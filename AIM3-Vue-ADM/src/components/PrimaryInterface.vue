<script setup>
import { ref } from 'vue';
import { Eye, Upload, Fingerprint, Navigation } from 'lucide-vue-next';

const props = defineProps({
  user: Object,
  isListening: Boolean
});

const emit = defineEmits(['toggleVoice', 'import']);
const fileInputRef = ref(null);

const handleImportClick = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    emit('import', file);
    e.target.value = '';
  }
};

const handleTraceClick = () => {
  window.open('https://aim3-ai-map-bright-luxury-608065432512.us-west1.run.app/', '_blank');
};
</script>

<template>
  <div class="w-full h-full flex flex-col items-center justify-center p-10 relative">
    <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handleFileChange" />
    
    <div class="absolute top-40 text-center pointer-events-none">
      <p class="text-[11px] font-black uppercase tracking-[0.8em] text-black/20 mb-12">SECTOR IDENTIFIER</p>
      <h1 class="text-8xl md:text-9xl font-bold tracking-tighter uppercase mb-4">Primary Interface</h1>
    </div>

    <div class="w-full max-w-7xl grid grid-cols-12 gap-12 items-center mt-20">
      <div class="col-span-4 space-y-12">
        <div class="space-y-4">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-black/30">PRIMARY DATA LOG</p>
          <div class="space-y-2 font-mono-light text-[12px] uppercase tracking-widest">
            <p>STATUS: OPERATIONAL</p>
            <p>LOCATION: HUB_01</p>
            <p>LOG: RESONANCE STABLE.</p>
          </div>
        </div>
        <div class="flex gap-4">
          <span class="px-4 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-widest">Dashboard</span>
          <span class="px-4 py-1.5 bg-black/5 text-black/40 text-[9px] font-black uppercase tracking-widest">Elite Tier</span>
        </div>
      </div>

      <div class="col-span-4 flex flex-col items-center gap-10 relative z-50">
        <div class="relative">
          <div v-if="isListening" class="absolute inset-0 rounded-full border border-black/10 animate-ring-expand" />
          <div v-if="isListening" class="absolute inset-0 rounded-full border border-black/5 animate-ring-expand" style="animation-delay: 0.5s" />
          
          <button 
            @click="$emit('toggleVoice')" 
            :class="[
              'relative w-40 h-40 rounded-full bg-black flex items-center justify-center transition-all duration-700 shadow-2xl',
              isListening ? 'scale-110 shadow-[0_0_100px_rgba(0,0,0,0.3)]' : 'aura-breathe hover:scale-105 active:scale-95'
            ]"
          >
            <div class="flex items-end gap-2 h-14">
              <div v-for="(h, i) in [1, 2, 3, 2, 1]" :key="i" :class="['w-1.5 bg-white rounded-full transition-all duration-300', isListening ? 'animate-voice-bar' : '']" :style="{ height: `${h * 12}px`, animationDelay: `${i * 100}ms`, animationDuration: '0.5s' }" />
            </div>
          </button>
        </div>

        <div class="text-center space-y-3">
          <p class="text-[9px] font-black uppercase tracking-[0.4em] text-black/20">Voice Input</p>
          <div class="relative group cursor-pointer" @click="$emit('toggleVoice')">
            <h3 :class="['font-serif-luxury text-[22px] md:text-[26px] italic leading-tight tracking-tight px-4 transition-all duration-1000', isListening ? 'text-black scale-105' : 'shimmer-text opacity-70 group-hover:opacity-100']">
              "Instantly moves to your Notebook"
            </h3>
            <div class="h-[0.5px] w-0 group-hover:w-1/2 mx-auto bg-black/10 transition-all duration-700 mt-2" />
          </div>
          <p v-if="isListening" class="text-[8px] font-mono-light uppercase tracking-[0.4em] text-teal-600 animate-pulse mt-2">Recording Presence...</p>
        </div>
      </div>

      <div class="col-span-4 flex flex-col items-end"></div>
    </div>

    <div class="absolute bottom-20 flex items-center gap-4 bg-white/40 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/60 shadow-xl shadow-black/5">
      <button @click="handleImportClick" class="flex flex-col items-center gap-3 px-8 py-6 group">
        <div class="p-4 bg-white border border-black/5 rounded-2xl group-hover:scale-110 transition-transform">
          <Upload :size="20" />
        </div>
        <span class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Import</span>
      </button>

      <button @click="handleTraceClick" class="flex flex-col items-center gap-3 px-8 py-6 group">
        <div class="p-4 bg-white border border-black/5 rounded-2xl group-hover:scale-110 transition-transform">
          <Navigation :size="20" />
        </div>
        <span class="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Trace</span>
      </button>
    </div>
  </div>
</template>
