<script setup>
import { computed } from 'vue';

const props = defineProps({
  content: String
});

// Simple markdown-like processing (basic version)
// For production, consider using markdown-it library
const processedContent = computed(() => {
  if (!props.content) return '';
  
  // Basic processing: preserve line breaks and simple formatting
  return props.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>')               // Italic
    .replace(/`(.*?)`/g, '<code class="bg-mono-200 text-mono-800 px-1.5 py-0.5 rounded text-sm font-mono border border-mono-300">$1</code>')  // Inline code
    .replace(/\n/g, '<br/>');  // Line breaks
});
</script>

<template>
  <div class="prose prose-sm max-w-none prose-neutral dark:prose-invert break-words">
    <div v-html="processedContent" />
  </div>
</template>

<style scoped>
/* Markdown-like styling */
:deep(strong) {
  font-weight: 700;
}

:deep(em) {
  font-style: italic;
}

:deep(code) {
  font-size: 0.875rem;
  font-family: 'JetBrains Mono', monospace;
}

:deep(a) {
  color: #1e293b;
  text-decoration: underline;
  text-decoration-color: #94a3b8;
  text-underline-offset: 2px;
  transition: all 0.2s;
}

:deep(a:hover) {
  text-decoration-color: #0f172a;
}

:deep(ul), :deep(ol) {
  padding-left: 1rem;
  margin: 0.5rem 0;
}

:deep(p) {
  margin-bottom: 0.5rem;
}

:deep(p:last-child) {
  margin-bottom: 0;
}
</style>
