const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

// Locations for ZKP Artifacts
const WASM_PATH = path.join(__dirname, "../zkp_artifacts/verify_secret.wasm");
const ZKEY_PATH = path.join(__dirname, "../zkp_artifacts/verify_secret_final.zkey");

/**
 * 🚀 FUKASA Prover Pool Implementation
 * Handles high-concurrency ZKP requests using a task queue.
 */
const proofQueue = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || proofQueue.length === 0) return;
    isProcessing = true;

    while (proofQueue.length > 0) {
        const task = proofQueue.shift();
        try {
            const result = await executeProofTask(task.secret, task.publicHash);
            task.resolve(result);
        } catch (e) {
            task.reject(e);
        }
    }

    isProcessing = false;
}

async function executeProofTask(secret, publicHash) {
    console.log(`[FUKASA Prover] 🛡️ Processing task (Queue depth: ${proofQueue.length})...`);

    // Simulating zkVM overhead (3 seconds per proof as per architecture)
    await new Promise(r => setTimeout(r, 2500));

    if (!fs.existsSync(WASM_PATH) || !fs.existsSync(ZKEY_PATH)) {
        return {
            proof: {
                pi_a: ["0x" + crypto.randomBytes(32).toString('hex'), "0x" + crypto.randomBytes(32).toString('hex')],
                pi_b: [
                    ["0x" + crypto.randomBytes(32).toString('hex'), "0x" + crypto.randomBytes(32).toString('hex')],
                    ["0x" + crypto.randomBytes(32).toString('hex'), "0x" + crypto.randomBytes(32).toString('hex')]
                ],
                pi_c: ["0x" + crypto.randomBytes(32).toString('hex'), "0x" + crypto.randomBytes(32).toString('hex')]
            },
            publicSignals: [publicHash],
            isMock: true,
            nodeId: "FUKASA-POOL-ALPHA-01"
        };
    }

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { secret, publicHash },
        WASM_PATH,
        ZKEY_PATH
    );
    return { proof, publicSignals, isMock: false };
}

const crypto = require('crypto'); // Ensure crypto is available for random mock generation

/**
 * Generate a Groth16 Proof (Queued via FUKASA Pool)
 */
async function generateZKP(secret, publicHash) {
    return new Promise((resolve, reject) => {
        proofQueue.push({ secret, publicHash, resolve, reject });
        processQueue();
    });
}

/**
 * Utility to format snarkjs proof into Solidity-ready arguments
 */
function formatProofForSolidity(proof) {
    return {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [
            [proof.pi_b[0][1], proof.pi_b[0][0]],
            [proof.pi_b[1][1], proof.pi_b[1][0]]
        ],
        c: [proof.pi_c[0], proof.pi_c[1]]
    };
}

module.exports = { generateZKP, formatProofForSolidity };
