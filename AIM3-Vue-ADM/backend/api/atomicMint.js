const express = require('express');
const router = express.Router();
const { uploadJSON } = require('../services/ipfs');
const { executeAtomicMint } = require('../services/atomic');

// Database Mock (In-memory)
const db = {
    rally: {},
    pins: [],
    logs: []
};

router.post('/', async (req, res) => {
    try {
        const { address, metadata, rally, aiLog } = req.body;

        console.log(`[Atomic API] 🚀 Processing request for ${address}`);

        // 1. Upload Metadata to IPFS (The "Soul" of the content)
        const ipfsResult = await uploadJSON(metadata);
        console.log(`[Atomic API] 📦 IPFS Metadata: ${ipfsResult.url}`);

        // 2. Execute Atomic Mint on Blockchain (The "Body" and "Proof")
        // Calls AtomicMint.sol -> Mints SBT + NFT + TBA in one TX
        const chainResult = await executeAtomicMint(address, ipfsResult.url);
        console.log(`[Atomic API] ⛓️ Blockchain Tx: ${chainResult.tx}`);

        // 3. Update Sync Database (Rally, Map, AI Logs) (The "Memory")
        db.rally[address] = rally;

        // Add Map Pin
        db.pins.push({
            address,
            tx: chainResult.tx,
            location: metadata.location || "Unknown",
            energy: aiLog?.energyScore || 0.5,
            timestamp: Date.now()
        });

        // Store AI Log
        db.logs.push({
            address,
            log: aiLog,
            prompt: metadata.description
        });

        // 4. Return unified success response
        res.json({
            success: true,
            transaction: chainResult,
            ipfs: ipfsResult,
            rally: rally, // Echo back current rally state
            message: "AIM3 Atomic Mint Complete: Physical, Digital, and AI states synchronized."
        });

    } catch (error) {
        console.error("[Atomic API] ❌ Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/pins', (req, res) => {
    res.json(db.pins);
});

module.exports = router;
