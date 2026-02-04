<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-vue-next';

const props = defineProps({
  localStream: Object,
  remoteStream: Object,
  targetName: String
});

const emit = defineEmits(['endCall']);

const localVideo = ref(null);
const remoteVideo = ref(null);
const isMuted = ref(false);
const isCameraOff = ref(false);

onMounted(() => {
  if (localVideo.value && props.localStream) {
    localVideo.value.srcObject = props.localStream;
  }
});

// Watch for remote stream updates
import { watch } from 'vue';
watch(() => props.remoteStream, (newStream) => {
  if (remoteVideo.value && newStream) {
    remoteVideo.value.srcObject = newStream;
  }
}, { immediate: true });

const toggleMute = () => {
  if (props.localStream) {
    props.localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    isMuted.value = !isMuted.value;
  }
};

const toggleCamera = () => {
  if (props.localStream) {
    props.localStream.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    isCameraOff.value = !isCameraOff.value;
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-black z-[10000] flex flex-col">
    <!-- Remote Video (Full Screen) -->
    <div class="relative flex-1 bg-slate-900 overflow-hidden">
      <video 
        ref="remoteVideo" 
        autoplay 
        playsinline 
        class="w-full h-full object-cover"
      ></video>
      
      <div v-if="!remoteStream" class="absolute inset-0 flex items-center justify-center">
        <div class="text-center space-y-4">
          <div class="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Video :size="40" class="text-white/20" />
          </div>
          <p class="text-white/40 text-[11px] font-bold uppercase tracking-[0.5em]">Waiting for resonance...</p>
        </div>
      </div>

      <!-- Identity Header -->
      <div class="absolute top-10 left-10 p-6 bg-black/40 backdrop-blur-3xl rounded-3xl border border-white/10">
        <h3 class="font-serif-luxury text-2xl italic text-white">{{ targetName }}</h3>
        <p class="text-[9px] text-teal-400 uppercase tracking-widest mt-1">Direct Liaison Active</p>
      </div>
    </div>

    <!-- Local Video (Picture in Picture) -->
    <div class="absolute bottom-32 right-10 w-48 aspect-[3/4] bg-black rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
      <video 
        ref="localVideo" 
        autoplay 
        playsinline 
        muted 
        class="w-full h-full object-cover"
      ></video>
      <div v-if="isCameraOff" class="absolute inset-0 bg-slate-800 flex items-center justify-center">
        <VideoOff :size="20" class="text-white/20" />
      </div>
    </div>

    <!-- Controls -->
    <div class="p-10 bg-gradient-to-t from-black to-transparent flex justify-center items-center gap-6">
      <button 
        @click="toggleMute"
        :class="['w-16 h-16 rounded-full flex items-center justify-center transition-all', isMuted ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20']"
      >
        <component :is="isMuted ? MicOff : Mic" :size="24" class="text-white" />
      </button>

      <button 
        @click="$emit('endCall')"
        class="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-red-500/40"
      >
        <PhoneOff :size="32" class="text-white" />
      </button>

      <button 
        @click="toggleCamera"
        :class="['w-16 h-16 rounded-full flex items-center justify-center transition-all', isCameraOff ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20']"
      >
        <component :is="isCameraOff ? VideoOff : Video" :size="24" class="text-white" />
      </button>
    </div>
  </div>
</template>
