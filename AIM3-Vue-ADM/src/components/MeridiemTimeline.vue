<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { 
  Calendar, 
  Clock, 
  Tag, 
  Layout, 
  PenTool, 
  ChevronRight, 
  Search, 
  Plus, 
  Network,
  Maximize2,
  Minimize2
} from 'lucide-vue-next';
import TimelineBlock from './TimelineBlock.vue';

const props = defineProps({
  initialContent: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['save', 'close']);

// --- State ---
const content = ref(props.initialContent || `# Resonance Timeline\n\nNow: Interface Sync #sync\n2026-02-17: Timeline Extension Phase 2 #coding\n2026-02-20 - 2026-02-25: Knowledge Integration #milestone\n2026-03-01: Global Resonance #launch`);
const activeTab = ref('timeline'); // 'timeline' or 'starfield'
const isFullScreen = ref(false);
const searchQuery = ref('');

// --- Computed ---
const timelineText = computed(() => {
    // If there's a specific block, use it. Otherwise, assume markdown with timeline info.
    const timelineRegex = /```timeline\n([\s\S]*?)```/;
    const match = content.value.match(timelineRegex);
    if (match) return match[1];
    
    // Fallback: If no block but content looks like timeline lines (Date: Title)
    if (/^\d{4}-\d{2}-\d{2}/m.test(content.value) || /^Now:/m.test(content.value)) {
        return content.value;
    }
    return '';
});

// --- Methods ---
const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value;
};

const handleSave = () => {
    // Wrap in timeline block if it's not already there for general notebook storage
    let finalContent = content.value;
    if (!finalContent.includes('```timeline') && timelineText.value) {
        finalContent = `\`\`\`timeline\n${finalContent}\n\`\`\``;
    }
    emit('save', finalContent);
};

</script>

<template>
  <div :class="['meridiem-container transition-all duration-700 overflow-hidden', isFullScreen ? 'fixed inset-0 z-[2000] bg-[#F8F9FA]' : 'w-full h-[85vh] rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] bg-[#F0F2F5] border border-white relative']">
    
    <!-- Top Dashboard Header (Luxury Switcher) -->
    <div class="absolute top-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-8">
        <div class="bg-white/60 backdrop-blur-3xl p-2 rounded-full border border-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] flex items-center justify-between">
            <div class="flex gap-1.5">
                <button 
                    @click="activeTab = 'timeline'"
                    :class="['flex items-center gap-3 px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 ease-out', 
                             activeTab === 'timeline' ? 'bg-black text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50']"
                >
                    <Layout :size="16" />
                    <span>Timeline</span>
                </button>
                <button 
                    @click="activeTab = 'starfield'"
                    :class="['flex items-center gap-3 px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 ease-out', 
                             activeTab === 'starfield' ? 'bg-black text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50']"
                >
                    <Network :size="16" />
                    <div class="flex flex-col items-center leading-none -space-y-0.5">
                        <span class="tracking-[0.1em]">Knowledge</span>
                        <span class="text-[7px] opacity-60 tracking-[0.1em]">Starfield</span>
                    </div>
                </button>
            </div>

            <div class="w-[1px] h-10 bg-slate-200 mx-4" />

            <button @click="handleSave" class="flex items-center gap-3 px-10 py-3.5 bg-[#17BEBB] hover:bg-[#14a8a5] text-white rounded-full text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 shadow-[0_10px_25px_rgba(23,190,187,0.3)] active:scale-95 group/btn">
                <PenTool :size="16" class="group-hover/btn:rotate-12 transition-transform" />
                <span>New Entry</span>
            </button>
        </div>

        <!-- Refined Search Bar -->
        <div class="mt-8 flex justify-center animate-in" style="animation-delay: 0.2s">
            <div class="w-full max-w-xl relative group">
                <Search class="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-[#17BEBB] transition-colors duration-500" :size="20" />
                <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Search across resonance archives..."
                    class="w-full bg-white/90 backdrop-blur-xl rounded-full py-5 pl-16 pr-8 border-none focus:ring-4 focus:ring-[#17BEBB]/10 text-slate-800 placeholder:text-slate-300 font-serif-luxury italic text-xl shadow-[0_5px_15px_rgba(0,0,0,0.02)] transition-all"
                />
            </div>
        </div>
    </div>

    <!-- Main Layout Container -->
    <div class="w-full h-full pt-56 flex overflow-hidden">
        
        <!-- EDITOR SIDE: Glassmorphism Architecture -->
        <div class="w-1/2 h-full p-12 flex flex-col animate-in" style="animation-delay: 0.3s">
            <div class="flex items-center justify-between mb-5 px-3">
                <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-[#17BEBB] animate-pulse"></div>
                    <span class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Amane Editor v0.9</span>
                </div>
                <div class="flex gap-2">
                    <span class="text-[9px] font-mono text-slate-300 uppercase px-2 py-0.5 border border-slate-200 rounded">UTF-8</span>
                    <span class="text-[9px] font-mono text-slate-300 uppercase px-2 py-0.5 border border-slate-200 rounded">MKW-01</span>
                </div>
            </div>
            <div class="flex-1 relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-[#17BEBB]/20 to-purple-500/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <textarea 
                    v-model="content"
                    class="relative w-full h-full bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 border border-white shadow-inner focus:ring-0 text-slate-800 font-mono text-sm leading-relaxed placeholder:text-slate-200 resize-none transition-all custom-scroll scroll-smooth"
                    placeholder="Begin mapping your temporal resonance..."
                ></textarea>
            </div>
        </div>

        <!-- VISUALIZATION SIDE: Dynamic Insights -->
        <div class="w-1/2 h-full p-12 bg-slate-50/50 border-l border-white animate-in" style="animation-delay: 0.4s">
            <div v-if="activeTab === 'timeline'" class="h-full flex flex-col">
                <div class="flex-1 overflow-y-auto custom-scroll pr-6 pb-20">
                    <TimelineBlock :events="timelineText" />
                    
                    <!-- Insight Cards / Context -->
                    <div v-if="timelineText" class="mt-12 p-8 bg-white/40 rounded-3xl border border-white shadow-sm italic font-serif text-slate-500 text-lg leading-relaxed">
                        "The pattern of your intent suggests a high concentration of <span class="text-[#17BEBB]">#coding</span> activity in the upcoming cycle. Consider allocating resonance to <span class="text-purple-500">#design</span> to maintain equilibrium."
                    </div>
                </div>
                
                <!-- System Telemetry -->
                <div class="pt-8 border-t border-slate-200 flex justify-between items-center opacity-50">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-[1px] bg-slate-300"></div>
                        <span class="text-[9px] font-black uppercase tracking-widest text-slate-600">Sync: 100% Secure</span>
                    </div>
                    <div class="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-[#17BEBB]">
                        <span>Temporal Indexing</span>
                        <div class="w-1.5 h-1.5 bg-[#17BEBB] rounded-full"></div>
                    </div>
                </div>
            </div>

            <!-- Knowledge Starfield Placeholder -->
            <div v-if="activeTab === 'starfield'" class="h-full flex items-center justify-center p-12 relative overflow-hidden bg-slate-900 rounded-[3rem] shadow-2xl">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(23,190,187,0.1)_0%,_transparent_70%)]"></div>
                <div class="text-center space-y-10 relative z-10 transition-all duration-1000 transform hover:scale-105">
                    <div class="relative inline-block">
                        <Network :size="80" class="mx-auto text-white/20" />
                        <div class="absolute inset-0 bg-white blur-3xl opacity-10 animate-pulse"></div>
                    </div>
                    <div>
                        <h2 class="font-serif-luxury text-5xl italic text-white tracking-tight mb-4">Resonance Void</h2>
                        <div class="h-[1px] w-20 bg-gradient-to-r from-transparent via-[#17BEBB] to-transparent mx-auto mb-6"></div>
                        <p class="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 max-w-xs mx-auto leading-relaxed">System is awaiting further neural mapping input.</p>
                    </div>
                    <button class="px-8 py-3 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all">
                        Initialize Mapping
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- UI Controls (Floating action bar style) -->
    <div class="absolute bottom-12 right-12 flex gap-4 z-40">
        <button @click="toggleFullScreen" class="w-14 h-14 bg-white/80 hover:bg-white text-slate-400 hover:text-slate-900 rounded-full transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center group active:scale-90">
            <component :is="isFullScreen ? Minimize2 : Maximize2" :size="20" class="group-hover:rotate-12 transition-transform" />
        </button>
        <button @click="$emit('close')" class="group flex items-center gap-4 pl-8 pr-6 py-4 bg-black text-white rounded-full transition-all duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:scale-110 active:scale-90 border border-white/20">
            <span class="text-[9px] font-black uppercase tracking-[0.4em] text-white/50 group-hover:text-white transition-colors">Retract to Core</span>
            <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <ChevronRight :size="18" class="rotate-180" />
            </div>
        </button>
    </div>

    <!-- Invisible Watermark -->
    <div class="absolute bottom-8 left-12 opacity-10 pointer-events-none transition-opacity hover:opacity-50">
        <div class="flex items-center gap-4">
            <div class="w-5 h-5 rounded-full border border-black flex items-center justify-center">
                <div class="w-1.5 h-1.5 bg-black rounded-full"></div>
            </div>
            <span class="text-[10px] font-black uppercase tracking-[0.8em] text-black">Amane Protocol</span>
        </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,700&display=swap');

.font-serif-luxury {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 700;
}

.meridiem-container {
  font-family: 'Inter', sans-serif;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.05);
  border-radius: 10px;
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.1);
}

/* Animations */
.animate-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
