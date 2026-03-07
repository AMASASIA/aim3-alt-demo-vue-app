<script setup>
import { onMounted, ref, watch } from 'vue';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Users } from 'lucide-vue-next';

const props = defineProps({
  localStream: Object,
  remoteStream: Object,
  isCalling: Boolean
});

const emit = defineEmits(['end-call']);

const localVideo = ref(null);
const remoteVideo = ref(null);
const isMuted = ref(false);
const isVideoOff = ref(false);

const updateStreams = () => {
  if (localVideo.value && props.localStream) {
    localVideo.value.srcObject = props.localStream;
  }
  if (remoteVideo.value && props.remoteStream) {
    remoteVideo.value.srcObject = props.remoteStream;
  }
};

onMounted(updateStreams);
watch(() => props.localStream, updateStreams);
watch(() => props.remoteStream, updateStreams);

const toggleMic = () => {
  isMuted.value = !isMuted.value;
  props.localStream.getAudioTracks()[0].enabled = !isMuted.value;
};

const toggleVideo = () => {
  isVideoOff.value = !isVideoOff.value;
  props.localStream.getVideoTracks()[0].enabled = !isVideoOff.value;
};
</script>

<template>
  <Transition name="scale">
    <div v-if="isCalling" class="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <div class="w-full max-w-6xl aspect-video bg-slate-900/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col pointer-events-auto relative">
        
        <!-- Remote Video (Full Background) -->
        <div class="absolute inset-0 bg-slate-800 flex items-center justify-center">
          <video 
            ref="remoteVideo" 
            autoplay 
            playsinline 
            class="w-full h-full object-cover"
          ></video>
          <div v-if="!remoteStream" class="absolute inset-0 flex flex-col items-center justify-center space-y-4">
            <div class="w-20 h-20 rounded-full bg-white/5 animate-pulse flex items-center justify-center">
              <Users :size="40" class="text-white/20" />
            </div>
            <p class="text-white/40 font-mono text-[10px] uppercase tracking-[0.4em]">Connecting to Peer...</p>
          </div>
        </div>

        <!-- Header Info -->
        <div class="relative z-10 p-8 flex justify-between items-start">
          <div class="flex items-center gap-4 bg-black/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
            <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div class="text-white font-serif-luxury italic text-xl">Amane Bridge: Secure P2P</div>
          </div>
          <button class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white hover:bg-white/20 transition-all">
            <Maximize2 :size="20" />
          </button>
        </div>

        <!-- Local Video (Picture in Picture) -->
        <div class="absolute bottom-32 right-8 w-48 md:w-64 aspect-video bg-black rounded-3xl border-2 border-white/20 overflow-hidden shadow-2xl z-20">
          <video 
            ref="localVideo" 
            autoplay 
            playsinline 
            muted 
            class="w-full h-full object-cover mirror"
          ></video>
          <div v-if="isVideoOff" class="absolute inset-0 bg-slate-900 flex items-center justify-center">
             <VideoOff :size="24" class="text-white/20" />
          </div>
        </div>

        <!-- Controls Bar -->
        <div class="mt-auto relative z-10 p-10 flex justify-center">
          <div class="flex items-center gap-6 bg-white/10 backdrop-blur-2xl px-10 py-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <button 
              @click="toggleMic"
              :class="['p-5 rounded-full transition-all', isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20']"
            >
              <component :is="isMuted ? MicOff : Mic" :size="24" />
            </button>
            <button 
              @click="$emit('end-call')"
              class="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 hover:scale-110 transition-all shadow-xl shadow-red-900/40"
            >
              <PhoneOff :size="32" />
            </button>
            <button 
              @click="toggleVideo"
              :class="['p-5 rounded-full transition-all', isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20']"
            >
              <component :is="isVideoOff ? VideoOff : Video" :size="24" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.mirror {
  transform: scaleX(-1);
}

.scale-enter-active, .scale-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(40px);
  filter: blur(20px);
}

video {
  pointer-events: none;
}
</style>
