<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { AmasVideoOverlay } from '../engine/AmasVideoOverlay';
import DataDefenseConsent from './DataDefenseConsent.vue';

const props = defineProps({
  videoSrc: String, // Optional: for testing with file
  stream: MediaStream,
  isActive: Boolean
});

const videoRef = ref(null);
const overlayRef = ref(null);
const renderer = ref(null);
const showConsent = ref(false);
const pendingProduct = ref(null);

// Simulation Data
const simulationScenario = [
    { time: 2, data: { products: [] } }, // Clear
    { 
        time: 5, 
        data: { 
            products: [{ x: 0.3, y: 0.4, label: 'Ray-Ban Meta', price: 29900, id: 'p1' }] 
        } 
    },
    { 
        time: 12, 
        data: { 
            products: [{ x: 0.7, y: 0.6, label: 'Blue Bottle Coffee', price: 4500, id: 'p2' }] 
        } 
    },
    { time: 18, data: { products: [] } } // Clear
];

let simInterval = null;

onMounted(() => {
    if (videoRef.value && overlayRef.value) {
        renderer.value = new AmasVideoOverlay(
            videoRef.value, 
            overlayRef.value,
            handlePurchaseRequest // Callback
        );
        
        // Start simulation loop for demo
        startSimulation();
    }
    
    if (props.stream && videoRef.value) {
        videoRef.value.srcObject = props.stream;
    }
});

watch(() => props.stream, (newStream) => {
    if (videoRef.value) videoRef.value.srcObject = newStream;
});

const startSimulation = () => {
    const startTime = Date.now();
    simInterval = setInterval(() => {
        const elapsedSec = (Date.now() - startTime) / 1000;
        
        // Find latest scenario step that matches elapsed time
        // Simple logic: Trigger exact events roughly
        const step = simulationScenario.find(s => Math.abs(s.time - elapsedSec) < 0.5);
        
        if (step) {
            console.log(`[Sim] Rendering A2UI at ${step.time}s`);
            renderer.value.renderA2UI(step.data);
        }
        
    }, 500);
};

const handlePurchaseRequest = (product) => {
    console.log('[A2UI] Purchase Requested:', product);
    pendingProduct.value = {
        ...product,
        intent: 'AGENTIC_PURCHASE',
        timestamp: Date.now(),
        userAddress: localStorage.getItem('aim3_did') || '0xUser',
        signature: `SIG_VIDEO_${Date.now()}`
    };
    showConsent.value = true;
};

const executeTransaction = async () => {
    showConsent.value = false;
    alert("🪢 Agentic Purchase & Minting Success!\nAssetizing your memory...");
    
    // Call backend
    try {
        await fetch('/execute-agentic-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingProduct.value)
        });
    } catch(e) {
        console.error(e);
    }
};

onUnmounted(() => {
    if (simInterval) clearInterval(simInterval);
});
</script>

<template>
  <div class="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      <div class="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-sky-500/30 group">
          <!-- Video Layer -->
          <video 
            ref="videoRef" 
            class="w-full h-full object-cover" 
            autoplay 
            playsinline 
            muted
          ></video>
          
          <!-- A2UI Overlay Layer -->
          <div ref="overlayRef" id="amas-a2ui-layer" class="absolute inset-0 pointer-events-none">
              <!-- Buttons injected here by JS -->
          </div>
          
          <!-- Test Controls -->
          <button @click="$emit('close')" class="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded z-50 hover:bg-red-500 transition-colors pointer-events-auto">
              Close Demo
          </button>
          
          <div class="absolute bottom-4 left-4 text-sky-500 font-mono text-xs opacity-50 z-50">
              A2UI Simulation Active... Watch for 5s & 12s
          </div>
      </div>
      
      <!-- Consent Modal -->
      <DataDefenseConsent 
        :is-open="showConsent" 
        :payload="pendingProduct"
        @approve="executeTransaction"
        @cancel="showConsent = false"
    />
  </div>
</template>

<style>
  /* Global styles for dynamic elements */
  .amas-a2ui-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .glow-animation {
    /* Pulse effect handled by internal elements */
  }
</style>
