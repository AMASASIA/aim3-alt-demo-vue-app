<template>
  <div class="map-page">
    <h1>AIM3 World Map</h1>
    
    <div class="map-container">
      <div class="map-placeholder">
        [ MAP VISUALIZATION HERE ]
        <br>
        (Antigravity Particles Active)
      </div>
      
      <div class="overlay-panel">
        <MintPanel />
      </div>
    </div>
  </div>
</template>

<script setup>
import MintPanel from '../components/MintPanel.vue';
import { AntigravityEngine } from '../engine/antigravity-engine.js';
import { onMounted } from 'vue';

onMounted(() => {
  AntigravityEngine.init();
});
</script>

<style scoped>
.map-page {
  width: 100%;
  height: 100vh;
  background: #111;
  color: #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.map-container {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-placeholder {
  width: 80%;
  height: 80%;
  border: 2px dashed #444;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
}

.overlay-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
}
</style>
