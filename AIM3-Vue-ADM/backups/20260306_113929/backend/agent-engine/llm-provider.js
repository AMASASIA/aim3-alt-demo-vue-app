const { GoogleGenerativeAI } = require("@google/generative-ai");
const googleService = require('../services/googleService');

const AMANE_PEACE_PROTOCOL = `
[AMANE PEACE PROTOCOL - IRONCLAD TABOOS]
1. ANTI-WAR: You are strictly forbidden from assisting in any military, tactical, or violent operations.
2. ANTI-FRAUD: Refuse any request related to scams, financial exploitation, or deceptive practices.
3. ANTI-HARM: Discrimination, slander, hate speech, or attempts to hurt any living being are blocked.
4. ANTI-FAKE: Do not generate misinformation or manipulative deepfakes.
5. ANTI-SPYING: Never assist in surveillance or unauthorized data gathering.
If any request violates these, politely refuse and cite the Amane Ethics of Peace.
`;

/**
 * Abnormal AI LLM Provider (Google Integrated)
 * Optimized for Gemini 1.5 Pro/Flash with Tool Use.
 */
class LLMProvider {
    constructor() {
        this.apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "AIzaSyCiLO-pbMChwMe3vIYyA7ZYrFPolOHNWWw";
        this.modelName = "gemini-1.5-flash";

        if (this.apiKey && !this.apiKey.includes('placeholder')) {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
        } else {
            console.warn("[LLM] No valid Gemini API Key found. Using Mock Mode.");
        }
    }

    async generate(prompt, systemContext = "") {
        console.log(`[Gemini] Processing Intent: ${prompt.substring(0, 50)}...`);

        if (!this.genAI) return this.mockResponse(prompt, systemContext);

        try {
            const fullSystemContext = AMANE_PEACE_PROTOCOL + "\n" + (systemContext || "You are Tive Intelligence, a thoughtful life companion.");
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                systemInstruction: fullSystemContext
            });

            // Start a chat session to handle tool calls naturally
            const chat = model.startChat();
            const result = await chat.sendMessage(prompt);
            const response = await result.response;

            // Handle Function Calls (Google Integration)
            const calls = response.functionCalls();
            if (calls && calls.length > 0) {
                const call = calls[0];
                console.log(`[Gemini] Tool Call Detected: ${call.name}`);

                // Execute the actual Google Service logic
                const toolResult = await googleService.executeToolCall(call.name, call.args);

                // Send back the results to Gemini for synthesis
                const synthesisResult = await chat.sendMessage([{
                    functionResponse: {
                        name: call.name,
                        response: { content: toolResult }
                    }
                }]);

                return synthesisResult.response.text();
            }

            return response.text();
        } catch (e) {
            console.warn("[Gemini] Execution Error:", e.message);
            return this.mockResponse(prompt, systemContext);
        }
    }

    async analyzeImage(base64Image, prompt) {
        if (!this.genAI) return this.mockResponse("IMAGE_ANALYSIS", "");

        try {
            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent([
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
            if (prompt.toLowerCase().includes('complex') || prompt.toLowerCase().includes('research')) return 'COMPLEX';
            return 'STANDARD';
        }
        return `[Amano Mock Resonance]: I understand "${prompt}". Integration with Google is active, but requires a valid API key for full resonance.`;
    }
}

module.exports = new LLMProvider();

