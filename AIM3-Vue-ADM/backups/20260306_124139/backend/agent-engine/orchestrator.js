const llm = require('./llm-provider');

class Orchestrator {
    constructor(state) {
        this.state = state;
        this.maxLoops = 5;
    }

    async run(input) {
        this.state.status = 'ORCHESTRATOR_RUNNING';
        this.state.log('Starting Orchestrator (Pattern 6)');

        // 1. Initial Planning
        const plan = await this.createPlan(input);
        this.state.setPlan(plan);

        // 2. Execution Loop
        let payload = { originalInput: input, intermediateResults: [] };
        let loops = 0;

        while (loops < this.maxLoops) {
            this.state.log(`Loop ${loops + 1}/${this.maxLoops}`);

            // Check if done
            const status = await this.checkCompletion(payload);
            if (status === 'DONE') break;

            // Execute next logical step
            const stepResult = await this.executeStep(payload);
            payload.intermediateResults.push(stepResult);
            this.state.updateContext(`step_${loops}`, stepResult);

            loops++;
        }

        // 3. Final Synthesis
        return await this.synthesize(payload);
    }

    async createPlan(input) {
        const prompt = `Analyze this request and create a step-by-step execution plan: "${input}"`;
        return (await llm.generate(prompt, "System: You are a strategic planner.")).split('\n');
    }

    async checkCompletion(payload) {
        // Simple mock check or LLM check
        // Real implementation would ask LLM: "Is the task complete based on results?"
        return payload.intermediateResults.length >= this.state.plan.length ? 'DONE' : 'CONTINUE';
    }

    async executeStep(payload) {
        const currentStepIndex = payload.intermediateResults.length;
        const currentTask = this.state.plan[currentStepIndex] || "General Analysis";

        this.state.log(`Executing Plan Step: ${currentTask}`);

        // Dynamic tool use could go here
        return await llm.generate(`Execute this task: ${currentTask}`, "System: You are a task worker.");
    }

    async synthesize(payload) {
        this.state.log('Synthesizing final result...');
        const prompt = `Based on these intermediate results: ${JSON.stringify(payload.intermediateResults)}, enable the final answer to user request: "${payload.originalInput}"`;
        return await llm.generate(prompt, "System: You are an integration specialist.");
    }
}

module.exports = Orchestrator;
