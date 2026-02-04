<template>
  <div class="mint-panel">
    <div class="status-bar">
      <span>Energy: {{ engineEnergy.toFixed(2) }}</span>
      <span>Status: {{ status }}</span>
    </div>

    <div class="glow-frame" :class="glowClass">
        <!-- Visualization area handled by Antigravity in background or here -->
        <h2 class="title">AIM3 Atomic Mint</h2>
    </div>

    <!-- AI Control Section -->
    <div class="ai-control">
      <h3>AI Guidance</h3>
      <input v-model="aiPrompt" placeholder="Enter prompt e.g. 'Excited space energy'" class="ai-input" />
      <button @click="generateAI" :disabled="loading">
        {{ loading ? 'Analyzing...' : '1. Ask AI' }}
      </button>
    </div>

    <!-- Metadata Preview -->
    <div v-if="aiResult" class="metadata-preview">
       <pre>{{ JSON.stringify(aiResult, null, 2) }}</pre>
    </div>

    <!-- Atomic Mint Button -->
    <button class="mint-btn" @click="atomicMint" :disabled="!aiResult || minting">
       {{ minting ? 'Minting Atomic...' : '2. ATOMIC MINT (NFT + SBT + Rally)' }}
    </button>
    
    <div v-if="txHash" class="success-msg">
        Success! <br>
        NFT: {{ txHash.nft }} <br>
        Soul: {{ txHash.sbt }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { askGemini } from "../engine/ai.js";
import { AntigravityEngine } from "../engine/antigravity-engine.js";

const apiKey = "YOUR_GEMINI_KEY"; // Real implementation would use env or user input
const aiPrompt = ref("Energetic neon cyber future");
const loading = ref(false);
const minting = ref(false);
const aiResult = ref(null);
const status = ref("Idle");
const txHash = ref(null);
const engineEnergy = ref(0.5);

const glowClass = computed(() => AntigravityEngine.glowState || 'stable');

const address = "0xUserAddressMock"; // In real app, get from wallet connection

// 1. Generate AI State & Metadata
async function generateAI() {
  loading.value = true;
  status.value = "Consulting AI...";
  
  try {
    // Prompt 1: Engine Physics
    const enginePrompt = `Analyze this mood: '${aiPrompt.value}'. Return JSON: { "color": "bright|calm|danger|#hex", "gravity": {"x":number,"y":number}, "energyScore": number(0-1), "reactivity": number(0-2) }`;
    const engineConfig = await askGemini(enginePrompt, apiKey);
    
    // Load into Engine
    AntigravityEngine.loadAIState(engineConfig);
    engineEnergy.value = engineConfig.energyScore || 0.5;
    
    // Prompt 2: NFT Metadata
    const metaPrompt = `Generate NFT metadata for '${aiPrompt.value}'. JSON: { "name": string, "description": string, "attributes": [] }`;
    const metadata = await askGemini(metaPrompt, apiKey);
    
    // Combine for Minting
    aiResult.value = {
        engine: engineConfig,
        metadata: metadata
    };
    
    status.value = "AI Ready. Engine Synced.";
  } catch (e) {
    console.error(e);
    status.value = "AI Error";
  } finally {
    loading.value = false;
  }
}

// 2. Atomic Mint Call
async function atomicMint() {
    if(!aiResult.value) return;
    minting.value = true;
    status.value = "Minting on Blockchain...";

    try {
        const metadata = aiResult.value.metadata;
        const aiLog = aiResult.value.engine;
        
        // This should point to your Node.js Backend URL (e.g. localhost:3000)
        const API_URL = "http://localhost:3000"; 
        
        const res = await fetch(`${API_URL}/atomicMint`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                address: address, // In reality, current connected wallet
                metadata: metadata,
                rally: { stamps: 1, action: "mint" }, // Mock rally update
                aiLog: aiLog
            })
        });
        
        const data = await res.json();
        
        if(data.success) {
            txHash.value = { nft: data.nft.tx, sbt: data.soul.tx };
            status.value = "MINT COMPLETE!";
            AntigravityEngine.triggerMintCelebration();
        } else {
            status.value = "Mint Failed: " + data.error;
        }

    } catch (e) {
        console.error(e);
        status.value = "Network Error";
    } finally {
        minting.value = false;
    }
}

// Loop to update local reactive vars from Engine if needed
setInterval(() => {
    engineEnergy.value = AntigravityEngine.energy;
}, 100);

</script>

<style scoped>
.mint-panel {
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 20px;
    border-radius: 12px;
    border: 1px solid #333;
    max-width: 400px;
    font-family: 'Inter', sans-serif;
}
.glow-frame {
    border: 2px solid #555;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
    transition: box-shadow 0.5s;
}
.glow-frame.reactive {
    box-shadow: 0 0 20px var(--glow-color, cyan);
    border-color: white;
}
.ai-input {
    width: 100%;
    padding: 8px;
    background: #222;
    border: 1px solid #444;
    color: white;
    margin-bottom: 10px;
}
button {
    width: 100%;
    padding: 10px;
    cursor: pointer;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    margin-bottom: 10px;
}
button:disabled {
    background: #444;
    cursor: not-allowed;
}
.mint-btn {
    background: linear-gradient(45deg, #ff00cc, #3333ff);
    font-weight: bold;
}
.success-msg {
    color: #00ff00;
    margin-top: 10px;
    word-break: break-all;
    font-size: 0.8em;
}
</style>
