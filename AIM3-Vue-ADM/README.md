# AIM3 / AMAS OS
**[OKE Atomic Mint Genesis Hash]**: `e658c74fffd7d14b3d26a7e6e4f718b33631660f03fecd9afe302083a7ff7311`
**[Proof of Creation]**: See [LICENSE.md](./LICENSE.md) for the official OKE Atomic Mint Declaration and Shrink-wrap License.
**[Verification]**: https://sepolia.basescan.org/tx/0xd4ac63ede88839a7c004ef0132fe8b9e9a6a94a90cff78377648ad10ec2017bc

---

# AIM3: AI-Driven Serverless P2P Ecosystem

**AI駆動・サーバーレス設計 (AI-Driven & Serverless Architecture)**

This project integrates the AIM3 Web3 ecosystem with a modern, high-performance P2P video communication layer. By leveraging **Firebase Realtime Database** for serverless signaling and **Google Cloud Run** for containerized deployment, it achieves a scalable, zero-maintenance infrastructure.

## 🚀 Key Features

### 1. AI-Driven Experience (Conceptual)
- **Intelligent Messaging**: Ready for integration with Gemini API for real-time translation and summarization.
- **Smart UI**: Adaptive interfaces powered by Antigravity aesthetics.

### 2. Serverless P2P Setup
- **Signaling**: Removed legacy WebSocket servers. Uses **Firebase Realtime Database (RTDB)** for instant, serverless SDP/ICE exchange.
- **Compute**: Stateless backend hosted on **Cloud Run** (or any container platform).
- **Video**: Peer-to-Peer (WebRTC) Mesh network. No media servers required for 1:1 calls.

### 3. Atomic Web3 Core
- **Smart Contracts**: `OKE_NFT.sol` & `SoulToken.sol` (SBT) managed via Atomic Mint.
- **Backend API**: `backend/` serves as the bridge for on-chain interactions.
- **Frontend**: Vue 3 + Vite for blazing fast performance.

---

## 🛠️ Tech Stack

- **Frontend**: Vue 3, Vite, Tailwind CSS (Glassmorphism UI)
- **Real-time**: Firebase Realtime Database
- **WebRTC**: Native Browser API (STUN/TURN ready)
- **Container**: Docker (Multi-stage build)

---

## 🏁 Getting Started

### 1. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_APP_TITLE=Antigravity P2P
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
```

### 2. Run Locally

**Frontend & Signaling (Requires Firebase Config)**
```bash
npm install
npm run dev
```

**Backend (Minting API)**
```bash
cd backend
npm install
npm start
```

### 3. Deploy to Cloud Run
```bash
# Deploy
gcloud run deploy amas-notebook-of-serend-ui-p2p-messaging-video-ch --image gcr.io/gen-lang-client-0917953723/amas-notebook-of-serend-ui-p2p-messaging-video-ch --platform managed --region us-west1 --allow-unauthenticated
```

---

## 💎 Opal Integration (Reasoning Engine)
This system is designed to interface with the **Opal** visual agent builder for complex authentication logic. The "Atomic Mint" workflow isolates fact extraction logic from the execution layer.

- **Atomic Mint Workflow**: [Launch in Opal](https://opal.google/app/13qmhzCOQ2_62Qt4rrt9NgLcNR9TFd3DO?shared)
- **Connection**: Configure the final "Custom Tool" node in Opal to target this server's gateway:
  - **Endpoint**: `POST /amane-l0/mint-fact`
  - **Payload**: JSON extracted from the previous Opal nodes.
