const llm = require('./llm-provider');

class Pipeline {
    constructor(state) {
        this.state = state;
    }

    async run(input) {
        this.state.status = 'PIPELINE_RUNNING';
        this.state.log('Starting Sequential Pipeline (Pattern 8)');

        // Step 1: Draft
        const draft = await this.draftStep(input);
        this.state.updateContext('draft', draft);

        // Step 2: Critique
        const critique = await this.critiqueStep(draft);
        this.state.updateContext('critique', critique);

        // Step 3: Refine
        const finalOutput = await this.refineStep(draft, critique);

        this.state.status = 'DONE';
        return finalOutput;
    }

    async draftStep(input) {
        this.state.log('>> Step 1: Drafting');
        const prompt = `Task: Generate a comprehensive initial response for: "${input}". 
        Focus on clarity and completeness.`;
        return await llm.generate(prompt, "System: You are an expert drafter.");
    }

    async critiqueStep(draft) {
        this.state.log('>> Step 2: Critiquing');
        const prompt = `Review the following draft for potential errors, bias, or missing info:\n"${draft}"\n
        Provide specific improvement points.`;
        return await llm.generate(prompt, "System: You are a critical reviewer.");
    }

    async refineStep(draft, critique) {
        this.state.log('>> Step 3: Refining');
        const prompt = `Original Draft: "${draft}"\nCritique: "${critique}"\n
        Rewrite the draft to address the critique and polish the final output.`;
        return await llm.generate(prompt, "System: You are a final editor.");
    }
}

module.exports = Pipeline;
