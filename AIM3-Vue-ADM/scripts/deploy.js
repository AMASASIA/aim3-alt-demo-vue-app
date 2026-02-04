const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");
    const deployer = new ethers.Wallet(process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

    console.log("Deploying contracts with account:", deployer.address);

    // 1. Deploy SBT
    // Note: We need the ABI and Bytecode. In a real hardhat project, these are artifacts. 
    // For this script to run standalone without artifacts, we'd need them inline or compiled.
    // Assuming a Hardhat environment:
    // const SBT = await ethers.getContractFactory("SBT");
    // const sbt = await SBT.deploy();
    // await sbt.waitForDeployment();

    // Since we are in a mixed environment, I'll output the instructions for Hardhat deployment.
    console.log("NOTE: Run this script with 'npx hardhat run scripts/deploy.js' after compiling.");

    // Real Deployment Logic (Conceptual)
    /*
    const SBT = await ethers.getContractFactory("SBT");
    const sbt = await SBT.deploy();
    await sbt.waitForDeployment();
    console.log("SBT Deployed at:", sbt.target);
  
    const TBAFactory = await ethers.getContractFactory("TBAFactory");
    const tbaFactory = await TBAFactory.deploy();
    await tbaFactory.waitForDeployment();
    console.log("TBAFactory Deployed at:", tbaFactory.target);
  
    const OKE = await ethers.getContractFactory("OKE_NFT");
    const oke = await OKE.deploy();
    await oke.waitForDeployment();
    console.log("OKE NFT Deployed at:", oke.target);
  
    const AtomicMint = await ethers.getContractFactory("AtomicMint");
    const atomic = await AtomicMint.deploy(sbt.target, tbaFactory.target, oke.target);
    await atomic.waitForDeployment();
    console.log("AtomicMint Deployed at:", atomic.target);
  
    // Post-deployment Setup: Transfer ownership of SBT to AtomicMint so it can mint!
    await sbt.transferOwnership(atomic.target);
    console.log("SBT Ownership transferred to AtomicMint");
    
    // Save addresses to backend .env or config
    const config = {
       ATOMIC_MINT: atomic.target,
       SBT: sbt.target,
       OKE: oke.target
    };
    fs.writeFileSync("../backend/contracts.json", JSON.stringify(config, null, 2));
    */
    console.log("Deployment script template created. Requires Hardhat artifacts.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
