
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Load Configuration
const configPath = path.join(__dirname, 'ai_studio_config.json');
const aiConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * AI Studioで検証した設定を、Antigravity上のランタイムに適用する
 */
const initializeMintEngine = (apiKey) => {
    const genAI = new GoogleGenerativeAI(apiKey);

    // AI Studioのシステムプロンプトと設定を完全に同期
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash", // Using Flash as per current capability match
        systemInstruction: aiConfig.system_instruction,
        generationConfig: aiConfig.generation_config
    });

    console.log(`[MCP Bridge] AI Studio Context Loaded for Project: ${aiConfig.project_id}`);
    return model;
};

module.exports = { initializeMintEngine };
