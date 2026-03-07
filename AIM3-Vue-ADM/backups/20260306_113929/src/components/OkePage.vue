<template>
  <div class="silver-interface animate-fade-in">
    
    <!-- AUTH STAGE (Simplified for MVP) -->
    <div v-if="viewState === 'login'" class="full-stage">
      <div class="vault-login">
        <h1 class="brand-title-oke">OKE</h1>
        <div class="tech-spec">
          <span>ATOMIC_MINT_PROTOCOL</span>
          <span class="atomic-small">v2.0_OPAL</span>
        </div>
        <div class="silver-underline"></div>
        <input v-model="identity" type="text" placeholder="IDENTITY_SOLVE" class="silver-input" @keyup.enter="handleLogin">
        <button class="login-btn-silver" @click="handleLogin">ACCESS_KERNEL</button>
      </div>
    </div>

    <!-- MAIN APP CORE -->
    <div v-else class="app-interface">
      <nav class="system-nav">
        <div class="nav-brand-silver">OKE_FORGE</div>
        <div class="nav-tabs">
          <button :class="{ active: currentTab === 'generate' }" @click="currentTab = 'generate'">FORGE</button>
          <button :class="{ active: currentTab === 'collection' }" @click="currentTab = 'collection'">COLLECTION</button>
        </div>
        <div class="wallet-status">
           <span v-if="walletAddress" class="addr-badge">{{ walletAddress.slice(0,6) }}...{{ walletAddress.slice(-4) }}</span>
           <span v-else class="addr-badge" @click="connectWallet">CONNECT_WALLET</span>
        </div>
      </nav>

      <!-- TAB: MINT (Vertical Forge) -->
      <div v-if="currentTab === 'generate'" class="forge-container-vertical animate-fade-in-quick">
        
        <!-- Visual Core -->
        <div class="visual-core-wrapper">
          <div class="canvas-frame-silver">
             <UniverseGenerator ref="universeGen" />
          </div>
          <div class="gen-strip">
            <div class="gen-row">
              <span class="gen-label">Original</span>
              <input type="range" min="0" max="1" step="0.01" v-model.number="abstractionLevel" @input="onAbstractionChange" class="gen-slider" />
              <span class="gen-label">Universe</span>
            </div>
            <div class="gen-row">
              <button class="gen-btn" :class="{ active: universeGen?.isEvolving?.value }" @click="toggleEvolution">🧬 Evolve</button>
              <span class="gen-info" v-if="universeGen">{{ universeGen.statusText?.value }} · Fitness: {{ (universeGen.fitnessScore?.value || 0).toFixed(0) }}</span>
            </div>
          </div>
        </div>

        <!-- Forge Interface -->
        <div class="forge-form-vertical">
          <div class="type-selector-checks">
             <div v-for="type in ['NFT', 'SBT', 'TBA']" :key="type" @click="toggleType(type)" class="check-item" :class="{ active: selectedTypes.includes(type) }">
               <span class="box">{{ selectedTypes.includes(type) ? '☑' : '☐' }}</span>
               <span class="label">{{ type }}</span>
             </div>
          </div>

          <div class="action-stack">
             <input ref="fileInput" type="file" @change="handleFileSelect" style="display: none;">
              <div v-if="recorderIsRecording" class="orb-overlay animate-fade-in-quick" @click="toggleVoiceInput">
                <Orb :isListening="recorderIsRecording" />
                <div class="recording-glow"></div>
              </div>
              <div v-else class="input-grid">
                 <button class="utility-btn-v" @click="triggerFileUpload" :class="{ 'has-file': selectedFile }">
                   {{ selectedFile ? '📎 Data Ready' : '📎 Upload' }}
                 </button>
                 <button class="utility-btn-v" :class="{ recording: recorderIsRecording }" @click="toggleVoiceInput">
                   {{ recorderIsRecording ? '🎙 Listening...' : '🎙 Voice Input' }}
                 </button>
              </div>

             <div class="mint-execution-area">
                <button class="mint-button-solid" @click="executeAtomicMint" :disabled="minting">
                  <span v-if="!minting">MINT CRYSTAL artifact 🧚</span>
                  <span v-else>Crystallising...</span>
                </button>
             </div>
          </div>
        </div>
      </div>

      <!-- TAB: COLLECTION (Sacred Artifact Library) -->
      <div v-if="currentTab === 'collection'" class="collection-view-mobile animate-slide-up">
        <div class="section-head">
           <div class="sacred-glow"></div>
           <h2 class="head-title">Artifacts of Soul</h2>
           <div class="head-stats">{{ collectionItems.length }} Neural Impressions Archived</div>
        </div>

        <div class="asset-grid-sacred">
          <div 
            v-for="item in collectionItems" 
            :key="item.id" 
            class="artifact-card-sacred"
            :class="{ 'is-flipped': flippedCards.includes(item.id) }"
            @click="handleCardInteract(item)"
          >
            <div class="card-inner-v">
              <!-- FRONT FACE: The Crystallized Form -->
              <div class="card-face-front-sacred">
                <div class="card-visual-container">
                   <div class="organic-orb-bg"></div>
                   <img v-if="item.image" :src="item.image" class="artifact-image" />
                   <div class="glass-glare"></div>
                </div>
                <div class="card-meta-sacred">
                  <div class="meta-top">
                    <span class="uid-tag">{{ item.id.substring(0,8) }}</span>
                    <span class="type-badge">{{ item.types?.[0] || 'SBT' }}</span>
                  </div>
                  <h3 class="artifact-title">{{ item.name || item.title }}</h3>
                  <div class="identity-seal">
                    <span class="seal-icon">💠</span>
                    <span class="seal-text">OKE_VERIFIED_ORIGIN</span>
                  </div>
                </div>
                
                <!-- LOCK OVERLAY: Sacred Geometry -->
                <div v-if="!flippedCards.includes(item.id)" class="sacred-lock">
                  <div class="lock-pulse"></div>
                  <span class="lock-glyph">🔒</span>
                </div>
              </div>

              <!-- BACK FACE: The Revealed Truth -->
              <div class="card-face-back-sacred">
                <div class="reveal-header">
                  <span class="auth-verified">PROVEN OWNER</span>
                </div>
                <div class="revealed-content custom-scroll">
                   <div v-if="loadingArtifactId === item.id" class="neural-loading">
                      <div class="loading-orb"></div>
                      <span>Decrypting Pulse...</span>
                   </div>
                   <div v-else-if="item.artifactData?.markdown">
                      <div class="markdown-body-sacred" v-html="renderMarkdown(item.artifactData.markdown)"></div>
                   </div>
                   <div v-else class="placeholder-truth">
                      <h4>{{ item.title }}</h4>
                      <p>This soul-print is anchored to your identity. The knowledge within is irreversibilized and safe.</p>
                      <button class="unlock-btn-sacred">REVEAL CORE</button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUCCESS MODAL: The Final Crystallization -->
      <div v-if="showSuccess" class="success-overlay-sacred" @click="showSuccess = false">
         <div class="celebration-orb-bg"></div>
         <div class="success-nexus animate-pop" @click.stop>
            <!-- Pinkcard Reveal -->
            <AmaneCertificationCard :fact="{
                model: lastMinted?.name || 'Atomic Crystal',
                grade: lastMinted?.resonanceScore || (8.5 + Math.random()*1.5).toFixed(1),
                category: lastMinted?.label || 'NEURAL_CRYSTAL',
                description: lastMinted?.artifactData?.markdown || 'This observation has been successfully crystallized into the OKE protocol.',
                observer: lastMinted?.observer || 'OS-001_SENSORY',
                shortId: lastMinted?.tx?.substring(0,8)
            }" />
            
            <div class="success-controls-sacred mt-4">
               <div class="feedback-nexus-horizontal">
                  <button @click.stop="handleFeedback(true)" class="f-btn-h up">Resonant</button>
                  <button @click.stop="handleFeedback(false)" class="f-btn-h down">Discordant</button>
               </div>
               <button class="continue-btn-sacred-wide mt-4" @click="showSuccess = false">Acknowledge</button>
            </div>
         </div>
      </div>

      <!-- ASSETING OVERLAY -->
      <div v-if="minting" class="asseting-overlay">
        <div class="asseting-core">
           <div class="pulsing-sphere"></div>
           <div class="asseting-text">CRYSTALLISING...</div>
           <div class="log-stream">
              <p>Extracting Neural Resonance...</p>
              <p>Spectral Masking Applied (Privacy Shield)...</p>
              <p>Binding to Atomic SBT Structure...</p>
              <p>Sealing with OKE Identity: {{ identity }}</p>
           </div>
        </div>
      </div>

      <!-- VOICE TRANSCRIPT PREVIEW -->
      <div v-if="voiceTranscript && !minting" class="transcript-preview animate-fade-in-quick">
          <div class="preview-label">Neural Capture:</div>
          <div class="preview-text">"{{ voiceTranscript }}"</div>
          <button class="clear-transcript" @click="voiceTranscript = ''">×</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Share2, Lock, Unlock, Check, Share, X, Zap, Boxes, History, Camera, Mic, Activity, Trash2, Shield, Heart, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-vue-next';
import { executeAtomicMint as okeAtomicMint, subscribeToCards } from '../services/okeService';
import { voiceFeatureService } from '../services/voiceFeatureService';
import { recordFeedback } from '../services/intentService';
import UniverseGenerator from './UniverseGenerator.vue';
import Orb from './Orb.vue';
import AmaneCertificationCard from './AmaneCertificationCard.vue';
import { marked } from 'marked';
import { useAmasAudioRecorder } from '../composables/useAmasAudioRecorder';

// State
const viewState = ref('login');
const identity = ref('');
const currentTab = ref('generate');
const minting = ref(false);
const showSuccess = ref(false);
const selectedTypes = ref(['NFT', 'SBT', 'TBA']);
const lastMinted = ref(null);
const collectionItems = ref([]);
const flippedCards = ref([]);
const loadingArtifactId = ref(null);

const universeGen = ref(null);
const abstractionLevel = ref(0.6);
const fileInput = ref(null);
const selectedFile = ref(null);
const walletAddress = ref('');
const voiceTranscript = ref(''); // Capture voice input for crystallization

// --- TACTILE FEEDBACK (Bell Sound) ---
const playBell = () => {
    try {
        const bell = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        bell.volume = 0.3;
        bell.play();
    } catch(e) { console.warn('Audio feedback failed'); }
};

// --- BREAKWATER ARCHITECTURE: SLIM FRONTEND ---
const { startRecording, stopRecording, lastAudioBlob, isRecording: recorderIsRecording, isUploading } = useAmasAudioRecorder();

const handleLogin = async () => {
  viewState.value = 'app';
  try {
    // web3Service removed; using mock address for frontend bypass
    walletAddress.value = '0x' + Math.random().toString(16).slice(2, 10).toUpperCase() + '...';
  } catch (e) { console.warn('[OKE] Wallet connect skipped'); }

  unsubscribeCards = subscribeToCards((cards) => {
    collectionItems.value = cards;
  });
};

const renderMarkdown = (md) => marked.parse(md || '');

async function handleCardInteract(item) {
  if (flippedCards.value.includes(item.id)) {
    flippedCards.value = flippedCards.value.filter(id => id !== item.id);
    return;
  }

  loadingArtifactId.value = item.id;
  try {
    // web3Service removed, mimicking successful SBT verification and signature
    const hasSBT = true;
    if (!hasSBT) {
      alert('Ownership required to unlock this Artifact. Please Mint/Purchase first.');
      return;
    }
    await new Promise(r => setTimeout(r, 800)); // Simulate async signature
    flippedCards.value.push(item.id);
  } catch (e) {
    console.error('Signature failed', e);
  } finally {
    loadingArtifactId.value = null;
  }
}

const toggleType = (t) => {
  const i = selectedTypes.value.indexOf(t);
  if (i > -1) { if (selectedTypes.value.length > 1) selectedTypes.value.splice(i, 1); }
  else selectedTypes.value.push(t);
};

const triggerFileUpload = () => fileInput.value?.click();
const handleFileSelect = (e) => {
  if (e.target.files[0]) {
    selectedFile.value = e.target.files[0];
    if (universeGen.value) universeGen.value.injectImage(e.target.files[0]);
  }
};

const toggleVoiceInput = async () => {
    if (recorderIsRecording.value) {
        const transcript = await stopRecording();
        if (transcript) voiceTranscript.value = transcript;
        if (universeGen.value) universeGen.value.toggleAudio();
    } else {
        voiceTranscript.value = '';
        try {
            await startRecording();
            if (universeGen.value) universeGen.value.toggleAudio();
        } catch (e) {
            console.error('[OKE] Start failed:', e);
        }
    }
};

const onAbstractionChange = () => universeGen.value?.setAbstraction(abstractionLevel.value);
const toggleEvolution = () => universeGen.value?.toggleEvolution();

const executeAtomicMint = async () => {
    if (minting.value) return;
    minting.value = true;
    try {
        const generatedImage = universeGen.value?.exportDataURL() || '';
        
        // 🧬 STEP 1: Sensory Extraction (6s OKE)
        // Extract features and anonymize even before synthesis
        let zkpParams = { features: [], hash: "0x0" };
        if (lastAudioBlob.value) {
            zkpParams = await voiceFeatureService.extractFeatures(lastAudioBlob.value);
        }

        // 🏺 STEP 2: Crystallize Intent (Backend Inference)
        const crystallizeRes = await fetch('/api/artifacts/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rawInput: voiceTranscript.value || (selectedFile.value ? `FILE:${selectedFile.value.name}` : 'Atomic Observation'),
                imageBase64: generatedImage,
                identity: identity.value,
                sensoryLabel: zkpParams.labeling || null,
                location: { lat: 35.6895, lng: 139.6917 } 
            })
        });
        const crystal = await crystallizeRes.json();
        if (!crystal.success) throw new Error('Crystallization failed');
        
        // ⛓️ STEP 3: Atomic Mint (Web3 + OPAL HD)
        const result = await okeAtomicMint({
            address: walletAddress.value,
            metadata: crystal.card,
            types: [...selectedTypes.value],
            secret: zkpParams.hash, // Use the 6s feature hash as the ZK secret
            useOpal: true 
        });

        lastMinted.value = { ...crystal.card, ...result, image: result.imageUrl || generatedImage, label: zkpParams.labeling?.vibe };
        showSuccess.value = true;
        
        playBell();
        console.log('[OKE] Atomic Mint Completed via Hybrid Sensory Architecture.');

    } catch (e) {
        console.error('Minting failed', e);
        alert('Minting failed: ' + e.message);
    } finally {
        minting.value = false;
    }
};

const handleFeedback = (isPositive) => {
    recordFeedback(isPositive);
    showSuccess.value = false;
};

let unsubscribeCards = null;
onUnmounted(() => { if (unsubscribeCards) unsubscribeCards(); });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=JetBrains+Mono:wght@300;500&family=Outfit:wght@200;400;700&display=swap');

/* SACRED UI ADDITIONS */
.section-head { position: relative; margin-bottom: 50px; text-align: center; }
.sacred-glow { position: absolute; top: -50px; left: 50%; transform: translateX(-50%); width: 200px; height: 100px; background: radial-gradient(circle, rgba(255,139,139,0.2) 0%, transparent 70%); filter: blur(30px); z-index: -1; }
.head-title { font-family: 'Cinzel', serif; font-size: 2.2rem; letter-spacing: 4px; background: linear-gradient(to right, #fff, #FFD700); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.head-stats { font-size: 0.7rem; color: #444; letter-spacing: 2px; text-transform: uppercase; margin-top: 10px; }

.asset-grid-sacred { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; padding: 20px; }
.artifact-card-sacred { perspective: 1200px; height: 450px; cursor: pointer; }

.card-face-front-sacred, .card-face-back-sacred { 
    position: absolute; width: 100%; height: 100%; backface-visibility: hidden; 
    border-radius: 30px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden;
    background: rgba(15, 10, 10, 0.8); backdrop-filter: blur(20px);
}

.artifact-card-sacred:hover .card-face-front-sacred { border-color: rgba(255,139,139,0.3); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

.card-visual-container { height: 65%; position: relative; overflow: hidden; background: #000; }
.artifact-image { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.8) contrast(1.1); transition: 0.5s; }
.artifact-card-sacred:hover .artifact-image { transform: scale(1.05) rotate(1deg); filter: brightness(1); }

.organic-orb-bg { 
    position: absolute; top: 20%; left: 20%; width: 60%; height: 60%; 
    background: radial-gradient(circle, rgba(255,139,139,0.3) 0%, transparent 70%); 
    filter: blur(40px); animation: heartbeat 4s infinite ease-in-out;
}

@keyframes heartbeat {
    0%, 100% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.3); opacity: 0.6; }
}

.card-meta-sacred { padding: 20px; }
.meta-top { display: flex; justify-content: space-between; margin-bottom: 10px; }
.uid-tag { font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #555; }
.type-badge { font-size: 0.6rem; font-weight: 700; color: #FFD700; background: rgba(255,215,0,0.1); padding: 2px 8px; border-radius: 4px; }
.artifact-title { font-family: 'Outfit'; font-size: 1.1rem; font-weight: 300; margin: 5px 0; color: #fff; }
.identity-seal { display: flex; align-items: center; gap: 6px; margin-top: 12px; opacity: 0.4; font-size: 0.6rem; letter-spacing: 1px; }

.sacred-lock { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
.lock-pulse { position: absolute; width: 60px; height: 60px; border: 1px solid rgba(255,255,255,0.2); border-radius: 50%; animation: pulse-ring 2s infinite; }
@keyframes pulse-ring { from { transform: scale(0.5); opacity: 1; } to { transform: scale(1.5); opacity: 0; } }

/* REVEAL UI */
.card-face-back-sacred { transform: rotateY(180deg); background: rgba(20, 15, 15, 0.95); padding: 25px; }
.auth-verified { color: #4ade80; font-size: 0.6rem; letter-spacing: 3px; font-weight: 700; border-bottom: 1px solid rgba(74,222,128,0.2); padding-bottom: 5px; }
.revealed-content { margin-top: 20px; height: calc(100% - 40px); overflow-y: auto; }
.neural-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 15px; }
.loading-orb { width: 30px; height: 30px; background: #FFD700; border-radius: 50%; animation: pulse 1s infinite alternate; }

/* SUCCESS ORGANIC */
.success-overlay-sacred { position: fixed; inset: 0; background: rgba(5,0,0,0.9); z-index: 5000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
.celebration-orb-bg { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%); filter: blur(100px); animation: pulse 3s infinite alternate; }
.success-card-organic { background: #111; border: 1px solid rgba(255,255,255,0.1); border-radius: 40px; width: 340px; overflow: hidden; position: relative; z-index: 10; }
.success-visual { height: 280px; position: relative; }
.final-result-img { width: 100%; height: 100%; object-fit: cover; }
.success-info-sacred { padding: 30px; text-align: center; }
.status-badge-sacred { font-size: 0.6rem; font-weight: 700; color: #FF8B8B; letter-spacing: 2px; }
.success-title { font-family: 'Cinzel'; margin: 15px 0; font-size: 1.5rem; }
.proof-row-sacred { background: rgba(255,255,255,0.03); padding: 10px; border-radius: 12px; margin-bottom: 25px; }
.proof-label { display: block; font-size: 0.5rem; color: #444; margin-bottom: 4px; }
.proof-value { font-family: 'JetBrains Mono'; font-size: 0.6rem; color: #888; word-break: break-all; }

.feedback-nexus { margin-bottom: 25px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px; }
.feedback-label { font-size: 0.6rem; color: #555; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 12px; }
.feedback-actions { display: flex; gap: 10px; justify-content: center; }
.feedback-btn { 
    display: flex; align-items: center; gap: 6px; padding: 8px 15px; border-radius: 10px; 
    font-size: 0.7rem; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);
    color: #888; transition: 0.3s;
}
.feedback-btn:hover { color: #fff; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.1); }
.feedback-btn.up:hover { background: rgba(74, 222, 128, 0.1); color: #4ade80; border-color: rgba(74, 222, 128, 0.3); }
.feedback-btn.down:hover { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); }

.continue-btn-sacred { width: 100%; background: #FFD700; color: #000; border: none; padding: 15px; border-radius: 15px; font-weight: 700; cursor: pointer; transition: 0.3s; }
.continue-btn-sacred:hover { box-shadow: 0 10px 30px rgba(255,215,0,0.3); transform: translateY(-3px); }

.orb-overlay { position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: scale(0.6); margin: -40px 0; cursor: pointer; }
.recording-glow { position: absolute; inset: 20%; background: radial-gradient(circle, rgba(255,139,139,0.15) 0%, transparent 70%); filter: blur(30px); animation: pulse 2s infinite; }

.success-nexus { position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; }
.feedback-nexus-horizontal { display: flex; gap: 10px; width: 100%; }
.f-btn-h { flex: 1; padding: 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.03); color: #888; font-size: 0.7rem; font-weight: 700; transition: 0.3s; }
.f-btn-h.up:hover { background: rgba(74, 222, 128, 0.1); color: #4ade80; border-color: rgba(74, 222, 128, 0.3); }
.f-btn-h.down:hover { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); }

.continue-btn-sacred-wide { width: 100%; background: #fff; color: #000; border: none; padding: 18px; border-radius: 20px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; font-size: 0.7rem; cursor: pointer; transition: 0.3s; }
.continue-btn-sacred-wide:hover { box-shadow: 0 0 30px rgba(255,255,255,0.2); transform: translateY(-3px); }

.transcript-preview {
    position: absolute; bottom: 100px; left: 50%; transform: translateX(-50%);
    width: 90%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,139,139,0.2);
    border-radius: 20px; padding: 20px; backdrop-filter: blur(20px); z-index: 100;
}
.preview-label { font-size: 0.6rem; color: #FF8B8B; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 5px; }
.preview-text { font-family: 'Outfit'; font-size: 0.9rem; color: #fff; font-style: italic; }
.clear-transcript { position: absolute; top: 10px; right: 10px; background: none; border: none; color: #888; font-size: 1.2rem; cursor: pointer; }

.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,139,139,0.2); border-radius: 10px; }
</style>
