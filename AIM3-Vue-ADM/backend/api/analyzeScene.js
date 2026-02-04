const express = require('express');
const router = express.Router();
const llmProvider = require('../agent-engine/llm-provider');

// AI Vision & Commerce Logic
const analyzeScene = async (frameData) => {
    const prompt = `Analyze this video frame for commercial objects. 
    Return ONLY a JSON array of objects found, with this structure: 
    [{"id": "string", "label": "string", "price": number_in_cents, "currency": "JPY", "coordinates": {"x": percentage, "y": percentage}, "metadata": {"brand": "string", "description": "string"}}]
    Limit to 3 most relevant items.`;

    try {
        const responseText = await llmProvider.analyzeImage(frameData, prompt);
        // Extract JSON from response (Gemini might wrap it in markdown)
        const jsonMatch = responseText.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return [];
    } catch (e) {
        console.error("Gemini Parse Error:", e);
        return [];
    }
};

router.post('/', async (req, res) => {
    try {
        const { frame } = req.body;
        console.log('[Analyze] Processing Frame via Gemini Vision...');

        const a2uiItems = await analyzeScene(frame);

        res.json({
            status: 'success',
            items: a2uiItems
        });
    } catch (error) {
        console.error('Analysis Error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

module.exports = router;

