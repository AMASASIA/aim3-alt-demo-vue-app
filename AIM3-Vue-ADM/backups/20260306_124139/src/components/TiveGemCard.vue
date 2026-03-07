<template>
  <div class="tive-gem-container">
    <!-- 🛡️ Security Loader Overlay -->
    <div v-if="isProcessing" class="security-loader">
      <div class="loader-bg"></div>
      <div class="loader-content">
        <span class="icon shield">🛡️</span>
        <span class="icon key">🗝</span>
        <p class="loader-text">Amane Protocol: Decrypting Knowledge Crystal...</p>
      </div>
    </div>

    <!-- 🃏 OKE Card Swiper Stack -->
    <swiper 
      v-if="gemData" 
      :effect="'cards'" 
      :grabCursor="true"
      :modules="modules"
      class="oke-card-swiper"
    >
      
      <!-- Slide 0: Index / Study Guide -->
      <swiper-slide class="omotenashi-card study-guide-card">
        <div class="card-glass-texture"></div>
        <div class="card-status-bar">
          <span class="pulse-dot"></span>
          <span class="status-id">INDEX_CRYSTAL_v2</span>
        </div>
        
        <h2 class="theme-title">{{ gemData.study_guide.theme }}</h2>
        <div class="summary-box">
          <p class="summary-text">{{ gemData.study_guide.summary }}</p>
        </div>

        <div class="glossary-section">
          <p class="section-label">KEY CONCEPTS</p>
          <div class="glossary-tags">
            <span v-for="item in gemData.glossary" :key="item.term" class="tag" @click="selectedTerm = item">
              {{ item.term }}
            </span>
          </div>
        </div>

        <div v-if="selectedTerm" class="term-peek animate-in fade-in slide-in-from-bottom-5">
           <strong>{{ selectedTerm.term }}:</strong> {{ selectedTerm.definition }}
        </div>
      </swiper-slide>

      <!-- Slides 1-N: OKE Specific Context Cards -->
      <swiper-slide 
        v-for="(card, index) in gemData.oke_cards" 
        :key="index" 
        class="omotenashi-card"
        :class="`type-${card.instruction_type}`"
      >
        <div class="card-glass-texture"></div>
        
        <div class="card-header">
          <span class="type-badge">{{ card.instruction_type.toUpperCase() }}</span>
          <h3 class="word-title">【{{ card.word }}】</h3>
        </div>
        
        <div class="card-body custom-scroll">
          <div class="meaning-box">
            <p class="meaning-text">{{ card.meaning }}</p>
          </div>
          
          <!-- Dynamic Content based on instruction_type -->
          <div class="dynamic-nexus">
            <!-- Text/Socratic Mode -->
            <div v-if="card.instruction_type === 'text'" class="text-content">
              <div class="etymology-box">
                <span class="socratic-icon">💡</span>
                <p class="etymology-text">{{ card.etymology }}</p>
              </div>
            </div>
            
            <!-- Vision/Generative Mode -->
            <div v-if="card.instruction_type === 'vision'" class="vision-nexus">
              <div class="visual-frame">
                <!-- If backend provided a generated image URL, use it, otherwise show a placeholder/abstract -->
                <div class="vision-placeholder">
                  <div class="abstract-energy"></div>
                  <img v-if="card.instruction_params?.image_url" :src="card.instruction_params.image_url" alt="Visual Insight" />
                  <p class="vision-overlay-text">Visualizing Resonance...</p>
                </div>
              </div>
              <p class="vision-caption">{{ card.etymology }}</p>
            </div>
            
            <!-- Search/Grounding Mode -->
            <div v-if="card.instruction_type === 'search'" class="search-nexus">
              <div class="search-bar-ui">
                <span class="search-icon">🔍</span>
                <span class="search-query">{{ card.instruction_params?.query || card.word }}</span>
              </div>
              <div class="search-results-sim">
                <p class="sync-status">Syncing with real-time world context...</p>
                <div class="result-entry">
                  <div class="shimmer-line"></div>
                  <div class="shimmer-line-short"></div>
                </div>
              </div>
              <p class="search-caption">{{ card.etymology }}</p>
            </div>

            <!-- Maps/Location Mode -->
            <div v-if="card.instruction_type === 'maps'" class="maps-nexus">
              <div class="map-preview">
                <div class="map-grid"></div>
                <div class="map-marker"></div>
              </div>
              <p class="map-caption">{{ card.etymology }}</p>
            </div>
          </div>
          
          <div class="example-quote">
            <span class="quote-mark">“</span>
            <p>{{ card.example_sentence }}</p>
          </div>
        </div>

        <div class="card-footer">
           <div class="system-meta">
              <span>WEIGHT: {{ gemData.system_action.suggested_score_weight }}</span>
              <span v-if="gemData.system_action.requires_onchain_verification" class="onchain-tag">🔗 SBT_READY</span>
           </div>
        </div>
      </swiper-slide>

    </swiper>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

const modules = [EffectCards];

const props = defineProps({
  gemData: {
    type: Object,
    required: true
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
});

const selectedTerm = ref(null);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;400;700&family=JetBrains+Mono:wght@300;500&display=swap');

.tive-gem-container {
  width: 100%;
  height: 100%;
  max-width: 440px;
  max-height: 600px;
  position: relative;
  font-family: 'Outfit', sans-serif;
}

.oke-card-swiper {
  width: 100%;
  height: 100%;
  padding: 20px;
}

/* 🌸 Pink Glassmorphism Cards */
.omotenashi-card {
  background: linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(255, 230, 235, 0.95) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 40px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(255, 105, 180, 0.1);
  color: #1a1a1a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.card-glass-texture {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  pointer-events: none;
  background-image: url('https://grainy-gradients.vercel.app/noise.svg');
}

/* Slide IDs */
.card-status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  opacity: 0.5;
}
.pulse-dot { width: 6px; height: 6px; background: #ff4d94; border-radius: 50%; animation: pulse 2s infinite; }
.status-id { font-family: 'JetBrains Mono'; font-size: 8px; letter-spacing: 2px; }

/* 🃏 Index Card Styles */
.theme-title {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 15px;
  background: linear-gradient(to right, #d81b60, #ff4081);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.summary-box {
  background: rgba(255, 255, 255, 0.4);
  padding: 15px;
  border-radius: 20px;
  margin-bottom: 20px;
}
.summary-text { font-size: 0.95rem; line-height: 1.5; color: #444; }

.glossary-section { margin-top: auto; }
.section-label { font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #ff4081; margin-bottom: 10px; }
.glossary-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 64, 129, 0.2);
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.3s;
}
.tag:hover { background: #ff4081; color: white; transform: scale(1.05); }

.term-peek {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: #ff4081;
  color: white;
  padding: 15px 25px;
  font-size: 12px;
  border-radius: 20px 20px 0 0;
}

/* 🃏 Content Card Styles */
.card-header { display: flex; flex-direction: column; gap: 5px; margin-bottom: 20px; }
.type-badge { font-family: 'JetBrains Mono'; font-size: 9px; color: #ff4081; font-weight: 700; letter-spacing: 2px; }
.word-title { font-size: 1.5rem; font-weight: 700; color: #333; }

.meaning-box { margin-bottom: 20px; border-left: 2px solid #ff4081; padding-left: 15px; }
.meaning-text { font-size: 1.1rem; line-height: 1.4; font-weight: 400; color: #222; }

.dynamic-nexus { flex: 1; margin-bottom: 20px; }

/* Dynamic Sub-Components */
.etymology-box { background: rgba(0, 0, 0, 0.03); padding: 15px; border-radius: 15px; font-style: italic; }
.etymology-text { font-size: 0.9rem; color: #555; }

.visual-frame { width: 100%; aspect-ratio: 16/9; border-radius: 20px; overflow: hidden; background: #000; position: relative; margin-bottom: 15px; }
.abstract-energy { position: absolute; inset: 0; background: radial-gradient(circle, rgba(255, 64, 129, 0.4) 0%, transparent 70%); filter: blur(20px); animation: energy 4s infinite alternate; }
.vision-overlay-text { position: absolute; bottom: 10px; left: 10px; font-size: 9px; color: rgba(255,255,255,0.6); font-family: 'JetBrains Mono'; }

.search-bar-ui { display: flex; align-items: center; gap: 10px; background: white; padding: 10px 15px; border-radius: 100px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); margin-bottom: 15px; }
.sync-status { font-size: 10px; color: #4285F4; margin-bottom: 8px; font-weight: 700; }
.shimmer-line { height: 8px; width: 100%; background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; margin-bottom: 6px; }
.shimmer-line-short { height: 8px; width: 60%; background: #f0f0f0; border-radius: 4px; }

.example-quote { margin-top: auto; position: relative; padding-top: 15px; border-top: 1px solid rgba(0,0,0,0.05); }
.quote-mark { position: absolute; top: -5px; left: -10px; font-size: 2rem; color: #ff4081; opacity: 0.2; }
.example-quote p { font-size: 0.9rem; font-style: italic; color: #666; }

.card-footer { margin-top: 15px; }
.system-meta { display: flex; justify-content: space-between; font-family: 'JetBrains Mono'; font-size: 8px; color: #999; }
.onchain-tag { color: #4ade80; font-weight: 700; }

/* 🛡️ Loader Styles */
.security-loader {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40px;
  overflow: hidden;
}
.loader-bg { position: absolute; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); }
.loader-content { position: relative; text-align: center; }
.icon { font-size: 3rem; margin: 0 10px; animation: float 3s infinite alternate; display: inline-block; }
.loader-text { margin-top: 20px; font-size: 12px; color: #ff80b3; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }

@keyframes pulse { 0%, 100% { opacity: 0.4; scale: 1; } 50% { opacity: 1; scale: 1.2; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes energy { 0% { opacity: 0.3; transform: scale(1); } 100% { opacity: 0.7; transform: scale(1.2); } }
@keyframes float { from { transform: translateY(0); } to { transform: translateY(-15px); } }

.custom-scroll::-webkit-scrollbar { width: 3px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(255, 64, 129, 0.2); border-radius: 10px; }

/* Mode Aura Accents */
.type-vision { border-top: 3px solid #EA4335; }
.type-search { border-top: 3px solid #4285F4; }
.type-text { border-top: 3px solid #d81b60; }
.type-maps { border-top: 3px solid #34A853; }
</style>
