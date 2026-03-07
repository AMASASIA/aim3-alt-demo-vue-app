<template>
  <div class="h-full flex flex-col bg-[#0a0a0a] text-[#e5e5e5] font-mono overflow-hidden">
    <!-- Terminal Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full bg-red-500/20 border border-red-500 animate-pulse"></div>
        <span class="text-[10px] uppercase tracking-[0.3em] text-white/60">Amane Core Kernel // System Logs</span>
      </div>
      <div class="flex gap-4 text-[10px] text-white/40">
        <span>UPTIME: 99.99%</span>
        <span>MEM: 24TB</span>
        <span>LATENCY: 0.2ms</span>
      </div>
    </div>

    <!-- Log Window -->
    <div ref="logContainer" class="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-hide">
      <div v-for="(log, index) in logs" :key="log.id" class="flex gap-4 text-xs font-light hover:bg-white/5 p-1 rounded transition-colors group">
        <span class="text-white/30 shrink-0 select-none">{{ formatTime(log.timestamp) }}</span>
        
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span :class="getTypeColor(log.type)" class="uppercase tracking-wider font-bold text-[9px] px-1 rounded bg-white/5">
              {{ log.type }}
            </span>
            <span class="text-white/80 group-hover:text-white">{{ log.title }}</span>
          </div>
          <span class="text-white/40 pl-1 border-l border-white/10 mt-1 ml-1 text-[10px]">{{ log.content }}</span>
        </div>
      </div>
      
      <!-- Typing Cursor -->
      <div class="flex items-center gap-2 mt-4 animate-pulse">
        <span class="text-teal-500">➜</span>
        <span class="w-2 h-4 bg-teal-500"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';

const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  }
});

// Filter for system-like entries + some mock kernel logs
const logs = computed(() => {
  const systemEntries = props.entries.filter(e => ['system', 'resonance', 'audit'].includes(e.type));
  
  // Merge with some dummy startup logs for effect
  const bootLogs = [
    { id: 'boot-1', type: 'kernel', title: 'Initializing PLURALITY_ENGINE...', content: 'Loaded v2.0.4. Hash: 0x99...a1', timestamp: new Date(Date.now() - 10000000) },
    { id: 'boot-2', type: 'network', title: 'Connecting to Amane L0 Gateway', content: 'Handshake successful. Latency: 4ms', timestamp: new Date(Date.now() - 9000000) },
    { id: 'boot-3', type: 'security', title: 'Mounting Secret Notebook (Encrypted)', content: 'AES-256-GCM. Key derivation complete.', timestamp: new Date(Date.now() - 8000000) },
  ];

  return [...bootLogs, ...systemEntries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
});

const logContainer = ref(null);

const formatTime = (date) => {
  return new Date(date).toISOString().split('T')[1].replace('Z', '');
};

const getTypeColor = (type) => {
  switch (type) {
    case 'error': return 'text-red-400';
    case 'warning': return 'text-amber-400';
    case 'resonance': return 'text-teal-400';
    case 'security': return 'text-purple-400';
    default: return 'text-blue-400';
  }
};

onMounted(() => {
  scrollToBottom();
});

const scrollToBottom = () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
