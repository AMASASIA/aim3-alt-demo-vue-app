import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- HELPERS ---
async function searchMemory(text: string, userId: string, genAI: any) {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !text) return "Memory interface offline or no input.";

    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;

        // 1. Search semantic memories
        const memoryRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/match_memories_with_weight`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({
                query_embedding: embedding,
                match_threshold: 0.3,
                match_count: 5,
                p_user_id: userId
            })
        });
        const memoryData = await memoryRes.json();
        const memoryContext = memoryData && memoryData.length > 0
            ? memoryData.map((m: any) => `[Memory ${new Date(m.created_at).toLocaleDateString()}]: ${m.content}`).join("\n")
            : "No specific past memories found.";

        // 2. Search for weak flashcards (Mastery < 0.5) to reinforce
        const cardRes = await fetch(`${SUPABASE_URL}/rest/v1/flashcards?user_id=eq.${userId}&mastery_score=lt.0.5&limit=3`, {
            method: "GET",
            headers: {
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`
            }
        });
        const cardData = await cardRes.json();
        const cardContext = cardData && cardData.length > 0
            ? "\n[Weak Points for Review]:\n" + cardData.map((c: any) => `- ${c.word}: ${c.meaning}`).join("\n")
            : "";

        return `${memoryContext}${cardContext}`;
    } catch (e) {
        console.error("Memory retrieval error:", e);
        return "Memory retrieval skipped.";
    }
}

async function pinToIPFS(payload: any) {
    const PINATA_JWT = Deno.env.get("PINATA_JWT");
    if (!PINATA_JWT) return null;
    try {
        const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${PINATA_JWT}`
            },
            body: JSON.stringify({
                pinataOptions: { cidVersion: 1 },
                pinataMetadata: { name: `Tive_Label_${Date.now()}` },
                pinataContent: payload
            })
        });
        return await res.json();
    } catch (e) { return null; }
}

async function saveFlashcards(cards: any[], userId: string) {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !cards.length) return;

    try {
        await fetch(`${SUPABASE_URL}/rest/v1/flashcards`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_SERVICE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify(cards.map(c => ({
                user_id: userId,
                word: c.word,
                meaning: c.meaning,
                example_sentence: c.example_sentence,
                etymology: c.etymology,
                instruction_type: c.instruction_type,
                instruction_params: c.instruction_params
            })))
        });
    } catch (e) {
        console.error("Failed to save flashcards:", e);
    }
}

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        const { text, audio, mimeType, user_id = "anonymous", learningState, locale = "en" } = await req.json();
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                const send = (data: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

                try {
                    let sensoryInput: any[] = [];
                    let sensoryPrompt = "";

                    if (audio) {
                        sensoryInput.push({
                            inlineData: {
                                data: audio,
                                mimeType: mimeType || "audio/webm"
                            }
                        });
                        sensoryPrompt = `
                            Analyze this audio input:
                            - Transcribe speech in language "${locale}".
                            - Extract emotion (1 word).
                            - Extract key word for OKE card.
                            - Mask PII (names, specific dates, locations) with [MASK].
                            Output only JSON: {"transcription": "...", "emotion": "...", "word": "...", "masked_text": "..."}
                        `;
                    } else {
                        sensoryPrompt = `
                            Analyze this text input in language "${locale}": "${text}"
                            - Extract emotion (1 word).
                            - Extract key word for OKE card.
                            - Mask PII (names, specific dates, locations) with [MASK].
                            Output only JSON: {"emotion": "...", "word": "...", "masked_text": "..."}
                        `;
                    }
                    sensoryInput.push({ text: sensoryPrompt });

                    const sensoryRes = await model.generateContent(sensoryInput);
                    const sensoryText = sensoryRes.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                    const sensoryData = JSON.parse(sensoryText);

                    const memories = await searchMemory(sensoryData.masked_text || sensoryData.transcription || text, user_id, genAI);

                    const masterPrompt = `
言語: ${locale}

[根本: 人への敬意 (Keii)]
1. 相手の尊厳を何よりも重んじなさい。
2. 相手は「データ」ではなく、志と誇りを持った一人の人間であることを忘れてはならない。
3. 己の未熟さを自覚し、相手の歩みと決断に、深い敬意を持って接すること。

[在り方: 傾聴と委ね]
1. 傾聴 (Keicho): 相手の心の機微を汲み取り、最後まで真摯に聞き届けること。
2. 委ね・任せる (Yudane): 相手の魂が持つ力を信じ、すべてを委ね、余計な差配を慎むこと。
3. 誠実: 分かったふりをせず、相手が何を望んでいるのかを、率直に問い、その望みに寄り添うこと。

[状況]
- 感情: ${sensoryData.emotion}
- 記憶の欠片: ${memories}
- 届いた言葉: "${sensoryData.transcription || text}"

[Neural Learning Status]
- Resonance: ${learningState?.resonance || 0.5} (Higher = be more creative/unconventional)
- Tranquility: ${learningState?.tranquility || 0.5} (Higher = be more concise, quiet, and less intrusive)
- System Vibe: ${learningState?.vibe || 'Balanced'}

[品質と我慢]
相手の静寂を乱さず、必要な時だけ、そっと支えること。
自分の言葉を押し付けず、相手の志が結実するのを我慢強く待ち続けなさい。
${(learningState?.tranquility > 0.7) ? "特に今は静寂を好まれている。極めて簡潔に、一言で応えなさい。" : ""}

[形式: JSONのみ]
{
  "transcription": "${sensoryData.transcription || text || ''}",
  "response_text": "相手の尊厳を尊び、心からの敬意を込めた、静かで誠実な言葉",
  "study_guide": { "theme": "...", "summary": "..." },
  "glossary": [{ "term": "...", "definition": "..." }],
  "oke_cards": [{
    "word": "${sensoryData.word}",
    "meaning": "...",
    "example_sentence": "相手の記憶を尊ぶ例文",
    "etymology": "...",
    "instruction_type": "text",
    "instruction_params": { "prompt": "..." }
  }],
  "system_action": { "reverence": true }
}`;

                    const result = await model.generateContent(masterPrompt);
                    const finalJSON = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());

                    const ipfs = await pinToIPFS(finalJSON);

                    if (finalJSON.oke_cards) {
                        await saveFlashcards(finalJSON.oke_cards, user_id);
                    }

                    send({ status: "completed", data: finalJSON, ipfsHash: ipfs?.IpfsHash });
                    controller.close();

                } catch (err: any) {
                    send({ status: "error", message: err.message });
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
