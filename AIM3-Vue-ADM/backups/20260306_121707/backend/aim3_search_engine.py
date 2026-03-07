"""
AIM3 Search Engine — Tive AI Core Algorithm
=============================================

Proprietary search algorithm implementing:
  1. Semantic Serendipity: Noise-injected vector search for non-linear discovery
  2. Context Weighting: SOUL-point reliability + Intent Synchronization (JP18991)
  3. Temporal Decay: Time-aware relevance scoring

Architecture:
  - Standalone: `uvicorn aim3_search_engine:app --port 8001`
  - Integrated: Import `router` into the main FastAPI app

Author: AMASASIA / AIM3 Project
"""

import os
import json
import time
import hashlib
from datetime import datetime
from typing import List, Optional, Dict, Any

import numpy as np
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Optional: Real embedding via Gemini
try:
    import google.generativeai as genai
    GEMINI_KEY = os.getenv("VITE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    if GEMINI_KEY:
        genai.configure(api_key=GEMINI_KEY)
        EMBEDDING_MODEL = "models/text-embedding-004"
        HAS_GEMINI = True
    else:
        HAS_GEMINI = False
except ImportError:
    HAS_GEMINI = False

# Optional: Pinecone Vector DB
try:
    from pinecone import Pinecone
    PINECONE_KEY = os.getenv("PINECONE_API_KEY")
    if PINECONE_KEY:
        pc = Pinecone(api_key=PINECONE_KEY)
        v_index = pc.Index("aim3-discovery-index")
        HAS_PINECONE = True
    else:
        HAS_PINECONE = False
except (ImportError, Exception):
    HAS_PINECONE = False


# ==========================================
# Phase 1: Data Models (Schema)
# ==========================================

class DiscoveryContext(BaseModel):
    """Hyper-resolution context schema for individualized search"""
    user_id: str
    intent_level: float = Field(
        ..., ge=0.0, le=1.0,
        description="User's current intent strength (0.0 = passive browsing, 1.0 = laser-focused)"
    )
    environment: str = Field(
        ...,
        description="Input environment: 'deep_work', 'walking', 'commute', 'creative', 'social'"
    )
    soul_points: int = Field(
        ..., ge=0,
        description="Yanus SOUL points — information reliability score"
    )
    location_lat: float = 0.0
    location_lng: float = 0.0
    temporal_mode: str = Field(
        default="present",
        description="'past' (recall), 'present' (live), 'future' (prediction)"
    )

class ArtifactMetadata(BaseModel):
    """Multi-dimensional metadata for a wisdom artifact"""
    artifact_id: str
    content: str = ""
    ideation_tags: List[str] = Field(
        default_factory=list,
        description="Abstract concept tags for ideation linking"
    )
    context: DiscoveryContext
    leads_to: List[str] = Field(
        default_factory=list,
        description="Concept vectors pointing to future discovery paths"
    )
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    embedding: Optional[List[float]] = None

class SearchQuery(BaseModel):
    query_text: str
    current_context: DiscoveryContext
    serendipity_factor: float = Field(
        default=0.15, ge=0.0, le=1.0,
        description="Noise coefficient for serendipitous discovery (0=precise, 1=maximum wander)"
    )
    temporal_weight: float = Field(
        default=0.1, ge=0.0, le=1.0,
        description="How much recency affects ranking (0=timeless, 1=latest only)"
    )
    top_k: int = Field(default=5, ge=1, le=50)

class IndexRequest(BaseModel):
    """Request to index a new artifact into the engine"""
    content: str
    context: DiscoveryContext
    tags: List[str] = Field(default_factory=list)
    artifact_type: str = "notebook_entry"


# ==========================================
# Phase 2: Core Algorithm Engine
# ==========================================

# In-memory artifact store (production: Pinecone + Firestore)
_artifact_store: List[Dict[str, Any]] = []


def get_embedding(text: str) -> np.ndarray:
    """
    Generate text embedding vector.
    Uses Gemini text-embedding-004 when available, falls back to deterministic hash-based vectors.
    """
    if HAS_GEMINI:
        try:
            result = genai.embed_content(model=EMBEDDING_MODEL, content=text)
            return np.array(result['embedding'])
        except Exception as e:
            print(f"[AIM3 Embedding] Gemini fallback: {e}")

    # Deterministic fallback: hash-based pseudo-embedding
    # Ensures same text always produces same vector (reproducible results)
    hash_bytes = hashlib.sha512(text.encode('utf-8')).digest()
    np.random.seed(int.from_bytes(hash_bytes[:4], 'big'))
    return np.random.rand(768).astype(np.float32)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors"""
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))


def inject_serendipity(base_vector: np.ndarray, factor: float) -> np.ndarray:
    """
    [Ideation] Semantic Serendipity Injection
    
    By adding controlled Gaussian noise to the query vector,
    we attract conceptually adjacent but logically unexpected results.
    This is the mathematical foundation of "planned serendipity."
    
    factor = 0.0 → Exact semantic match (deterministic)
    factor = 0.15 → Light creative drift (recommended default)
    factor = 0.5 → Strong lateral thinking mode
    factor = 1.0 → Maximum exploration (near-random discovery)
    """
    if factor <= 0:
        return base_vector

    noise = np.random.normal(0, factor, base_vector.shape)
    noisy_vector = base_vector + noise

    # Re-normalize to unit sphere to maintain cosine similarity validity
    norm = np.linalg.norm(noisy_vector)
    if norm > 0:
        noisy_vector = noisy_vector / norm

    return noisy_vector


def compute_aim3_score(
    base_similarity: float,
    artifact_meta: Dict[str, Any],
    query_context: DiscoveryContext,
    temporal_weight: float = 0.1
) -> Dict[str, Any]:
    """
    [Individualization] AIM3 Composite Scoring Algorithm
    
    Combines multiple signals into a single relevance score:
    
    1. SOUL Multiplier — Reliability boost from Yanus Protocol trust points
    2. Intent Sync — JP18991 patent: match between user intent and creator intent
    3. Environment Resonance — Bonus when usage context matches
    4. Temporal Decay — Recency factor with configurable weight
    """
    
    # A. SOUL Point Reliability Multiplier
    # Higher SOUL = more trusted content = gently boosted
    artifact_soul = artifact_meta.get("soul_points", 0)
    soul_multiplier = 1.0 + min(artifact_soul / 10000, 0.5)  # Cap at 1.5x

    # B. Intent Synchronization Rate (JP18991 Core)
    # Measures alignment between searcher's intent and artifact creator's intent
    artifact_intent = artifact_meta.get("intent_level", 0.5)
    intent_diff = abs(query_context.intent_level - artifact_intent)
    intent_multiplier = 1.0 - (intent_diff * 0.4)  # Max penalty: 40%

    # C. Environment Resonance
    # Content created in same environment gets a contextual boost
    artifact_env = artifact_meta.get("environment", "")
    env_multiplier = 1.15 if artifact_env == query_context.environment else 1.0

    # D. Temporal Decay
    # Recent artifacts get a gentle boost, configurable by temporal_weight
    created_str = artifact_meta.get("created_at", "")
    temporal_multiplier = 1.0
    if created_str and temporal_weight > 0:
        try:
            created_dt = datetime.fromisoformat(created_str)
            age_hours = (datetime.now() - created_dt).total_seconds() / 3600
            # Exponential decay: half-life = 168 hours (1 week)
            decay = np.exp(-0.00413 * age_hours)  # ln(2)/168 ≈ 0.00413
            temporal_multiplier = 1.0 + (temporal_weight * decay)
        except (ValueError, TypeError):
            pass

    # Composite AIM3 Score
    aim3_score = (
        base_similarity
        * soul_multiplier
        * intent_multiplier
        * env_multiplier
        * temporal_multiplier
    )

    return {
        "aim3_score": round(aim3_score, 6),
        "breakdown": {
            "base_similarity": round(base_similarity, 4),
            "soul_multiplier": round(soul_multiplier, 4),
            "intent_sync": round(intent_multiplier, 4),
            "env_resonance": round(env_multiplier, 4),
            "temporal_boost": round(temporal_multiplier, 4),
        },
        "is_serendipitous": aim3_score > base_similarity * 1.05
    }


# ==========================================
# Phase 3: API Router
# ==========================================

router = APIRouter(prefix="/aim3", tags=["AIM3 Search Engine"])


def load_evolved_strategy():
    """Load the latest strategy weights from the Achiever Daemon"""
    strategy_path = "agent_strategy.json"
    if os.path.exists(strategy_path):
        try:
            with open(strategy_path, 'r') as f:
                return json.load(f)
        except: pass
    return None

@router.post("/search", summary="AIM3 Serendipity-Contextual Search")
async def serendipity_contextual_search(request: SearchQuery):
    """
    Non-linear search API fusing [Ideation] and [Individualization].
    
    Updated: Now incorporates autonomous weights from the Achiever Daemon (Self-Evolution).
    """
    try:
        # 1. Load Evolved Strategy (Pillar 4: Verified Learning)
        evolved = load_evolved_strategy()
        s_factor = request.serendipity_factor
        t_weight = request.temporal_weight
        
        if evolved:
            # Apply autonomous biases from the self-evolution loop
            s_factor = evolved.get("serendipity_bias", s_factor)
            t_weight = evolved.get("temporal_weight", t_weight)
            print(f"[AIM3 Engine] Applying evolved strategy | Gen: {evolved.get('generation')}")

        # 2. Query Vectorization
        base_vector = get_embedding(request.query_text)

        # 3. [Ideation] Semantic Serendipity Injection (with evolved factor)
        ideation_vector = inject_serendipity(base_vector, s_factor)

        # 3. Retrieve Candidates
        if HAS_PINECONE:
            # Production: Pinecone vector search
            pinecone_results = v_index.query(
                vector=ideation_vector.tolist(),
                top_k=request.top_k * 4,  # Over-fetch for re-ranking
                include_metadata=True
            )
            raw_results = [
                {
                    "id": match.id,
                    "score": match.score,
                    "metadata": match.metadata or {}
                }
                for match in pinecone_results.matches
            ]
        else:
            # Local: Search in-memory store
            raw_results = []
            for artifact in _artifact_store:
                if artifact.get("embedding") is not None:
                    sim = cosine_similarity(ideation_vector, np.array(artifact["embedding"]))
                    raw_results.append({
                        "id": artifact["artifact_id"],
                        "score": sim,
                        "metadata": artifact.get("metadata", {})
                    })

            # If no artifacts stored, return demo results
            if not raw_results:
                raw_results = [
                    {
                        "id": f"DEMO-{i:03d}",
                        "score": round(0.92 - (i * 0.04), 4),
                        "metadata": {
                            "soul_points": 1200 + i * 150,
                            "intent_level": round(0.8 - i * 0.05, 2),
                            "environment": request.current_context.environment,
                            "created_at": datetime.now().isoformat(),
                            "content_preview": f"Discovery artifact #{i+1}"
                        }
                    }
                    for i in range(min(request.top_k * 2, 10))
                ]

        # 4. [Individualization] AIM3 Composite Re-ranking
        scored_results = []
        for res in raw_results:
            scoring = compute_aim3_score(
                base_similarity=res["score"],
                artifact_meta=res["metadata"],
                query_context=request.current_context,
                temporal_weight=request.temporal_weight
            )

            scored_results.append({
                "artifact_id": res["id"],
                "aim3_score": scoring["aim3_score"],
                "original_similarity": res["score"],
                "scoring_breakdown": scoring["breakdown"],
                "is_serendipitous": scoring["is_serendipitous"],
                "metadata": {
                    k: v for k, v in res["metadata"].items()
                    if k != "embedding"  # Don't leak raw vectors
                }
            })

        # 5. Sort by AIM3 score and return top-k
        scored_results.sort(key=lambda x: x["aim3_score"], reverse=True)

        return {
            "status": "success",
            "query": request.query_text,
            "engine_version": "AIM3-SE-1.0",
            "algorithms_applied": [
                "Semantic_Serendipity",
                "SOUL_Reliability",
                "Intent_Synchronization_JP18991",
                "Environment_Resonance",
                "Temporal_Decay"
            ],
            "serendipity_factor": request.serendipity_factor,
            "total_candidates": len(raw_results),
            "results": scored_results[:request.top_k],
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AIM3 Search Engine Error: {str(e)}")


@router.post("/index", summary="Index artifact into AIM3 search engine")
async def index_artifact(request: IndexRequest):
    """
    Register a new artifact (notebook entry, discovery, memo) into the search engine.
    Generates embedding and stores with full context metadata.
    """
    try:
        # Generate embedding
        embedding = get_embedding(request.content)

        artifact_id = f"ART-{hashlib.md5(request.content.encode()).hexdigest()[:12]}"

        artifact = {
            "artifact_id": artifact_id,
            "embedding": embedding.tolist(),
            "metadata": {
                "content_preview": request.content[:200],
                "soul_points": request.context.soul_points,
                "intent_level": request.context.intent_level,
                "environment": request.context.environment,
                "user_id": request.context.user_id,
                "tags": request.tags,
                "artifact_type": request.artifact_type,
                "created_at": datetime.now().isoformat()
            }
        }

        if HAS_PINECONE:
            v_index.upsert(vectors=[(
                artifact_id,
                embedding.tolist(),
                artifact["metadata"]
            )])
        else:
            _artifact_store.append(artifact)

        return {
            "status": "indexed",
            "artifact_id": artifact_id,
            "vector_dimensions": len(embedding),
            "store": "pinecone" if HAS_PINECONE else "local_memory",
            "total_artifacts": len(_artifact_store) if not HAS_PINECONE else "N/A"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing Error: {str(e)}")


@router.get("/health", summary="Engine health check")
async def health():
    return {
        "status": "operational",
        "engine": "AIM3 Search Engine v1.0",
        "gemini_embedding": HAS_GEMINI,
        "pinecone_store": HAS_PINECONE,
        "local_artifacts": len(_artifact_store),
        "timestamp": datetime.now().isoformat()
    }


# ==========================================
# Standalone App (for independent execution)
# ==========================================

app = FastAPI(
    title="AIM3 Search Engine — Tive AI Core",
    version="1.0.0",
    description="Proprietary search algorithm: Semantic Serendipity × Context Weighting"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("  AIM3 Search Engine — Tive AI Core Algorithm")
    print("  Semantic Serendipity × Context Weighting")
    print(f"  Gemini Embedding: {'✓' if HAS_GEMINI else '✗ (using hash fallback)'}")
    print(f"  Pinecone Vector DB: {'✓' if HAS_PINECONE else '✗ (using local memory)'}")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8001)
