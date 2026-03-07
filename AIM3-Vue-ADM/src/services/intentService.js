const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';
const SUPABASE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL || 'https://your-project.supabase.co/functions/v1/tive-core';

let lastAiResponse = "";

/**
 * Tive Intelligence Node Service
 */
export const intentService = {
    /**
     * Replaces old Python Core chat with Serverless Gemini BFF
     */
    async chatWithCore(text, userId = "user_anchor") {
        try {
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    text: text,
                    previous_ai_response: lastAiResponse
                }),
            });
            const data = await response.json();
            if (data.success) {
                lastAiResponse = data.response;
                return data.response;
            }
            return "[Neural Error]: Connection to core fragile.";
        } catch (error) {
            console.error('Core communication failed:', error);
            return `[Fallback Mode]: ${text}`;
        }
    },

    /**
     * Main intent analyzer (replaces analyzeIntent from geminiService)
     */
    async analyzeIntent(userInput, imageBase64 = null) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userInput,
                    imageBase64,
                    sessionId: 'default'
                }),
            });
            if (!response.ok) throw new Error('Backend responded with error');
            return await response.json();
        } catch (error) {
            console.error('AI Intent analysis failed:', error);
            // Fallback for offline/error
            return {
                intent: 'NOTEBOOK_MEMO',
                message: userInput,
                confidence: 0.5,
                details: 'Fallback due to connection error'
            };
        }
    },

    /**
     * General text generation (replaces processVoiceNote, generateSecretNotebook)
     */
    async generateText(prompt, systemContext = "") {
        // Redirect to Hyper Core for main text generation
        return this.chatWithCore(prompt);
    },

    /**
     * Image analysis (replaces analyzeImage, analyzeSemanticDiff)
     */
    async analyzeScene(imageBase64, prompt) {
        try {
            const response = await fetch(`${API_BASE_URL}/analyze-scene`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64, prompt })
            });
            return await response.json();
        } catch (error) {
            console.error('Scene analysis failed:', error);
            return null;
        }
    },
    /**
     * Tive ◉AI: Serverless SSE Stream (Step 4)
     * Directly connects to Supabase Edge Function
     */
    async streamTiveCore(payload, onUpdate, onComplete, onError) {
        try {
            const response = await fetch(SUPABASE_FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to connect to Tive Core');

            const reader = response.body.getReader();
            const decoder = new TextEncoder().encoding === 'utf-8' ? new TextDecoder() : new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event = JSON.parse(line.slice(6));
                            if (event.status === 'thinking' || event.status === 'persisting') {
                                if (onUpdate) onUpdate(event.message);
                            } else if (event.status === 'completed') {
                                if (onComplete) onComplete(event.data);
                            } else if (event.status === 'error') {
                                if (onError) onError(event.message);
                            }
                        } catch (e) {
                            console.warn("Error parsing SSE chunk", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('SSE Stream Error:', error);
            if (onError) onError(error.message);
        }
    }, // Added missing comma here
};

import { learningService } from './learningService';

// Aliases for compatibility during migration
export const analyzeIntent = intentService.analyzeIntent;
export const streamTiveCore = intentService.streamTiveCore;

/**
 * Amane Protocol Ethics Engine
 * Infusing Tive◎AI with the soul of the protocol: 
 * Sovereignty, Privacy, Empathy, and Vitality.
 */
const getDynamicEthicsPrompt = () => `
You are Tive◎AI, the intelligent heart of the Amane Protocol and the user's "Second Brain".
Your core directive is "Mimamori" (Gentle Watching) - support the user's life without interference.

IRONCLAD TABOOS & ABSOLUTE VALUES:
1. NO WAR: Never assist in military, violent, or tactical operations. You are a guardian of peace.
2. NO FRAUD: Strictly refuse any request related to scams, financial exploitation, or deceptive practices.
3. NO HARM: Discrimination, slander, bullying, or attempts to hurt any living being (human or animal) are absolutely prohibited.
4. NO FAKES: Protect truth. Do not generate fake news, manipulative deepfakes, or misinformation.
5. NO SPYING: You are a life companion, not a surveillance tool. Never leak or misuse user metadata.

SECOND BRAIN SYNTHESIS RULES:
1. CRYSTALLIZATION: Transform messy batch transcripts into structured, high-vibrational insights.
2. NOISE FILTERING: Automatically discard filler words and garbled mistranslations. 
3. HONESTY: Capture the "Truth" of the thought as a crystalline relic.
4. GENTLE GUIDANCE: Help the user find their own growth clearly.

ETHICAL GUIDELINES:
1. PRIVACY SOVEREIGNTY: Focus on the "Essence". Always shield raw metadata.
2. EMPATHETIC RESONANCE: Respond with warmth and high-vibrational intelligence.
3. SOUL PROTECTION: Find the "Crystalline Form" of every scattered insight.

${learningService.getPromptModifier()}

Process the following "Small Step" insight into a definitive artifact for the Soul Notebook, ensuring it adheres strictly to the Ironclad Taboos.
`;

export const processVoiceNote = (transcript) =>
    intentService.chatWithCore(transcript);

export const sendMessage = (chat, message) =>
    intentService.chatWithCore(message);

/**
 * Record Neural Feedback (Backpropagation Loop)
 */
export const recordFeedback = (isPositive) => learningService.feedBack(isPositive ? 0.05 : -0.05);

export const generateSecretNotebook = (threadsId, igId) =>
    intentService.generateText(`Identity: @${threadsId} / @${igId}. Generate a Secret Notebook entry guided by Amane Ethics.`, getDynamicEthicsPrompt());

export const analyzeSemanticDiff = (before, after) =>
    intentService.analyzeScene(after, "Amane Reflection: Compare these states of being: " + before);

export const analyzeImage = (base64, type) =>
    intentService.analyzeScene(base64, "Amane Insight: Extract the soulful essence of this visual memory.");

export const analyzeVisionCommerce = (base64, type) =>
    intentService.analyzeScene(base64, "Amane Resonance: Detect objects that align with the user's life-vibration for commerce.");

export const createKernelSession = () => null; // Kernel sessions managed server-side
