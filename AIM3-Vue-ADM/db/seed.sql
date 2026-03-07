-- Dummy Data Insertion Script for Antigravity Simulation

-- 1. Insert Agents (AMAS Nodes)
INSERT INTO agents (id, agent_type, public_key) VALUES
('AMAS_NODE_GENESIS', 'AI_GEMINI', '0x1234...abcd'),
('AMAS_NODE_AUDITOR', 'AI_SMALL_LLM', '0x5678...efgh'),
('EXPERT_YANUS', 'HUMAN_EXPERT', '0x9999...zzzz');

-- 2. Insert Assets (Demo Items)
INSERT INTO assets (id, model_name, brand_name, category) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Air Jordan 1 High OG "Lost & Found"', 'Nike', 'sneakers'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Black Lotus (Alpha)', 'Magic: The Gathering', 'trading_cards'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'Vintage 1994 Supreme Box Logo Tee', 'Supreme', 'apparel');

-- 3. Insert Atomic Facts (The "Story" of the items)
INSERT INTO atomic_facts (asset_id, observer_id, oke_grade, fact_payload, ipfs_cid, amane_hash) VALUES
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    'AMAS_NODE_GENESIS', 
    9.8, 
    '{"condition": "mint", "stitching": "perfect", "uv_scan": "pass", "note": "Verified via Video Analysis"}', 
    'bafybeig...lostandfound', 
    '0xaa...11'
),
(
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 
    'EXPERT_YANUS', 
    8.5, 
    '{"condition": "played", "corners": "slight_wear", "centering": "90/10"}', 
    'bafybeig...blacklotus', 
    '0xbb...22'
);

-- 4. Insert Market History
INSERT INTO market_history (asset_id, source_platform, price, currency) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'StockX', 58000, 'JPY'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SNKRDUNK', 56500, 'JPY'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'eBay', 8500000, 'JPY');
