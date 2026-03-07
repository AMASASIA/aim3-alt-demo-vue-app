<script setup lang="ts">
import { ref } from 'vue';
import { useAmasAudio } from '../composables/useAmasAudio';

const { playSanctuaryBell } = useAmasAudio();
const isVisible = ref(false);
const isProcessing = ref(false);

// liaison-consultant.mdの解析完了（Want抽出）を検知して発火
const triggerConsensus = () => {
  if (isVisible.value) return; // Prevent duplicate triggers/audio
  isVisible.value = true;
  playSanctuaryBell(); // 出現と同時に「鈴の音」で認知を浄化
};

const handleAgreement = async () => {
  isProcessing.value = true;
  
  // Invisible Finance Protocol: 非同期でSBTミント & ガスレス決済を実行
  // 内部で IDQ Soul Wallet SDK を呼び出し
  // TODO: Add actual API call here
  
  setTimeout(() => {
    isVisible.value = false;
    isProcessing.value = false;
    // 完了時に Apple Watch への「トクン」というハプティクスを送信
    // TODO: Implement haptics feedback if available
    console.log('Agreement processed');
  }, 1500);
};

defineExpose({ triggerConsensus, isVisible });
</script>

<template>
  <Transition name="amas-fade">
    <div v-if="isVisible" class="amas-overlay">
      <div class="glass-card">
        <div class="brand">Tive ◎ AI</div>
        
        <div class="consensus-core">
          <button class="pulse-mic" :class="{ 'is-loading': isProcessing }" @click="handleAgreement">
            <div class="inner-pulse">🧚</div>
          </button>
          <p class="status-msg">Just moment / 少々お待ちくださいませ</p>
        </div>

        <div class="action-row">
          <button @click="handleAgreement" class="btn-yes">YES</button>
          <button @click="isVisible = false" class="btn-not-now">Not now</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.amas-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(24px); /* 深いブラーで文脈を保持 */
  z-index: 9999;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 40px;
  padding: 40px;
  width: 320px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  color: white;
  font-family: 'Inter', sans-serif;
}

.brand {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 2rem;
  letter-spacing: 2px;
}

.consensus-core {
  margin: 2rem 0;
}

.status-msg {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 300;
}

.pulse-mic {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: transform 0.3s ease;
}

.pulse-mic:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.25);
}

.pulse-mic.is-loading {
  animation: breathe 1.5s infinite ease-in-out;
}

.inner-pulse {
  font-size: 2rem;
}

.pulse-mic::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: pulse 2s infinite;
  box-sizing: border-box;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.95); opacity: 0.8; }

}

.action-row {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding: 0 1rem;
}

.btn-yes { 
  color: #fff; 
  font-weight: 600; 
  background: rgba(255, 255, 255, 0.1); 
  border: 1px solid rgba(255, 255, 255, 0.2); 
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  cursor: pointer; 
  transition: all 0.2s;
}

.btn-yes:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-not-now { 
  color: rgba(255, 255, 255, 0.4); 
  background: none; 
  border: none; 
  cursor: pointer; 
  font-size: 0.9rem;
}

.btn-not-now:hover {
  color: rgba(255, 255, 255, 0.8);
}

/* Vue Transition */
.amas-fade-enter-active,
.amas-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.amas-fade-enter-from,
.amas-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
