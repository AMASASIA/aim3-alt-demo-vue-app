<template>
  <AnchorScreen v-if="!user" @anchor="handleAnchor" :isLoading="isInitializing" />
  
  <div :class="['min-h-screen w-full flex flex-col transition-colors duration-1000 overflow-hidden relative font-sans', theme === 'light' ? 'light-mode' : '']">
    
    <!-- 🌌 Persistent Sacred Engine Background -->
    <div class="engine-bg-container">
        <canvas ref="bgCanvasRef" class="engine-bg-canvas"></canvas>
    </div>

    <main class="flex-1 relative overflow-hidden flex flex-col min-h-0">
      <Transition name="view-fade" mode="out-in">
        <!-- Deploy Dash Integration -->
        <PrimaryInterface 
          v-if="activeView === 'dashboard'" 
          :isListening="isListening" 
          :isProcessing="isProcessingVoice"
          :lastAudioUrl="lastAudioUrl"
          @toggleVoice="handleToggleVoice"
          @viewMemos="activeView = 'notebook'"
          @viewDiscovery="notify('Discovery', 'Searching the neural web...', 'success')"
          @viewAiMap="notify('AI Map', 'Initializing semantic visualization...', 'success')"
          @viewDeployment="activeView = 'deployment'"
          @notify="(n) => notify(n.title, n.message, n.type)"
          @textInput="handleSendMessage"
        />

        <!-- History (Page 3) -->
        <NotebookView 
          v-else-if="activeView === 'notebook'" 
          :user="user" 
          :entries="notebookEntries" 
          :isListening="isListening"
          @save-diary="handleManualDiaryEntry"
          @toggle-voice="handleToggleVoice"
          @nav="(view) => { if (view === 'dashboard') activeView = 'dashboard'; }"
        />

        <!-- Result Screen (Page 2) -->
        <ResultScreen 
          v-else-if="activeView === 'result'"
          :content="resultContent"
          :isThinking="isResultThinking"
          @close="activeView = 'dashboard'"
          @save="(content) => { 
            handleSaveToNotebook(content);
            activeView = 'notebook'; 
          }"
          @oke="(content) => {
            handleSaveToNotebook(content);
            activeView = 'dashboard';
          }"
          @submit="(data) => { 
            isResultThinking = true; 
            resultContent = ''; 
            handleSendMessage(data.prompt); 
          }"
          @toggle-voice="handleToggleVoice"
        />

        <!-- Deployment Dashboard (New) -->
        <DeploymentDashboard 
          v-else-if="activeView === 'deployment'"
          @nav="(view) => { if (view === 'dashboard') activeView = 'dashboard'; }"
        />
      </Transition>
    </main>

    <NotificationToast :notifications="notifications" @remove="removeNotification" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, X, LayoutDashboard, MessageSquare, Video, Terminal, Compass, Shield, Fingerprint, Users, Box, Activity, Book } from 'lucide-vue-next';
import AnchorScreen from '../components/AnchorScreen.vue';
import NotebookView from '../components/NotebookView.vue';
import PrimaryInterface from '../components/PrimaryInterface.vue';
import NotificationToast from '../components/NotificationToast.vue';
import { useNotifications } from '../composables/useNotifications';
import ResultScreen from '../components/ResultScreen.vue';
import DeploymentDashboard from '../components/DeploymentDashboard.vue';
import { createKernelSession, sendMessage, analyzeIntent, streamTiveCore } from '../services/intentService.js';
import { useAmasSecretary } from '../composables/useAmasSecretary';
import { useAmasAudio } from '../composables/useAmasAudio';
import { useAmasAudioRecorder } from '../composables/useAmasAudioRecorder';
import { AntigravityEngine } from '../engine/antigravity-engine.js';
import { i18n, theme } from '../services/i18n';

// Helpers for detection
const detectLanguage = (text) => {
    const jaPattern = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
    if (jaPattern.test(text)) return 'ja';
    const koPattern = /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f\ua960-\ua97f\ud7b0-\ud7ff]/;
    if (koPattern.test(text)) return 'ko';
    return 'en'; // Default
};

// State
const user = ref(null);
const router = useRouter();
const { notify, notifications, removeNotification } = useNotifications();
const messages = ref([]);
const notebookEntries = ref([]);
const isLoading = ref(false);
const isInitializing = ref(false);
const activeView = ref('dashboard');
const isListening = ref(false);
const isProcessingVoice = ref(false);
const kernelSession = ref(null);
const { startRecording, stopRecording, lastAudioUrl, lastAudioId, isRecording: recorderIsRecording } = useAmasAudioRecorder();
const { handleVoiceNote: processSecretaryNote } = useAmasSecretary();
const { playSemanticTone } = useAmasAudio();

// --- 🛡️ Mimamori State Synchronization ---
watch(recorderIsRecording, async (newVal) => {
    // If AI auto-stopped the recording (silence or timeout)
    if (!newVal && isListening.value) {
        console.log("[Tive◎AI] 🛡️ Protector triggered sync.");
        isListening.value = false;
        isProcessingVoice.value = true;
        
        const transcript = await stopRecording(); // Get what was recorded so far
        isProcessingVoice.value = false;
        
        if (transcript) {
            activeView.value = 'result';
            isResultThinking.value = true;
            resultContent.value = '';
            await handleVoiceTranscription(transcript);
        } else {
            notify('Protective Care', 'Recording paused automatically (No voice detected).', 'info');
            activeView.value = 'dashboard';
            AntigravityEngine.loadAIState({ energyScore: 0.3, color: '#94a3b8', reactivity: 0.5 });
        }
    }
});

// Result State
const resultContent = ref('');
const isResultThinking = ref(true);

// Engine Background
const bgCanvasRef = ref(null);
let animationId = null;

// Load data on mount
onMounted(() => {
  const savedUser = localStorage.getItem('amas_user_v4');
  const savedMessages = localStorage.getItem('amas_messages_v4');
  const savedNotebook = localStorage.getItem('amas_notebook_v2');

  if (savedUser) {
    user.value = JSON.parse(savedUser);
    const history = savedMessages ? JSON.parse(savedMessages).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    })) : [];
    kernelSession.value = createKernelSession(history);
  }

  if (savedMessages) messages.value = JSON.parse(savedMessages);
  if (savedNotebook) {
      notebookEntries.value = JSON.parse(savedNotebook).map(e => ({
          ...e,
          timestamp: new Date(e.timestamp)
      }));
  }

  // Initialize Sacred Engine
  if (bgCanvasRef.value) {
      AntigravityEngine.init(bgCanvasRef.value);
      AntigravityEngine.loadAIState({ energyScore: 0.4, color: '#FF8B8B', reactivity: 0.5 });
      
      const animate = () => {
          AntigravityEngine.update();
          animationId = requestAnimationFrame(animate);
      };
      animate();
  }
});

onUnmounted(() => {
    if (animationId) cancelAnimationFrame(animationId);
});

// Watch for changes to save
watch(messages, (newVal) => localStorage.setItem('amas_messages_v4', JSON.stringify(newVal)), { deep: true });
watch(notebookEntries, (newVal) => localStorage.setItem('amas_notebook_v2', JSON.stringify(newVal)), { deep: true });

// Keyboard Shortcut Ctrl+A
const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        activeView.value = 'result';
        isResultThinking.value = false;
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
});

// Login handler
const handleAnchor = async (id, session) => {
  if (!id) return;
  isInitializing.value = true;
  try {
    const newUser = { id: `user-${Date.now()}`, name: id, session };
    user.value = newUser;
    localStorage.setItem('amas_user_v4', JSON.stringify(newUser));
    kernelSession.value = createKernelSession([]);
  } finally {
    isInitializing.value = false;
  }
};


// Messaging logic
const handleSendMessage = async (text) => {
  if (!text) return;
  console.log(`[Tive◎AI] 📨 Message Received: "${text}"`);
  
  // 1. Language Detection & Contextual Sync
  const detectedLang = detectLanguage(text);
  if (i18n.locale !== detectedLang) {
    console.log(`[Tive◎AI] 🌐 Language Shift detected: ${detectedLang}`);
    i18n.setLocale(detectedLang);
  }

  // 2. Omotenashi (Hospitality) & Keyword detection
  const isOmotenashi = text.includes('おもてなし') || text.toLowerCase().includes('hospitality');
  const isAmas = text.toLowerCase().includes('@amas') || text.includes('アマス') || text.includes('あます');

  if (isOmotenashi || isAmas) {
    AntigravityEngine.loadAIState({ energyScore: 1.0, color: '#fbcfe8', reactivity: 0.8, type: 'omotenashi' });
    notify('Omotenashi Mode', 'Hospitality Protocol Activated. Resonating with your heart.', 'success');
  }

  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    content: text,
    timestamp: new Date()
  });
  
  // 3. Switch to Result View
  activeView.value = 'result';
  isResultThinking.value = true;
  resultContent.value = '';
  isLoading.value = true;

  try {
    const payload = { text: text };
    
    streamTiveCore(
      payload,
      (msg) => { 
        // Update thinking status or intermediate thought
        console.log("[Tive◎AI] Streaming:", msg);
      },
      (data) => {
        // Handle completion
        const aiResponse = data; // This will be the OKE JSON
        messages.value.push({
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: aiResponse,
          timestamp: new Date()
        });
        
        if (activeView.value === 'result') {
          resultContent.value = aiResponse;
          isResultThinking.value = false;
          AntigravityEngine.loadAIState({ energyScore: 0.8, color: '#FFD700', reactivity: 1.2 });
        }
      },
      (err) => {
        throw new Error(err);
      }
    );
  } catch (error) {
    console.error('[Tive◎AI] AI Error:', error);
    if (activeView.value === 'result') {
      resultContent.value = `[Neural Fragility]: Connection was interrupted.`;
      isResultThinking.value = false;
    }
  } finally {
    isLoading.value = false;
  }
};

// Voice logic
const { stopAll } = useAmasAudio();

const handleToggleVoice = async () => {
    if (isListening.value) {
        // 1. Set states for processing
        isListening.value = false;
        isProcessingVoice.value = true;
        
        // 2. Immediate Transition to Pinkcard (Thinking mode)
        activeView.value = 'result';
        isResultThinking.value = true;
        resultContent.value = '';
        
        try {
            stopAll();
            const audioData = await stopRecording();
            isProcessingVoice.value = false;
            
            if (audioData) {
                // handleVoiceTranscription will update resultContent and set isResultThinking to false
                await handleVoiceTranscription(audioData);
            } else {
                notify('Notice', 'No voice detected.', 'info');
                activeView.value = 'dashboard';
                isResultThinking.value = false;
            }
        } catch (e) {
            console.error('Voice toggle stop error:', e);
            notify('Error', 'Processing failed.', 'error');
            activeView.value = 'dashboard';
            isResultThinking.value = false;
            isProcessingVoice.value = false;
        }
    } else {
        try {
            await startRecording();
            isListening.value = true;
            AntigravityEngine.loadAIState({ energyScore: 0.9, color: '#FF8B8B', reactivity: 2.0 });
        } catch (e) {
            notify('Error', 'Mic access failed', 'error');
        }
    }
};

const handleVoiceTranscription = async (audioData) => {
    if (!audioData) return;
    console.log(`[Tive◎AI] 🎤 Voice Streaming Capture...`);

    const processingId = 'proc-' + Date.now();
    notebookEntries.value.unshift({ id: processingId, type: 'voice_memo', title: 'Thinking...', content: 'Receiving neural audio...', timestamp: new Date(), isProcessing: true });
    
    try {
        const payload = { 
            audio: audioData.base64, 
            mimeType: audioData.mimeType 
        };

        streamTiveCore(
            payload,
            (msg) => {
                console.log("[Tive◎AI] Thought:", msg);
            },
            (data) => {
                // data is the OKE JSON including transcription
                const finalContent = data; 
                resultContent.value = finalContent;
                isResultThinking.value = false;

                // Create notebook entry
                const entry = {
                    id: Date.now().toString(),
                    type: 'standard',
                    title: `Voice Crystal ${new Date().toLocaleTimeString()}`,
                    content: finalContent,
                    timestamp: new Date()
                };
                notebookEntries.value.unshift(entry);
                
                playSemanticTone('reflection');
                notify('Notebook', 'Insight captured.', 'success');
                AntigravityEngine.loadAIState({ energyScore: 0.5, color: '#FFD700', reactivity: 0.8 });
            },
            (err) => {
                 resultContent.value = `[Error]: ${err}`;
                 isResultThinking.value = false;
            }
        );

    } catch (e) {
        console.error('Transcription Error:', e);
        resultContent.value = `[Neural Fragility]: Failed to process voice.`;
        isResultThinking.value = false;
    } finally {
        notebookEntries.value = notebookEntries.value.filter(e => e.id !== processingId);
    }
};

const handleManualDiaryEntry = (content) => {
  notebookEntries.value.unshift({
    id: Date.now().toString(),
    type: 'diary',
    title: `Diary ${new Date().toLocaleTimeString()}`,
    content,
    timestamp: new Date()
  });
};

const handleSaveToNotebook = (content) => {
    if (!content) return;
    const entry = {
        id: Date.now().toString(),
        type: 'standard',
        title: `AI Response ${new Date().toLocaleTimeString()}`,
        content: content,
        timestamp: new Date()
    };
    notebookEntries.value.unshift(entry);
    notify('Notebook', 'Saved to Notebook', 'success');
    AntigravityEngine.triggerMintCelebration();
};
</script>

<style>
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    -webkit-tap-highlight-color: transparent;
    background: #000;
}

.engine-bg-container {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.4;
}

.engine-bg-canvas {
    width: 100%;
    height: 100%;
}

.light-mode .engine-bg-container {
    opacity: 0.1;
}

/* View Transitions */
.view-fade-enter-active, .view-fade-leave-active {
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.view-fade-enter-from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
    filter: blur(10px);
}
.view-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(1.02);
    filter: blur(10px);
}
</style>
