-- AMAS OKE Atomic Fact Ledger Schema [AMAS_GENESIS_REVIVAL]

-- 1. 資産マスター (靴、カード、古着などの個体管理)
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    brand_name TEXT,
    category TEXT CHECK (category IN ('sneakers', 'trading_cards', 'apparel', 'dolls', 'watches', 'art')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. AMAS エージェント台帳 (どのAI/人間が鑑定したか)
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY, -- 例: 'AMAS_NODE_OS_001', 'GEMINI_1_5_PRO'
    agent_type TEXT NOT NULL, -- 'AI_SMALL_LLM', 'AI_GEMINI', 'HUMAN_EXPERT'
    public_key TEXT -- Amane Protocol用署名検証キー
);

-- 3. OKE Atomic Facts (事実の原子)
CREATE TABLE IF NOT EXISTS atomic_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id),
    observer_id TEXT REFERENCES agents(id),
    oke_grade DECIMAL(3, 1) NOT NULL, -- 1.0 - 10.0
    fact_payload JSONB NOT NULL, -- 傷の座標、音声インサイトのテキスト等
    ipfs_cid TEXT UNIQUE NOT NULL, -- 真実の証拠(画像・音声)へのリンク
    amane_hash TEXT UNIQUE NOT NULL, -- L0プロトコル用ハッシュ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 相場履歴 (Market Miningデータ)
CREATE TABLE IF NOT EXISTS market_history (
    id SERIAL PRIMARY KEY,
    asset_id UUID REFERENCES assets(id),
    source_platform TEXT, -- 'StockX', 'eBay', 'Mercari'
    price DECIMAL(12, 2),
    currency TEXT DEFAULT 'JPY',
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 初期エージェントの登録
INSERT INTO agents (id, agent_type) VALUES ('AMAS_OS_ALPHA', 'AI_GEMINI') ON CONFLICT DO NOTHING;
