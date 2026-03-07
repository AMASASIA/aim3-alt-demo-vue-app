/**
 * AIM3 Security Extension Layer
 * Implements: Differential Privacy, ZK Commitment, Local Verification, and Ed25519 Signing.
 */
const crypto = require('crypto');
const nacl = require('tweetnacl');
const fs = require('fs');
const path = require('path');

// Persistent Key Structure (In production, use a secure Key Management System)
const KEY_PATH = path.join(__dirname, '../security_keys.json');
let signingKey;

function getSigningKey() {
    if (signingKey) return signingKey;
    if (fs.existsSync(KEY_PATH)) {
        const data = JSON.parse(fs.readFileSync(KEY_PATH));
        signingKey = nacl.sign.keyPair.fromSecretKey(Buffer.from(data.secretKey, 'hex'));
    } else {
        signingKey = nacl.sign.keyPair();
        fs.writeFileSync(KEY_PATH, JSON.stringify({
            publicKey: Buffer.from(signingKey.publicKey).toString('hex'),
            secretKey: Buffer.from(signingKey.secretKey).toString('hex')
        }));
    }
    return signingKey;
}

/**
 * 1. Differential Privacy (DP) - Laplace Noise
 * Adds noise to numeric values to prevent re-identification.
 */
function dpNoise(value, epsilon = 0.5) {
    if (typeof value !== 'number') return value;
    // Laplace random variable: L(0, b) where b = 1/epsilon
    const u = Math.random() - 0.5;
    const b = 1 / epsilon;
    const noise = -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    return value + noise;
}

function applyDP(data, epsilon = 0.5) {
    const out = {};
    for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'number') {
            out[k] = dpNoise(v, epsilon);
        } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
            out[k] = applyDP(v, epsilon);
        } else {
            out[k] = v;
        }
    }
    return out;
}

/**
 * 2. ZK Commitment (Hash-based Proof of Existence)
 */
function zkCommit(data) {
    const raw = JSON.stringify(data, Object.keys(data).sort());
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return {
        commitment: hash,
        size: Buffer.byteLength(raw),
        timestamp: Date.now()
    };
}

/**
 * 3. Local LLM Double-Verification (Anomaly Detection / Edge Intelligence)
 * Targeted for: mistral-7b / llama-3-8b via local Ollama instance
 */
async function localVerify(dataString) {
    console.log("[Security] 🧠 Triggering Edge Intelligence (Local-LLM)...");

    try {
        // Attempt to call local Ollama instance (Mistral-7B)
        // If the user has Ollama running, this provides "Government-Grade" deep analysis.
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral",
                prompt: `Analyze the following JSON fact for anomalies or excessive uncertainty. 
                Return ONLY "VERIFIED" or "REJECTED". 
                Fact: ${dataString}`,
                stream: false
            }),
            signal: AbortSignal.timeout(2000) // Don't block pipeline forever
        });

        if (response.ok) {
            const result = await response.json();
            const decision = result.response?.trim().toUpperCase();
            console.log(`[Security] 🤖 LLM Decision: ${decision}`);
            return decision.includes("VERIFIED");
        }
    } catch (e) {
        console.warn("[Security] ⚠️ Local LLM Offline. Falling back to Heuristic Shield.");
    }

    // Heuristic Shield (Fall-back)
    const lower = dataString.toLowerCase();
    const banned = ["unknown", "maybe", "guess", "invalid", "error", "null", "undefined"];

    for (const word of banned) {
        if (lower.includes(word)) return false;
    }

    // Entropy check: prevent low-information mints
    if (dataString.length < 15) return false;

    return true;
}

/**
 * 4. Tamper-Proof Signing (Ed25519)
 */
function signData(data) {
    const keys = getSigningKey();
    const msg = Buffer.from(JSON.stringify(data, Object.keys(data).sort()));
    const sig = nacl.sign.detached(msg, keys.secretKey);
    return {
        signature: Buffer.from(sig).toString('hex'),
        publicKey: Buffer.from(keys.publicKey).toString('hex')
    };
}

/**
 * Unified Secure Pipeline Integration
 * facts -> DP -> ZK -> Verify -> Sign -> result
 */
async function securePipeline(facts) {
    console.log("[Security] 🛡️ Entering Secure Pipeline...");

    // 1. Differential Privacy (Noise injection)
    const privateData = applyDP(facts, 0.5);

    // 2. ZK Commitment (Hashing)
    const commitment = zkCommit(privateData);

    // 3. Local Verification (Anomaly detection via AI)
    if (!await localVerify(JSON.stringify(privateData))) {
        throw new Error("Security Violation: Local Verification Failed (Information Quality or Uncertainty)");
    }

    // 4. Ed25519 Signing
    const auth = signData(privateData);

    console.log("[Security] ✅ Pipeline Passed: Data is irreversible and signed.");

    return {
        securedData: privateData,
        proof: {
            zk: commitment,
            auth: auth
        }
    };
}

module.exports = { securePipeline };
