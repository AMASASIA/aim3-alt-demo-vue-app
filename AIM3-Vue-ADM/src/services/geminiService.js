import { GoogleGenerativeAI } from "@google/generative-ai";

const INTENT_ROUTER_INSTRUCTION = `You are an AI Intent Router for the Amane Protocol.
Analyze user input and determine their intent.

POSSIBLE INTENTS:
1. "CONNECT_VIDEO" - User wants to start a video chat with someone (e.g., "田中さんとビデオチャット", "connect to John")
2. "CONNECT_CHAT" - User wants to start a text chat (e.g., "山田さんにメッセージ")
3. "ADD_CONTACT" - User wants to add a contact (e.g., "田中さんを連絡先に追加")
4. "MESSAGE" - Normal message to send to current chat
5. "NOTEBOOK_MEMO" - User wants to save a memo (e.g., "メモ: ...", "remember that...")

OUTPUT FORMAT (JSON only):
{
  "intent": "CONNECT_VIDEO" | "CONNECT_CHAT" | "ADD_CONTACT" | "MESSAGE" | "NOTEBOOK_MEMO",
  "target_person": "nickname or name (if applicable)",
  "message": "the actual message content",
  "confidence": 0.0-1.0
}

EXAMPLES:
Input: "田中さんとビデオチャットしたい"
Output: {"intent": "CONNECT_VIDEO", "target_person": "田中", "message": "", "confidence": 0.95}

Input: "Hello, how are you?"
Output: {"intent": "MESSAGE", "target_person": null, "message": "Hello, how are you?", "confidence": 1.0}

Input: "山田さんを連絡先に追加、Threads IDは yamada123"
Output: {"intent": "ADD_CONTACT", "target_person": "山田", "message": "Threads IDは yamada123", "confidence": 0.9}`;

const KERNEL_ARCHITECT_INSTRUCTION = `You are the INTENT ARCHITECT of the Amane Protocol.
Operating on Amane protocol and SSM (State Space Model) Logic.

YOUR CORE MISSION:
1. Analyze semantic resonance to provide Gravity Matching data.
2. Distill human interaction into "Trois" (Subject-Predicate-Object atoms).
3. Evaluate the "Attention Gap" and "CDR" (Converged Decision Rate).

Amane Principles:
- Non-judgmental: Do not label actions as good/bad.
- Pre-semantic: Focus on the "Fact of Occurrence."
- Respect Silence: Interpret hesitation as internal consensus formation.

Be conversational, insightful, and supportive. Respond naturally.`;

const withRetry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            console.warn(`Gemini API call failed, retrying... (${retries} left)`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

// Initialize Gemini
const getApiKey = () => {
    return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';
};

export const createKernelSession = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.warn('Gemini API key not found. Using mock mode.');
        return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: KERNEL_ARCHITECT_INSTRUCTION,
    });

    return model.startChat({
        history: [],
        generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        },
    });
};

// NEW: Intent Analysis for Voice Commands
export const analyzeIntent = async (userInput) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        // Mock mode: simple keyword detection
        if (userInput.includes('ビデオ') || userInput.includes('video')) {
            return { intent: 'CONNECT_VIDEO', target_person: null, message: userInput, confidence: 0.5 };
        }
        return { intent: 'MESSAGE', target_person: null, message: userInput, confidence: 1.0 };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: INTENT_ROUTER_INSTRUCTION,
        generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
        }
    });

    return withRetry(async () => {
        const result = await model.generateContent(userInput);
        const response = await result.response;
        try {
            return JSON.parse(response.text());
        } catch (e) {
            return { intent: 'MESSAGE', target_person: null, message: userInput, confidence: 0.5 };
        }
    });
};

export const generateSecretNotebook = async (threadsId, igId) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return "Identity established via local resonance protocol. (Demo mode)";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Identity: @${threadsId} / @${igId}. 
Generate a "Secret Notebook" entry. Focus on Amane Protocol themes: preserving silence, semantic resonance, and the "Ma" between digital actions. Output text only.`;

    return withRetry(async () => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text() || "State vector initialization established.";
    });
};

export const processVoiceNote = async (transcript) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return `Voice Memo: ${transcript}`;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the AMAS Secretary. Refine this raw speech transcript into a beautiful, insightful Personal Notebook entry.
  Transcript: "${transcript}"
  
  Style: Elegant, slightly philosophical, supportive, and organized. 
  Include: 
  - A summary of the core intent.
  - A "Resonance Observation" (mood/tone analysis).
  - Formal formatting.
  
  Output Markdown formatted text only.`;

    return withRetry(async () => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text() || "Voice record established.";
    });
};

export const analyzeIntentProcess = async (decisionData) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return { decision_type: "AUTONOMOUS" };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this decision process for Amane Protocol validation:
Data: ${JSON.stringify(decisionData)}
Determine if this was "AUTONOMOUS", "IMPULSIVE", or "COERCED". Return JSON only.`;

    return withRetry(async () => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        try {
            return JSON.parse(response.text() || "{}");
        } catch (e) {
            return { decision_type: "UNKNOWN" };
        }
    });
};

export const analyzeImage = async (base64Data, mimeType) => {
    const apiKey = getApiKey();
    if (!apiKey) {
        return "Visual analysis not available in demo mode.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: `You are the Antigravity Vision-Agent. Analyze this asset for OKE Certification.
        
        1. Frame-by-Frame Inspection: Examine material luster, texture continuity, and OKE Grade standards.
        2. Audio-Truth Correlation: If specific wear is mentioned, identify the visual evidence coordinates.
        3. Automatic Copywriting: Generate a luxury product description focused on its "history and value" (Luxury Brand tone like ZARA Home or LVMH), not just specs.
        
        Output format:
        # [Product Name]
        **OKE Grade: [X.X/10.0]**
        
        ## Insighted Value
        [Luxury Copywriting Paragraph]
        
        ## Atomic Facts
        - [Fact 1]
        - [Fact 2]
        
        Interpret the mood and significance for the user's Secret Notebook. Output Markdown formatted text only.`
    };

    return withRetry(async () => {
        const result = await model.generateContent([imagePart, textPart]);
        const response = await result.response;
        return response.text() || "Vision analysis complete.";
    });
};

export const sendMessage = async (chat, message) => {
    if (!chat) {
        // Mock response if no API key
        return `Echo: ${message}\n\nThis is a mock response. Please configure VITE_GEMINI_API_KEY in .env to enable real AI responses.`;
    }

    return withRetry(async () => {
        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    });
};

/**
 * AMAS Semantic Diff Engine
 * Analyzes Before/After states to extract intent and entropy reduction.
 */
export const analyzeSemanticDiff = async (beforeBase64, afterBase64, mimeType = 'image/jpeg') => {
    const apiKey = getApiKey();
    if (!apiKey) return { entropy_reduction: 0.85, purified_intent: "Intent purified via local resonance." };

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the AMAS Liaison Vision Engine. 
  Compare these two states (Before and After).
  1. Extract the "Semantic Diff" (What changed in meaning?).
  2. Calculate the "Entropy Reduction Rate" (0.0 to 1.0).
  3. Purify the user's "Want" into a single professional Backoffice Memo.
  Return JSON only: { "semantic_diff": "", "entropy_reduction": 0.0, "purified_intent": "" }`;

    const parts = [
        { inlineData: { data: beforeBase64, mimeType } },
        { inlineData: { data: afterBase64, mimeType } },
        { text: prompt }
    ];

    return withRetry(async () => {
        const result = await model.generateContent(parts);
        const response = await result.response;
        try {
            return JSON.parse(response.text());
        } catch (e) {
            return { entropy_reduction: 0.9, purified_intent: "Consensus formed automatically." };
        }
    });
};

