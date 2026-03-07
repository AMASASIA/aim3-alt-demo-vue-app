<script setup>
import { ref } from 'vue';
import { MapPin, X } from 'lucide-vue-next';

defineProps({
    isLoading: Boolean
});

const emit = defineEmits(['close', 'confirm']);

const handleConfirm = () => {
    emit('confirm');
};
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <!-- Modal Card -->
    <div class="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl p-8 relative overflow-hidden animate-fade-in-up">
        
      <!-- Background Glow -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10 animate-pulse"></div>
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10 animate-pulse" style="animation-delay: 1s;"></div>

      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
          <X :size="20" />
      </button>

      <!-- Content -->
      <div class="text-center space-y-6 relative z-10">
          <div class="w-20 h-20 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
              <MapPin :size="32" class="text-indigo-300" />
          </div>

          <div class="space-y-2">
              <h3 class="font-serif-luxury text-3xl italic text-white tracking-wide">Share to Aether Map?</h3>
              <p class="text-[12px] font-light text-white/60 leading-relaxed px-4">
                  この記憶を地図に刻みますか？<br>
                  <span class="opacity-50 text-[10px] uppercase tracking-widest block mt-2">（位置情報はAIにより安全に保護・変換されます）</span>
              </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 pt-4">
              <button 
                  @click="$emit('close')" 
                  class="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all active:scale-95"
              >
                  Cancel
              </button>
              <button 
                  @click="handleConfirm" 
                  :disabled="isLoading"
                  class="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500/80 to-teal-500/80 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden active:scale-95"
              >
                  <span v-if="!isLoading">Share Memory</span>
                  <span v-else class="flex items-center justify-center gap-2">
                      <div class="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div class="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                      <div class="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                  </span>
                  
                  <!-- Shine Effect -->
                  <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-shine pointer-events-none"></div>
              </button>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-serif-luxury {
  font-family: "Cormorant Garamond", serif;
  font-weight: 700;
}

@keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
    animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes shine {
    100% { transform: translateX(100%); }
}

.animate-shine {
    animation: shine 0.5s;
}
</style>
