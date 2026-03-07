<script setup>
import MarkdownRenderer from './MarkdownRenderer.vue';

const props = defineProps({
  message: Object,
  isFirst: Boolean
});

const isAdvocacy = props.message.role === 'model';
</script>

<template>
  <div class="flex items-center relative group py-2 h-full">
    <!-- Horizontal Connector line (coming from the left) -->
    <div v-if="!isFirst" class="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-[1px] bg-slate-100" />
    
    <!-- Hexagon Node Card -->
    <div :class="[
      'hexagon-container w-[75vw] md:w-96 p-[1px] transition-all duration-700 ease-out transform',
      isAdvocacy ? 'node-glow bg-teal-100/50 scale-105' : 'bg-slate-100'
    ]">
      <div class="hexagon-container w-full bg-white flex flex-col items-center justify-center p-10 min-h-[350px]">
        <div class="mb-6">
          <span class="text-[8px] font-mono-light text-slate-300 uppercase tracking-[0.5em] border-b border-slate-50 pb-1">
            {{ message.role === 'user' ? 'Local' : message.role === 'peer' ? 'Remote' : 'Kernel' }}
          </span>
        </div>
        
        <div :class="[
          'prose prose-sm max-w-none text-[13px] leading-relaxed text-center w-full overflow-hidden',
          isAdvocacy ? 'font-serif-luxury italic text-slate-900 text-[14px]' : 'font-light text-slate-500'
        ]">
          <MarkdownRenderer :content="message.content" />
        </div>
        
        <div class="mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="text-[7px] text-slate-200 uppercase tracking-widest font-mono-light">
            {{ new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
