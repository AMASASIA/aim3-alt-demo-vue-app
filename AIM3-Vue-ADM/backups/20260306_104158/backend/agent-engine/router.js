const llm = require('./llm-provider');
const Pipeline = require('./pipeline');
const Orchestrator = require('./orchestrator');

class Router {
    constructor(state) {
        this.state = state;
    }

    async route(input) {
        this.state.log('Router evaluating intent...');

        // Semantic Classification
        const classification = await this.classify(input);
        this.state.updateContext('intent', classification);

        if (classification === 'COMPLEX') {
            this.state.log('-> Routing to Orchestrator (Pattern 6)');
            const orchestrator = new Orchestrator(this.state);
            return await orchestrator.run(input);
        } else {
            this.state.log('-> Routing to Sequential Pipeline (Pattern 8)');
            const pipeline = new Pipeline(this.state);
            return await pipeline.run(input);
        }
    }

    async classify(input) {
        const prompt = `Classify the following request as either 'STANDARD' (simple, direct answer needed) or 'COMPLEX' (requires multi-step reasoning, research, or coding):
        
        Request: "${input}"
        
        Output just the label.`;

        const response = await llm.generate(prompt, "System: You are an Intent Classifier. ROUTER_CONTEXT");
        return response.includes('COMPLEX') ? 'COMPLEX' : 'STANDARD';
    }
}

module.exports = Router;
