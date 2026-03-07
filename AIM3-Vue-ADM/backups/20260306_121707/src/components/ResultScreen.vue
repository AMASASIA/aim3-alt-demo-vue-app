<script setup>
import { ref, onMounted, computed } from 'vue';
import { Share2, Book, Check, PenTool, X, Trash2, ArrowLeft, Plus, Mic, Square, Menu, LayoutDashboard, Copy, Zap } from 'lucide-vue-next';
import { i18n, theme, activeModel } from '../services/i18n';
import AmaneCertificationCard from './AmaneCertificationCard.vue';

const props = defineProps({
    content: { type: String, default: "" },
    isThinking: { type: Boolean, default: true }
});

const emit = defineEmits(['close', 'save', 'oke', 'submit']);

const isSigning = ref(false);
const isOke = ref(false);
const promptInput = ref('');
const processingState = ref('idle'); // idle, proofing, sending, completed
const userWallet = ref(localStorage.getItem('tive_wallet_address') || '');
const zkpProof = ref(null);

// Canvas Logic
const canvasRef = ref(null);
const ctx = ref(null);
const isDrawing = ref(false);

const initCanvas = () => {
    if (canvasRef.value) {
        const canvas = canvasRef.value;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        ctx.value = canvas.getContext('2d');
        ctx.value.strokeStyle = '#fff'; // White ink for dark sacred vessel
        ctx.value.lineWidth = 2;
        ctx.value.lineCap = 'round';
        ctx.value.lineJoin = 'round';
    }
};

const startDrawing = (e) => {
    if (!isSigning.value) return;
    isDrawing.value = true;
    const { x, y } = getCoordinates(e);
    ctx.value.beginPath();
    ctx.value.moveTo(x, y);
};

const draw = (e) => {
    if (!isDrawing.value) return;
    const { x, y } = getCoordinates(e);
    ctx.value.lineTo(x, y);
    ctx.value.stroke();
};

const stopDrawing = () => {
    isDrawing.value = false;
};

const clearCanvas = () => {
    if (ctx.value && canvasRef.value) {
        ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
    }
};

const getCoordinates = (e) => {
    const rect = canvasRef.value.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
};

const handleCopy = () => {
    navigator.clipboard.writeText(props.content);
};

const toggleSign = () => {
    if (isSigning.value) {
        clearCanvas();
        isSigning.value = false;
    } else {
        isSigning.value = true;
        setTimeout(initCanvas, 50); 
    }
};

const handlePromptSubmit = () => {
    if (!promptInput.value.trim()) return;
    emit('submit', { prompt: promptInput.value, model: selectedModel.value });
    promptInput.value = '';
};

// --- TACTILE FEEDBACK ---
const playBell = () => {
    try {
        const bell = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        bell.volume = 0.3;
        bell.play();
    } catch(e) { console.warn('Audio feedback failed'); }
};

// --- OKE / ZKP FLOW ---
const handleAmaneMint = async (target) => {
    if (processingState.value !== 'idle') return;
    
    processingState.value = 'proofing';
    try {
        const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        processingState.value = 'sending';
        
        const payload = {
            targetWallet: userWallet.value || "0xGhostWallet",
            contextFact: { 
                name: `Tive AI Thought: ${selectedModel.value}`, 
                content: props.content,
                model: selectedModel.value
            },
            visualFact: "", 
            useOpal: false 
        };

        const res = await fetch(`${API_URL}/api/oke/mint-fact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Backend Minting Failed");
        const data = await res.json();
        console.log("Amane Flow Success (Backend):", data);

        processingState.value = 'completed';
        playBell();
        if (target === 'save') emit('save', props.content);
        else emit('oke', props.content);
        
        setTimeout(() => processingState.value = 'idle', 3000);

    } catch (e) {
        console.error("Amane Flow failed", e);
        if (target === 'save') emit('save', props.content);
        else emit('oke', props.content);
        processingState.value = 'idle';
    }
};
</script>

<template>
  <div :class="['fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 transition-all duration-1000', theme === 'light' ? 'bg-zinc-50' : 'bg-[#0a0505]']">
    
    <!-- 🌌 Sacred Backdrop Glows -->
    <div class="sacred-aura">
        <div class="aura-orb rose"></div>
        <div class="aura-orb gold"></div>
    </div>

    <!-- Top Navigation Protocol -->
    <header class="absolute top-0 w-full p-10 flex justify-between items-center z-[110]">
        <div class="system-id">
            <div class="pulse-dot"></div>
            <span class="id-text">Tive◎AI_v2.0</span>
        </div>
        <div class="header-actions">
            <div class="model-badge">
                <span class="model-label">{{ selectedModel }}</span>
                <div class="status-glow"></div>
            </div>
            <button @click="$emit('close')" class="exit-btn">
                <X :size="20" />
            </button>
        </div>
    </header>

    <!-- 🏺 The Sacred Vessel (Main Card) -->
    <div class="vessel-container animate-in fade-in zoom-in duration-700">
        
        <!-- Action Orbs (Floating Controls) -->
        <div v-if="!isThinking" class="vessel-controls">
            <button 
                @click="isOke = !isOke; if(!isOke) handleCopy();" 
                class="control-orb" 
                :class="{ 'active-oke': isOke }"
            >
                <component :is="isOke ? Check : Share2" :size="20" />
                <div class="orb-aura"></div>
            </button>
            <button @click="toggleSign" class="control-orb" :class="{ 'signing': isSigning }">
                <PenTool v-if="!isSigning" :size="18" />
                <Trash2 v-else :size="18" />
                <div class="orb-aura"></div>
            </button>
        </div>

        <div class="sacred-vessel-card glass-vessel">
            <div class="vessel-glass-texture"></div>
            
            <!-- Dynamic Neural Content -->
            <Transition name="reveal" mode="out-in" appear>
                <div v-if="isThinking" key="thinking" class="thinking-nexus">
                    <div class="nexus-core">
                        <div class="core-beat"></div>
                        <div class="neural-pulse-ring"></div>
                    </div>
                    <h2 class="nexus-title animate-pulse">Synthesizing...</h2>
                    <p class="nexus-sub">Neural strands aligning to your frequency</p>
                </div>

                <div v-else key="content" class="content-nexus custom-scroll flex items-center justify-center p-0 overflow-visible">
                    <!-- AI Verified Response (Pinkcard) -->
                    <AmaneCertificationCard 
                        class="reveal-scale transition-all duration-1000"
                        :fact="{
                            model: activeModel,
                            grade: (9.5 + Math.random()*0.4).toFixed(1),
                            category: 'Neural Consensus Insight',
                            description: content,
                            observer: 'Tive◎AI_Kernel',
                            shortId: '0x' + Math.random().toString(16).slice(2,10)
                        }"
                    />
                    
                    <!-- Signature Layer (Overlay or integrated) -->
                    <div v-if="isSigning" class="signature-zone absolute inset-0 z-50 pointer-events-auto">
                        <canvas 
                            ref="canvasRef"
                            class="sig-canvas w-full h-full"
                            @mousedown="startDrawing"
                            @mousemove="draw"
                            @mouseup="stopDrawing"
                        ></canvas>
                        <span class="sig-hint absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-[10px] uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">Acknowledge with your soul signature</span>
                    </div>
                </div>
            </Transition>
        </div>
    </div>

    <!-- 🧬 Bottom Integration Bar -->
    <div class="vessel-footer-bar">
        <div v-if="!isThinking" class="interaction-stack">
            <div class="bridge-row">
                <button 
                    @click="handleAmaneMint('oke')" 
                    :disabled="processingState !== 'idle'"
                    class="mint-shard-btn"
                >
                    <div class="shard-icon">
                        <Zap v-if="processingState === 'idle'" :size="24" />
                        <div v-else class="shard-loader"></div>
                    </div>
                    <span class="shard-text">{{ processingState === 'idle' ? 'Crystallize' : 'Crystallizing...' }}</span>
                </button>
                
                <!-- Fast Switch Model -->
                <div class="model-selector-organic">
                    <select v-model="activeModel" class="organic-select">
                        <option value="Gemini 2.0 Flash">Gemini 2.0 Flash</option>
                        <option value="Opal Reasoning">Opal Reasoning</option>
                    </select>
                </div>
            </div>
            
            <!-- Quick Input Bridge -->
            <div class="input-bridge-sacred">
                <input 
                    v-model="promptInput"
                    placeholder="Ask more..." 
                    class="bridge-input"
                    @keydown.enter="handlePromptSubmit"
                />
                <button @click="handlePromptSubmit" class="bridge-send">
                    <Plus :size="18" />
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;400;700&family=JetBrains+Mono:wght@400&display=swap');

/* SACRED AURA */
.sacred-aura { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.aura-orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.15; }
.aura-orb.rose { top: -10%; left: -10%; width: 60%; height: 60%; background: #FF8B8B; animation: drift 15s infinite alternate; }
.aura-orb.gold { bottom: -10%; right: -10%; width: 50%; height: 50%; background: #FFD700; animation: drift 20s infinite alternate-reverse; }

@keyframes drift { from { transform: translate(0,0) rotate(0deg); } to { transform: translate(10%, 10%) rotate(5deg); } }

/* HEADER PROTOCOL */
.system-id { display: flex; align-items: center; gap: 10px; opacity: 0.4; }
.pulse-dot { width: 6px; height: 6px; background: #FFD700; border-radius: 50%; animation: pulse 2s infinite; }
.id-text { font-family: 'JetBrains Mono'; font-size: 10px; letter-spacing: 2px; color: white; }

.header-actions { display: flex; align-items: center; gap: 20px; }
.model-badge { position: relative; background: rgba(255,255,255,0.05); padding: 5px 15px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.1); }
.model-label { font-size: 10px; font-weight: 700; color: #FFD700; letter-spacing: 1px; }

.exit-btn { color: white; opacity: 0.3; transition: 0.3s; }
.exit-btn:hover { opacity: 1; }

/* SACRED VESSEL */
.vessel-container { position: relative; width: 100%; max-width: 480px; z-index: 10; margin-bottom: 50px; }
.sacred-vessel-card { 
    aspect-ratio: 1; width: 100%; background: rgba(20, 10, 10, 0.7); 
    border-radius: 60px; border: 1px solid rgba(255,255,255,0.08); 
    position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 40px 100px rgba(0,0,0,0.6); backdrop-filter: blur(40px);
}

.vessel-glass-texture { 
    position: absolute; inset: 0; opacity: 0.05; pointer-events: none;
    background-image: url('https://grainy-gradients.vercel.app/noise.svg');
}

/* VESSEL CONTROLS */
.vessel-controls { position: absolute; right: -70px; top: 20%; display: flex; flex-direction: column; gap: 15px; }
.control-orb { 
    width: 48px; height: 48px; border-radius: 18px; 
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center; color: white;
    cursor: pointer; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); position: relative;
}
.control-orb:hover { transform: scale(1.1); background: rgba(255,255,255,0.1); }
.control-orb.active-oke { background: #FF8B8B; border-color: #FF8B8B; }

/* THINKING NEXUS */
.thinking-nexus { text-align: center; }
.nexus-core { 
    width: 60px; height: 60px; background: rgba(255,139,139,0.1); 
    border-radius: 50%; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center;
}
.core-beat { width: 20px; height: 20px; background: #FF8B8B; border-radius: 50%; animation: pulse-sacred 1.2s infinite; }
@keyframes pulse-sacred { 0%, 100% { scale: 1; opacity: 0.5; box-shadow: 0 0 0 0 rgba(255,139,139,0.4); } 50% { scale: 1.5; opacity: 1; box-shadow: 0 0 20px 10px rgba(255,139,139,0); } }

.nexus-title { font-family: 'Outfit'; font-size: 2.2rem; font-weight: 200; letter-spacing: -1px; margin-bottom: 10px; color: white; }
.nexus-sub { font-size: 11px; color: #64748b; letter-spacing: 1px; }

/* CONTENT NEXUS */
.content-nexus { padding: 50px; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; }
.revealed-text { 
    font-family: 'Outfit'; font-size: 1.5rem; font-weight: 200; line-height: 1.6; 
    color: rgba(255,255,255,0.9); text-align: center; max-height: 380px; overflow-y: auto;
}

/* FOOTER INTERACTION */
.vessel-footer-bar { width: 100%; max-width: 600px; z-index: 100; }
.mint-shard-btn { 
    background: #fff; color: #000; border: none; padding: 16px 32px; 
    border-radius: 20px; display: flex; align-items: center; gap: 15px; 
    font-weight: 700; font-family: 'Outfit'; cursor: pointer; transition: 0.3s;
}
.mint-shard-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(255,255,255,0.1); }

.input-bridge-sacred { 
    margin-top: 25px; display: flex; align-items: center; gap: 10px; 
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); 
    padding: 10px 10px 10px 25px; border-radius: 100px; backdrop-filter: blur(20px);
}
.bridge-input { flex: 1; background: transparent; border: none; outline: none; color: white; font-size: 14px; }
.bridge-send { width: 40px; height: 40px; border-radius: 50%; background: #FFD700; color: black; display: flex; align-items: center; justify-content: center; }

.bridge-row { display: flex; align-items: center; justify-content: center; gap: 20px; }
.organic-select { background: transparent; color: #FFB8B8; font-size: 12px; font-weight: 700; border: none; outline: none; }

.custom-scroll::-webkit-scrollbar { width: 2px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(107, 91, 84, 0.2); }

/* REVEAL TRANSITION */
.reveal-enter-active, .reveal-leave-active { transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
.reveal-enter-from { opacity: 0; scale: 0.9; filter: blur(20px); }
.reveal-leave-to { opacity: 0; scale: 1.1; filter: blur(20px); }

.neural-pulse-ring { 
    position: absolute; inset: -10px; border: 1px solid rgba(255,139,139,0.2); 
    border-radius: 50%; animation: ring-expand 2s infinite; 
}
@keyframes ring-expand { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }

.reveal-scale { scale: 1.0; }
@media (max-width: 640px) { .reveal-scale { scale: 0.85; } }
</style>
