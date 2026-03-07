<template>
  <div class="fixed inset-0 bg-[#0a0a0a] z-[10000] flex flex-col font-sans">
    <!-- Remote Video (Full Screen) -->
    <div class="relative flex-1 overflow-hidden">
      <video 
        ref="remoteVideo" 
        autoplay 
        playsinline 
        class="w-full h-full object-cover opacity-90"
      ></video>
      
      <div v-if="!remoteStream" class="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
        <div class="text-center space-y-6">
          <div class="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center mx-auto animate-pulse-slow">
            <span class="font-serif text-3xl italic text-white/80">A</span>
          </div>
          <p class="text-white/40 text-[10px] uppercase tracking-[0.4em] font-light">Waiting for Resonance</p>
        </div>
      </div>

      <!-- Identity Header (Luxury Tag Style) -->
      <div class="absolute top-12 left-12">
        <div class="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-sm min-w-[240px]">
           <div class="flex items-center gap-3 mb-2">
             <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
             <span class="text-[9px] uppercase tracking-[0.3em] text-white/60">Live Connection</span>
           </div>
           <h3 class="font-serif text-3xl text-white tracking-tight">{{ targetName }}</h3>
           <p class="text-[10px] font-mono text-white/40 mt-2 tracking-widest">AMAS SECURE CHANNEL</p>
        </div>
      </div>

      <!-- A2UI Visual Layer: Agentic Commerce Overlay -->
      <div v-if="detectedObjects.length > 0" class="absolute inset-0 z-50 pointer-events-none">
          <div 
            v-for="item in detectedObjects" 
            :key="item.id"
            class="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            :style="{ left: item.coordinates.x + '%', top: item.coordinates.y + '%' }"
          >
             <button 
                @click="handleMintRequest(item)"
                class="group flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/40 rounded-full hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse-slow"
             >
                <span class="text-xl">🧚</span>
                <div class="flex flex-col items-start">
                    <span class="text-[8px] uppercase tracking-widest leading-none opacity-80 group-hover:text-black/60">{{ item.label }}</span>
                    <span class="text-[10px] font-bold leading-none font-sans">BUY NOW</span>
                </div>
             </button>
          </div>
      </div>
    </div>

    <!-- Local Video (Picture in Picture - Floating Card) -->
    <div class="absolute bottom-40 right-12 w-48 aspect-[3/4] bg-[#1a1a1a] shadow-2xl border border-white/10 z-20 transition-all hover:scale-105">
      <video 
        ref="localVideo" 
        autoplay 
        playsinline 
        muted 
        class="w-full h-full object-cover opacity-80"
      ></video>
      <div v-if="isCameraOff" class="absolute inset-0 flex items-center justify-center">
        <span class="font-serif italic text-white/20">Hidden</span>
      </div>
    </div>

    <!-- Controls (Minimalist Bar) -->
    <div class="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-8">
      <div class="flex items-center gap-8 px-12 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full">
        <button 
          @click="toggleMute"
          class="group flex flex-col items-center gap-2 transition-all hover:text-white"
        >
          <div :class="['w-12 h-12 rounded-full flex items-center justify-center border transition-all', isMuted ? 'bg-white text-black border-white' : 'border-white/30 text-white/60 group-hover:border-white']">
             <component :is="isMuted ? MicOff : Mic" :size="18" />
          </div>
        </button>

        <button 
          @click="$emit('endCall')"
          class="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-all hover:scale-105 shadow-xl shadow-white/10"
        >
          <div class="w-4 h-4 bg-black rounded-sm"></div>
        </button>

        <button 
          @click="toggleCamera"
          class="group flex flex-col items-center gap-2 transition-all hover:text-white"
        >
          <div :class="['w-12 h-12 rounded-full flex items-center justify-center border transition-all', isCameraOff ? 'bg-white text-black border-white' : 'border-white/30 text-white/60 group-hover:border-white']">
             <component :is="isCameraOff ? VideoOff : Video" :size="18" />
          </div>
        </button>
      </div>
      
      <!-- VISION COMMERCE Main Trigger -->
      <button 
        @click="analyzeFrame"
        :disabled="isAnalyzing"
        class="absolute right-12 bottom-0 top-0 my-auto flex flex-col items-center justify-center gap-2 group transition-all disabled:opacity-50"
      >
        <div class="relative w-20 h-20 rounded-full border-2 border-white/20 group-hover:border-white group-hover:scale-110 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
             <div class="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-20 group-hover:opacity-40"></div>
             <ScanEye v-if="!isAnalyzing" :size="28" class="text-white group-hover:text-cyan-400 transition-colors" />
             <Loader2 v-else :size="28" class="text-white animate-spin" />
        </div>
        <span class="text-[10px] font-bold tracking-[0.3em] text-white/80 group-hover:text-white uppercase font-sans drop-shadow-md">VISION</span>
      </button>
    </div>
    
    <!-- Analysis Result Overlay (Paper Card Style) -->
    <transition name="slide-fade">
       <div v-if="analysisResult" class="absolute top-48 right-12 w-80 bg-white p-8 shadow-2xl skew-y-1 origin-top-right z-[60]">
            <div class="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div class="flex flex-col">
                    <span class="text-[10px] uppercase tracking-[0.4em] text-cyan-600 mb-1">VISION COMMERCE</span>
                    <span class="font-serif text-xl text-black italic">Insight & Action</span>
                </div>
                <button @click="analysisResult = null" class="text-gray-300 hover:text-black transition-colors"><X :size="20" /></button>
            </div>
            <p class="text-[12px] text-gray-600 font-sans leading-relaxed tracking-wide text-justify mb-6">{{ analysisResult }}</p>
            
            <button 
              @click="handleMintRequest"
              class="w-full flex items-center justify-center gap-2 py-3 border border-black text-black hover:bg-black hover:text-white transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              <ShoppingBag :size="14" />
              <span>Mint & Shop</span>
            </button>

            <div class="mt-8 flex justify-between items-end">
                <span class="text-[9px] font-mono text-gray-300">AMAS-V2.0 // GEMINI</span>
                <div class="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center">
                    <div class="w-1 h-1 bg-black rounded-full"></div>
                </div>
            </div>
       </div>
    </transition>

    <!-- Privacy Checkpoint Modal (AMAS Privacy Shield) -->
    <PrivacyCheckpoint 
      v-if="showPrivacyCheckpoint"
      :dataItems="checkpointPayload"
      @confirm="executeMint"
      @cancel="showPrivacyCheckpoint = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { PhoneOff, Mic, MicOff, Video, VideoOff, ScanEye, Loader2, X, ShoppingBag } from 'lucide-vue-next';
import { analyzeVisionCommerce } from '../services/intentService';
import PrivacyCheckpoint from './PrivacyCheckpoint.vue';
import AmasPrivacyFirewall from '../services/privacyFirewall';

const props = defineProps({
  localStream: Object,
  remoteStream: Object,
  targetName: String
});

const emit = defineEmits(['endCall', 'commerce-receipt']);

const localVideo = ref(null);
const remoteVideo = ref(null);
const isMuted = ref(false);
const isCameraOff = ref(false);
const isAnalyzing = ref(false);
const analysisResult = ref(null);
const showPrivacyCheckpoint = ref(false);
const checkpointPayload = ref([]);
const detectedObjects = ref([]);

onMounted(() => {
  if (localVideo.value && props.localStream) {
    localVideo.value.srcObject = props.localStream;
  }
});

watch(() => props.remoteStream, (newStream) => {
  if (remoteVideo.value && newStream) {
    remoteVideo.value.srcObject = newStream;
  }
}, { immediate: true });

const toggleMute = () => {
  if (props.localStream) {
    props.localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    isMuted.value = !isMuted.value;
  }
};

const toggleCamera = () => {
  if (props.localStream) {
    props.localStream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    isCameraOff.value = !isCameraOff.value;
  }
};

const analyzeFrame = async () => {
    const videoEl = remoteVideo.value?.srcObject ? remoteVideo.value : localVideo.value;
    if (!videoEl) return;
    
    isAnalyzing.value = true;
    analysisResult.value = null;
    detectedObjects.value = [];

    try {
        const canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        
        // Use the new Vision Commerce Intelligence
        const commerceResult = await analyzeVisionCommerce(base64, 'image/jpeg');
        
        analysisResult.value = commerceResult.insight;
        if (commerceResult.items) {
            detectedObjects.value = commerceResult.items.map(item => ({
                ...item,
                // Ensure price is formatted
                priceLabel: `¥${item.price.toLocaleString()}`
            }));
        }

    } catch (e) {
        console.error("Vision AI failed", e);
        analysisResult.value = "Vision Link connection failed. Retrying...";
    } finally {
        isAnalyzing.value = false;
    }
};



const handleMintRequest = async (specificItem = null) => {
  const item = specificItem || detectedObjects.value[0] || {
      id: "PROT-X1",
      label: "Amane Resonance Artifact",
      price: 50000 
  };
  
  const rawData = {
      id: item.id,
      label: item.label,
      price: `¥${item.price.toLocaleString()}`,
      reasoning: item.reasoning,
      userWallet: "0x7X...9Y",
      advertising_id: "TRACKING_PIXEL_ABC", 
      device_fingerprint: "DEVICE_XYZ"
  };

  // 1. Intercept & Cleanse
  const cleanPayload = AmasPrivacyFirewall.intercept(rawData);
  
  // Convert to UI format array
  checkpointPayload.value = Object.entries(cleanPayload).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: String(value)
  }));
  
  // 2. Show Approal UI
  showPrivacyCheckpoint.value = true;
};

const executeMint = async () => {
  try {
      const payload = checkpointPayload.value.reduce((acc, item) => {
          acc[item.label.toLowerCase()] = item.value;
          return acc;
      }, {});
      
      const result = await AmasPrivacyFirewall.secureExecute(payload);
      
      // Emit receipt for Notebook Sync
      emit('commerce-receipt', {
          id: result.receiptId || result.txHash,
          product: payload.label,
          price: payload.price,
          reasoning: payload.reasoning,
          txHash: result.txHash,
          timestamp: new Date()
      });

      showPrivacyCheckpoint.value = false;
      analysisResult.value = null;
      notify('Secure Transaction', "Agentic Purchase Finalized. Logged to Notebook.", 'success');
  } catch (e) {
      console.error(e);
      alert("Transaction Blocked: " + e.message);
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');

.font-serif { font-family: 'Playfair Display', serif; }
.font-sans { font-family: 'Inter', sans-serif; }

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(30px) skewY(5deg);
  opacity: 0;
}
</style>
