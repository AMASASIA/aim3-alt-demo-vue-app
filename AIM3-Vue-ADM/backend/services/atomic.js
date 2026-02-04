const { ethers } = require('ethers');
require('dotenv').config();

// Load ABI (Mocked for now, in real app import from artifacts)
const ATOMIC_ABI = [
    "function atomicMint(address user, string memory metadataURI) external returns (uint256, uint256, address)"
];

// Configuration
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
// Admin Wallet (must have funds)
const signer = process.env.PRIVATE_KEY
    ? new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    : ethers.Wallet.createRandom().connect(provider);

// Address from deployment
const ATOMIC_ADDRESS_MOCK = "0xMockAtomicMintAddress";
const ATOMIC_ADDRESS = process.env.ATOMIC_ADDRESS || ATOMIC_ADDRESS_MOCK;

async function executeAtomicMint(userAddress, metadataURI) {
    if (process.env.MOCK_MINT === 'true') {
        console.log("Mocking Atomic Mint...");
        return {
            tx: "0xMockAtomicTxHash_" + Date.now(),
            sbtId: 101,
            nftId: 505,
            tba: "0xTBA_Account_Address"
        };
    }

    try {
        const contract = new ethers.Contract(ATOMIC_ADDRESS, ATOMIC_ABI, signer);

        console.log(`Sending Atomic Transaction for ${userAddress}...`);
        const tx = await contract.atomicMint(userAddress, metadataURI);

        console.log(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);
        const receipt = await tx.wait();

        // Parse logs to get IDs if needed, implies ABI includes Event definition
        // For now returning basic info
        return {
            tx: receipt.hash,
            status: "Confirmed"
        };
    } catch (err) {
        console.error("Atomic Mint Failed on Chain:", err);
        throw err;
    }
}

module.exports = { executeAtomicMint };
