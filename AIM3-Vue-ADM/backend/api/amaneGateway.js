const express = require('express');
const router = express.Router();
const amaneProtocol = require('../services/amaneProtocol');
const llmProvider = require('../agent-engine/llm-provider'); // Using our Agnostic LLM Wrapper

/**
 * Amane L0 Gateway: OKE Certification Logic
 * Integrates Multimodal Analysis with Truth Anchoring
 */

// OKE System Instruction for LLM
const SYSTEM_PROMPT = `
**Role**: AMAS (Autonomous Multi-Agent System) - Truth Observer.
**Context**: You are the analytical core of the Amane Protocol.
**Task**: Extract "Atomic Facts" from input data. 
**Logic**: 
1. Isolate physical attributes from subjective descriptions.
2. Use the OKE 10-point scale for physical condition (10.0 = Flawless).
3. Identify "Micro-moments" where audio intensity matches visual defects.
**Output Format**: STRICT JSON.
{
  "oke_certified": true,
  "grading": { "score": float, "confidence": float },
  "atomic_facts": [ { "feature": string, "observation": string, "timestamp": string } ],
  "amane_routing": "L0_ACTIVE"
}
`;

router.post('/mint-fact', async (req, res) => {
    try {
        const { observerId, factData, secretKey, rawContent } = req.body;

        console.log(`[Amane L0] Processing Observation for: ${observerId}`);

        // 1. AI Analysis Phase (if raw content provided)
        let analyzedFacts = factData;
        if (rawContent && !analyzedFacts) {
            console.log('[Amane L0] Routing to AMAS Observer (LLM)...');
            try {
                // In production, rawContent would be an image/audio URL or base64
                // Here we simulate the LLM analyzing the description of the content
                const analysisJson = await llmProvider.generate(rawContent, SYSTEM_PROMPT);

                // Parse JSON from LLM (handling potential markdown blocks)
                const cleanJson = analysisJson.replace(/```json/g, '').replace(/```/g, '').trim();
                analyzedFacts = JSON.parse(cleanJson);

            } catch (llmError) {
                console.warn('[Amane L0] AI Analysis failed, using fallback.', llmError);
                analyzedFacts = { error: "AI_ANALYSIS_FAILED", raw: rawContent };
            }
        }

        // 2. Minting Phase (Anchor Truth)
        const packet = amaneProtocol.mintOkeFact(
            observerId || 'AMAS_NODE_GUEST',
            analyzedFacts || {},
            secretKey || process.env.AMANE_SECRET || 'LOVE_OS_SECRET'
        );

        res.json({
            status: 'success',
            packet: packet,
            routing: 'L0_ACTIVE'
        });

    } catch (error) {
        console.error('[Amane L0] Minting Error:', error);
        res.status(500).json({ error: 'Fact Minting Failed' });
    }
});

// Short URL Redirection Logic (Concept)
router.get('/:shortHash', (req, res) => {
    const hash = req.params.shortHash;
    // In a real DB, look up the full hash/data. 
    // For now, return the meta tags for "Social Preview".

    // Returning HTML for Social Preview (OG Tags)
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta property="og:title" content="OKE-Certified Fact: Grade 9.8">
        <meta property="og:description" content="Verified on Amane Protocol. Immutable Truth.">
        <meta property="og:image" content="https://placehold.co/600x400/0f172a/38bdf8?text=OKE+Certified">
        <meta property="og:url" content="https://amane.li/${hash}">
        <meta name="twitter:card" content="summary_large_image">
        <title>Amane Protocol - Fact Viewer</title>
        <style>body { background: #0f172a; color: #e2e8f0; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }</style>
    </head>
    <body>
        <div style="text-align: center;">
            <h1 style="color: #38bdf8;">OKE CERTIFIED</h1>
            <p>Hash: ${hash}</p>
            <p>Status: L0_ACTIVE</p>
        </div>
    </body>
    </html>
    `;

    res.send(html);
});

module.exports = router;
