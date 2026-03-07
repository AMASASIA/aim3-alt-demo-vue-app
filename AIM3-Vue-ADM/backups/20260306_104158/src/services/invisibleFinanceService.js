/**
 * Invisible Finance Service (Base Layer Integration)
 * 
 * Interface for AI Transaction Gateway (ERC-8004) and Memory Ingestion.
 * Enhanced with AIM3 semantic indexing for transaction recall.
 */

import { aim3Index, aim3Search } from './aim3SearchService';

const API_BASE_URL = import.meta.env.VITE_FINANCE_API_URL || 'http://localhost:8000';

export const invisibleFinanceService = {
    /**
     * Start Memory Ingestion (2-finger hold)
     * Effectively triggers a voice stream to the backend for semantic indexing.
     */
    async startMemoryIngest(audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob);

        try {
            const response = await fetch(`${API_BASE_URL}/memory/ingest`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            // Auto-index memory into AIM3 for semantic recall (fire-and-forget)
            if (result.status !== 'error' && result.transcript) {
                aim3Index({
                    content: result.transcript.substring(0, 500),
                    tags: ['memory', 'voice_ingest'],
                    artifactType: 'memory_ingest',
                    intentLevel: 0.6,
                    soulPoints: 500
                }).catch(() => { }); // Silent — non-critical
            }

            return result;
        } catch (error) {
            console.error('Memory Ingest failed:', error);
            return { status: 'error', message: error.message };
        }
    },

    /**
     * Execute Invisible Payment (2-finger swipe)
     * Finalizes the deal on the Base chain using the AI Agent Identity.
     */
    async executePayment(params = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/finance/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: params.amount || 10,
                    recipient: params.recipient || null,
                    reason: params.reason || 'Tive AI Gesture Execution'
                })
            });
            const result = await response.json();

            // Auto-index transaction into AIM3 for future semantic recall
            if (result.status === 'success') {
                aim3Index({
                    content: `Transaction: ${params.reason || 'Invisible Finance'} — ${params.amount || 10} SOL — Hash: ${result.tx_hash?.substring(0, 16)}`,
                    tags: ['finance', 'transaction', 'invisible_payment'],
                    artifactType: 'finance_tx',
                    intentLevel: 0.9,
                    soulPoints: 1500
                }).catch(() => { }); // Silent — non-critical
            }

            return result;
        } catch (error) {
            console.error('Payment Execution failed:', error);
            return { status: 'error', message: error.message };
        }
    },

    /**
     * Semantic search across finance history via AIM3
     * @param {string} query - Natural language query (e.g., "last week's payments")
     * @returns {Promise<Object|null>} Matching artifacts or null
     */
    async searchTransactions(query) {
        return aim3Search({
            queryText: query,
            intentLevel: 0.9,
            environment: 'deep_work',
            soulPoints: 2000,
            serendipityFactor: 0.05, // Low noise for finance (precision > exploration)
            topK: 5
        });
    },

    /**
     * Get Layer Status
     */
    async getStatus() {
        try {
            const response = await fetch(`${API_BASE_URL}/finance/status`);
            return await response.json();
        } catch (error) {
            return { status: 'offline' };
        }
    }
};

export default invisibleFinanceService;

