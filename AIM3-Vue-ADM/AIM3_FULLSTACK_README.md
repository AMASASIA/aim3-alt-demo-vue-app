# AIM3 Web3 Fullstack
This directory contains the fully integrated AIM3 application combining AI (Gemini), Web3 (Solidity), and Physics (Antigravity Engine).

## Directory Structure
- **frontend/**: (Root/src) Vue.js application with Antigravity Engine and MintPanel.
- **backend/**: Node.js Express API handling Atomic Minting and IPFS.
- **contracts/**: Solidity Smart Contracts (AtomicMint.sol, OKE_NFT.sol, SBT.sol).
- **scripts/**: Deployment scripts for the blockchain layer.

## Quick Start

### 1. Contracts
Deploy the contracts to your preferred network (or local node).
```bash
npx hardhat run scripts/deploy.js
```
Copy the resulting addresses to `.env` in `backend/`.

### 2. Backend
Start the Atomic Mint API.
```bash
cd backend
npm install
npm start
```

### 3. Frontend
Start the AIM3 UI.
```bash
npm install
npm run dev
```

## Features
- **Atomic Mint**: One click mints NFT + SBT + TBA.
- **AI Integration**: Google Gemini drives the physics engine and metadata.
- **Antigravity**: Physics-based UI that reacts to AI emotions.
