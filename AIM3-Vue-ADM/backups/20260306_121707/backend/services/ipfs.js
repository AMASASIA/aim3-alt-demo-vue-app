const pinataSDK = require('@pinata/sdk');

// Initialize Pinata 
// In production, use process.env.PINATA_API_KEY and process.env.PINATA_SECRET_KEY
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET);

async function uploadJSON(metadata) {
    if (!process.env.PINATA_API_KEY) {
        console.warn("Pinata API Keys missing, returning mock hash");
        return { url: "ipfs://QmZ4njh... (mock)" };
    }

    try {
        const res = await pinata.pinJSONToIPFS(metadata);
        return {
            hash: res.IpfsHash,
            url: `ipfs://${res.IpfsHash}`
        };
    } catch (error) {
        console.error("IPFS Upload Error:", error);
        throw error;
    }
}

module.exports = { uploadJSON };
