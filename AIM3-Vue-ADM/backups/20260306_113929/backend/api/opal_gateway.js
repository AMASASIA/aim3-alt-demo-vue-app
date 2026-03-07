const express = require('express');
const router = express.Router();
const MintAgent = require('../agent-engine/mint_topology');
const fs = require('fs');
const path = require('path');

// Load workflow definition
const WORKFLOW_DEF = JSON.parse(fs.readFileSync(path.join(__dirname, '../opal-bridge/opal_workflow_real.json')));

// Define Gateway
router.post('/workflow/customer-inquiry', async (req, res) => {
    try {
        const { text, userId } = req.body;
        console.log(`[OPAL Gateway] Trigger Node: Customer Inquiry from ${userId}`);

        // Initialize MINT Agent
        const agent = new MintAgent(process.env.GEMINI_API_KEY);

        // Load System Instruction
        const instruction = WORKFLOW_DEF.nodes.find(n => n.id === 'mint_reasoning').config.systemInstruction;

        // Execute Step (Reason -> Act -> Observe Loop)
        const response = await agent.executeStep(text, { instruction });

        res.status(200).json({ status: 'success', data: response });
    } catch (error) {
        console.error('[OPAL Gateway] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
