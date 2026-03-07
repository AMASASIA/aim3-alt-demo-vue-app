<script setup>
import { ref, onMounted } from 'vue';
import { Map as MapIcon, Users, Hexagon } from 'lucide-vue-next';

// Placeholder for AI MAP integration or simple cluster map
const clusters = ref([
    { id: 1, x: 20, y: 30, size: 40, label: 'Tech Cluster', active: true },
    { id: 2, x: 70, y: 60, size: 30, label: 'Creative Hub', active: false },
    { id: 3, x: 40, y: 80, size: 25, label: 'DeFi Zone', active: true }
]);

const userPosition = ref({ x: 50, y: 50 });

onMounted(() => {
    // Simulate movement
    setInterval(() => {
        userPosition.value = {
            x: 50 + Math.sin(Date.now() / 1000) * 10,
            y: 50 + Math.cos(Date.now() / 1000) * 10
        };
    }, 100);
});
</script>

<template>
  <div class="w-full h-full bg-slate-900 relative overflow-hidden rounded-xl border border-slate-700 shadow-inner">
      <!-- Grid Background -->
      <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
      <div class="absolute inset-0 grid-bg opacity-20"></div>

      <!-- Clusters -->
      <div v-for="cluster in clusters" :key="cluster.id" 
           class="absolute rounded-full border border-cyan-500/30 flex items-center justify-center transition-all duration-1000"
           :style="{ left: cluster.x + '%', top: cluster.y + '%', width: cluster.size + 'px', height: cluster.size + 'px' }"
           :class="cluster.active ? 'bg-cyan-900/20 animate-pulse' : 'bg-slate-800/20'">
           <Hexagon :size="cluster.size / 2" class="text-cyan-500/50" />
           <span class="absolute -bottom-6 text-[10px] text-cyan-300 whitespace-nowrap">{{ cluster.label }}</span>
      </div>

      <!-- User Node -->
      <div class="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] z-10 transition-transform duration-100 ease-linear"
           :style="{ left: userPosition.x + '%', top: userPosition.y + '%' }">
           <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white whitespace-nowrap">
               YOU
           </div>
      </div>

      <!-- AI Overlay -->
      <div class="absolute top-4 right-4 bg-black/40 backdrop-blur px-3 py-2 rounded border border-purple-500/30">
          <div class="flex items-center gap-2 text-purple-300 text-xs font-bold">
              <MapIcon size="14" />
              <span>AI MAP: ACTIVE</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-1">Tracking resonance consensus...</p>
      </div>
  </div>
</template>

<style scoped>
.grid-bg {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, #334155 1px, transparent 1px),
                      linear-gradient(to bottom, #334155 1px, transparent 1px);
}
</style>
