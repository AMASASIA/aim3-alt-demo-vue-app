const express = require('express');
const router = express.Router();

/**
 * Mock Finance Execution Endpoint
 * Handles agentic payments and returns dummy transaction hashes.
 */
router.post('/execute', async (req, res) => {
    try {
        const { amount, recipient, currency = 'SBT' } = req.body;

        if (!amount || !recipient) {
            return res.status(400).json({ error: 'Missing amount or recipient' });
        }

        console.log(`[Finance Mock] Executing purchase: ${amount} ${currency} to ${recipient}`);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const tx_hash = `0x${Math.random().toString(16).slice(2, 42)}`;

        res.json({
            status: 'success',
            message: 'Transaction executed successfully',
            tx_hash: tx_hash,
            details: {
                amount,
                recipient,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Finance Mock Error:', error);
        res.status(500).json({ error: 'Atomic Mint execution failed' });
    }
});

module.exports = router;
