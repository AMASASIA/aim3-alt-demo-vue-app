const express = require('express');
const router = express.Router();
const { uploadJSON } = require('../services/ipfs');
const { executeAtomicMint } = require('../services/atomic');
const { securePipeline } = require('../services/securityService');
const { db } = require('../firebase-backend');
const { ref, push, set, child } = require("firebase/database");

router.post('/', async (req, res) => {
    try {
        const { address, metadata, rally, aiLog, secret, publicHash } = req.body;

        console.log(`[Atomic API] 🛡️ Entering Secure Pipeline for ${address}`);

        // --- 🛡️ MOCK MODE / DEMO SAFEGUARD ---
        if (process.env.MOCK_MODE === 'true') {
            return res.json({
                success: true,
                transaction: { tx: "0x" + "a".repeat(64), status: "confirmed" },
                ipfs: { url: "ipfs://mock_soul" + Date.now() },
                security: { proof: "zk_mock_commitment_passed" },
                message: "DEMO MODE: Atomic Mint Simulated Success (No gas used)."
            });
        }

        // 1. Secure Layer: DP -> ZK -> Verify -> Sign
        // Metadata is irreversibilized and signed here
        const secureResult = await securePipeline(metadata);

        // 2. Upload SECURED Metadata to IPFS (The "Soul" of the content)
        const ipfsResult = await uploadJSON(secureResult.securedData);
        console.log(`[Atomic API] 📦 Secured IPFS Metadata: ${ipfsResult.url}`);

        // 3. Execute Atomic Mint on Blockchain (The "Body" and "Proof")
        // Now supports ZKP parameters (secret, publicHash)
        const chainResult = await executeAtomicMint(address, ipfsResult.url, secret, publicHash);
        console.log(`[Atomic API] ⛓️ Blockchain Tx: ${chainResult.tx}`);

        // 3. Update Sync Database (Rally, Map, AI Logs) (The "Memory")
        // PERSISTENCE: Now using Firebase instead of memory

        // Save Rally State
        if (rally) {
            await set(ref(db, `rally/${address}`), rally);
        }

        // Add Map Pin
        await push(ref(db, 'pins'), {
            address,
            tx: chainResult.tx,
            location: metadata.location || "Unknown",
            energy: aiLog?.energyScore || 0.5,
            timestamp: Date.now()
        });

        // Store AI Log
        await push(ref(db, `logs/${address}`), {
            log: aiLog,
            prompt: metadata.description,
            timestamp: Date.now()
        });

        // 4. Return unified success response
        res.json({
            success: true,
            transaction: chainResult,
            ipfs: ipfsResult,
            security: secureResult.proof, // Returns ZK Commitment and Signature
            rally: rally, // Echo back current rally state
            message: "AIM3 Atomic Mint Complete: Data irreversalized and signed (Government-Grade Security)."
        });

    } catch (error) {
        console.error("[Atomic API] ❌ Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


const { getData } = require('../firebase-backend'); // Assumption: need helper or direct usage
const { get } = require("firebase/database");

router.get('/pins', async (req, res) => { // Async now
    try {
        const snapshot = await get(ref(db, 'pins'));
        if (snapshot.exists()) {
            res.json(Object.values(snapshot.val()));
        } else {
            res.json([]);
        }
    } catch (e) {
        res.status(500).json([]);
    }
});

module.exports = router;
