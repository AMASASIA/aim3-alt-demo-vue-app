<template>
  <div class="fixed inset-0 z-[11000] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
    <div class="w-full max-w-md bg-white rounded-sm shadow-2xl overflow-hidden font-sans border border-gray-200">
      
      <!-- Header -->
      <div class="bg-gray-50 border-b border-gray-100 p-6 flex items-center gap-4">
        <div class="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
          <Shield :size="16" class="text-white" />
        </div>
        <div>
          <h3 class="text-sm font-bold uppercase tracking-widest text-gray-800">AMAS Privacy Guardian</h3>
          <p class="text-[10px] text-gray-400">Data Sovereignty Enforcement Protocol</p>
        </div>
      </div>

      <!-- Warning Alert -->
      <div class="p-6 pb-2">
        <div class="bg-amber-50 border-l-4 border-amber-400 p-4">
          <div class="flex items-start gap-3">
            <AlertTriangle :size="16" class="text-amber-500 mt-0.5" />
            <p class="text-xs text-amber-800 leading-relaxed">
              <strong>Wait.</strong> Verify the data payload before transmission.<br>
              Tracking cookies and User-Agent headers have been <span class="line-through opacity-50">stripped</span>.
            </p>
          </div>
        </div>
      </div>

      <!-- Data Preview -->
      <div class="px-6 py-4">
        <h4 class="text-[10px] uppercase tracking-widest text-gray-400 mb-4 px-2">Payload Preview</h4>
        <div class="space-y-1">
          <div v-for="(item, index) in dataItems" :key="index" class="flex justify-between items-center p-3 rounded hover:bg-gray-50 transition-colors group">
            <span class="text-xs text-gray-500 font-medium">{{ item.label }}</span>
            <span class="text-xs font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded group-hover:bg-white group-hover:shadow-sm transition-all">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- Audit Status -->
      <div class="px-8 py-2 flex justify-end">
        <div class="flex items-center gap-2 text-[10px] text-teal-600 font-bold uppercase tracking-widest">
          <CheckCircle2 :size="12" />
          <span>Privacy Audit: Cleared</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
        <button 
          @click="$emit('cancel')"
          class="flex-1 py-3 px-4 rounded border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 :size="14" />
          Purge & Return
        </button>
        <button 
          @click="$emit('confirm')"
          class="flex-1 py-3 px-4 rounded bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-teal-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Lock :size="14" />
          Execute (Safe)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Shield, AlertTriangle, Trash2, Lock, CheckCircle2 } from 'lucide-vue-next';

defineProps({
  dataItems: {
    type: Array,
    default: () => [
      { label: "Asset", value: "Unknown Object" },
      { label: "Action", value: "L0 Minting" }
    ]
  }
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
