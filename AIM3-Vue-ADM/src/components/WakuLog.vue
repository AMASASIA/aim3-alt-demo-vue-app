<script setup>
import { ref, watch, nextTick } from 'vue';
import { Terminal } from 'lucide-vue-next';

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);
const logContainer = ref(null);

watch(() => props.logs.length, () => {
    nextTick(() => {
        if (logContainer.value) {
            logContainer.value.scrollTop = logContainer.value.scrollHeight;
        }
    });
});
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="relative w-full max-w-3xl bg-slate-900 border border-green-500/30 rounded-lg shadow-2xl overflow-hidden font-mono text-xs md:text-sm">
      <!-- Terminal Header -->
      <div class="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-green-500/30">
        <div class="flex items-center gap-2 text-green-400">
          <Terminal size="16" />
          <span class="font-bold">WakuLog System Monitor</span>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-white transition-colors">✕</button>
      </div>

      <!-- Logs Area -->
      <div ref="logContainer" class="h-96 overflow-y-auto p-4 space-y-1 text-green-300/80 bg-black/90">
        <div v-if="logs.length === 0" class="text-slate-500 italic pb-2">
          > System initialized. Waiting for SSM protocol events...
        </div>
        <div v-for="(log, i) in logs" :key="i" class="flex gap-2">
          <span class="text-slate-500">[{{ new Date(log.timestamp).toLocaleTimeString() }}]</span>
          <span :class="{'text-yellow-400': log.type === 'warn', 'text-red-400': log.type === 'error', 'text-blue-400': log.type === 'info'}">
            {{ log.message }}
          </span>
        </div>
        <div class="animate-pulse text-green-500 font-bold mt-2">_</div>
      </div>
    </div>
  </div>
</template>
