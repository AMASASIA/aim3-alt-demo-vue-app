<script setup>
import { ref } from 'vue';

const props = defineProps({
  isLoading: Boolean
});

const emit = defineEmits(['anchor']);

const threadsId = ref('');
const igId = ref('');

const handleSubmit = () => {
  if (threadsId.value && igId.value) {
    emit('anchor', threadsId.value, igId.value);
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 font-sans select-none">
    <div class="w-full max-w-xl flex flex-col items-center animate-fade-in">
      
      <!-- Logo Section -->
      <div class="text-center mb-10">
        <h1 class="text-7xl md:text-[80px] font-serif-luxury leading-none text-[#0F172A] mb-8 tracking-tight">Amas</h1>
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-[#94A3B8] mb-6">
          PERSONALIZE RESONANCE | CORE OS
        </p>
        <h2 class="text-2xl text-[#64748B] font-light tracking-tight mb-4 px-4">
          Define your presence. Connect your signals.
        </h2>
        <p class="text-[14px] text-[#94A3B8] font-light">
          We use your handles to <span class="italic font-serif-luxury text-[#1e293b] text-lg">生成</span> your <span class="font-serif-luxury font-bold text-[#0F172A] text-lg">Notebook</span>.
        </p>
      </div>

      <!-- Input Card -->
      <div class="w-full max-w-md bg-white rounded-[3.5rem] p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] border border-[#F1F5F9]">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-3">
            <input 
              type="text" 
              v-model="threadsId"
              placeholder="Threads @" 
              class="w-full bg-[#F8FAFC] rounded-2xl py-5 px-8 text-center text-[16px] text-[#1E293B] outline-none border border-transparent focus:bg-white focus:border-[#E2E8F0] transition-all placeholder:text-slate-300"
              :disabled="isLoading"
              required
            />
            <input 
              type="text" 
              v-model="igId"
              placeholder="Instagram @" 
              class="w-full bg-[#F8FAFC] rounded-2xl py-5 px-8 text-center text-[16px] text-[#1E293B] outline-none border border-transparent focus:bg-white focus:border-[#E2E8F0] transition-all placeholder:text-slate-300"
              :disabled="isLoading"
              required
            />
          </div>

          <button 
            type="submit" 
            :disabled="isLoading || !threadsId || !igId"
            class="w-full py-6 rounded-2xl bg-[#0F172A] text-white font-bold uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-xl active:scale-[0.98] mt-4"
          >
            <span v-if="isLoading" class="animate-pulse">INITIALIZING...</span>
            <template v-else>
              <span>INITIALIZE</span>
              <span class="text-xl opacity-60">→</span>
            </template>
          </button>
        </form>
      </div>

      <!-- Bottom Metadata -->
      <footer class="mt-24 opacity-20">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 border border-black rounded-full flex items-center justify-center text-[8px] font-bold">✓</div>
          <span class="text-[10px] font-black tracking-[0.4em] uppercase text-black">Amane Protocol</span>
        </div>
      </footer>
    </div>
  </div>
</template>
