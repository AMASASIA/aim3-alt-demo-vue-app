<script setup>
import { ref, computed } from 'vue';
import { Search, Sparkles, Instagram, Hash, Loader, CheckCircle, Zap, Brain } from 'lucide-vue-next';

const emit = defineEmits(['extract-insights', 'close']);

const props = defineProps({
  isProcessing: {
    type: Boolean,
    default: false
  }
});

// User inputs
const targetHandle = ref('');
const keywords = ref(['', '', '', '', '']);
const platform = ref('threads'); // 'threads' or 'instagram'

// --- AI Model Selection ---
const selectedModel = ref('gemini-2.0-flash');
const aiModels = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0', provider: 'Google', color: 'from-blue-500 to-cyan-500', badge: 'Fast' },
  { id: 'gemini-exp-1121', label: 'Gemini Deep Think', provider: 'Google', color: 'from-indigo-600 to-purple-600', badge: 'Logic++' },
  { id: 'claude-3.5-sonnet', label: 'Claude 3.5', provider: 'Anthropic', color: 'from-amber-500 to-orange-500', badge: 'Creative' },
  { id: 'antigravity-agent', label: 'Antigravity Agent', provider: 'Autonomous', color: 'from-black to-slate-800', badge: 'Auto' },
];

const agentMode = ref('manual'); // 'manual' or 'patrol' or 'agent-mail'
const isPatrolling = ref(false);
const agentMailSync = ref(false);
const useAntigravityX = ref(true);
const voiceTranscript = ref(''); 

// Serendipity factor (AIM3 algorithm control)
const serendipityFactor = ref(0.15);
const serendipityLabels = { 0: 'Precise', 0.15: 'Balanced', 0.35: 'Creative', 0.6: 'Explorative' };
const currentSerendipityLabel = computed(() => {
  const f = serendipityFactor.value;
  if (f <= 0.05) return 'Precise';
  if (f <= 0.2) return 'Balanced';
  if (f <= 0.4) return 'Creative';
  return 'Explorative';
});

// Validation
const isValid = computed(() => {
  if (agentMode.value === 'patrol') return true;
  return targetHandle.value.trim() && keywords.value.filter(k => k.trim()).length >= 3;
});

const addKeyword = () => {
  if (keywords.value.length < 10) {
    keywords.value.push('');
  }
};

const removeKeyword = (index) => {
  if (keywords.value.length > 5) {
    keywords.value.splice(index, 1);
  }
};

const startExtraction = () => {
  const cleanKeywords = keywords.value.filter(k => k.trim());
  emit('extract-insights', {
    platform: platform.value,
    handle: targetHandle.value.trim() || 'amas',
    keywords: cleanKeywords,
    model: selectedModel.value,
    agentMode: agentMode.value,
    serendipityFactor: serendipityFactor.value
  });
};
</script>

<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white/90 backdrop-blur-md rounded-[3rem] border border-white/20 shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="p-8 border-b border-slate-100/50 flex-shrink-0">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles :size="24" class="text-white" />
            </div>
            <div>
              <h2 class="font-serif-luxury text-2xl italic text-slate-900">AI Discovery</h2>
              <p class="text-xs text-slate-500 uppercase tracking-widest mt-1">Tive AI × AIM3 Search Engine</p>
            </div>
          </div>
          <button 
            @click="$emit('close')"
            class="group flex items-center gap-3 px-6 py-2 rounded-full bg-slate-100 hover:bg-black hover:text-white transition-all duration-500"
          >
            <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Return to Core</span>
            <span class="text-slate-600 group-hover:text-white text-xl">×</span>
          </button>
        </div>
      </div>

      <!-- Body (Scrollable) -->
      <div class="p-8 space-y-6 overflow-y-auto custom-scroll flex-1">

        <!-- AI Model Selection -->
        <div class="space-y-3">
          <label class="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Brain :size="14" class="text-purple-400" />
            AI Engine
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="model in aiModels"
              :key="model.id"
              @click="selectedModel = model.id"
              :class="[
                'relative px-4 py-3 rounded-2xl border-2 transition-all duration-300 text-left group/model overflow-hidden',
                selectedModel === model.id 
                  ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              ]"
            >
              <!-- Active glow -->
              <div 
                v-if="selectedModel === model.id"
                :class="['absolute inset-0 opacity-10 bg-gradient-to-r', model.color]"
              />
              <div class="relative flex items-center justify-between">
                <div>
                  <div class="text-[11px] font-bold tracking-wide">{{ model.label }}</div>
                  <div :class="['text-[9px] uppercase tracking-widest mt-0.5', selectedModel === model.id ? 'text-white/50' : 'text-slate-400']">
                    {{ model.provider }}
                  </div>
                </div>
                <span :class="[
                  'text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full',
                  selectedModel === model.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 text-slate-500'
                ]">
                  {{ model.badge }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- CO-CREATION INTELLIGENCE MODES -->
        <div class="space-y-4">
          <label class="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
            <span>Co-Creation Hub (A2A Economy)</span>
            <span class="text-purple-600 text-[10px] tracking-widest font-black">HA-INTEGRATION</span>
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              @click="agentMode = 'agent-mail'"
              :class="['px-6 py-5 rounded-[2rem] border-2 transition-all flex flex-col gap-2 text-left relative overflow-hidden group/mail',
                       agentMode === 'agent-mail' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white hover:border-slate-300']"
            >
              <div v-if="agentMode === 'agent-mail'" class="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-700 opacity-20"></div>
              <div class="flex items-center gap-2 relative">
                <Sparkles :size="16" :class="agentMode === 'agent-mail' ? 'text-cyan-300' : 'text-blue-500'" />
                <span class="font-bold text-sm">AgentMail Discovery</span>
              </div>
              <span class="text-[9px] opacity-80 uppercase tracking-widest relative">Autonomous Inbox Extraction × Anonymized Insight</span>
            </button>
            
            <button
              @click="agentMode = 'patrol'"
              :class="['px-6 py-5 rounded-[2rem] border-2 transition-all flex flex-col gap-2 text-left relative overflow-hidden',
                       agentMode === 'patrol' ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-200 bg-white hover:border-slate-300']"
            >
              <div v-if="agentMode === 'patrol'" class="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-800 opacity-20"></div>
              <div class="flex items-center gap-2 relative">
                <Zap :size="16" :class="agentMode === 'patrol' ? 'text-amber-300' : 'text-purple-400'" />
                <span class="font-bold text-sm">Antigravity X Mission</span>
              </div>
              <span class="text-[9px] opacity-80 uppercase tracking-widest relative">Autonomous Browser Actuation (Cloud-Managed)</span>
            </button>
          </div>
        </div>

        <!-- TRUST & SAFETY SHIELD (Addresses Anxiety) -->
        <div class="bg-slate-900 text-white rounded-[2rem] p-6 space-y-4 border border-white/10 shadow-xl">
            <div class="flex items-center justify-between">
                 <div class="flex items-center gap-2 text-teal-400 uppercase tracking-[0.2em] text-[10px] font-black">
                     <CheckCircle :size="14" />
                     Co-Creation Safeguard
                 </div>
                 <div class="text-[9px] text-slate-500 font-mono">Gateway Protocol: v2.4</div>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed font-serif italic">
                "AIエージェント自身が利用規約に合意し、Invisible Financeを通じてAPI利用料を自己決済します。データは完全に匿名化され、個人情報とプライバシーはGatewayによって物理的に保護されます。"
            </p>
            <div class="flex gap-4 pt-2">
                 <div class="flex-1 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                      <div class="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                      <span class="text-[8px] uppercase tracking-widest text-slate-400">Anti-Fraud Shield</span>
                 </div>
                 <div class="flex-1 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                      <div class="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      <span class="text-[8px] uppercase tracking-widest text-slate-400">Anonymized Mining</span>
                 </div>
            </div>
        </div>

        <!-- Platform Selection (Conditional) -->
        <div v-if="agentMode === 'manual'" class="space-y-3 animate-in fade-in slide-in-from-top-2">
          <label class="text-xs font-bold uppercase tracking-widest text-slate-400">Target Source</label>
          <div class="flex gap-3">
            <button
              @click="platform = 'threads'"
              :class="['flex-1 px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3',
                       platform === 'threads' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 bg-white hover:border-slate-300']"
            >
              <Instagram :size="20" :class="platform === 'threads' ? 'text-purple-600' : 'text-slate-400'" />
              <span :class="['font-bold text-sm', platform === 'threads' ? 'text-purple-900' : 'text-slate-600']">Threads</span>
            </button>
            <button
              @click="platform = 'instagram'"
              :class="['flex-1 px-6 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3',
                       platform === 'instagram' ? 'border-pink-500 bg-pink-50' : 'border-slate-200 bg-white hover:border-slate-300']"
            >
              <Instagram :size="20" :class="platform === 'instagram' ? 'text-pink-600' : 'text-slate-400'" />
              <span :class="['font-bold text-sm', platform === 'instagram' ? 'text-pink-900' : 'text-slate-600']">Instagram</span>
            </button>
          </div>
        </div>

        <!-- Target Handle (Conditional) -->
        <div v-if="agentMode === 'manual'" class="space-y-3 animate-in fade-in slide-in-from-top-2">
          <label class="text-xs font-bold uppercase tracking-widest text-slate-400">Target Handle</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono">@</span>
            <input
              v-model="targetHandle"
              type="text"
              placeholder="username"
              class="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:border-purple-500 focus:ring-0 transition-all font-mono text-slate-900"
            />
          </div>
        </div>

        <!-- Keywords -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-widest text-slate-400">Keywords (Min 3)</label>
            <button
              v-if="keywords.length < 10"
              @click="addKeyword"
              class="text-xs font-bold text-purple-600 hover:text-purple-700 uppercase tracking-wider"
            >
              + Add More
            </button>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(keyword, index) in keywords" 
              :key="index"
              class="flex items-center gap-2"
            >
              <Hash :size="16" class="text-slate-300 flex-shrink-0" />
              <input
                v-model="keywords[index]"
                type="text"
                :placeholder="`Keyword ${index + 1}`"
                class="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-purple-500 focus:ring-0 transition-all text-sm"
              />
              <button
                v-if="keywords.length > 5"
                @click="removeKeyword(index)"
                class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all text-slate-400"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Serendipity Factor (AIM3 Algorithm Control) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Zap :size="14" class="text-amber-400" />
              Serendipity Level
            </label>
            <span class="text-[10px] font-black uppercase tracking-widest text-purple-600">{{ currentSerendipityLabel }}</span>
          </div>
          <div class="relative">
            <input 
              v-model.number="serendipityFactor" 
              type="range" 
              min="0" 
              max="0.6" 
              step="0.05"
              class="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-600"
            />
            <div class="flex justify-between mt-1">
              <span class="text-[8px] text-slate-400 uppercase tracking-widest">Precise</span>
              <span class="text-[8px] text-slate-400 uppercase tracking-widest">Explorative</span>
            </div>
          </div>
        </div>

        <!-- Co-Creation Benefits Box -->
        <div class="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-6">
          <div class="flex gap-4">
            <Brain :size="24" class="text-indigo-500 flex-shrink-0 mt-1" />
            <div class="text-xs text-indigo-900 leading-relaxed">
              <p class="font-bold mb-2 uppercase tracking-widest">Autonomous ROI Integration:</p>
              <ul class="space-y-2 text-indigo-700 font-serif italic">
                <li>• **Self-Onboarding**: AgentMail manages inbox analysis 24/7 without human intervention.</li>
                <li>• **Invisible Commerce**: Your agent signs browser operate contracts and fulfills payments.</li>
                <li>• **Artifact Assetization**: Insights are auto-mined into sellable digital wisdom packages.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-8 border-t border-slate-100/50 bg-slate-50/50 flex-shrink-0">
        <button
          @click="startExtraction"
          :disabled="!isValid || isProcessing"
          :class="['w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3',
                   isValid && !isProcessing 
                     ? (agentMode === 'patrol' ? 'bg-black text-white hover:bg-slate-800' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg')
                     : 'bg-slate-200 text-slate-400 cursor-not-allowed',
                   'scale-[1.02] active:scale-95']"
        >
          <component :is="isProcessing ? Loader : (agentMode === 'patrol' || agentMode === 'agent-mail' ? Zap : Search)" :size="20" :class="isProcessing ? 'animate-spin' : ''" />
          <span>{{ isProcessing ? 'Autonomous Negotiation...' : (agentMode === 'agent-mail' ? 'Authorize AgentMail Sync' : (agentMode === 'patrol' ? 'Deploy Antigravity X' : 'Start AI Discovery')) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
input:focus {
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9333ea, #ec4899);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #9333ea, #ec4899);
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
}
</style>
