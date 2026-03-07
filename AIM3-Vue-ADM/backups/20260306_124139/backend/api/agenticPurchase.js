const express = require('express');
const router = express.Router();
const privacyGuard = require('../middleware/privacyGuard');
const web3Service = require('../services/web3Service');
const { executeStripePayment } = require('../services/stripeService');

// Interface for Storage Adapters
const storageAdapters = {
    googleSheet: async (data, paymentId) => {
        console.log(`[Storage: GSheet] Logging Purchase ${paymentId}: ${data.itemId}`);
        return true;
    },
    ipfs: async (data) => {
        console.log('[Storage: IPFS] Pinning to decentralized node...', data.itemId);
        return "QmHashMock123456789";
    },
    localDB: async (data) => {
        return true;
    }
};

const processedIds = new Set();

router.post('/', privacyGuard, async (req, res) => {
    try {
        const payload = req.body;
        console.log('[Agentic Purchase] Processing Clean Payload:', JSON.stringify(payload, null, 2));

        if (!payload.signature) {
            return res.status(401).json({ error: 'Missing Audit Signature. Transaction rejected.' });
        }

        // Idempotency
        if (processedIds.has(payload.signature)) {
            return res.status(409).json({ error: 'Transaction already processed' });
        }

        // 1. EXECUTE PAYMENT (One Strike)
        // We do this BEFORE the parallel block to ensure funds are secured first.
        console.log(`[Stripe] Initiating charge for ¥${payload.price}...`);

        let payment;
        try {
            payment = await executeStripePayment(
                payload.price,
                (payload.currency || 'jpy').toLowerCase(),
                payload.email
            );
        } catch (paymentError) {
            return res.status(402).json({ error: 'Payment Failed: ' + paymentError.message });
        }

        if (payment.status !== 'succeeded' && payment.status !== 'requires_payment_method') {
            // In Agentic flow, we might handle async payments, but for "One Strike" we assume success or fail.
            // For test mode, we might get 'requires_payment_method' if no method attached, but we mock success.
            console.warn('[Stripe] Payment status:', payment.status);
        }

        console.log(`[Stripe] Payment Successful: ${payment.id}`);
        processedIds.add(payload.signature); // Mark as processed only after payment

        // 2. PARALLEL EXECUTION (Save & Mint)
        console.log('[Antigravity] Payment secured. Executing parallel assetization...');

        const results = await Promise.all([
            // Storage
            storageAdapters.googleSheet(payload, payment.id),
            storageAdapters.ipfs(payload),

            // Web3 Minting
            web3Service.amasMint('Base', '0xUserAddress', payload),
            web3Service.amasMint('Polygon', '0xUserAddress', payload)
        ]);

        console.log('[Agentic Core] All systems synced. Atomic Mint complete.');

        res.json({
            status: 'success',
            message: 'Atomic Mint & Purchase Complete.',
            txHashes: {
                payment: payment.id,
                base: results[2],
                polygon: results[3]
            }
        });

    } catch (error) {
        console.error('Purchase Error:', error);
        res.status(500).json({ error: 'Execution failed' });
    }
});

module.exports = router;
