<script setup>
import { ref } from 'vue';
import { Sparkles } from 'lucide-vue-next';

const props = defineProps({
  isLoading: Boolean
});

const emit = defineEmits(['anchor']);
const isProcessing = ref(false);
const loginError = ref('');

const handleGuestEntry = async () => {
    if (isProcessing.value) return;
    
    isProcessing.value = true;
    loginError.value = '';
    
    try {
        console.log("[Tive◎AI] 🛡️ Initializing Amane Anchor Protocol (Direct Entry)...");
        // Direct Entry: No popup, quick transition
        await new Promise(r => setTimeout(r, 600)); 
        
        const mockName = "Amane Visitor";
        const mockId = "user-" + Math.random().toString(36).substring(7);
        
        console.log("[Tive◎AI] ✅ Resonance Established:", mockName);
        emit('anchor', mockName, mockId);
    } catch (error) {
        console.error("[Tive◎AI] ⚠️ Anchor Protocol Interrupted:", error);
        loginError.value = 'Connection unstable. Using fallback entry...';
        emit('anchor', "Guest", "guest-session"); 
    } finally {
        isProcessing.value = false;
    }
};
</script>

<template>
  <div class="login-root fixed inset-0 flex items-center justify-center bg-black overflow-hidden">
    <!-- Subtle Background Glow -->
    <div class="absolute inset-0 bg-radial-gradient from-indigo-500/5 to-transparent pointer-events-none"></div>

    <div class="login-container w-full max-w-sm flex flex-col items-center animate-fade-in z-10 px-8">
      
      <!-- Unified Direct Entry Button -->
      <button 
        @click="handleGuestEntry"
        :disabled="isLoading || isProcessing"
        class="group relative w-full flex items-center justify-center gap-4 py-5 px-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        <div class="w-5 h-5 flex items-center justify-center">
            <Sparkles :size="20" class="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
        </div>
        <span class="text-sm font-medium tracking-tight text-white/90">Initialize Amane / Enter</span>
        
        <div v-if="isLoading || isProcessing" class="absolute inset-0 bg-black/80 flex items-center justify-center rounded-2xl">
            <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </button>

      <p v-if="loginError" class="mt-4 text-xs text-red-400/80 animate-pulse">{{ loginError }}</p>

    </div>
  </div>
</template>


<style scoped>
.bg-radial-gradient {
  background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to));
}

.animate-fade-in {
    animation: fadeIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>

<style scoped>
.animate-fade-in-up {
    animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
