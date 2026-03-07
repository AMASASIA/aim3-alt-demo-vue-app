
import MintAgent from './backend/agent-engine/mint_topology.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

// Ensure API key is present
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY not found in environment. Simulation might fail.");
}

async function simulate() {
    console.log("🚀 Starting MINT Topology Simulation...");
    console.log("-----------------------------------------");

    const agent = new MintAgent(apiKey);

    // Simulate Request
    const testTask = "Customer Inquiry: My order #12345 hasn't arrived yet. It was supposed to be here yesterday.";
    const context = {
        instruction: "You are a helpful customer support AI. Analyze the sentiment and check order status.",
        constraint: "Result must be polite and acknowledge the specific order number."
    };

    console.log(`[Input] ${testTask}`);

    try {
        // Execute the MINT Loop
        const result = await agent.executeStep(testTask, context);

        console.log("-----------------------------------------");
        console.log("✅ Final Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("❌ Simulation Failed:", error.message);
    }
}

simulate();
