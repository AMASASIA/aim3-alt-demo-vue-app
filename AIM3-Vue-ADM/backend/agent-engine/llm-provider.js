require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Gemini-First LLM Provider
 * Optimized for Gemini 1.5 Flash for speed and multi-modal support.
 */

class LLMProvider {
    constructor() {
        this.apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        this.modelName = "gemini-1.5-flash";

        if (this.apiKey && !this.apiKey.includes('placeholder')) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: this.modelName });
        } else {
            console.warn("[LLM] No valid Gemini API Key found. Using Mock Mode.");
        }
    }

    async generate(prompt, systemContext = "") {
        console.log(`[Gemini] Generating response for: ${prompt.substring(0, 50)}...`);

        // --- MOCK FALLBACK ---
        if (!this.model) {
            return this.mockResponse(prompt, systemContext);
        }

        // --- REAL GEMINI CALL ---
        try {
            // Using systemInstruction for Gemini 1.5 if preferred, 
            // but for simple generateContent we can combine.
            const modelToUse = systemContext
                ? this.genAI.getGenerativeModel({ model: this.modelName, systemInstruction: systemContext })
                : this.model;

            const result = await modelToUse.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return text;
        } catch (e) {
            console.warn("[Gemini] API Call failed, falling back to mock.", e.message);
            return this.mockResponse(prompt, systemContext);
        }
    }

    async analyzeImage(base64Image, prompt) {
        if (!this.model) return this.mockResponse("IMAGE_ANALYSIS", "");

        try {
            const result = await this.model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image.split(',')[1],
                        mimeType: "image/jpeg"
                    }
                }
            ]);
            return result.response.text();
        } catch (e) {
            console.error("[Gemini Vision] Failed:", e);
            return null;
        }
    }

    mockResponse(prompt, context) {
        if (context.includes('ROUTER')) {
            if (prompt.toLowerCase().includes('complex') || prompt.toLowerCase().includes('research') || prompt.toLowerCase().includes('plan')) return 'COMPLEX';
            return 'STANDARD';
        }
        return `[Gemini Mock]: I understand "${prompt}". (Ensure GEMINI_API_KEY is valid for real AI responses)`;
    }
}

module.exports = new LLMProvider();

