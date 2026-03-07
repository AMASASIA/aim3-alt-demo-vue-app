import os
import hashlib
import json
from datetime import datetime
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from pinecone import Pinecone
import uvicorn

app = FastAPI(title="Amane L0 Gateway - Independent Backend")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 環境設定と初期化 ---
API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")
PINECONE_KEY = os.getenv("PINECONE_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
else:
    print("Warning: GEMINI_API_KEY is not set.")

# Pinecone初期化 (APIキーがある場合のみ)
v_index = None
if PINECONE_KEY:
    try:
        pc = Pinecone(api_key=PINECONE_KEY)
        # インデックスが存在することを確認（適宜作成）
        v_index = pc.Index("amane-atomic-index")
    except Exception as e:
        print(f"Pinecone Initialization Error: {e}")

# --- OKE 準拠: 事実の原子（Atomic Fact）精錬ロジック ---
async def extract_atomic_facts(image_bytes: bytes, audio_transcript: str):
    """
    AIモデルの抽象化: OKE形式での厳密な事実抽出
    """
    if not API_KEY:
        return {
            "model_id": "MOCK-001",
            "condition_grade": 8.0,
            "physical_features": "Mock evaluation",
            "evidence": "Transcript matched"
        }

    model = genai.GenerativeModel('gemini-1.5-pro')
    
    # 画像パートの作成
    image_part = {
        "inline_data": {
            "data": image_bytes,
            "mime_type": "image/jpeg"
        }
    }
    
    prompt = f"""
    分析対象（画像および以下の音声インサイト）から、以下の項目を厳密なOKE JSON形式で抽出せよ。
    音声インサイト: "{audio_transcript}"

    抽出項目:
    1. model_id: モデル名/型番
    2. condition_grade: コンディション評価 (1.0-10.0)
    3. physical_features: 物理的特徴（傷の座標、摩耗度など）
    4. evidence: 根拠（音声インサイトからの具体的な引用）

    出力は純粋なJSONのみとすること。
    """
    
    try:
        response = model.generate_content([prompt, image_part])
        # Markdownのコードブロックを除去して解析
        clean_text = response.text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:-3].strip()
        elif clean_text.startswith("```"):
            clean_text = clean_text[3:-3].strip()
        return json.loads(clean_text)
    except Exception as e:
        print(f"Inference Error: {e}")
        return {"error": "Failed to extract OKE facts", "details": str(e)}

# --- メイン・プロセス: 鑑定と永続化 ---
@app.post("/v1/process-asset")
async def process_asset(image: UploadFile = File(...), transcript: str = None):
    try:
        # 1. 生データのハッシュ生成 (データ改ざん防止)
        img_bytes = await image.read()
        content_to_hash = img_bytes
        if transcript:
            content_to_hash += transcript.encode()
            
        raw_data_hash = hashlib.sha256(content_to_hash).hexdigest()

        # 2. GeminiによるOKE事実抽出 (推論層)
        facts = await extract_atomic_facts(img_bytes, transcript or "No transcript provided")

        # 3. IPFSへの分散保存 (事実の永続化 - デモ用仮ID)
        ipfs_cid = f"ipfs_hash_{raw_data_hash[:16]}"

        # 4. Pineconeへのベクトル登録 (資産の照合層)
        if v_index:
            try:
                # 実際にはここで facts を埋め込みベクトル化する
                # 今回はダミーベクトルを使用
                dummy_vector = [0.1] * 1536 # 1536次元の例
                v_index.upsert(vectors=[(ipfs_cid, dummy_vector, {"grade": str(facts.get('condition_grade', 0))})])
            except Exception as e:
                print(f"Vector Indexing Skip: {e}")

        # 5. 自社DB (OKE Atomic Fact Ledger) への保存 (管理層)
        # 実際には psycopg2 等を使用して Step 3-4 のデータを SQL DB へ挿入します
        ledger_entry = {
            "asset_id": "AUTO_GENERATED",
            "observer_id": "AMAS_OS_ALPHA",
            "oke_grade": facts.get('condition_grade', 0.0),
            "fact_payload": facts,
            "ipfs_cid": ipfs_cid,
            "amane_hash": raw_data_hash
        }
        print(f"[LEDGER_SYNC] Entry prepared: {json.dumps(ledger_entry)}")

        return {
            "status": "OKE_CERTIFIED",
            "certification_id": ipfs_cid,
            "atomic_facts": facts,
            "provenance": {
                "hash": raw_data_hash,
                "agent": "AMAS_OS_ALPHA",
                "protocol": "AMANE-L0.3"
            },
            "amane_link": f"http://localhost:5173/f/{raw_data_hash}",
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        print(f"Critical Gateway Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
