/**
 * MINT (Multimodal Intelligent Network Topology) Core Implementation
 * 
 * Implements the reasoning-action-observation loop with self-correction.
 */
const { GoogleGenerativeAI } = require("@google/generative-ai");

class MintAgent {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    /**
     * Executes a single MINT step with reasoning, action, and observation (validation).
     * @param {string} task - The input task or query.
     * @param {object} context - Execution context (system instructions, history).
     * @param {number} depth - Recursion depth for retries.
     */
    async executeStep(task, context, depth = 0) {
        if (depth > 3) {
            throw new Error("Max retry depth exceeded. MINT loop terminated to prevent infinite recursion.");
        }

        console.log(`\n[MINT] Step Start (Depth ${depth}): "${task.substring(0, 50)}..."`);

        // 1. Reasoning (推論)
        console.log(`[MINT] 🧠 Reasoning...`);
        const plan = await this.reason(task, context);

        // 2. Action (実行)
        console.log(`[MINT] ⚡ Action...`);
        const result = await this.act(plan);

        // 3. Observation (検証)
        console.log(`[MINT] 👁️ Observation...`);
        const validation = await this.observe(result, task, context);

        if (!validation.success) {
            console.warn(`[MINT] ⚠️ Validation Failed: ${validation.error}`);
            console.log(`[MINT] 🔄 Self-Correcting...`);

            // Recursive Retry with error context
            const refinedContext = { ...context, previousError: validation.error };
            return this.executeStep(`Retry previous task: ${task}. Fix error: ${validation.error}`, refinedContext, depth + 1);
        }

        console.log(`[MINT] ✅ Step Complete.`);
        return result;
    }

    async reason(task, context) {
        const sysPrompt = context.instruction || "You are an intelligent agent.";
        const prompt = `
        System: ${sysPrompt}
        Task: ${task}
        Context: ${JSON.stringify(context)}
        
        Instruction: Analyze the task and produce a JSON plan.
        Output Format: JSON { "reasoning": "thought process", "action": "function_name", "parameters": {} }
        `;

        const response = await this.model.generateContent(prompt);
        return this.parseJSON(response.response.text());
    }

    async act(plan) {
        // In a real topology, this distributes work to microservices
        // Here we simulate the execution
        return {
            status: "executed",
            plan_id: plan.action,
            output: `Executed action ${plan.action} with ${JSON.stringify(plan.parameters)}`,
            timestamp: Date.now()
        };
    }

    async observe(result, originalTask, context) {
        // Self-Reflection Loop
        const prompt = `
        System: Verify if the result meets the user's intent.
        Original Task: ${originalTask}
        Actual Result: ${JSON.stringify(result)}
        Constraint: ${context.constraint || "None"}
        
        Instruction: Return JSON.
        Output Format: JSON { "success": boolean, "error": "reason if failed" }
        `;

        const response = await this.model.generateContent(prompt);
        return this.parseJSON(response.response.text());
    }

    parseJSON(text) {
        try {
            return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) {
            return { error: "JSON Parse Error", raw: text };
        }
    }
}

module.exports = MintAgent;
