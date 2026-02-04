<script setup>
import { ref, onMounted } from 'vue';
import { useInvisibleFinance } from '../composables/useInvisibleFinance';
import { Heart } from 'lucide-vue-next';

const props = defineProps({
  targetName: {
    type: String,
    default: 'Someone'
  },
  intentType: {
    type: String,
    default: 'Liaison'
  }
});

const emit = defineEmits(['close', 'agreed']);

const { 
  playSanctuaryBell, 
  startSanctuaryHold, 
  executeInvisibleFinance, 
  isHolding, 
  sanctuaryTime 
} = useInvisibleFinance();

const show = ref(true);
const voiceInputActive = ref(false);

onMounted(() => {
  playSanctuaryBell(); // 出現時に鈴の音を鳴らす
});

const handleYes = async () => {
  // 感情フィルタリング（90秒ルール）の発動
  // ※ 実際の実装ではユーザーが待たずに接続する場合もありますが、
  // ここでは聖域の思想に基づき、ホールド期間を開始します
  emit('agreed', { targetName: props.targetName, intentType: props.intentType });
  
  await startSanctuaryHold();
  
  // 保持期間終了後に不可視の決済を実行
  await executeInvisibleFinance(`${props.intentType} with ${props.targetName}`);
  
  setTimeout(() => {
    show.value = false;
    emit('close');
  }, 2000);
};

const handleDismiss = () => {
  show.value = false;
  emit('close');
};
</script>

<template>
  <Transition name="amas-fade">
    <div v-if="show" class="invisible-finance-overlay">
      <div class="glass-card animate-fade-in-up">
        <header class="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-40">
          AMAS ▼ AI LIAISON
        </header>
        
        <div class="content-area min-h-[160px] flex flex-col justify-center">
          <p v-if="!isHolding" class="status-text font-serif-luxury italic text-2xl mb-2">
            Just moment / 少々お待ちくださいませ
          </p>
          <p v-if="!isHolding" class="text-[11px] text-white/40 uppercase tracking-widest">
            Connecting to {{ targetName }}
          </p>
          
          <div v-else class="space-y-4">
            <p class="sanctuary-text font-serif-luxury italic text-3xl text-teal-300">
              Sanctuary Time
            </p>
            <div class="text-6xl font-mono-light opacity-80">{{ sanctuaryTime }}s</div>
            <p class="text-[9px] text-white/30 uppercase tracking-[0.3em]">Purifying intent through silence...</p>
          </div>
          
          <div 
            class="mic-button" 
            :class="{ active: voiceInputActive, holding: isHolding }"
          >
            <div class="pulse-ring"></div>
            <Heart 
              :size="32" 
              :class="isHolding ? 'text-amber-400 fill-amber-400' : 'text-white'" 
            />
          </div>
        </div>

        <div class="action-footer" :class="{ 'is-disabled': isHolding }">
          <button @click="handleYes" :disabled="isHolding" class="btn-yes">YES</button>
          <button @click="handleDismiss" class="btn-not-now">Not now</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.invisible-finance-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  z-index: 10000;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 48px;
  padding: 60px 40px;
  width: 420px;
  text-align: center;
  color: #fff;
  box-shadow: 0 40px 100px rgba(0,0,0,0.5);
}

.mic-button {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 40px auto;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.mic-button.holding {
  background: rgba(255, 165, 0, 0.2); /* 琥珀色の浄化光 */
  transform: scale(1.1);
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: amas-pulse 2.5s infinite;
}

@keyframes amas-pulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}

.action-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding: 0 20px;
}

button {
  background: none;
  border: none;
  color: rgba(255,255,255,0.4);
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-style: italic;
  cursor: pointer;
  padding: 10px 20px;
  transition: all 0.4s;
  letter-spacing: 0.1em;
}

button:hover:not(:disabled) {
  color: #fff;
  transform: translateY(-2px);
}

.btn-yes {
  font-weight: bold;
  color: #a0ffd0;
  text-shadow: 0 0 20px rgba(160, 255, 208, 0.4);
}

.is-disabled {
  opacity: 0.3;
  pointer-events: none;
}

.amas-fade-enter-active,
.amas-fade-leave-active {
  transition: opacity 1s, transform 1s;
}

.amas-fade-enter-from,
.amas-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
