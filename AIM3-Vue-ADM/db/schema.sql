-- 1. 資産マスター (靴、カード、古着などの個体管理)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    brand_name TEXT,
    category TEXT CHECK (category IN ('sneakers', 'trading_cards', 'apparel', 'dolls')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. AMAS エージェント台帳 (どのAI/人間が鑑定したか)
CREATE TABLE agents (
    id TEXT PRIMARY KEY, -- 例: 'AMAS_NODE_OS_001'
    agent_type TEXT NOT NULL, -- 'AI_SMALL_LLM', 'AI_GEMINI', 'HUMAN_EXPERT'
    public_key TEXT -- Amane Protocol用署名検証キー
);

-- 3. OKE Atomic Facts (事実の原子)
CREATE TABLE atomic_facts (
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
CREATE TABLE market_history (
    id SERIAL PRIMARY KEY,
    asset_id UUID REFERENCES assets(id),
    source_platform TEXT, -- 'StockX', 'eBay', 'Mercari'
    price DECIMAL(12, 2),
    currency TEXT DEFAULT 'JPY',
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
