<template>
  <div class="tive-app">
    <div v-if="loading" class="security-overlay">
      <span class="icon shield">🛡️</span>
      <span class="icon key">🗝</span>
    </div>

    <swiper
      v-if="!loading && cards.length"
      :effect="'cards'"
      :grabCursor="true"
      :modules="modules"
      @slideChange="onSlideChange"
      class="card-swiper"
    >
      <swiper-slide v-for="card in cards" :key="card.id">
        <div class="omotenashi-card">
          <div class="card-header">
            <h3>【{{ card.word }}】</h3>
          </div>
          <div class="card-body">
            <p class="meaning">{{ card.meaning }}</p>
            <div class="section">
              <h4>🗣️ 魔法の例文</h4>
              <p>{{ card.example_sentence }}</p>
            </div>
            <div class="section">
              <h4>🌍 言葉のひみつ</h4>
              <p>{{ card.etymology }}</p>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
    
    <div v-else-if="!loading && !cards.length" class="empty-state">
      <p>No cards available yet. Capture some insights!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCards } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'
import { supabase } from '../lib/supabaseClient'

const cards = ref([])
const loading = ref(false)
const modules = [EffectCards]

// Supabaseからカードを取得
const fetchCards = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    cards.value = data || []
  } catch (err) {
    console.error('Error fetching flashcards:', err)
  } finally {
    loading.value = false
  }
}

// 覚えた/忘れたのフィードバック送信
const onSlideChange = async (swiper) => {
  const previousIndex = swiper.previousIndex;
  const currentIndex = swiper.activeIndex;
  
  // スワイプ方向で「覚えた(右/次)」か「まだ(左/前)」かを判定（簡易的）
  const isLearned = currentIndex > previousIndex;
  const swipedCard = cards.value[previousIndex];

  if (!swipedCard) return;

  console.log(`[Tive◎Memory] Card "${swipedCard.word}" - Mastery: ${isLearned ? 'Learned' : 'Review'}`);

  try {
    // 別のエッジファンクション（update-mastery）を呼び出す想定
    await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTION_URL.replace('tive-core', 'update-mastery')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardId: swipedCard.id,
        isLearned,
        userId: swipedCard.user_id
      })
    });
  } catch (e) {
    console.warn("Feedback persistence skipped (offline/dev mode)");
  }
}

onMounted(fetchCards)
</script>

<style scoped>
.tive-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  width: 100%;
}

.card-swiper { width: 320px; height: 450px; margin-top: 20px; }

.omotenashi-card {
  background: linear-gradient(135deg, rgba(255, 240, 245, 0.95) 0%, rgba(255, 228, 225, 0.95) 100%);
  backdrop-filter: blur(15px);
  border-radius: 30px;
  padding: 30px;
  height: 100%;
  box-shadow: 0 15px 35px rgba(255, 105, 180, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card-header h3 { color: #d81b60; font-size: 1.8rem; text-align: center; margin: 0; }

.meaning {
  color: #c2185b;
  font-weight: 600;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 20px;
}

.section {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 15px;
  margin-top: 15px;
}

.section h4 {
  color: #ad1457;
  font-size: 0.9rem;
  margin: 0 0 5px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.section p {
  color: #4a148c;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.4;
}

.empty-state {
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

/* 🗝🛡️ アニメーション */
.security-overlay { 
  display: flex; 
  gap: 20px; 
  justify-content: center; 
  font-size: 3rem; 
  height: 100%;
  align-items: center;
}
.icon { animation: breathe 2s infinite; }
@keyframes breathe { 0%, 100% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } }
</style>
