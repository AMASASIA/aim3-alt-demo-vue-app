const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// MOCK ABI for development (Complete with real ABIs after compilation)
const OKE_ABI = [
    "function mint(address to, string memory uri) external returns (uint256)"
];
const SOUL_ABI = [
    "function mintSoul(address user) external returns (uint256)"
];

// Setup Provider & Signer
// Uses a default provider for now, or JsonRpcProvider with process.env.RPC_URL
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");

// The Wallet that pays for gas (Admin)
const signer = process.env.PRIVATE_KEY
    ? new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    : ethers.Wallet.createRandom().connect(provider); // Mock signer if no key

// Contract Instances
// Replace addresses with deployed addresses
const OKE_ADDRESS = process.env.OKE_ADDRESS || "0x0000000000000000000000000000000000000000";
const SOUL_ADDRESS = process.env.SOUL_ADDRESS || "0x0000000000000000000000000000000000000000";

const okeContract = new ethers.Contract(OKE_ADDRESS, OKE_ABI, signer);
const soulContract = new ethers.Contract(SOUL_ADDRESS, SOUL_ABI, signer);

async function mintOKE(to, uri) {
    if (process.env.MOCK_MINT === 'true') return { tx: "0xMockTxOKE", tokenId: 1 };

    const tx = await okeContract.mint(to, uri);
    await tx.wait();
    // In real app, parse logs to get ID, simplified return here
    return { tx: tx.hash, tokenId: 0 };
}

async function mintSoul(to) {
    if (process.env.MOCK_MINT === 'true') return { tx: "0xMockTxSoul", tokenId: 1 };

    const tx = await soulContract.mintSoul(to);
    await tx.wait();
    return { tx: tx.hash, tokenId: 0 };
}

module.exports = { mintOKE, mintSoul };
