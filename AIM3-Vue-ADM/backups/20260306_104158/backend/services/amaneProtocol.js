const crypto = require('crypto');

/**
 * Amane Protocol: High-Purity Fact Delivery L0 Protocol
 * Ported to Node.js for seamless integration with AMAS Core.
 */
class AmaneProtocolL0 {
    constructor() {
        this.version = "v1.0-Amane-Core";
    }

    /**
     * Mint an OKE-Certified Fact Packet
     * @param {string} observerId - The ID of the observing node (User/DID)
     * @param {object} factData - The extracted features/facts
     * @param {string} secretKey - Secret for origin signing
     */
    mintOkeFact(observerId, factData, secretKey) {
        // 1. Create Payload
        const payload = {
            protocol: this.version,
            certified_by: "OKE",
            timestamp: new Date().toISOString(),
            observer: observerId,
            facts: factData,
            origin_sig: crypto.createHash('sha256').update(secretKey || 'default-secret').digest('hex')
        };

        // 2. Deterministic Stringify (sort keys) for Consistent Hashing
        const deterministicString = JSON.stringify(payload, Object.keys(payload).sort());

        // 3. Generate Fact Hash (Atomic Fact)
        const factHash = crypto.createHash('sha256').update(deterministicString).digest('hex');

        return {
            oke_certified_url: `https://amane.li/${factHash.substring(0, 10)}`,
            fact_hash: factHash,
            payload: payload
        };
    }
}

module.exports = new AmaneProtocolL0();
