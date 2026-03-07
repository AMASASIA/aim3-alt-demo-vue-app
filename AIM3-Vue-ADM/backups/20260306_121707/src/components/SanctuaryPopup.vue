<script setup>
import { ref, onMounted } from 'vue';
import { X, Heart, Shield, Loader, Activity } from 'lucide-vue-next';

const props = defineProps({
  show: Boolean,
  mode: { type: String, default: 'confirm' } // 'confirm' or 'processing'
});

const emit = defineEmits(['close', 'confirm']);

// State
const isSanctuaryActive = ref(false);
const countdown = ref(90); // 90s AI Advocacy Hold
const timer = ref(null);

const playBell = async () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') await audioCtx.resume();

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2637.02, now); // 2.6kHz / E7

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 3.1);
    } catch (e) {
        console.error("Audio Context Error", e);
    }
};

onMounted(() => {
    if (props.show) {
        playBell();
        startCountdown();
    }
});

const startCountdown = () => {
    timer.value = setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--;
        } else {
            clearInterval(timer.value);
        }
    }, 1000);
};

const handleYes = () => {
    isSanctuaryActive.value = true;
    if (navigator.vibrate) navigator.vibrate(50);
    
    setTimeout(() => {
        emit('confirm');
        isSanctuaryActive.value = false;
    }, 2000);
};

const skipHold = () => {
    countdown.value = 0;
    clearInterval(timer.value);
};


</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[99999] flex items-center justify-center font-sans">
      
      <!-- Backdrop: Heavy Blur + Slight Dim -->
      <div class="absolute inset-0 bg-white/10 backdrop-blur-[32px] transition-all duration-700"></div>

      <!-- Main Sanctuary Card -->
      <div class="relative z-10 w-full max-w-sm p-8 flex flex-col items-center justify-center space-y-12 animate-float-in">
          
          <!-- Status Text -->
          <div class="space-y-2 text-center">
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                  <span v-if="countdown > 0">AI Advocacy Hold</span>
                  <span v-else-if="!isSanctuaryActive">Advocacy Complete</span>
                  <span v-else>Crystallizing...</span>
              </p>
              <h2 class="font-serif-luxury text-3xl italic text-slate-800">
                  <span v-if="countdown > 0">{{ countdown }}s Silence</span>
                  <span v-else>{{ isSanctuaryActive ? 'Just a moment.' : 'Proceed with Wisdom.' }}</span>
              </h2>
              <p v-if="countdown > 0" class="text-[8px] italic text-slate-400 max-w-[200px] mx-auto mt-4 leading-relaxed">
                  "Purifying the intent... establishing the sanctity of this agreement."
              </p>
          </div>

          <!-- The Heart / Decision Button -->
          <div class="relative">
              <button 
                @click="handleYes"
                :disabled="isSanctuaryActive || countdown > 0"
                :class="['w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 relative group', 
                    (isSanctuaryActive || countdown > 0) ? 'scale-90 bg-slate-100 opacity-40 cursor-not-allowed' : 'bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95']"
              >
                  <Activity v-if="isSanctuaryActive" :size="32" class="text-teal-500 animate-pulse" />
                  <Heart v-else :size="32" :class="[countdown > 0 ? 'text-slate-300' : 'text-slate-800 fill-slate-50 group-hover:fill-red-500/10 group-hover:text-red-500']" class="transition-colors" />
              </button>
              
              <!-- Progress Ring (Simulated) -->
              <svg v-if="countdown > 0" class="absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="48" 
                    fill="none" stroke="currentColor" stroke-width="1.5"
                    class="text-slate-200"
                  />
                  <circle 
                    cx="50" cy="50" r="48" 
                    fill="none" stroke="currentColor" stroke-width="1.5"
                    class="text-teal-500 transition-all duration-1000"
                    stroke-dasharray="301"
                    :stroke-dashoffset="301 * (countdown / 90)"
                  />
              </svg>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-6 w-full items-center">
              <button 
                  v-if="!isSanctuaryActive"
                  @click="$emit('close')"
                  class="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
              >
                  Exit Sanctuary
              </button>
              <button 
                  v-if="countdown > 0"
                  @click="skipHold"
                  class="text-[7px] font-black uppercase tracking-[0.3em] text-slate-200 hover:text-slate-400"
              >
                  Dev: Fast Track
              </button>
          </div>
          
      </div>

    </div>
  </Transition>
</template>

<style scoped>
.font-serif-luxury {
  font-family: "Cormorant Garamond", serif;
  font-weight: 700;
}

@keyframes float-in {
    0% { opacity: 0; transform: translateY(20px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-float-in {
    animation: float-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
