<script setup>
import { ShieldCheck, Share2, ExternalLink, Cpu } from 'lucide-vue-next';

const props = defineProps({
  facts: {
    type: Object,
    required: true
  },
  cid: String,
  amaneLink: String,
  timestamp: String
});
</script>

<template>
  <div class="oke-card group animate-fade-in">
    <!-- Certificate Header -->
    <div class="flex justify-between items-start mb-8">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-black flex items-center justify-center rounded-full">
          <ShieldCheck :size="18" class="text-white" />
        </div>
        <div>
          <h4 class="text-[10px] font-black uppercase tracking-[0.4em] text-black">OKE Certified</h4>
          <p class="text-[8px] font-mono-light opacity-40 uppercase tracking-widest">{{ timestamp }}</p>
        </div>
      </div>
      <div class="grade-badge">
        <span class="text-[10px] uppercase font-bold tracking-tighter opacity-40 mr-1">Grade</span>
        <span class="text-2xl font-serif-luxury italic font-bold text-black">{{ facts.condition_grade || '8.5' }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="space-y-4 mb-8">
      <div class="border-l-2 border-black pl-4 py-1">
        <h3 class="text-lg font-serif-luxury italic font-bold text-black leading-tight">
          {{ facts.model_id || 'Untitled Asset' }}
        </h3>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div v-for="(fact, index) in (facts.atomic_facts || [])" :key="index" class="bg-black/[0.03] p-4 rounded-xl border border-black/5">
          <p class="text-[8px] uppercase tracking-widest text-black/40 mb-1">Atomic Fact #0{{ index + 1 }}</p>
          <p class="text-[11px] font-medium text-black/80 leading-relaxed">{{ fact }}</p>
        </div>
      </div>
    </div>

    <!-- Infrastructure Data -->
    <div class="bg-black text-white rounded-2xl p-6 mb-6 overflow-hidden relative">
      <div class="absolute right-[-10%] top-[-20%] opacity-20 rotate-12">
        <Cpu :size="120" />
      </div>
      
      <div class="relative z-10">
        <p class="text-[8px] uppercase tracking-[0.3em] text-white/40 mb-3">Immutable Verification Record</p>
        <div class="space-y-2">
          <div class="flex justify-between text-[9px] font-mono-light">
            <span class="text-white/40">CID-L0</span>
            <span class="text-white/80 select-all">{{ cid || 'pending_sync' }}</span>
          </div>
          <div class="flex justify-between text-[9px] font-mono-light">
            <span class="text-white/40">PROTOCOL</span>
            <span class="text-white/80">AMANE-L0.3 / OKE</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <a :href="amaneLink" target="_blank" class="flex-1 bg-black/5 hover:bg-black/10 text-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
        <ExternalLink :size="12" />
        <span class="text-[9px] font-bold uppercase tracking-widest">Verify Ledger</span>
      </a>
      <button class="w-12 bg-black/5 hover:bg-black/10 text-black rounded-xl flex items-center justify-center transition-all">
        <Share2 :size="12" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.oke-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 32px;
  padding: 40px;
  position: relative;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.oke-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.15);
}

.grade-badge {
  display: flex;
  align-items: baseline;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}
</style>
