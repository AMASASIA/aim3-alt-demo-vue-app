<script setup>
import { ShieldCheck, Share2, ExternalLink, Cpu, Info } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps({
  facts: {
    type: Object,
    required: true
  },
  cid: String,
  amaneLink: String,
  timestamp: String,
  visualImageUrl: String,
  isVerified: Boolean
});

const displayCid = computed(() => {
    if (props.facts?.onChainHash) return props.facts.onChainHash;
    return props.cid || '0x11...67DD';
});

const verified = computed(() => props.isVerified || !!props.facts?.onChainHash);
</script>

<template>
  <div :class="['oke-certificate-card group animate-fade-in relative overflow-hidden transition-all duration-700', verified ? 'bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-[#c0c0c0]/40 shadow-[0_0_50px_rgba(255,255,255,0.05)]' : 'bg-[#0a0a0a] border-white/5']">
    
    <!-- Silver Verification Seal (Lucide Icon based) -->
    <div v-if="verified" class="absolute top-6 right-6 z-30 animate-in fade-in zoom-in duration-1000">
        <div class="relative w-12 h-12 flex items-center justify-center border border-[#c0c0c0]/30 rounded-full bg-black/40 backdrop-blur-md">
            <ShieldCheck :size="24" class="text-white opacity-80 animate-pulse-slow" />
            <div class="absolute inset-0 bg-white/5 blur-xl rounded-full animate-ping"></div>
        </div>
    </div>

    <!-- Ambient Silver Glow -->
    <div class="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none"></div>
    
    <!-- Precision Silver Border -->
    <div :class="['absolute inset-0 rounded-[24px] border transition-all duration-1000 pointer-events-none z-20', verified ? 'border-[#c0c0c0]/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]' : 'border-white/10 group-hover:border-[#c0c0c0]/50']"></div>

    <!-- Content -->
    <div class="relative z-10 flex flex-col h-full">
      
      <!-- Asset Visualization -->
      <div class="relative h-56 rounded-xl bg-[#050505] overflow-hidden mb-6 border border-white/5 shadow-inner flex items-center justify-center">
        <img v-if="visualImageUrl" :src="visualImageUrl" class="w-full h-full object-contain transition-all duration-700 hover:scale-105" />
        <div v-else class="absolute inset-0 flex items-center justify-center opacity-20">
             <Cpu :size="100" class="text-white" />
        </div>
      </div>

      <!-- Tech Headers -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-1">
            <h2 class="font-mono text-xl text-white tracking-widest uppercase">{{ facts.model_id || 'ATOMIC_ASSET' }}</h2>
            <div v-if="verified" class="px-2 py-0.5 border border-[#c0c0c0] text-[#c0c0c0] text-[8px] font-bold tracking-[0.2em] rounded">VERIFIED</div>
        </div>
        <div class="flex items-center gap-2">
            <span class="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold">Atomic Minting Protocol v1.0</span>
        </div>
      </div>

      <!-- Blockchain Details -->
      <div class="bg-white/2 rounded-xl p-5 mb-5 border border-white/5 backdrop-blur-sm">
        <div class="flex justify-between items-start mb-4">
            <div>
                <p class="text-[8px] uppercase tracking-[0.2em] text-[#888] mb-1">Soulbound Token (SBT)</p>
                <p class="font-mono text-[10px] text-white tracking-tight truncate max-w-[180px]">{{ displayCid }}</p>
            </div>
            <div class="text-right">
                <p class="text-[8px] uppercase tracking-[0.2em] text-[#888] mb-1">Asset Type</p>
                <p class="text-[10px] text-white font-bold tracking-[0.1em]">NFT + SBT</p>
            </div>
        </div>
        
        <div class="pt-4 border-t border-white/5 flex items-center justify-between">
            <div>
                <p class="text-[8px] text-[#555] mb-1 uppercase tracking-widest">Resonance Score</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-xl font-light text-white tracking-tighter">{{ facts.soulPoints || '142.8' }}</span>
                  <span class="text-[9px] text-[#444]">/ 500.0</span>
                </div>
            </div>
            <div class="flex gap-2">
                <div class="w-8 h-8 rounded border border-white/10 flex items-center justify-center bg-white/5">
                    <Info :size="12" class="text-[#666]" />
                </div>
            </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="mt-auto flex justify-between items-center">
        <div class="text-[8px] text-[#444] font-mono tracking-widest uppercase">
            {{ timestamp || 'LOCAL_TIME_STAMP' }} // L0_CERT
        </div>
        <a :href="amaneLink" target="_blank" class="w-10 h-10 rounded border border-white/10 flex items-center justify-center transition-all hover:bg-white/5 hover:border-[#c0c0c0]/50">
            <ExternalLink :size="14" class="text-[#888]" />
        </a>
      </div>

    </div>
  </div>
</template>

<style scoped>
.oke-certificate-card {
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 30px 60px -12px rgba(0,0,0,0.8);
  font-family: 'Outfit', sans-serif;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 1s cubic-bezier(0.165, 0.84, 0.44, 1);
}
</style>
