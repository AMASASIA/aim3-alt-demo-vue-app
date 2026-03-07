<template>
  <router-view v-on:action="handleGlobalAction" />
  
  <!-- Global AI Agent - Liberating from Information Gravity -->
  <AmasAgent ref="agentRef" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AmasAgent from './components/AmasAgent.vue';

const agentRef = ref(null);

/**
 * Global Action Handler
 * ページ（Notebook等）から届いたアクションを仕分け、AIエージェントに転送する
 */
const handleGlobalAction = (action) => {
  console.log('[App] Received Global Action:', action);

  if (action.type === 'amas-agent-command') {
    // 1. AI Discovery などの結果をエージェントに渡し、自動ミントを指示
    if (action.command === 'record_insight' && agentRef.value) {
      console.log('[App] Forwarding Insight to AI Agent...');
      agentRef.value.isActive = true;
      agentRef.value.executeTool('mint_achievement', {
        content: action.data.content,
        category: action.data.category
      });
    }
    
    // 2. 音声入力の同期 (中央ボタン押下時)
    if (action.command === 'toggle_voice' && agentRef.value) {
      if (action.data.isListening) {
        agentRef.value.isActive = true;
        agentRef.value.startListening();
      }
    }
  }
};

// Windowレコレベルでもアクションを捕捉できるようにリスナーを設定（柔軟性のため）
onMounted(() => {
  window.addEventListener('amas-command', (event) => {
    handleGlobalAction(event.detail);
  });
});

onUnmounted(() => {
  window.removeEventListener('amas-command', handleGlobalAction);
});
</script>

<style>
/* Global Glassmorphism Backgrounds & Animations */
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
}
</style>

