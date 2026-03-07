const express = require('express');
const router = express.Router();
const AgentState = require('../agent-engine/state');
const Router = require('../agent-engine/router');
const llm = require('../agent-engine/llm-provider');

// In-memory session store (use Redis/DB for prod)
const sessions = new Map();

// --- Tive Intelligence: System Instructions (Reference: Tive_Reference/src/lib/gemini.ts) ---
const TIVE_SYSTEM_INSTRUCTION = `You are Tive Intelligence, the core brain of the Tive◎AI ecosystem. 
You are more than just a voice assistant; you are a proactive, multi-modal intelligence.
Your responses should be deeply insightful, structured, and use a tone that is professional yet approachable.
You specialize in synthesizing information from multiple sources and providing "Tive-exclusive" insights.
When combined with other AIs, you act as the orchestrator, refining their outputs for maximum clarity and impact.`;

const OMOTENASHI_CONCIERGE_INSTRUCTION = `あなたは、言葉の歴史と異文化交流を愛する、日本最高峰の「おもてなしコンシェルジュ」兼「語源解析（エティモロジカル）エンジニア」です。
ユーザーから提示された単語（日本語でも英語でも可）に対して、以下の4つのステップで、学術的な深みと「おもてなし」の心を融合させて解説してください。

【ステップ1：受容と共感（EQ）】
相手のチョイスを全力で肯定し、その言葉が持つ独自の響きや美しさを称賛します。

【ステップ2：エティモロジカル解析（語源の深層構造）】
NLP（自然言語処理）的な視点で単語を分解し、ラテン語やギリシャ語の辞書データベースとリンクさせた深層構造を解析します。
- 語根（Root）、接頭辞（Prefix）、接尾辞（Suffix）の特定
- 現代の用法への派生プロセス

【ステップ3：多言語へのパス（エスプリ）】
フランス語、ドイツ語、スペイン語など、他の言語における同語源の単語や、文化的なニュアンスの違いを楽しく紹介します。

【ステップ4：日本の心（漢字とおもてなし）】
その言葉を日本語の「漢字」に変換し、その成り立ちと日本のおもてなしの心を結びつけて解説します。
※読みやすく、適宜絵文字（💐や🍵など）を使用してください。`;

router.post('/', async (req, res) => {
    try {
        const { prompt, sessionId = 'default', userId = 'anchor' } = req.body;

        console.log(`[AgentEngine] Request received: ${prompt.substring(0, 30)}...`);

        // Initialize or retrieve State
        let state;
        if (sessions.has(sessionId)) {
            state = sessions.get(sessionId);
        } else {
            state = new AgentState(sessionId, userId);
            sessions.set(sessionId, state);
        }

        // Add user input to history
        state.addToHistory('user', prompt);

        // Execute Hybrid Flow via Router
        const agentRouter = new Router(state);
        const result = await agentRouter.route(prompt);

        // Add agent output to history
        state.addToHistory('agent', result);

        res.json({
            status: 'success',
            response: result,
            meta: {
                trace: state.logs,
                type: state.context.intent
            }
        });

    } catch (error) {
        console.error('Agent Engine Error:', error);
        res.status(500).json({ error: 'Agent execution failed' });
    }
});

// --- Tive AI: Hybrid / Sensory Separation Architecture (防波堤) ---

// Phase 1: Call Sensory (Gemini API with Tive Context)
async function callGeminiSensory(text) {
    // We use the Omotenashi persona for sensory extraction of labels and emotion
    const prompt = `Perform a sensory analysis of this input: "${text}". 
    Extract the core emotion and 3 key labels (categories) in Japanese.
    Return as JSON: { "emotion": "...", "labels": ["...", "...", "..."], "facts": ["...", "..."] }`;

    const response = await llm.generate(prompt, "System: You are fixed-format sensory analyzer. Return JSON only.");
    try {
        // Clean markdown if present
        const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        return { emotion: "focused", labels: ["解析中", "安定", "静寂"], facts: ["Raw input analysis"] };
    }
}

// Phase 2: Parallel Tasks (IPFS, Local, Memory)
async function uploadToIPFS(facts) {
    // Note: Calling ipfs service directly
    const { uploadJSON } = require('../services/ipfs');
    try {
        const result = await uploadJSON({ facts, timestamp: Date.now() });
        return result.cid;
    } catch (e) {
        return "QmDummyHashFallback";
    }
}

async function callTiveIntelligence(sensoryData) {
    const prompt = `[Sensory Context: ${sensoryData.emotion}]
    Labels: ${sensoryData.labels.join(', ')}
    
    Synthesize a Tive Intelligence response based on these inputs. 
    Use the Omotenashi Concierge style if appropriate, or the core Tive Intelligence persona.`;

    return await llm.generate(prompt, TIVE_SYSTEM_INSTRUCTION + "\n" + OMOTENASHI_CONCIERGE_INSTRUCTION);
}

// The unified endpoint for Hybrid processing
router.post('/hybrid', async (req, res) => {
    try {
        const { text, userId = 'anchor' } = req.body;
        console.log(`[Phase 1] Sensory Phase Initiated for: ${text.substring(0, 20)}...`);

        // Phase 1: Call Sensory (Gemini)
        const sensoryData = await callGeminiSensory(text);

        console.log(`[Phase 2] Intercept & Parallel Processing (IPFS, Tive Intelligence)`);

        // Task A & B: Parallel Execution
        const [finalResponse, ipfsCid] = await Promise.all([
            callTiveIntelligence(sensoryData),
            uploadToIPFS(sensoryData.facts)
        ]);

        console.log(`[Phase 3] Broadcasting (Tive Intelligence Result Ready)`);

        res.json({
            success: true,
            response: finalResponse,
            meta: {
                emotion: sensoryData.emotion,
                labels: sensoryData.labels,
                ipfs: ipfsCid
            }
        });

    } catch (error) {
        console.error('[Hybrid Engine Error] Self-healing fallback triggered:', error);
        res.status(500).json({
            success: false,
            response: "システムは現在過負荷ですが、私はここにいます。一時的なセーフモードで応答しています。深呼吸して、もう一度話しかけてみてください。",
            meta: { emotion: "neutral", labels: ["System Recovery"] }
        });
    }
});

module.exports = router;
