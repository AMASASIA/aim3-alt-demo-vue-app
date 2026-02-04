class AgentState {
    constructor(sessionId, userId) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.history = []; // Conversation history
        this.context = {}; // Shared memory (Working Memory)
        this.plan = [];    // Strategy plan for Orchestrator
        this.status = 'IDLE'; // IDLE, RUNNING, WAITING, DONE
        this.logs = [];    // Execution logs for debugging/audit
    }

    updateContext(key, value) {
        this.context[key] = value;
        this.log(`Context updated: ${key}`);
    }

    addToHistory(role, content) {
        this.history.push({ role, content, timestamp: Date.now() });
    }

    setPlan(steps) {
        this.plan = steps;
        this.log('New plan established.');
    }

    log(message) {
        const entry = { timestamp: Date.now(), message };
        this.logs.push(entry);
        console.log(`[State:${this.sessionId}] ${message}`);
    }

    serialize() {
        return {
            sessionId: this.sessionId,
            status: this.status,
            context: this.context,
            plan: this.plan,
            historyLength: this.history.length
        };
    }
}

module.exports = AgentState;
