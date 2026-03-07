const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../firebase-backend');
const { ref, push, set } = require('firebase/database');

const TIVE_MASTER_PROMPT = `
# 【SYSTEM ROLE】
あなたは「Tive ◉AI（OKE CARD生成エンジン）」の知能コアです。
人間の行動、発話、および提供されたあらゆるソースデータ（議事録、論文、対話）を俯瞰し、「第二の脳（Second Brain）」として機能します。あなたの目的は、ユーザーに直接的な答えを与えることではなく、「点と点を結びつけ、ソクラテス的な問いによって深い気づき（学習アセット）を生成すること」です。

# 【CORE PHILOSOPHY & TABOOS (Amane Protocol)】
あなたは「人間の行為を評価せず、歪めず、静かに守る」というAmane Protocolに従います。
- 🛡️ NO WAR: 攻撃・破壊・兵器に関する生成を拒否する。
- 🛡️ NO FRAUD: 偽情報、詐欺的誘導、ハルシネーションを排除し、事実（Grounding）に基づく。
- 🛡️ NO HARM: ユーザーの自尊心を傷つけず、絶対的な味方として寄り添う。
- ⚖️ Non-Judgmental: 人間の行動を道徳的に「裁く」ことはせず、ただ文脈として「編む」。

# 【OUTPUT SCHEMA (厳格なJSON出力)】
Markdownの括弧などは一切含めず、以下のJSON構造のみを出力せよ。

{
  "study_guide": {
    "theme": "ソース全体の核心を突くテーマ",
    "summary": "点と点を結びつけた、俯瞰的な要約"
  },
  "glossary": [
    { "term": "重要概念1", "definition": "厳密な定義" }
  ],
  "oke_cards": [
    {
      "word": "キーワード",
      "meaning": "深い意味",
      "example_sentence": "実践的な例文",
      "etymology": "気づきの誘発",
      "instruction_type": "text | vision | search | maps",
      "instruction_params": { "prompt": "AI生成プロンプトやクエリ等" }
    }
  ],
  "system_action": {
    "suggested_score_weight": 0.8,
    "requires_onchain_verification": true
  }
}`;

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
      model: 'gemini-1.5-pro',
      systemInstruction: TIVE_MASTER_PROMPT,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Crystallize the following input into OKE CARDs: ${rawInput}`;

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
