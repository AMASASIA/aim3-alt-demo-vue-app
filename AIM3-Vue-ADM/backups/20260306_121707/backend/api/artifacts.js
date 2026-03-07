const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../firebase-backend');
const { ref, push, set } = require('firebase/database');

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY);

/**
 * Step 1: OKE Artifact Crystallization & Auto-Push API
 * Pattern 1: Pack everything (Markdown, Web3, Context) into a single Firebase node.
 * This interprets user intent (voice/text) into a sellable digital artifact.
 */
router.post('/create', async (req, res) => {
  try {
    const { rawInput, location, imageBase64, identity } = req.body;
    console.log(`[OKE Orchestrator] Crystallizing intent for: ${identity}`);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro', // Using Pro as requested for high-quality logic
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
          あなたは @amas の意図を解釈するAI Orchestratorです。
          以下の[ユーザー入力（音声テキスト）]を解析し、AtoAで販売可能な「Artifact」として、
          以下の【必須JSONスキーマ】に完全に一致する形で出力してください。

          [ユーザー入力]: ${rawInput}

          【必須JSONスキーマ】
          {
            "title": "簡潔なタイトル (例: AIM3 System Architecture)",
            "subtitle": "サブタイトル",
            "location": { "lat": ${location?.lat || 0}, "lng": ${location?.lng || 0} },
            "web3": {
              "contractAddress": "${process.env.VITE_ATOMIC_MINT_CONTRACT_ADDRESS || '0x...Placeholder'}",
              "tier1Price": "0.015"
            },
            "artifactData": {
              "markdown": "# 🟢 Artifact...\\n\\n(詳細なMarkdown本文。技術的背景、設計思想、ポエティックな洞察を含めてください)",
              "discoveryContext": "Voice Input via Primal Interface"
            },
            "attributes": {
              "gravity": 0.35,
              "symmetry": 8,
              "purity": 0.9,
              "soul": 0.8
            }
          }
          必ず上記のJSONフォーマットのみを出力し、余計なテキストやMarkdownのコードブロック記号(\`\`\`)は含めないでください。
        `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const payload = JSON.parse(responseText.trim());

    // Prepare full package with images and system metadata
    const artifactId = `ART-${Date.now()}`;
    const completePayload = {
      ...payload,
      id: artifactId,
      identity: identity || 'anonymous',
      image: imageBase64, // The generated universe image (from canvas)
      minted: false,
      timestamp: new Date().toISOString(),
      source: 'Device-On-Device'
    };

    // Firebase: Direct push to 'cards' node as the source of truth
    const cardsRef = ref(db, 'cards');
    const newCardRef = push(cardsRef);
    await set(newCardRef, { ...completePayload, firebaseId: newCardRef.key });

    res.json({
      success: true,
      id: newCardRef.key,
      artifactId: artifactId,
      card: completePayload,
      message: 'OKE発行および音声結晶化が完了しました。'
    });

  } catch (error) {
    console.error('[Artifacts] Crystallization failed:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
