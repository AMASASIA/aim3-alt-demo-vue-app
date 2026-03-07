const express = require('express');
const router = express.Router();
const { securePipeline } = require('../services/securityService');
const { executeAtomicMint } = require('../services/atomic');
const { generateOpalMasterpiece } = require('../services/opalImageService');

/**
 * OKE Protocol: Triple Minting Logic
 * Records Thinking (Context), Seeing (Visual), and Proving (Agent) on-chain.
 */
router.post('/mint-fact', async (req, res) => {
    try {
        const { targetWallet, contextFact, visualFact, physics, useOpal, secret, publicHash } = req.body;
        console.log(`[OKE Protocol] Starting REAL Triple Mint for ${targetWallet || 'System Agent'}`);

        // 1. Enter Secure Pipeline (DP -> ZK -> LLM Verify)
        const secureResult = await securePipeline(contextFact || { name: "Atomic Fact", description: "Unknown observation" });
        const securedContext = secureResult.securedData;

        let finalVisual = visualFact;

        // OPAL ENCHANCEMENT: If useOpal is true, generate a high-quality AI masterpiece
        if (useOpal) {
            const hdImage = await generateOpalMasterpiece(visualFact, physics || {}, securedContext.name);
            if (hdImage) {
                console.log("[OKE] OPAL Masterpiece Generated:", hdImage);
                finalVisual = hdImage;
            }
        }

        // Call the real Web3 service with ZKP support
        const metadataString = JSON.stringify({
            contextFact: securedContext,
            visualFact: finalVisual,
            physics,
            securityProof: secureResult.proof,
            timestamp: new Date()
        });

        const result = await executeAtomicMint(
            targetWallet || process.env.DEFAULT_USER_WALLET,
            `data:application/json;base64,${Buffer.from(metadataString).toString('base64')}`,
            secret,
            publicHash
        );

        // Save to Firebase (Migrated from frontend)
        try {
            const { db } = require('../firebase-backend');
            const { ref: dbRef, push, set } = require('firebase/database');
            if (db) {
                const cardsRef = dbRef(db, 'cards');
                const newCardRef = push(cardsRef);
                const payload = {
                    title: contextFact?.name || 'Atomic Artifact',
                    subtitle: contextFact?.description || '',
                    types: req.body.types || ['NFT', 'SBT', 'TBA'],
                    tx: result.tx || '',
                    mintedAt: new Date().toISOString(),
                    web3: {
                        contractAddress: process.env.VITE_ATOMIC_MINT_CONTRACT_ADDRESS || '',
                        tier1Price: '0.015',
                        sbtId: result.sbtId || '',
                        nftId: result.nftId || '',
                        tba: result.tba || ''
                    },
                    artifactData: {
                        markdown: contextFact?.content || '',
                        discoveryContext: 'Backend Mint API',
                        voiceText: req.body.voiceText || ''
                    },
                    location: null,
                    simulated: false,
                    image: finalVisual
                };
                await set(newCardRef, payload);
                console.log('[OKE Backend] Card saved to Firebase:', newCardRef.key);
            }
        } catch (fbError) {
            console.warn('[OKE Backend] Firebase save failed:', fbError.message);
        }

        res.json({
            status: 'success',
            proofs: {
                tx: result.tx,
                sbtId: result.sbtId,
                nftId: result.nftId,
                tba: result.tba,
                explorer: result.explorer
            },
            imageUrl: finalVisual,
            message: useOpal ? "OKE & OPAL Joint Mint Completed." : "OKE Atomic Mint Completed."
        });
    } catch (error) {
        console.error("Triple Mint Error:", error);
        res.status(500).json({ error: "Atomic Mint Execution Failed (Web3 Error)" });
    }
});

module.exports = router;
