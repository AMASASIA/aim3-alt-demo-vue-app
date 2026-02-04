<script setup>
import { Feather, MapPin, Sparkles, ShieldCheck, Zap, Image as ImageIcon, Clock, BookOpen } from 'lucide-vue-next';
import MarkdownRenderer from './MarkdownRenderer.vue';
import OKECertificationCard from './OKECertificationCard.vue';

const props = defineProps({
  user: Object,
  entries: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <div v-if="user" class="w-full h-full flex flex-col items-center overflow-y-auto custom-scroll bg-white/50 backdrop-blur-sm">
    <div class="w-full max-w-6xl px-6 md:px-12 py-10 md:py-20 space-y-16 md:space-y-32">
      
      <!-- HEADER SECTION -->
      <header class="text-center space-y-6 md:space-y-12 mt-32 md:mt-48">
        <div class="flex justify-center">
          <div class="w-16 h-16 md:w-24 md:h-24 rounded-full bg-slate-900 flex items-center justify-center text-teal-400 shadow-2xl shadow-teal-100/20">
            <Feather :size="32" />
          </div>
        </div>
        <h1 class="font-serif-luxury text-7xl md:text-[10rem] lg:text-[12rem] text-slate-900 leading-[0.8] tracking-tighter font-bold italic select-none">Personal Notebook</h1>
        <p class="text-[10px] md:text-[14px] font-black uppercase tracking-[0.5em] md:tracking-[1em] text-slate-300">Identity x Semantic Resonance | Amas Core OS</p>
      </header>

      <!-- VISUAL DIARY LOG -->
      <section v-if="entries.length > 0" class="space-y-12">
        <div class="flex items-center gap-6 px-4">
          <div class="h-[1px] flex-1 bg-slate-200/50" />
          <span class="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Visual Diary Log</span>
          <div class="h-[1px] flex-1 bg-slate-200/50" />
        </div>
        
        <div class="grid grid-cols-1 gap-12">
          <div 
            v-for="entry in entries" 
            :key="entry.id" 
            class="bg-white rounded-[3rem] border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:flex-row transition-all hover:shadow-2xl hover:-translate-y-2"
          >
            <div v-if="entry.metadata?.image" class="w-full lg:w-2/5 aspect-square lg:aspect-auto bg-slate-50 relative">
              <img 
                :src="entry.metadata.image" 
                :alt="entry.title" 
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-black/5" />
            </div>
            <div class="flex-1 p-10 md:p-16 space-y-8">
              <div class="flex justify-between items-start">
                <div class="space-y-2">
                  <div class="flex items-center gap-3 mb-4">
                    <ImageIcon :size="14" class="text-teal-500" />
                    <span class="text-[9px] font-black uppercase tracking-widest text-teal-600">Verified Insight</span>
                  </div>
                  <h3 class="font-serif-luxury text-4xl md:text-5xl italic text-slate-900 font-semibold">{{ entry.title }}</h3>
                </div>
                <div class="flex flex-col items-end opacity-20">
                  <Clock :size="18" />
                  <span class="text-[10px] font-mono-light mt-2">
                    {{ new Date(entry.timestamp).toLocaleDateString() }}
                  </span>
                </div>
              </div>
              
              <div class="prose prose-md max-w-none text-slate-600 font-light leading-relaxed">
                <MarkdownRenderer :content="entry.content" />
              </div>

              <!-- OKE Certification Card Integration -->
              <div v-if="entry.metadata?.oke_facts" class="mt-12">
                <OKECertificationCard 
                  :facts="entry.metadata.oke_facts" 
                  :cid="entry.metadata.certification_id"
                  :amaneLink="entry.metadata.amane_link"
                  :timestamp="new Date(entry.timestamp).toLocaleTimeString()"
                />
              </div>

              <div class="pt-8 border-t border-slate-50 flex gap-3">
                <span class="text-[9px] font-bold text-slate-300 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">Amane Secretary v4.2</span>
                <span class="text-[9px] font-bold text-slate-300 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">Vision Node Alpha</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- EMPTY STATE -->
      <section v-else class="text-center py-20 opacity-30 select-none">
          <BookOpen :size="48" class="mx-auto mb-4 text-slate-300" />
          <p class="font-serif-luxury italic text-2xl">Your canvas is empty.</p>
          <p class="text-[10px] uppercase tracking-widest mt-2">Chat with AI or analyze scenes to capture insights.</p>
      </section>

      <!-- VERIFIED IDENTITY SECTION -->
      <section class="pt-20">
        <div class="bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 text-white relative overflow-hidden shadow-2xl">
          <div class="absolute top-0 right-0 p-12 md:p-20 opacity-[0.05] pointer-events-none">
            <ShieldCheck :size="320" />
          </div>
          
          <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 md:mb-24 relative z-10">
            <div class="flex items-center gap-5">
              <div class="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                <Zap :size="22" class="text-slate-900" />
              </div>
              <h2 class="text-[12px] md:text-[14px] font-black uppercase tracking-[0.5em] text-teal-500">Verified Identity Data</h2>
            </div>
            <div class="w-full md:w-auto px-6 py-3 border border-slate-700/50 rounded-2xl bg-slate-800/20">
              <p class="text-[10px] md:text-[11px] font-mono-light text-slate-400 tracking-widest uppercase truncate">DID: {{ user.id.slice(0, 16) }}...</p>
            </div>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 relative z-10">
            <div class="space-y-12">
              <div class="space-y-4">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Anchor</p>
                <p class="text-2xl md:text-4xl font-serif-luxury italic font-semibold">@{{ user.threadsId }} Identity Sphere</p>
              </div>
              <div class="space-y-4">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SBT Attributes</p>
                <ul class="text-[14px] md:text-[16px] font-light text-slate-400 space-y-4">
                  <li class="flex items-center gap-4">
                    <span class="w-1.5 h-1.5 bg-teal-500/50 rounded-full" />
                    Synchronized Amane Core
                  </li>
                  <li class="flex items-center gap-4">
                    <span class="w-1.5 h-1.5 bg-teal-500/50 rounded-full" />
                    Verified Resonance Participant
                  </li>
                  <li class="flex items-center gap-4">
                    <span class="w-1.5 h-1.5 bg-teal-500/50 rounded-full" />
                    CDR Score: 0.99
                  </li>
                </ul>
              </div>
            </div>

            <div class="space-y-12">
              <div class="space-y-4">
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secret Notebook Abstract</p>
                <p class="text-[14px] md:text-[18px] font-light text-slate-400 leading-relaxed italic border-l-2 border-slate-800 pl-8 font-serif-luxury">
                  "{{ user.secretNotebook }}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="text-center pt-20 pb-40 md:pb-60">
        <div class="inline-flex items-center gap-6 opacity-20">
          <div class="w-10 h-[1px] bg-slate-400" />
          <p class="text-[10px] font-black uppercase tracking-[0.6em] text-slate-400 whitespace-nowrap">Archive State Synced | Amane Core OS</p>
          <div class="w-10 h-[1px] bg-slate-400" />
        </div>
      </footer>
    </div>
  </div>
</template>
