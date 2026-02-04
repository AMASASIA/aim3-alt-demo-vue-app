<script setup>
import { ref } from 'vue';
import { Fingerprint, ScanFace } from 'lucide-vue-next';

const emit = defineEmits(['anchored']);

const handle = ref('');
const isScanning = ref(false);
const scanStage = ref(''); // 'fingerprint', 'face', 'success'

const initiateSequence = () => {
    if (!handle.value.trim()) return;
    
    isScanning.value = true;
    scanStage.value = 'fingerprint';
    
    // Simulate Last Gate Sequence
    setTimeout(() => {
        scanStage.value = 'face';
        
        setTimeout(() => {
            scanStage.value = 'success';
            
            setTimeout(() => {
                emit('anchored', handle.value);
            }, 1000);
        }, 1500);
    }, 1500);
};
</script>

<template>
  <div class="fixed inset-0 bg-[#1a1816] z-50 flex items-center justify-center p-8 text-[#e0d6cc] font-sans selection:bg-[#c0a080] selection:text-black">
      <div v-if="!isScanning" class="w-full max-w-md space-y-12 animate-fade-in">
          <!-- Header -->
          <div class="space-y-2 border-l-2 border-[#8b7e74] pl-6 py-2">
              <h1 class="text-3xl md:text-4xl font-extralight tracking-[0.2em] uppercase text-white">
                  Personal Resonance
              </h1>
              <p class="text-xs tracking-[0.4em] text-[#8b7e74] uppercase font-bold">
                  Core OS Deployment
              </p>
          </div>

          <!-- Ritual Text -->
          <div class="space-y-6">
              <p class="text-lg font-serif italic text-[#c0a080] opacity-80 leading-relaxed">
                  "Generate your NOTEBOOK in the palm of your hand."
              </p>
              <p class="text-xs text-[#a69d95] tracking-widest leading-loose">
                  OSは、操作されるものではなく、あなた自身が『コントロールする』ものである。<br>
                  To secure sovereignty, specify your identity.
              </p>
          </div>

          <!-- Input -->
          <div class="space-y-8">
              <div class="relative group">
                  <input 
                      v-model="handle" 
                      type="text" 
                      placeholder="ENTER ANCHOR HANDLE" 
                      class="w-full bg-transparent border-b border-[#3d3834] py-4 text-xl tracking-[0.2em] focus:outline-none focus:border-[#c0a080] transition-colors placeholder:text-[#3d3834] text-center uppercase"
                      @keydown.enter="initiateSequence"
                  />
                  <div class="absolute bottom-0 left-0 w-0 h-[1px] bg-[#c0a080] transition-all duration-700 group-hover:w-full"></div>
              </div>

              <!-- Action -->
              <button 
                  @click="initiateSequence" 
                  :disabled="!handle.trim()"
                  class="w-full py-4 bg-[#2a2624] hover:bg-[#3d3834] border border-[#3d3834] hover:border-[#8b7e74] transition-all duration-500 uppercase tracking-[0.3em] text-xs text-[#a69d95] hover:text-[#c0a080] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                  <Fingerprint size="16" class="group-hover:scale-110 transition-transform" />
                  Initiate Last Gate
              </button>
          </div>
      </div>

      <!-- Last Gate Sequence Overlay -->
      <div v-else class="flex flex-col items-center justify-center space-y-8">
          <div class="relative w-24 h-24 flex items-center justify-center">
               <!-- Scan Rings -->
               <div class="absolute inset-0 border border-[#c0a080]/20 rounded-full animate-ping-slow"></div>
               <div class="absolute inset-2 border border-[#c0a080]/40 rounded-full animate-spin-reverse"></div>
               
               <!-- Icons -->
               <transition name="fade" mode="out-in">
                   <Fingerprint v-if="scanStage === 'fingerprint'" class="text-[#c0a080] w-10 h-10 animate-pulse" />
                   <ScanFace v-else-if="scanStage === 'face'" class="text-[#c0a080] w-10 h-10 animate-pulse" />
                   <div v-else class="w-3 h-3 bg-[#c0a080] rounded-full shadow-[0_0_20px_#c0a080]"></div>
               </transition>
          </div>

          <div class="text-center space-y-2">
              <h3 class="text-xs tracking-[0.4em] uppercase text-[#8b7e74]">
                  {{ scanStage === 'fingerprint' ? 'Anchor Tap Verification' : scanStage === 'face' ? 'Face ID Authorization' : 'Deploying Core OS' }}
              </h3>
              <div class="h-0.5 w-32 bg-[#2a2624] mx-auto overflow-hidden">
                  <div class="h-full bg-[#c0a080] animate-progress"></div>
              </div>
          </div>
      </div>
  </div>
</template>

<style scoped>
.animate-ping-slow {
    animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}
.animate-spin-reverse {
    animation: spin 10s linear infinite reverse;
}
.animate-progress {
    animation: progress 1.5s ease-in-out infinite;
}
@keyframes spin {
    to { transform: rotate(360deg); }
}
@keyframes progress {
    0% { width: 0%; transform: translateX(-100%); }
    100% { width: 100%; transform: translateX(100%); }
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.animate-fade-in {
    animation: fadeIn 1s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
