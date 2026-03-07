<template>
  <div class="mint-panel-container">
    <div class="mint-panel glass-panel">
      <!-- 🛡️ Header: Security Status & Energy -->
      <div class="panel-header">
        <div class="engine-status">
          <div class="status-indicator" :class="statusClass"></div>
          <span class="status-name">{{ status }}</span>
        </div>
        <div class="security-badge" v-if="address">
          <div class="shield-pulse"></div>
          <span class="addr-masked">{{ address.substring(0,6) }}...{{ address.slice(-4) }}</span>
        </div>
      </div>

      <!-- 🌌 Title & Dynamic Visualizer -->
      <div class="hero-section">
          <h1 class="premium-title">Tive◎AI <span>Atomic Mint</span></h1>
          <div class="visualizer-frame" :class="{ 'recording': isRecording, 'loading': loading }">
              <div class="scan-line" v-if="loading || minting"></div>
              <div class="visualizer-canvas" ref="visualizerRef"></div>
              <!-- Energy Meter Overlay -->
              <div class="energy-overlay">
                  <div class="energy-track">
                      <div class="energy-fill" :style="{ height: (engineEnergy * 100) + '%' }"></div>
                  </div>
              </div>
          </div>
      </div>

      <!-- 🧠 AI Synthesis Interaction -->
      <div class="interface-core">
        <div class="input-hub" v-if="!aiResult">
          <input 
            v-model="prompt" 
            placeholder="AIへの指示を入力..." 
            class="premium-input"
            @keyup.enter="generateAI"
            :disabled="loading"
          />
          <button @click="generateAI" :disabled="loading" class="primary-btn">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Synchronizing...' : 'Initialize Tive' }}
          </button>
        </div>

        <!-- 📄 AI Result: Thinking Phase -->
        <Transition name="slide-up">
          <div v-if="aiResult && !txHash" class="result-display glass-card">
            <div class="result-meta">
              <span class="tag emotion">{{ aiResult.hybridMeta?.emotion || 'Neural' }}</span>
              <div class="tag-group">
                <span v-for="l in aiResult.hybridMeta?.labels" :key="l" class="tag label">#{{ l }}</span>
              </div>
            </div>
            <p class="result-text">{{ aiResult.metadata.description }}</p>
            
            <!-- 🎤 Voice ZKP Trigger -->
            <div class="proof-trigger" v-if="!minting">
                <p class="instruction">証明の刻印には6秒間の音声が必要です</p>
                <button @click="handleProvenMint" class="proof-btn" :class="{ 'rec': isRecording }">
                    <div class="mic-icon" v-if="!isRecording">🎙️</div>
                    <div v-else class="rec-timer">00:0{{ 6 - recCountdown }}</div>
                    <span>{{ isRecording ? '録音中...' : '証明を開始してMINT' }}</span>
                </button>
            </div>
            <div v-else class="mint-progress">
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
                <p class="progress-label">Executing Atomic Proof (zkVM)...</p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 🔗 Footer: Identity & Network -->
      <div class="panel-footer" v-if="!txHash">
          <div class="network-tag">
              <span class="dot"></span> Base Sepolia
          </div>
          <button v-if="!isConnected" @click="open" class="connect-btn">Connect Identity</button>
      </div>

      <!-- 🎉 Final Success State: Verified Identity -->
      <Transition name="fade">
        <div v-if="txHash" class="success-screen glass-panel">
            <div class="success-header">
                <div class="verified-badge">
                   <div class="check-mark">L</div>
                </div>
                <h2>Identity Verified</h2>
                <p class="success-sub">Atomic Synthesis Completed</p>
            </div>
            
            <div class="artifact-preview">
                <div class="artifact-mini-card">
                    <div class="mini-visual"></div>
                    <div class="mini-info">
                        <span class="mini-title">OKE Identity Fact</span>
                        <code class="mini-cid">{{ ipfsCid.substring(0,12) }}...</code>
                    </div>
                </div>
            </div>

            <div class="tx-links" v-if="txHash.explorer">
                <a :href="txHash.explorer" target="_blank" class="tx-link">
                    <span>View on BaseScan</span>
                    <i class="external-icon">↗</i>
                </a>
            </div>
            
            <button @click="resetPanel" class="dismiss-btn">Complete Mission</button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { AntigravityEngine } from "../engine/antigravity-engine.js";
import { useWeb3ModalAccount, useWeb3Modal } from '@web3modal/ethers/vue';
import { useAmasAudioRecorder } from '../composables/useAmasAudioRecorder';
import { voiceFeatureService } from '../services/voiceFeatureService';

// Backend Config
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Wallet & Recorder
const { address, isConnected } = useWeb3ModalAccount();
const { open } = useWeb3Modal();
const { startRecording, stopRecording, isRecording, lastAudioBlob } = useAmasAudioRecorder();

// Local State
const status = ref("Awaiting Command...");
const prompt = ref("");
const loading = ref(false);
const minting = ref(false);
const aiResult = ref(null);
const txHash = ref(null);
const ipfsCid = ref('');
const engineEnergy = ref(0.3);
const recCountdown = ref(0);
let timer = null;

const visualizerRef = ref(null);

// Status Styling
const statusClass = computed(() => {
    if (loading.value || minting.value) return 'status-busy';
    if (aiResult.value) return 'status-ready';
    return 'status-idle';
});

// Engine Sync
onMounted(() => {
    AntigravityEngine.init(visualizerRef.value);
    const loop = () => {
        AntigravityEngine.update();
        engineEnergy.value = AntigravityEngine.energy;
        requestAnimationFrame(loop);
    };
    loop();
});

const generateAI = async () => {
    if (!prompt.value || loading.value) return;
    loading.value = true;
    status.value = "Tive Synthesis Engine Alpha...";
    
    try {
        const res = await fetch(`${API_BASE_URL}/agent/hybrid`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt.value })
        });
        const data = await res.json();
        if (data.success) {
            aiResult.value = {
                metadata: {
                    name: `Tive Synthesis: ${data.meta?.emotion}`,
                    description: data.response,
                    attributes: (data.meta?.labels || []).map(l => ({ trait_type: "Label", value: l }))
                },
                hybridMeta: data.meta
            };
            ipfsCid.value = data.meta.ipfs || '';
            AntigravityEngine.loadAIState({ 
                energyScore: data.meta.emotion === 'focused' ? 0.9 : 0.6,
                color: data.meta.emotion === 'focused' ? '#00ffcc' : '#ff00cc',
                reactivity: 1.2
            });
            status.value = "Mind State Captured.";
        }
    } catch (e) {
        status.value = "Neural Link Stable (Safe Mode).";
    } finally { loading.value = false; }
};

const handleProvenMint = async () => {
    if (isRecording.value || minting.value || !isConnected.value) return;
    
    // 1. Voice Proof Phase (6 seconds)
    status.value = "Capturing Voice ZK Proof...";
    recCountdown.value = 0;
    
    await startRecording();
    timer = setInterval(() => {
        recCountdown.value++;
        if (recCountdown.value >= 6) {
           finishProvenMint();
        }
    }, 1000);
};

const finishProvenMint = async () => {
    clearInterval(timer);
    await stopRecording();
    
    if (!lastAudioBlob.value) {
        status.value = "Proof Capture Failed (No Audio).";
        minting.value = false;
        return;
    }

    minting.value = true;
    status.value = "Extracting Voice Features (MFCC)...";
    
    try {
        // 1. Client-Side Voice Feature Extraction (0.8s)
        const proofData = await voiceFeatureService.extractFeatures(lastAudioBlob.value);
        
        status.value = "FUKASA zkVM Proving... (2.5s)";
        
        // 2. Optimized Web3 Implementation
        const res = await fetch(`${API_BASE_URL}/atomicMint`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                address: address.value,
                metadata: aiResult.value.metadata,
                rally: { stamps: 1, action: "mint", timestamp: Date.now() },
                aiLog: { energy: engineEnergy.value, emotion: aiResult.value.hybridMeta.emotion },
                secret: proofData.hash,
                publicHash: proofData.hash
            })
        });
        
        const data = await res.json();
        if (data.success) {
            txHash.value = {
                nft: data.transaction?.tx,
                sbt: data.transaction?.sbtId,
                explorer: data.transaction?.explorer
            };
            AntigravityEngine.triggerMintCelebration();
            status.value = "Identity Anchored.";
        }
    } catch (e) {
        status.value = "Anchor Failed (Connection Required).";
        console.error(e);
    } finally { minting.value = false; }
};

const resetPanel = () => {
    aiResult.value = null;
    txHash.value = null;
    prompt.value = "";
    status.value = "Awaiting Command...";
    AntigravityEngine.loadAIState({ energyScore: 0.3, color: '#94a3b8' });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

.mint-panel-container {
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #000;
}

.glass-panel {
    background: rgba(18, 18, 20, 0.85);
    backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 40px;
    padding: 40px;
    width: 100%;
    max-width: 480px;
    color: white;
    font-family: 'Inter', sans-serif;
    position: relative;
    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #475569;
}
.status-ready { background: #14b8a6; box-shadow: 0 0 10px #14b8a6; }
.status-busy { background: #3b82f6; animation: status-pulse 1s infinite; }

@keyframes status-pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }

.addr-masked {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #64748b;
    background: rgba(255,255,255,0.05);
    padding: 6px 14px;
    border-radius: 100px;
}

.premium-title {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -1px;
    margin: 0;
}
.premium-title span {
    display: block;
    font-size: 14px;
    font-weight: 300;
    letter-spacing: 5px;
    color: #475569;
    text-transform: uppercase;
    margin-top: 4px;
}

.visualizer-frame {
    height: 160px;
    background: rgba(0,0,0,0.4);
    border-radius: 24px;
    margin: 30px 0;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.03);
}

.visualizer-canvas {
    width: 100%;
    height: 100%;
}

.energy-overlay {
    position: absolute;
    right: 20px;
    bottom: 20px;
    top: 20px;
    width: 4px;
}
.energy-track {
    height: 100%;
    background: rgba(255,255,255,0.05);
    border-radius: 2px;
    display: flex;
    flex-direction: column-reverse;
}
.energy-fill {
    background: #00ffcc;
    width: 100%;
    border-radius: 2px;
    transition: height 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Input Area */
.premium-input {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 18px 24px;
    border-radius: 20px;
    color: white;
    font-size: 15px;
    outline: none;
    margin-bottom: 16px;
    transition: all 0.3s;
}
.premium-input:focus {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.2);
}

.primary-btn {
    width: 100%;
    background: white;
    color: black;
    border: none;
    padding: 18px;
    border-radius: 20px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s;
}
.primary-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(255,255,255,0.1); }

/* Result Display */
.result-display {
    padding: 24px;
    background: rgba(255,255,255,0.02);
    border-radius: 24px;
    margin-top: 20px;
}
.result-text { font-size: 14px; line-height: 1.6; color: #94a3b8; }
.tag { font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }
.emotion { background: rgba(0, 255, 204, 0.1); color: #00ffcc; }
.label { color: #475569; margin-left: 8px; }

/* Proof Section */
.proof-trigger { margin-top: 30px; text-align: center; }
.instruction { font-size: 12px; color: #475569; margin-bottom: 16px; }
.proof-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px;
    background: rgba(255,255,255,0.05);
    border: 1px dashed rgba(255,255,255,0.2);
    border-radius: 24px;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
}
.proof-btn.rec { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; border-style: solid; animation: rec-pulse 2s infinite; }
@keyframes rec-pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }

/* Success Screen */
.success-screen {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.6s ease;
}

.verified-badge {
    width: 80px;
    height: 80px;
    background: #00ffcc;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 30px;
}
.check-mark {
    width: 30px;
    height: 30px;
    border-left: 6px solid #000;
    border-bottom: 6px solid #000;
    transform: rotate(-45deg) translate(6px, -4px);
}

.artifact-preview {
    width: 80%;
    background: rgba(255,255,255,0.03);
    padding: 20px;
    border-radius: 24px;
    margin: 30px 0;
}

.tx-link {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #475569;
    text-decoration: none;
    font-size: 12px;
    transition: color 0.3s;
}
.tx-link:hover { color: #00ffcc; }

.dismiss-btn {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    color: #64748b;
    padding: 12px 40px;
    border-radius: 100px;
    margin-top: 40px;
    cursor: pointer;
}

/* Transitions */
.slide-up-enter-active { transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from { transform: translateY(40px); opacity: 0; }
.fade-enter-active { transition: opacity 0.8s; }
.fade-enter-from { opacity: 0; }
</style>
