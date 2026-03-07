// src/engine/atomic-mint.js

/**
 * atomicMint
 * The wrapper function that calls the Backend atomicMint API.
 */

import { API_BASE_URL } from '../config/api.js';

export async function atomicMint({
    address,
    metadata,
    rallyProgress,
    aiLog
}) {
    try {
        const response = await fetch(`${API_BASE_URL}/atomicMint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address,
                metadata,
                rally: rallyProgress,
                aiLog
            })
        });

        if (!response.ok) {
            throw new Error(`Mint failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Atomic Mint Error:", error);
        throw error;
    }
}

import { AntigravityEngine } from "./antigravity-engine.js";

export async function mintWithAnimation(data) {
    // Trigger Physics Celebration immediately
    if (AntigravityEngine && AntigravityEngine.triggerMintCelebration) {
        AntigravityEngine.triggerMintCelebration();
    } else {
        console.warn("AntigravityEngine not found or missing triggerMintCelebration");
    }

    // Call API
    return atomicMint(data);
}
