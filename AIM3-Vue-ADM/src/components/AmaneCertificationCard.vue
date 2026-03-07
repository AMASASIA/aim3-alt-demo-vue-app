<template>
  <div class="amane-container p-4 md:p-12 w-full h-full flex justify-center items-center font-serif text-[#1A1A1A]">
    <!-- Card Container -->
    <div class="oke-card relative w-full max-w-[340px] bg-[#FDFDFD] rounded-[32px] shadow-2xl overflow-hidden flex flex-col items-center border border-white/20">
      
      <!-- Organic Glass Backlit -->
      <div class="absolute -top-20 -right-20 w-40 h-40 bg-pink-100/50 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-50/50 rounded-full blur-3xl"></div>

      <!-- Brown Header (The Label) -->
      <div class="w-[85%] mt-8 bg-[#6B5B54] py-3 px-6 text-center shadow-lg relative z-10">
        <h1 class="text-white text-[12px] font-serif uppercase tracking-[0.2em] font-bold">{{ fact.category || 'OKE Certified Fact' }}</h1>
      </div>

      <!-- Content Body -->
      <div class="flex-1 w-full px-8 pt-10 pb-12 flex flex-col items-center text-center relative z-10">
        
        <!-- Logo & Date Section -->
        <div class="flex items-center gap-5 mb-10 w-full justify-center border-b border-[#6B5B54]/10 pb-8">
            <!-- Dynamic OKE Monogram (Sacred Geometry style) -->
            <div class="w-14 h-14 relative flex items-center justify-center">
                <div class="absolute inset-0 border border-[#C4A484]/20 rounded-full animate-pulse-slow"></div>
                <span class="absolute text-3xl font-serif text-[#C4A484] -top-1 -left-1">K</span>
                <span class="absolute text-5xl font-serif text-[#8B4513] -top-3 left-4 opacity-70">O</span>
                <span class="absolute text-3xl font-serif text-[#C4A484] top-4 left-4">E</span>
            </div>
            
            <div class="text-left">
                <div class="text-[16px] font-bold text-[#1A1A1A] font-serif tracking-tight leading-none mb-1">OKE Certified</div>
                <div class="text-[9px] text-[#6B5B54] uppercase tracking-[0.15em] font-medium opacity-70">Ground Truth Verified</div>
                <div class="text-[9px] text-[#1A1A1A]/50 uppercase tracking-[0.25em] mt-2 font-mono">{{ displayDate }}</div>
            </div>
        </div>

        <!-- Grade Score / Neural Resonance -->
        <div class="mb-10 relative w-full text-left pl-4">
             <div class="text-[10px] text-[#6B5B54] uppercase tracking-widest mb-2 opacity-60">Resonance Grade</div>
             <div class="flex items-baseline gap-2">
                <span class="text-7xl font-serif text-[#1A1A1A] leading-none tracking-tighter">{{ fact.grade || '9.8' }}</span>
                <span class="text-xl text-[#1A1A1A]/30 font-serif">/10.0</span>
             </div>
        </div>

        <!-- AI Insight Section (The Revealed Content) -->
        <div class="w-full text-left space-y-4 mb-10">
            <div class="space-y-1">
                <div class="text-[10px] font-bold uppercase tracking-[0.1em] text-[#1A1A1A] leading-tight">
                    TARGET: <span class="font-normal opacity-80">{{ fact.model || 'Atomic Observation' }}</span>
                </div>
                <div class="text-[8px] uppercase tracking-[0.2em] text-[#6B5B54]/80 font-medium font-mono">
                    ID: {{ fact.shortId || 'UNVERIFIED' }}
                </div>
            </div>

            <!-- AI Scribe (The dynamic response) -->
            <div v-if="fact.description" class="p-4 bg-white/40 border border-[#6B5B54]/5 rounded-xl text-left shadow-sm max-h-[160px] overflow-y-auto custom-scroll-light markdown-body">
                <div class="text-[11px] font-serif leading-relaxed italic text-[#333]" v-html="renderedDescription"></div>
            </div>
            
            <div class="flex items-center justify-between pt-4 border-t border-[#6B5B54]/5">
                <div class="flex flex-col">
                    <span class="text-[8px] uppercase tracking-widest text-[#1A1A1A]/40">Observer Node</span>
                    <span class="text-[9px] font-mono text-[#6B5B54]">{{ fact.observer || 'AMAS-NODE-001' }}</span>
                </div>
                <div class="flex gap-3">
                    <span class="text-xs grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">🔖</span>
                    <span class="text-xs grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">❤</span>
                </div>
            </div>
            
            <!-- The Signature Brand -->
             <div class="flex justify-end mt-2">
                 <span class="bg-pink-100/80 text-pink-600 text-[8px] px-2 py-1 rounded-full font-sans tracking-tight shadow-sm border border-pink-200/50">
                   ❤amas @ <span class="font-bold underline decoration-pink-300">@kamale</span>
                 </span>
             </div>
        </div>

        <!-- Call to Action -->
        <a :href="'https://amane.li/' + (fact.shortId || '')" class="w-full group relative overflow-hidden bg-[#4A5056] text-white py-4 rounded-xl text-[11px] font-serif uppercase tracking-[0.2em] shadow-xl hover:bg-[#32363b] transition-all duration-300">
            <span class="relative z-10">View Full Provenance</span>
            <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </a>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps({
  fact: {
    type: Object,
    default: () => ({
      model: "Nike AJ1 High '85",
      grade: 9.8,
      category: "Authentic Atomic Fact",
      description: "Neural scan confirms molecular alignment with 1985 manufacturing protocols. Original pigmentation signature detected.",
      observer: "AMAS Node OS-001",
      shortId: "6ac3f2d1"
    })
  }
});

const displayDescription = ref('');
const isTyping = ref(false);

const displayDate = computed(() => {
    const d = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
});

const renderedDescription = computed(() => {
    if (!displayDescription.value) return '';
    const rawHtml = marked.parse(displayDescription.value);
    return DOMPurify.sanitize(rawHtml);
});

const typeText = async (text) => {
    isTyping.value = true;
    displayDescription.value = '';
    const chars = text.split('');
    let current = '';
    
    // Type in chunks for better performance and rhythm
    for (let i = 0; i < chars.length; i++) {
        current += chars[i];
        displayDescription.value = current;
        // Faster typing for longer texts
        const speed = chars.length > 200 ? 5 : 15;
        await new Promise(r => setTimeout(r, speed));
    }
    isTyping.value = false;
};

watch(() => props.fact.description, (newVal) => {
    if (newVal) typeText(newVal);
}, { immediate: true });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.font-serif {
  font-family: 'Cormorant Garamond', serif;
}

.oke-card {
  box-shadow: 
    0 40px 100px -20px rgba(0, 0, 0, 0.4),
    inset 0 0 40px rgba(255, 255, 255, 0.5);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  animation: holo-shimmer 8s infinite alternate ease-in-out;
}

@keyframes holo-shimmer {
    0% { filter: hue-rotate(0deg) brightness(1); }
    50% { filter: hue-rotate(5deg) brightness(1.02); box-shadow: 0 40px 100px -20px rgba(255, 139, 139, 0.2), inset 0 0 40px rgba(255, 255, 255, 0.6); }
    100% { filter: hue-rotate(-5deg) brightness(1); }
}

.oke-card:hover {
    transform: translateY(-5px) scale(1.01);
    filter: brightness(1.05);
}

@keyframes pulse-slow {
    0%, 100% { opacity: 0.1; transform: scale(0.9); }
    50% { opacity: 0.3; transform: scale(1.1); }
}

.animate-pulse-slow {
    animation: pulse-slow 4s infinite ease-in-out;
}
.custom-scroll-light::-webkit-scrollbar { width: 3px; }
.custom-scroll-light::-webkit-scrollbar-thumb { background: rgba(107, 91, 84, 0.2); border-radius: 10px; }

/* Markdown Styles */
.markdown-body :deep(p) { margin-bottom: 8px; }
.markdown-body :deep(strong) { font-weight: 700; color: #000; }
.markdown-body :deep(ul) { list-style-type: disc; padding-left: 15px; margin-bottom: 8px; }
.markdown-body :deep(li) { margin-bottom: 4px; }
</style>

