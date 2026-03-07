<script setup>
import { ref, watch } from 'vue';
import { 
    Globe, Sun, Moon, Settings, CircleDot, Map, 
    MessageSquare, Activity, Mic, ChevronDown, Play, Square 
} from 'lucide-vue-next';
import Orb from './Orb.vue';
import { i18n, theme, toggleTheme, activeModel, setModel } from '../services/i18n';

const props = defineProps({
  user: Object,
  isListening: Boolean,
  isProcessing: Boolean,
  lastAudioUrl: String
});

const emit = defineEmits(['toggleVoice', 'viewDiscovery', 'viewAiMap', 'viewMemos', 'textInput', 'notify', 'viewDeployment']);

const textInputValue = ref('');
const showLanguageMenu = ref(false);
const showModelMenu = ref(false);
const recordingTime = ref(0);
const sessionLimit = 60; 
let timerInterval = null;

const languages = [
    { code: 'en', name: 'English' }, { code: 'ja', name: '日本語' }, { code: 'ko', name: '한국어' },
    { code: 'zh', name: '中文' }, { code: 'fr', name: 'Français' }, { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' }, { code: 'it', name: 'Italiano' }, { code: 'ru', name: 'Русский' },
    { code: 'pt', name: 'Português' }, { code: 'nl', name: 'Nederlands' }, { code: 'vn', name: 'Tiếng Việt' },
    { code: 'th', name: 'ไทย' }, { code: 'hi', name: 'हिन्दी' }, { code: 'ar', name: 'العربية' }
];

const models = ['Gemini 2.0 Flash', 'Opal Reasoning', 'Tive◎DeepView'];

const handleOrbClick = () => {
    emit('toggleVoice');
};

const handleTextSubmit = () => {
    if (!textInputValue.value) return;
    emit('textInput', textInputValue.value);
    textInputValue.value = '';
};

const selectLanguage = (code) => {
    i18n.setLocale(code);
    showLanguageMenu.value = false;
};

const selectModel = (m) => {
    setModel(m);
    showModelMenu.value = false;
};

watch(() => props.isListening, (newVal) => {
    if (newVal) {
        recordingTime.value = 0;
        timerInterval = setInterval(() => {
            recordingTime.value++;
        }, 1000);
    } else {
        clearInterval(timerInterval);
    }
});
</script>

<template>
  <div class="tive-root" :class="{ 'light-mode': theme === 'light', 'is-recording': isListening }">
    
    <!-- 🌊 Mimamori Aura Pulse -->
    <div v-if="isListening" class="mimamori-aura"></div>

    <header class="tive-header">
      <div class="tive-branding">
        <!-- 🐛 Firefly Status Light (Top-Left Resonance) -->
        <div class="firefly-status">
            <div class="firefly-glow"></div>
            <div class="firefly-dot"></div>
        </div>
        <span class="tive-brand-text">Tive◎AI</span>
      </div>
      
      <div class="nav-icons">
        <!-- Language Switcher -->
        <div class="relative">
            <button class="icon-btn" @click="showLanguageMenu = !showLanguageMenu">
                <Globe :size="20" />
            </button>
            <div v-if="showLanguageMenu" class="dropdown-panel custom-scroll right-0">
                <div v-for="lang in languages" :key="lang.code" @click="selectLanguage(lang.code)" class="dropdown-item" :class="{ active: i18n.locale === lang.code }">
                    {{ lang.name }}
                </div>
            </div>
        </div>

        <button class="icon-btn" @click="toggleTheme">
            <component :is="theme === 'dark' ? Sun : Moon" :size="20" />
        </button>
        <button class="icon-btn" @click="emit('notify', { title: 'Settings', message: 'Calibration in progress...', type: 'success' })">
            <Settings :size="20" />
        </button>
      </div>
    </header>

    <main class="tive-main" :class="{ 'focus-mode': isListening }">
        <div v-if="!isListening" class="hero-section animate-in fade-in duration-700">
           <h1 class="title">{{ i18n.t('title') }}</h1>
           <p class="subtitle">{{ i18n.t('ask') }}</p>
        </div>

        <!-- 🔘 GIANT RESONANCE BUTTON -->
        <div class="orb-hitbox" @click="handleOrbClick" :class="{ 'recording': isListening }">
          <div class="orb-scale-wrapper">
             <Orb :isListening="isListening" :isProcessing="isProcessing" />
          </div>
          
          <div v-if="isListening" class="recording-ui animate-in zoom-in duration-300">
              <div class="progress-ring">
                  <div class="time-readout">{{ sessionLimit - recordingTime }}s</div>
                  <div class="stop-label">TAP TO ANCHOR</div>
                  <div class="subtle-stop">
                    <Square :size="12" fill="currentColor" />
                  </div>
              </div>
          </div>
        </div>

        <nav v-if="!isListening" class="bridge-nav fade-in duration-1000">
            <button @click="$emit('viewDiscovery')" class="bridge-link">
                <CircleDot :size="16" />
                <span>{{ i18n.t('discovery') }}</span>
            </button>
            <button @click="$emit('viewAiMap')" class="bridge-link active-link">
                <Map :size="16" />
                <span>{{ i18n.t('map') }}</span>
            </button>
            <button @click="$emit('viewMemos')" class="bridge-link">
                <MessageSquare :size="16" />
                <span>{{ i18n.t('memo') }}</span>
            </button>
            <button @click="$emit('viewDeployment')" class="bridge-link">
                <Activity :size="16" />
                <span>{{ i18n.t('deployment') }}</span>
            </button>
        </nav>
    </main>

    <footer v-if="!isListening" class="input-container animate-in slide-in-from-bottom duration-500">
        <div class="input-bar shadow-2xl">
                <button class="input-util-btn" @click="handleOrbClick"><Mic :size="18" /></button>
                <div class="relative">
                    <button class="input-util-btn" @click="showModelMenu = !showModelMenu">
                        <ChevronDown :size="18" />
                    </button>
                    <div v-if="showModelMenu" class="dropdown-panel bottom-full mb-4 left-0 w-48">
                        <div v-for="m in models" :key="m" @click="selectModel(m)" class="dropdown-item" :class="{ active: activeModel === m }">
                            {{ m }}
                        </div>
                    </div>
                </div>
                <input 
                    v-model="textInputValue"
                    @keydown.enter="handleTextSubmit"
                    type="text" 
                    :placeholder="i18n.t('askModel')"
                />
                <button @click="handleTextSubmit" class="send-btn">
                    <Play :size="16" fill="currentColor" class="rotate-90 translate-x-0.5" />
                </button>
        </div>
    </footer>

    <!-- Processing Curtain (Thinking Box) -->
    <div v-if="isProcessing" class="processing-curtain">
        <div class="thinking-box">
            <div class="thinking-dot-container">
                <div class="thinking-dot"></div>
            </div>
            <div class="thinking-text">{{ i18n.t('thinking') }}</div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.tive-root {
  width: 100%; height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: 40px; background-color: #050202; color: #fff;
  font-family: 'Outfit', sans-serif; overflow: hidden; position: relative;
  transition: background-color 1.5s ease;
}
.light-mode { background-color: #f7f1ec; color: #1a1a1a; }

.mimamori-aura {
    position: absolute; inset: 0;
    background: radial-gradient(circle at center, transparent 30%, rgba(255, 139, 139, 0.1) 100%);
    animation: aura-breathe 4s infinite ease-in-out;
    pointer-events: none; z-index: 5;
}
@keyframes aura-breathe { 0%, 100% { opacity: 0.3; scale: 1; } 50% { opacity: 0.8; scale: 1.1; } }

.is-recording { background-color: #0f0505; }

.tive-header { width: 100%; display: flex; justify-content: space-between; align-items: center; z-index: 100; }
.tive-branding { display: flex; align-items: center; gap: 12px; }
.tive-brand-text { font-family: 'Cinzel', serif; font-weight: 700; letter-spacing: 2px; }
.tive-dot-logo { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #fff; }
.tive-dot-logo.is-active { background: #FF8B8B; border-color: #FF8B8B; box-shadow: 0 0 10px #FF8B8B; }

.nav-icons { display: flex; gap: 20px; align-items: center; position: relative; }
.icon-btn { opacity: 0.4; transition: 0.3s; background: none; border: none; color: inherit; cursor: pointer; }
.icon-btn:hover { opacity: 1; }

/* 🐛 Firefly Status Light Styles (Top-Left Resonance) */
.firefly-status { position: relative; width: 6px; height: 6px; margin-right: 8px; }
.firefly-glow { 
    position: absolute; inset: -8px; border-radius: 50%; 
    background: #fff; filter: blur(6px); opacity: 0; 
    animation: firefly-resonate 3s infinite ease-in-out;
    animation-delay: 0.5s; 
}
.firefly-dot { position: absolute; inset: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 8px rgba(255, 255, 255, 1); }
@keyframes firefly-resonate { 
    0%, 100% { transform: scale(0.6); opacity: 0.1; }
    50% { transform: scale(3.0); opacity: 0.4; }
}

.dropdown-panel {
    position: absolute; width: 150px; max-height: 250px;
    background: rgba(10, 5, 5, 0.95); border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px; overflow-y: auto; z-index: 200; backdrop-filter: blur(20px);
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}
.dropdown-item { padding: 12px 15px; font-size: 11px; cursor: pointer; transition: 0.2s; opacity: 0.6; }
.dropdown-item:hover { background: rgba(255, 255, 255, 0.05); opacity: 1; }
.dropdown-item.active { color: #FF8B8B; opacity: 1; font-weight: 700; }

.tive-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; z-index: 10; padding: 0 20px; }
.hero-section { text-align: center; margin-bottom: 20px; max-width: 600px; }
.title { font-size: clamp(2rem, 6vw, 3.5rem); font-family: 'Cinzel', serif; margin-bottom: 12px; }
.subtitle { font-size: 0.95rem; opacity: 0.5; font-weight: 200; white-space: pre-line; line-height: 1.6; }

.orb-hitbox {
    position: relative; width: 340px; height: 340px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: 0.5s ease;
}
.orb-hitbox.recording { transform: scale(1.15); }

.recording-ui { position: absolute; display: flex; flex-direction: column; align-items: center; pointer-events: none; z-index: 50; }
.time-readout { font-size: 72px; font-family: 'Cinzel'; font-weight: 200; color: #fff; }
.stop-label { font-size: 10px; font-weight: 900; letter-spacing: 3px; color: rgba(255,255,255,0.4); margin-top: -5px; }

.subtle-stop { 
  position: absolute; bottom: -80px; opacity: 0.2; color: #fff;
  transition: 0.3s;
}
.orb-hitbox:hover .subtle-stop { opacity: 0.6; }

.bridge-nav { 
    margin-top: 40px; 
    display: flex; 
    gap: 40px; 
    justify-content: center; 
    align-items: center; 
    width: 100%;
}
.bridge-link { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    gap: 12px; 
    opacity: 0.3; 
    transition: 0.4s; 
    background: none; 
    border: none; 
    color: inherit; 
    cursor: pointer; 
    width: 100px; /* Fixed width for perfect symmetry */
}
.bridge-link span { 
    font-size: 10px; 
    font-weight: 700; 
    letter-spacing: 2px; 
    text-transform: uppercase;
}
.bridge-link:hover { opacity: 1; color: #fff; transform: translateY(-3px); }
.active-link { opacity: 0.8 !important; color: #FFD700; }

.input-container { width: 100%; max-width: 500px; margin-bottom: 30px; }
.input-bar { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; display: flex; align-items: center; padding: 6px; backdrop-filter: blur(20px); }
.input-bar input { flex: 1; background: transparent; border: none; outline: none; padding: 12px 15px; color: inherit; font-size: 14px; }
.input-util-btn { background: none; border: none; color: inherit; opacity: 0.4; padding: 0 8px; cursor: pointer; transition: 0.3s; }
.input-util-btn:hover { opacity: 1; color: #fff; }
.send-btn { width: 44px; height: 44px; background: #fff; color: #000; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: 0.3s; }
.send-btn:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }

.processing-curtain { position: fixed; inset: 0; background: #000; z-index: 2000; display: flex; align-items: center; justify-content: center; }
.thinking-box {
  width: min(400px, 90vw); height: min(400px, 90vw);
  background: radial-gradient(circle at center, #fffbfc 0%, #f7e1e8 100%);
  border-radius: 60px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.thinking-dot { width: 8px; height: 8px; background: #ff5e8e; border-radius: 50%; margin-bottom: 24px; box-shadow: 0 0 15px rgba(255, 94, 142, 0.4); animation: thinking-pulse 1.5s infinite ease-in-out; }
.thinking-text { font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #333; letter-spacing: 2px; }
@keyframes thinking-pulse { 0%, 100% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.6); opacity: 1; } }

/* Mobile Adaptations */
@media (max-width: 640px) {
  .tive-root { padding: 20px; }
  .tive-branding .tive-brand-text { font-size: 14px; }
  .orb-hitbox { width: 280px; height: 280px; }
  .title { font-size: 1.8rem; }
  .bridge-nav { gap: 10px; }
  .bridge-link { width: 80px; }
  .bridge-link span { font-size: 8px; }
  .input-bar { padding: 4px; }
  .input-bar input { font-size: 12px; }
  .input-container { margin-bottom: 20px; width: 95%; }
}

.custom-scroll::-webkit-scrollbar { width: 3px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
</style>
