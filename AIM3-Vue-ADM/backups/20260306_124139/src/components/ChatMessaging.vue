<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { Rocket, Mic, MicOff, Bookmark } from 'lucide-vue-next';
import ChatMessage from './ChatMessage.vue';
import TypingIndicator from './TypingIndicator.vue';

const props = defineProps({
  messages: Array,
  isLoading: Boolean
});

const emit = defineEmits(['sendMessage', 'saveToNotebook']);

const inputValue = ref('');
const isListening = ref(false);
const scrollContainerRef = ref(null);
const initRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = 'ja-JP';

        recog.onresult = (event) => {
            const text = event.results[0][0].transcript;
            inputValue.value = text;
            isListening.value = false;
            handleSend(); 
        };

        recog.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            isListening.value = false;
        };

        recog.onend = () => {
            isListening.value = false;
        };
        return recog;
    }
    return null;
};

const toggleVoice = () => {
  if (isListening.value) {
    recognition?.stop();
  } else {
    recognition = initRecognition();
    if (!recognition) {
        alert("Speech recognition not supported in this browser.");
        return;
    }
    isListening.value = true;
    try {
        recognition.start();
    } catch (e) {
        console.error("Speech start failed:", e);
        isListening.value = false;
    }
  }
};

const handleSend = () => {
  if (!inputValue.value.trim()) return;
  emit('sendMessage', inputValue.value);
  inputValue.value = '';
};

watch(() => [props.messages, props.isLoading], () => {
  nextTick(() => {
    if (scrollContainerRef.value) {
      const container = scrollContainerRef.value;
      container.scrollTo({
        left: container.scrollWidth,
        behavior: 'smooth'
      });
    }
  });
}, { deep: true });
</script>

<template>
  <div class="h-full flex flex-col relative overflow-hidden">
    <!-- Horizontal Message Slider -->
    <div 
      ref="scrollContainerRef"
      class="flex-1 overflow-x-auto overflow-y-hidden flex items-center snap-x snap-mandatory scroll-smooth custom-scroll px-[10vw] pb-32 pt-20"
    >
      <div class="flex items-center gap-12 h-full">
        <div v-if="messages.length === 0" class="flex-none w-[80vw] md:w-[400px] h-full flex flex-col items-center justify-center opacity-10 gap-6 snap-center">
          <div class="hexagon-container w-16 h-16 bg-slate-200" />
          <p class="text-[10px] uppercase tracking-[1em] font-black italic text-center">Amas Core Ready</p>
        </div>
        
        <div 
          v-else
          v-for="(m, index) in messages" 
          :key="m.id" 
          class="flex-none snap-center flex items-center group relative"
        >
          <ChatMessage :message="m" :isFirst="index === 0" />
          <!-- Action hover button -->
          <button 
            v-if="m.senderId === 'GEMINI_AI'"
            @click="emit('saveToNotebook', { title: 'AI Reflection', content: m.text })"
            class="absolute top-0 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            title="Save to Notebook"
          >
            <Bookmark :size="14" class="text-teal-400" />
          </button>
        </div>
        
        <div v-if="isLoading" class="flex-none snap-center pl-4">
          <TypingIndicator />
        </div>
        
        <!-- Spacing element at the end -->
        <div class="flex-none w-[20vw]" />
      </div>
    </div>

    <!-- Persistent Input Overlay -->
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-[100]">
      <div class="bg-white/90 backdrop-blur-2xl rounded-full p-1.5 pl-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100/50 flex items-center gap-3">
        <button 
          @click="toggleVoice"
          :class="['w-10 h-10 rounded-full flex items-center justify-center transition-all', isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:text-slate-600']"
        >
          <Mic v-if="!isListening" :size="16" />
          <MicOff v-else :size="16" />
        </button>
        <input 
          type="text"
          v-model="inputValue"
          @keydown.enter="handleSend"
          placeholder="Type or use voice..."
          class="flex-1 bg-transparent border-none focus:ring-0 text-[13px] font-medium text-slate-800 placeholder:text-slate-300"
        />
        <button 
          @click="handleSend"
          class="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/20"
        >
          <Rocket :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

