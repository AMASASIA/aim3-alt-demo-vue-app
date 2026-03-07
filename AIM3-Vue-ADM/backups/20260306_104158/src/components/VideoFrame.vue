<script setup>
import { ref, onMounted, watch } from 'vue';
import { Mic, MicOff, Video, VideoOff, Aperture, ShoppingBag } from 'lucide-vue-next';

const props = defineProps({
  localStream: MediaStream,
  remoteStream: MediaStream,
  isJoined: Boolean,
  isAudioEnabled: Boolean,
  isVideoEnabled: Boolean,
  a2uiItems: {
      type: Array, // [{ id, label, price, coordinates: {x,y}, ... }]
      default: () => []
  }
});

const emit = defineEmits(['toggle-audio', 'toggle-video', 'analyze-request', 'item-click']);

const localVideo = ref(null);
const remoteVideo = ref(null);

watch(() => props.localStream, (newStream) => {
    if (localVideo.value) localVideo.value.srcObject = newStream;
}, { immediate: true });

watch(() => props.remoteStream, (newStream) => {
    if (remoteVideo.value) remoteVideo.value.srcObject = newStream;
}, { immediate: true });

onMounted(() => {
    if (localVideo.value && props.localStream) localVideo.value.srcObject = props.localStream;
    if (remoteVideo.value && props.remoteStream) remoteVideo.value.srcObject = props.remoteStream;
});
</script>

<template>
  <div class="relative w-full h-full flex flex-col md:flex-row gap-4 items-center justify-center p-4">
      
      <!-- Placeholder -->
      <div v-if="!isJoined" class="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
          <div class="w-16 h-16 rounded-full border-2 border-dashed border-slate-600 animate-spin-slow mb-4"></div>
          <p class="text-lg font-light tracking-wide text-cyan-400">AWAITING RESONANCE</p>
          <p class="text-sm mt-2 opacity-60">Share your Bridge URL to connect.</p>
      </div>

      <!-- Remote Video Area -->
      <div v-show="isJoined" class="relative w-full h-full max-h-[80vh] bg-black rounded-lg overflow-hidden shadow-2xl border border-slate-700/50 ring-1 ring-white/5 group">
          <video ref="remoteVideo" autoplay playsinline class="w-full h-full object-cover"></video>
          
          <!-- A2UI Overlay Layer -->
          <div class="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              <transition-group name="fade">
                  <div 
                    v-for="item in a2uiItems" 
                    :key="item.id"
                    class="absolute pointer-events-auto cursor-pointer"
                    :style="{ left: item.coordinates.x + '%', top: item.coordinates.y + '%' }"
                    @click="$emit('item-click', item)"
                  >
                      <!-- Invisible Trigger Area with Pulse -->
                      <div class="w-6 h-6 rounded-full border-2 border-white/50 animate-ping absolute -translate-x-1/2 -translate-y-1/2 bg-white/20"></div>
                      
                      <!-- Button Appear -->
                      <div class="absolute left-4 top-0 bg-slate-900/80 backdrop-blur border border-cyan-500/50 rounded-lg px-3 py-1.5 flex flex-col gap-0.5 min-w-[120px] shadow-xl hover:scale-105 transition-transform origin-left">
                          <span class="text-[10px] text-cyan-300 font-bold tracking-wider uppercase">{{ item.label }}</span>
                          <div class="flex items-center gap-1">
                              <span class="text-xs text-white">🧚 ¥{{ item.price.toLocaleString() }}</span>
                              <ShoppingBag size="10" class="text-green-400 ml-auto" />
                          </div>
                      </div>
                  </div>
              </transition-group>
          </div>

          <!-- Overlay Info -->
          <div class="absolute top-4 left-4 bg-black/40 backdrop-blur px-3 py-1 rounded text-xs font-mono text-cyan-300 border border-cyan-500/20">
              REMOTE NODE
          </div>

          <!-- Controls -->
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 bg-slate-900/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
             <button @click="$emit('toggle-audio')" class="p-2 rounded-full hover:bg-white/10 transition-all" :class="{'text-red-400': !isAudioEnabled, 'text-white': isAudioEnabled}">
                 <Mic v-if="isAudioEnabled" size="20" />
                 <MicOff v-else size="20" />
             </button>
             <button @click="$emit('toggle-video')" class="p-2 rounded-full hover:bg-white/10 transition-all" :class="{'text-red-400': !isVideoEnabled, 'text-white': isVideoEnabled}">
                 <Video v-if="isVideoEnabled" size="20" />
                 <VideoOff v-else size="20" />
             </button>
              <!-- Analyze Button -->
             <button @click="$emit('analyze-request')" class="p-2 rounded-full hover:bg-cyan-500/20 text-cyan-400 transition-all border border-cyan-500/30">
                 <Aperture size="20" />
             </button>
          </div>
      </div>

      <!-- Local Video -->
      <div v-show="isJoined && localStream" class="absolute bottom-8 right-8 w-32 md:w-48 aspect-video bg-slate-800 rounded-lg overflow-hidden shadow-2xl border border-slate-600/50 transition-all hover:scale-105 z-20">
          <video ref="localVideo" autoplay playsinline muted class="w-full h-full object-cover"></video>
          <div class="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-green-500"></div>
      </div>
  </div>
</template>

<style scoped>
.animate-spin-slow {
    animation: spin 8s linear infinite;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
