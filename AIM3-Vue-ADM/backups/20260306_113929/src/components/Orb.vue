<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Square } from 'lucide-vue-next';

const props = defineProps({
  isListening: Boolean,
  isProcessing: Boolean,
  intensity: { type: Number, default: 0 }
});

const bars = ref(Array.from({ length: 32 }, () => ({ h: 8, targetH: 8 })));
let animationFrame;

const animate = () => {
    if (props.isListening) {
        bars.value.forEach(bar => {
            bar.targetH = 10 + Math.random() * 80;
            bar.h += (bar.targetH - bar.h) * 0.3;
        });
    } else {
        bars.value.forEach(bar => {
            const idle = 8 + Math.sin(Date.now() / 1000 + bars.value.indexOf(bar)) * 3;
            bar.h += (idle - bar.h) * 0.1;
        });
    }
    animationFrame = requestAnimationFrame(animate);
};

onMounted(() => animate());
onUnmounted(() => cancelAnimationFrame(animationFrame));
</script>

<template>
  <div class="orb-container" :class="{ 'is-listening': isListening, 'is-processing': isProcessing }">
    <!-- Sacred Halo -->
    <div class="sacred-halo" :class="{ 'is-active': isListening || isProcessing }"></div>
    
    <div class="orb-core glass-vessel">
      <!-- Mist / Soul Smoke -->
      <div class="mist-layer rose-glow"></div>
      <div class="mist-layer gold-glow"></div>
      
      <!-- Neural Visualizer Blocks -->
      <div v-if="isListening" class="visualizer-shards">
          <div 
            v-for="(bar, i) in bars" 
            :key="i" 
            class="soul-shard" 
            :style="{ 
                height: bar.h + 'px',
                opacity: 0.3 + (bar.h / 80)
            }"
          ></div>
          <!-- Subtle Stop Icon -->
          <div class="stop-icon-overlay">
            <Square :size="24" fill="currentColor" />
          </div>
      </div>

      <!-- Living Center Dot -->
      <div v-else class="heart-dot">
          <div class="dot-core"></div>
          <div class="dot-pulse"></div>
      </div>
    </div>

    <!-- Ripples of Intent -->
    <div v-if="isListening" class="intent-ripples">
      <div v-for="i in 3" :key="i" class="ripple"></div>
    </div>
  </div>
</template>

<style scoped>
.orb-container {
  position: relative;
  width: 340px;
  height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.sacred-halo {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid rgba(255, 215, 0, 0.1);
  box-shadow: 0 0 40px rgba(255, 139, 139, 0.05);
  animation: halo-float 8s infinite alternate ease-in-out;
}
.sacred-halo.is-active {
    border-color: rgba(255, 215, 0, 0.4);
    box-shadow: 0 0 80px rgba(255, 215, 0, 0.2);
    animation: rotate 10s infinite linear;
}

@keyframes halo-float { from { scale: 0.95; opacity: 0.3; } to { scale: 1.05; opacity: 0.6; } }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.orb-core {
  position: relative;
  width: 240px;
  height: 240px;
  background: #000;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.05);
}

.visualizer-shards { display: flex; align-items: center; gap: 4px; z-index: 10; }
.soul-shard {
    width: 6px;
    background: #fff;
    border-radius: 100px;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.stop-icon-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    opacity: 0.3;
    pointer-events: none;
    z-index: 20;
    transition: all 0.5s ease-in-out;
}
.is-listening .stop-icon-overlay {
    opacity: 0.6;
    animation: stop-pulse 2s infinite alternate;
}
@keyframes stop-pulse {
    from { transform: scale(0.95); opacity: 0.4; }
    to { transform: scale(1.05); opacity: 0.8; }
}
.orb-container:hover .stop-icon-overlay { opacity: 1; transform: scale(1.1); }

.heart-dot { position: relative; width: 12px; height: 12px; z-index: 20; }
.dot-core { position: absolute; inset: 0; background: #fff; border-radius: 50%; box-shadow: 0 0 20px #fff; z-index: 2; }
.dot-pulse { 
    position: absolute; inset: -4px; border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 50%; 
    animation: ping-sacred 3s infinite cubic-bezier(0, 0, 0.2, 1); 
}

@keyframes ping-sacred { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(4); opacity: 0; } }

.mist-layer { position: absolute; inset: -50%; filter: blur(60px); opacity: 0.1; }
.rose-glow { background: radial-gradient(circle, #fff 0%, transparent 60%); animation: drift 15s infinite linear; }
.gold-glow { background: radial-gradient(circle, #fff 0%, transparent 60%); animation: drift 20s infinite linear reverse; }

@keyframes drift { from { transform: rotate(0deg) translate(10%, 10%); } to { transform: rotate(360deg) translate(-10%, -10%); } }

.intent-ripples { position: absolute; inset: -40px; pointer-events: none; }
.ripple { 
    position: absolute; inset: 0; border: 1px solid rgba(255, 255, 255, 0.1); 
    border-radius: 50%; animation: ripple-spread 4s infinite; 
}
.ripple:nth-child(2) { animation-delay: 1.5s; }
.ripple:nth-child(3) { animation-delay: 3s; }

@keyframes ripple-spread {
    0% { transform: scale(0.6); opacity: 0.5; }
    100% { transform: scale(1.5); opacity: 0; }
}
</style>
