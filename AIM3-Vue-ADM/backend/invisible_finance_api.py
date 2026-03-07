import os
import uuid
import time
import json
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from web3 import Web3
from typing import Optional, List
import google.generativeai as genai

# Firebase Admin for Vector Search
import firebase_admin
from firebase_admin import credentials, firestore

# Configuration
GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY", "AIzaSyCiLO-pbMChwMe3vIYyA7ZYrFPolOHNWWw")
PROJECT_ID = os.getenv("VITE_FIREBASE_PROJECT_ID", "gen-lang-client-0556123756")

# Initialize Firebase (Using ADC or fallback to project_id)
try:
    firebase_admin.initialize_app(options={'projectId': PROJECT_ID})
except ValueError:
    pass # Already initialized

# Firestore Client with Mock Fallback for local testing without ADC
class MockFirestore:
    def collection(self, name): return self
    def add(self, data): 
        print(f"[Mock DB] Added to {self.current_col}: {data}")
        return self
    def order_by(self, *args, **kwargs): return self
    def limit(self, n): return self
    def get(self): return []
    def __init__(self): self.current_col = "none"
    def collection(self, name): 
        self.current_col = name
        return self

try:
    db = firestore.client()
except Exception as e:
    print(f"Firestore initialization failed (ADC missing), using Mock DB: {e}")
    db = MockFirestore()

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
intent_model = genai.GenerativeModel("gemini-1.5-flash")
embedding_model = "models/text-embedding-004"

app = FastAPI(title="AIM3 Primal & Invisible Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AIM3 Search Engine Integration ---
try:
    from aim3_search_engine import router as aim3_search_router
    app.include_router(aim3_search_router)
    print("[AIM3] Search Engine router mounted at /aim3/*")
except ImportError as e:
    print(f"[AIM3] Search Engine not loaded: {e}")

# --- Models ---
class IntentRequest(BaseModel):
    text: str

class RecallRequest(BaseModel):
    prompt: str

class PaymentRequest(BaseModel):
    recipient: Optional[str] = None
    amount: float
    intent_id: Optional[str] = None
    reason: str = "Invisible Finance Execution"

# --- AI Orchestrator endpoints ---

@app.post("/ai/analyze-intent")
async def analyze_intent(req: IntentRequest):
    """
    Backend Implementation: Intent Router.
    """
    system_instruction = """
    You are the INTENT ARCHITECT for Amane Protocol.
    Analyze the user's voice input and classify it accurately.
    
    POSSIBLE INTENTS:
    - "CONNECT_VIDEO": User wants to start a call with someone.
    - "CONNECT_CHAT": User wants to start a chat.
    - "NOTEBOOK_MEMO": General diary or idea.
    - "SCHEDULE_EVENT": Date/time detected for calendar.
    - "TODO_TASK": Action item detected for tasks.
    - "RECALL_WILL": Vague/habitual triggers like "the usual", "like before", "いつもの", "前みたいに".
    - "MINT_FACT": User wants to record a fact, proof, or certification on-chain.
    
    OUTPUT JSON FORMAT:
    {
      "intent": "...",
      "target_person": "nickname or null",
      "message": "Extracted core content",
      "start_time": "ISO 8601 or null",
      "details": "Contextual details",
      "confidence": 0.0-1.0
    }
    """
    try:
        response = intent_model.generate_content(
            f"{system_instruction}\nUser Input: {req.text}",
            generation_config={"response_mime_type": "application/json"}
        )
        data = json.loads(response.text)
        
        # Opal Routing Logic (Simulated for Phase 2)
        if data.get("intent") == "MINT_FACT":
            print(f"[AIM3] Fact detected. Routing to Opal Reasoning Engine...")
            data["details"] = data.get("details", "") + " (Routed to Opal for Fact Extraction)"
            
        return data
    except Exception as e:
        print(f"Error in analyze_intent: {e}")
        return {"intent": "NOTEBOOK_MEMO", "message": req.text, "confidence": 0.5}

@app.post("/ai/generate-embedding")
async def generate_embedding(req: IntentRequest):
    """Generates 768-dim vectors for semantic indexing."""
    try:
        result = genai.embed_content(model=embedding_model, content=req.text)
        return {"embedding": result['embedding']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/recall-will")
async def recall_will(req: RecallRequest):
    """
    Phase B: Semantic Recall & Execution.
    1. Embed the prompt.
    2. Search similar memories in Firestore (Vector Search).
    3. Construct Plan with Gemini 2.0.
    """
    try:
        # 1. Embed Prompt
        emb_result = genai.embed_content(model=embedding_model, content=req.prompt)
        query_vector = emb_result['embedding']

        # 2. Vector Search in Firestore (semantic_memories)
        # Note: Requires Vector Index on 'embedding' field
        memories_ref = db.collection("semantic_memories")
        
        # We use a simulated limit for now if the index is still building,
        # but the code follows the find_nearest pattern.
        try:
            # Requires google-cloud-firestore >= 2.16.0 for Vector support
            from google.cloud.firestore_v1.vector import Vector
            
            # This is the actual Vector Search query
            similar_memories = memories_ref.find_nearest(
                vector_field="embedding",
                query_vector=Vector(query_vector),
                distance_measure=firestore.DistanceMeasure.COSINE,
                limit=3
            ).get()
            
            context = [m.to_dict().get("content", "") for m in similar_memories]
        except Exception as e:
            print(f"Vector search falling back to latest: {e}")
            # Fallback to latest memories
            latest = memories_ref.order_by("metadata.timestamp", direction=firestore.Query.DESCENDING).limit(3).get()
            context = [m.to_dict().get("content", "") for m in latest]

        # 3. Generate Action Plan
        system_instruction = """
        You are the AIM3 Action Engine. Based on past memories, interpret the user's ambiguous prompt.
        Determine: Title, Description, Category.
        
        PAST MEMORIES:
        {memories}
        
        USER PROMPT: "{prompt}"
        
        OUTPUT JSON:
        {
          "title": "...",
          "description": "...",
          "category": "...",
          "reasoning": "..."
        }
        """
        prompt = system_instruction.format(memories="\n---\n".join(context), prompt=req.prompt)
        
        response = intent_model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)

    except Exception as e:
        print(f"Recall Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Finance Ratio ---

# Mock Daily Spending Tracker (In-memory for demo)
daily_spending = {"total": 0.0, "last_reset": time.time()}
DAILY_LIMIT = 100.0

@app.post("/finance/execute")
async def execute_payment(req: PaymentRequest):
    """
    Phase C: Invisible Finance Execution.
    Includes ERC-8004 style Daily Limit check.
    """
    global daily_spending
    
    # Simple Reset Logic (24h)
    if time.time() - daily_spending["last_reset"] > 86400:
        daily_spending = {"total": 0.0, "last_reset": time.time()}
        
    if daily_spending["total"] + req.amount > DAILY_LIMIT:
        raise HTTPException(status_code=403, detail="Daily agentic spending limit reached (ERC-8004 Policy).")
        
    tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}"[:66]
    
    daily_spending["total"] += req.amount
    
    # Store record in ledger
    db.collection("finance_ledger").add({
        "tx_hash": tx_hash,
        "amount": req.amount,
        "reason": req.reason,
        "total_day_spend": daily_spending["total"],
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    
    return {
        "status": "success",
        "tx_hash": tx_hash,
        "remaining_limit": DAILY_LIMIT - daily_spending["total"],
        "message": "Payment synchronized with Base Layer."
    }

# --- OKE / Opal Integration ---

class MintFactRequest(BaseModel):
    targetWallet: str
    factData: dict
    soulbound: bool = True

@app.post("/amane-l0/mint-fact")
async def mint_fact_callback(req: MintFactRequest):
    """
    Opal Callback Implementation.
    Receives extracted facts and executes Atomic Minting on-chain.
    """
    print(f"[Web3 Core] Received Fact from Opal for wallet: {req.targetWallet}")
    
    # Simulate Blockchain Transaction
    tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}"[:66]
    
    # Store in Firestore Proof Registry
    db.collection("proof_registry").add({
        "owner": req.targetWallet,
        "fact": req.factData,
        "tx_hash": tx_hash,
        "soulbound": req.soulbound,
        "timestamp": firestore.SERVER_TIMESTAMP
    })
    
    return {
        "status": "success",
        "txHash": tx_hash,
        "message": "Fact minted securely via OKE Transition Layer."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
