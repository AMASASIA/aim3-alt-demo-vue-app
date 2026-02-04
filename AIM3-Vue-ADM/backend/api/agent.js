const express = require('express');
const router = express.Router();
const AgentState = require('../agent-engine/state');
const Router = require('../agent-engine/router');

// In-memory session store (use Redis/DB for prod)
const sessions = new Map();

router.post('/', async (req, res) => {
    try {
        const { prompt, sessionId = 'default', userId = 'anchor' } = req.body;

        console.log(`[AgentEngine] Request received: ${prompt.substring(0, 30)}...`);

        // Initialize or retrieve State
        let state;
        if (sessions.has(sessionId)) {
            state = sessions.get(sessionId);
        } else {
            state = new AgentState(sessionId, userId);
            sessions.set(sessionId, state);
        }

        // Add user input to history
        state.addToHistory('user', prompt);

        // Execute Hybrid Flow
        const agentRouter = new Router(state);
        const result = await agentRouter.route(prompt);

        // Add agent output to history
        state.addToHistory('agent', result);

        res.json({
            status: 'success',
            response: result,
            meta: {
                trace: state.logs,
                type: state.context.intent
            }
        });

    } catch (error) {
        console.error('Agent Engine Error:', error);
        res.status(500).json({ error: 'Agent execution failed' });
    }
});

module.exports = router;
