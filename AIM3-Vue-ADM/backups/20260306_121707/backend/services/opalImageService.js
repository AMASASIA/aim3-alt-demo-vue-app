const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let openai = null;

function getOpenAIClient() {
    if (openai) return openai;

    const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        return null;
    }

    openai = new OpenAI({
        apiKey: apiKey,
    });
    return openai;
}

/**
 * OPAL Image Generation Service
 * Translates OKE Universe parameters into High-Definition Generative Art.
 */
async function generateOpalMasterpiece(base64Image, physics, contextName) {
    console.log(`[OPAL] Generating HD Masterpiece for context: ${contextName}`);

    // Phase 1: Contextual Reasoning (Interpet Physics into a Prompt)
    const prompt = `A professional digital art masterpiece following the 'OKE Protocol'. 
    Theme: "Water Sound Image 432Hz" and "Sacred Cymatics".
    Visuals: Expanding water ripples, liquid silver textures, and concentric wave patterns representing a 432Hz frequency.
    Aesthetic: Holographic rippling surfaces, bioluminescent aquatic glows, and glassmorphism.
    Structure: Symmetrical cymatic patterns (Symmetry: ${physics.symmetry}). 
    Atmosphere: Tranquil but powerful energy, liquid gravity (G: ${physics.G}), glowing sonic soul.
    Incorporate the essence of the user's uploaded image but transform it into an elite NFT art piece with deep 3D fluid dynamics and cinematic underwater lighting. 
    Style: Minimalist Liquid Silver, meditative 432Hz visualization, high contrast, 8k resolution.`;

    try {
        const client = getOpenAIClient();
        if (!client) {
            console.warn("[OPAL] No OpenAI Key. Using Enhanced Canvas Mock.");
            return null; // Let the frontend fallback or the backend return a high-quality static asset
        }

        const response = await client.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "hd",
            style: "vivid"
        });

        return response.data[0].url;
    } catch (error) {
        console.error("[OPAL] DALL-E Generation Failed:", error);
        return null;
    }
}

module.exports = { generateOpalMasterpiece };
