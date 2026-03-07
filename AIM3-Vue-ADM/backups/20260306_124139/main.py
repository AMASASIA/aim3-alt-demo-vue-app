# main.py
import os
import time
import math
import json
import asyncio
import uvicorn
import uuid
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import google.generativeai as genai
from sentence_transformers import SentenceTransformer, util

# --- 🛡️ AMANE COMPLIANCE INTEGRATION ---
from amane_safety import safety_protocol
from socratic_broadcaster import socratic_engine

# ==========================================
# 初期設定 (APIキー & モデル読み込み)
# ==========================================
api_key = os.environ.get("GEMINI_API_KEY", "") or os.environ.get("VITE_GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("【警告】Secretsに 'GEMINI_API_KEY' が設定されていません！")

print("Loading SentenceTransformer model... (初回は数秒かかります)")
try:
    embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
except Exception as e:
    print(f"Model load error: {e}")
    embedding_model = None

# 簡易インメモリDB
DB_MEMORY = {}
DB_GOALS = {}

# ==========================================
# 知能コア拡張モジュール (全10種統合)
# ==========================================

class MemoryScorer:
    def score(self, text, emotion=None, repeat_count=1):
        length_score = min(len(text)/200, 1)
        emotion_score = {"joy":0.7, "anger":0.9, "sad":0.85, "neutral":0.4, None:0.5}.get(emotion, 0.5)
        repeat_score = min(math.log(repeat_count+1, 5), 1)
        return round((length_score*0.3 + emotion_score*0.4 + repeat_score*0.3), 3)

class RelationBuilder:
    async def link_async(self, new_node, existing_nodes):
        if not embedding_model or not existing_nodes: return []
        new_vec = embedding_model.encode(new_node["content"], convert_to_tensor=True)
        relations = []
        for node in existing_nodes:
            vec = embedding_model.encode(node["content"], convert_to_tensor=True)
            sim = float(util.cos_sim(new_vec, vec))
            if sim > 0.75:
                relations.append({"target": node["id"], "type": "similar_to", "weight": round(sim, 2)})
        return relations

class CausalInferenceEngine:
    async def infer_async(self, new_node, memory_db, llm_func):
        recent_nodes = [n for n in memory_db if (new_node["timestamp"] - n["timestamp"]) < 86400*3 and n["id"] != new_node["id"]]
        if not recent_nodes: return []
        
        candidates = "\n".join([f"- ID:{n['id']} 内容:{n['content']}" for n in recent_nodes])
        prompt = f"""
        以下の過去の記憶の中に、現在の発言の直接的な「原因」となっているものはあるか？
        [現在の発言] {new_node['content']}
        [過去の記憶] {candidates}
        ある場合のみ、以下のJSON配列で出力せよ。ない場合は [] を返せ。
        [ {{"source_id": "ID", "reason": "理由"}} ]
        """
        try:
            res = await llm_func(prompt, json_mode=True)
            data = json.loads(res) if res else []
            return [{"target": d["source_id"], "type": "caused_by", "weight": 0.95, "reason": d.get("reason","")} for d in data if isinstance(d, dict)]
        except: return []

class BeliefRevisionSystem:
    def revise(self, new_node, memory_db):
        triggers = ["実は", "やっぱり", "変わった", "以前は", "but actually"]
        if any(w in new_node["content"] for w in triggers):
            for node in memory_db:
                if node["timestamp"] < new_node["timestamp"]:
                    node["confidence"] *= 0.5 
            new_node["type"] = "revised_belief"
            new_node["weight"] = 1.5
        return memory_db

class IntrospectionEngine:
    async def reflect_async(self, prev_response, current_input, llm_func):
        if not prev_response: return None
        prompt = f"""
        直前のAIの発言に対するユーザーの反応を評価せよ。
        [直前のAI] "{prev_response}"
        [ユーザーの反応] "{current_input}"
        出力JSON: {{"was_optimal": bool, "self_correction_note": "改善点(あれば)"}}
        """
        try:
            res = await llm_func(prompt, json_mode=True)
            return json.loads(res) if res else None
        except: return None

    def get_adjustment_prompt(self, reflection):
        if reflection and not reflection.get("was_optimal"):
            note = reflection.get("self_correction_note", "トーンの調整が必要")
            return f"\n[System Note (Self-Reflection)]: 直前の回答は最適ではありませんでした。反省点: {note}。これを踏まえ、より適切に回答してください。\n"
        return ""

class GoalTracker:
    async def extract_goal_async(self, text, llm_func):
        prompt = f"""発言からユーザーの「長期的な目標」を抽出しJSONで出力せよ。
        発言: "{text}"
        形式: {{"has_goal": true/false, "extracted_goal": "目標内容"}}"""
        try:
            res = await llm_func(prompt, json_mode=True)
            data = json.loads(res)
            return data.get("extracted_goal") if isinstance(data, dict) and data.get("has_goal") else None
        except: return None

    def update(self, goal_text, goal_db):
        goal_db.append({"id": f"goal_{int(time.time())}", "content": goal_text, "status": "active", "timestamp": time.time()})

    def inject(self, prompt, goal_db):
        if not goal_db: return prompt
        active_goals = "\n".join([g["content"] for g in goal_db if g["status"] == "active"][-3:])
        return f"[User's Long-term Goals (北極星)]\n{active_goals}\n\n{prompt}"

class ForgettingEngine:
    def decay(self, node, ttl=86400*30): 
        age = time.time() - node["timestamp"]
        node["importance"] *= max(0, 1 - (age / ttl))
        return node if node["importance"] >= 0.05 else None

class ContextComposer:
    def build(self, query, nodes, k=6):
        ranked = sorted(nodes, key=lambda n: n["importance"] * n.get("confidence", 1.0), reverse=True)
        return "\n".join([n["content"] for n in ranked[:k]])

class PersonaStabilizer:
    def enforce(self, response):
        return response.replace("！！！", "！")

class SelfImprover:
    def improve(self, response):
        if len(response) < 10:
            return response + "\n(もう少し詳しい説明が必要な場合はお知らせくださいね。)"
        return response

class EmotionDetector:
    async def detect_async(self, text, llm_func):
        prompt = f"""発言からユーザーの「情動(Emotion)」を1つ抽出しJSONで出力せよ。
        選択肢: [joy, anger, sad, neutral, fear, surprise]
        発言: "{text}"
        形式: {{"emotion": "選択肢", "intensity": 0.0-1.0}}"""
        try:
            res = await llm_func(prompt, json_mode=True)
            return json.loads(res)
        except: return {"emotion": "neutral", "intensity": 0.5}

# ==========================================
# FastAPI サーバー設定 & 超並列パイプライン
# ==========================================
app = FastAPI(title="Tive◎AI | AMAS Core OS", version="2.0.0-PEACE")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.middleware("http")
async def add_compliance_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Amane-Privacy"] = "GDPR-Sovereign"
    response.headers["X-Amane-Ethics"] = "EU-AI-Act-Ready"
    response.headers["X-Amane-Peace"] = "Geneva-Protocol-AI-1.0"
    return response

# インスタンス化
scorer = MemoryScorer()
semantic_linker = RelationBuilder()
causal_engine = CausalInferenceEngine()
forgetter = ForgettingEngine()
goal_tracker = GoalTracker()
belief_reviser = BeliefRevisionSystem()
introspector = IntrospectionEngine()
composer = ContextComposer()
persona = PersonaStabilizer()
improver = SelfImprover()
emotion_detector = EmotionDetector()

# Gemini 非同期ラッパー
async def llm_generate_async(prompt, json_mode=False):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        config = genai.types.GenerationConfig(response_mime_type="application/json") if json_mode else None
        response = await model.generate_content_async(prompt, generation_config=config)
        return response.text
    except Exception as e:
        print(f"LLM API Error: {e}")
        return "{}" if json_mode else ""

class ChatRequest(BaseModel):
    user_id: str
    text: str
    previous_ai_response: str = None

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    start_time = time.time()
    user_id = request.user_id
    text = request.text
    
    # --- 🛡️ BROAD LISTENING - INPUT AUDIT ---
    input_audit = await safety_protocol.audit_intent_async(text, llm_generate_async)
    if not input_audit.get("safe"):
        return {
            "success": False,
            "type": "SAFETY_REFUSAL",
            "response": input_audit.get("reason", "I cannot proceed with this request for safety reasons."),
            "meta": {"violation": input_audit.get("violation")}
        }

    # ユーザーごとの記憶空間を初期化
    if user_id not in DB_MEMORY: DB_MEMORY[user_id] = []
    if user_id not in DB_GOALS: DB_GOALS[user_id] = []
    memory_db = DB_MEMORY[user_id]
    goal_db = DB_GOALS[user_id]

    # --- フェーズ1: 超並列・認知フェーズ ---
    emotion_task = emotion_detector.detect_async(text, llm_generate_async)
    intro_task = introspector.reflect_async(request.previous_ai_response, text, llm_generate_async)
    goal_task = goal_tracker.extract_goal_async(text, llm_generate_async)
    semantic_task = semantic_linker.link_async({"content": text}, memory_db)

    detected_emotion, reflection, extracted_goal, semantic_links = await asyncio.gather(
        emotion_task, intro_task, goal_task, semantic_task
    )

    # 感情に基づいて重要度スコアを計算 (同期処理)
    score = scorer.score(text, emotion=detected_emotion.get("emotion"))

    # --- フェーズ2: メモリーグラフ構築フェーズ ---
    node = {
        "id": f"mem_{int(time.time())}",
        "type": "dialogue",
        "content": text,
        "timestamp": time.time(),
        "importance": score,
        "confidence": 0.9,
        "relations": semantic_links
    }

    causal_links = await causal_engine.infer_async(node, memory_db, llm_generate_async)
    node["relations"].extend(causal_links)
    
    memory_db = belief_reviser.revise(node, memory_db)
    if extracted_goal:
        goal_tracker.update(extracted_goal, goal_db)

    memory_db.append(node)
    DB_MEMORY[user_id] = [updated_node for n in memory_db if (updated_node := forgetter.decay(n))]
    
    # --- フェーズ3: 回答生成とブロードキャスティング ---
    base_context = composer.build(text, DB_MEMORY[user_id])
    
    system_instruction = "あなたは Tive◎AI。Amane Protocol の心臓部です。ソクラテス式の対話と、ヒントン氏の提唱する安全性を重視してください。"
    prompt = f"""
    {system_instruction}
    
    [過去の関連する文脈]
    {base_context}
    
    [現在のユーザーの発言]
    {text}
    """
    
    prompt_with_goals = goal_tracker.inject(prompt, DB_GOALS[user_id])
    final_prompt = prompt_with_goals + introspector.get_adjustment_prompt(reflection)

    raw_response = await llm_generate_async(final_prompt)

    # --- 🛡️ BROAD LISTENING - RESPONSE AUDIT ---
    output_audit = await safety_protocol.audit_response_async(raw_response, llm_generate_async)
    if not output_audit.get("safe"):
        raw_response = "私は平和と真実の守護者です。生成された回答に倫理的な懸念があったため、ここで内容を修正させていただきます。"

    stabilized_response = persona.enforce(raw_response)
    final_response = improver.improve(stabilized_response)
    
    # 🕊️ SOCRATIC BROADCASTING (Scaffolding)
    final_broadcast = socratic_engine.scaffold(final_response, ["Memory", "Peace", "Growth"])

    print(f"⚡ Total Processing Time: {time.time() - start_time:.2f}s")

    return {
        "success": True,
        "response": final_broadcast,
        "meta": {
            "introspection": reflection,
            "extracted_goal": extracted_goal,
            "resonance": score,
            "emotion": detected_emotion,
            "relations_count": len(node["relations"]),
            "compliance": ["EU-AI-ACT", "GDPR", "GENEVA"]
        }
    }

@app.get("/")
async def root():
    return {"status": "active", "engine": "Tive◎AI | AMAS Core OS", "compliance": "Amane Protocols Active"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
