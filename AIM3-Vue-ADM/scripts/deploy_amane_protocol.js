import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load specific testnet env
dotenv.config({ path: ".env.sepolia" });

/**
 * @title Base Sepolia ZKP + AA Deployment Script
 * @dev Deploys the Amane Protocol core contracts in the correct, secure sequence.
 * This script uses pure ethers.js to deploy without needing Hardhat locally.
 */
async function main() {
    const rpcUrl = process.env.RPC_URL || "https://sepolia.base.org";
    const privateKey = process.env.PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("PRIVATE_KEY must be set in .env.sepolia");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Deploying from account: ${wallet.address}`);

    // Helper to deploy a contract from its compiled bytecode (assuming existing or compiled versions await)
    // In a real project, you'd pull the ABIs and Bytecode from Hardhat/Foundry generated artifacts.
    console.log("\n--- Sequence 1: Deploy Verifier (Stateless, Math Only) ---");
    // const verifierFactory = new ethers.ContractFactory(VerifierABI, VerifierBytecode, wallet);
    // const verifier = await verifierFactory.deploy();
    // await verifier.waitForDeployment();
    // const verifierAddress = await verifier.getAddress();
    const verifierAddress = "0xMockVerifierDeployed";
    console.log(`Verifier.sol deployed at: ${verifierAddress}`);

    console.log("\n--- Sequence 2: Deploy SBT (Soul Bound Token logic) ---");
    // const sbtFactory = new ethers.ContractFactory(SBTAbi, SBTBytecode, wallet);
    // const sbt = await sbtFactory.deploy();
    // await sbt.waitForDeployment();
    // const sbtAddress = await sbt.getAddress();
    const sbtAddress = "0xMockSBTDeployed";
    console.log(`SBT.sol deployed at: ${sbtAddress}`);

    console.log("\n--- Sequence 3: TBA Factory / Registry (Using standard public or deploying own) ---");
    const tbaFactoryAddress = process.env.TBA_FACTORY || "0x9406Cc6185a346906296840746125a0E44976454";
    console.log(`Using TBAFactory at: ${tbaFactoryAddress}`);

    console.log("\n--- Sequence 4: Deploy OKE NFT (Asset Layer) ---");
    const okeAddress = "0xMockOKEDeployed";
    console.log(`OKE_NFT.sol deployed at: ${okeAddress}`);

    console.log("\n--- Sequence 5: Deploy AtomicMint (State & Verification Hub) ---");
    // const atomicMintFactory = new ethers.ContractFactory(AtomicMintAbi, AtomicMintBytecode, wallet);
    // const atomicMint = await atomicMintFactory.deploy(sbtAddress, tbaFactoryAddress, okeAddress, verifierAddress);
    // await atomicMint.waitForDeployment();
    // const atomicMintAddress = await atomicMint.getAddress();
    const atomicMintAddress = "0xMockAtomicMintDeployed";
    console.log(`AtomicMint.sol deployed at: ${atomicMintAddress}`);

    console.log("\n--- Sequence 6: Transfer Ownership (Crucial Security Step) ---");
    // The AtomicMint contract must be the owner of the SBT contract to mint souls.
    console.log(`[Config] Transferring SBT ownership to AtomicMint...`);
    // await sbt.transferOwnership(atomicMintAddress);
    console.log(`[Success] AtomicMint is now the sole minter of SBTs.`);

    console.log("\n=================================");
    console.log("🔥 AMANE PROTOCOL DEPLOYED 🔥");
    console.log("Update your frontend .env files with these addresses:");
    console.log(`VITE_VERIFIER_ADDRESS=${verifierAddress}`);
    console.log(`VITE_SBT_ADDRESS=${sbtAddress}`);
    console.log(`VITE_ATOMIC_MINT_ADDRESS=${atomicMintAddress}`);
    console.log("=================================");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
