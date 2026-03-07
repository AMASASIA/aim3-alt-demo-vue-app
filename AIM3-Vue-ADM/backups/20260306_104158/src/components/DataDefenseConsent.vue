<script setup>
import { ref } from 'vue';
import { ShieldCheck, AlertTriangle, FileJson, X } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
  payload: Object
});

const emit = defineEmits(['approve', 'cancel']);

const jsonString = ref('');

// Pretty print JSON when opened
const formatJson = () => {
    return JSON.stringify(props.payload, null, 2);
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-xl shadow-[0_0_50px_rgba(34,211,238,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="p-6 border-b border-cyan-900/50 flex justify-between items-start bg-slate-800/50">
            <div>
                <h2 class="text-xl font-bold flex items-center gap-2 text-white">
                    <ShieldCheck class="text-green-400" />
                    Transparent Execution Audit
                </h2>
                <p class="text-slate-400 text-sm mt-1">
                    Review the EXACT data payload before authorizing this agentic action.
                </p>
            </div>
            <button @click="$emit('cancel')" class="text-slate-500 hover:text-white">
                <X />
            </button>
        </div>

        <!-- JSON Viewer -->
        <div class="flex-1 overflow-auto p-6 bg-black relative font-mono text-sm scrollbar-thin">
            <div class="absolute top-4 right-4 text-xs text-slate-600 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                <FileJson size="12" class="inline mr-1" /> JSON Payload
            </div>
            
            <pre class="text-green-400/90 whitespace-pre-wrap">{{ formatJson() }}</pre>

            <!-- Warning if sensitive keys found (Mock check) -->
            <div class="mt-8 p-4 bg-yellow-900/10 border border-yellow-700/30 rounded flex flex-col gap-3">
                <div class="flex gap-3">
                    <AlertTriangle class="text-yellow-500 shrink-0" size="20" />
                    <div>
                        <h4 class="text-yellow-500 font-bold text-xs uppercase mb-1">Privacy Check</h4>
                        <p class="text-yellow-200/70 text-xs">
                            This payload has been stripped of cookies and advertising IDs. 
                            Only the data shown above will be transmitted to the Clean Proxy.
                        </p>
                    </div>
                </div>

                <!-- Financial Breakdown -->
                 <div class="mt-2 pt-2 border-t border-yellow-700/20">
                    <div class="flex justify-between items-center text-xs text-yellow-100/80">
                        <span>Raw Service Value</span>
                        <span>¥{{ (payload?.price || 0).toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between items-center text-xs text-green-400 font-bold mt-1">
                        <span>Protocol Maintenance (5%)</span>
                        <span>¥{{ Math.floor((payload?.price || 0) * 0.05).toLocaleString() }}</span>
                    </div>
                     <div class="flex justify-between items-center text-xs text-yellow-100/60 mt-1">
                        <span>Advocate Revenue (95%)</span>
                        <span>¥{{ Math.floor((payload?.price || 0) * 0.95).toLocaleString() }}</span>
                    </div>
                 </div>
            </div>
        </div>

        <!-- Action Footer -->
        <div class="p-6 border-t border-cyan-900/50 bg-slate-800/50 flex justify-end gap-3">
            <button @click="$emit('cancel')" class="px-5 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors font-medium text-sm">
                Reject
            </button>
            <button @click="$emit('approve')" class="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 transition-all font-bold text-sm tracking-wide flex items-center gap-2">
                <ShieldCheck size="16" />
                Approve & Sign
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
    width: 8px;
}
.scrollbar-thin::-webkit-scrollbar-track {
    background: #0f172a;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
}
</style>
