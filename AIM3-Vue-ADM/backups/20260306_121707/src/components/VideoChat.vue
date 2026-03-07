<script setup>
import { ref, onUnmounted, nextTick } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, set, onValue, push, update, remove, get, child, onChildAdded } from "firebase/database";
import { Video, Mic, MicOff, VideoOff, PhoneOff, Send, Monitor } from 'lucide-vue-next';

// WebRTC Configuration
const configuration = {
  iceServers: JSON.parse(import.meta.env.VITE_ICE_SERVERS || '[{"urls":"stun:stun.l.google.com:19302"}]')
};

// Application State
const roomId = ref('');
const isJoined = ref(false);
const localVideo = ref(null);
const remoteVideo = ref(null);
const messages = ref([]);
const newMessage = ref('');
const isAudioEnabled = ref(true);
const isVideoEnabled = ref(true);

// WebRTC & Firebase Refs
let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomRef = null;
let messagesRef = null;

const createRoom = async () => {
    await joinRoomAction(true);
};

const joinRoom = async () => {
    await joinRoomAction(false);
};

const joinRoomAction = async (create) => {
  if (!roomId.value) return;
  
  // Cleanup previous session if any
  if (isJoined.value) await leaveRoom();

  roomRef = dbRef(db, `rooms/${roomId.value}`);
  messagesRef = dbRef(db, `rooms/${roomId.value}/messages`);

  // Check room existence logic could go here, 
  // but for simplicity we'll just try to acquire media first.
  
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideo.value) {
      localVideo.value.srcObject = localStream;
    }
  } catch (e) {
    console.error('Error accessing media devices:', e);
    alert('Could not access camera/microphone');
    return;
  }

  isJoined.value = true;
  
  // Initialize PeerConnection
  peerConnection = new RTCPeerConnection(configuration);
  registerPeerConnectionListeners();

  // Add Local Tracks
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  // Pull tracks from remote
  peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      event.streams[0].getTracks().forEach(track => {
          if (!remoteStream) remoteStream = new MediaStream();
          remoteStream.addTrack(track);
      });
      if (remoteVideo.value) remoteVideo.value.srcObject = remoteStream;
  };

  // Chat Listener
  onChildAdded(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
          // Check if message is already in array to avoid dups from strict mode re-renders if applicable
          // simplified check:
          if (!messages.value.some(m => m.id === snapshot.key)) {
             messages.value.push({ ...data, id: snapshot.key, isLocal: data.senderId === 'ME' /* simplistic local check won't work perfectly without unique ID, fixing below */ });
          }
      }
  });

  // Signaling Logic: Determine Caller vs Callee
  // We check if an offer already exists.
  const roomSnapshot = await get(roomRef);
  
  if (roomSnapshot.exists() && roomSnapshot.val().offer && !create) {
      // We are the Callee (Answerer)
      console.log('Joining as Callee');
      const offer = roomSnapshot.val().offer;
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      const answerContainer = {
          sdp: answer.sdp,
          type: answer.type
      };
      
      await update(roomRef, { answer: answerContainer });
      
      // Listen for ICE candidates from Caller
      const callerCandidatesRef = child(roomRef, 'callerCandidates');
      onChildAdded(callerCandidatesRef, (snapshot) => {
          const candidate = snapshot.val();
          if (candidate) {
              console.log('Adding Caller ICE candidate');
              peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
      });
      
  } else {
      // We are the Caller (Offerer) or room didn't exist
      console.log('Joining as Caller');
      // If room existed but we are forcing create or it was empty enough?
      // Resetting room for fresh start if we are caller
      await set(roomRef, { created: Date.now() }); // Clear old data
      
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      const offerContainer = {
          sdp: offer.sdp,
          type: offer.type
      };
      
      await update(roomRef, { offer: offerContainer });
      
      // Listen for Answer
      onValue(child(roomRef, 'answer'), (snapshot) => {
          const data = snapshot.val();
          if (!peerConnection.currentRemoteDescription && data && data.sdp) {
              console.log('Received Answer');
              const answer = new RTCSessionDescription(data);
              peerConnection.setRemoteDescription(answer);
          }
      });
      
      // Listen for ICE candidates from Callee
      const calleeCandidatesRef = child(roomRef, 'calleeCandidates');
      onChildAdded(calleeCandidatesRef, (snapshot) => {
          const candidate = snapshot.val();
          if (candidate) {
              console.log('Adding Callee ICE candidate');
              peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
      });
  }
};

const registerPeerConnectionListeners = () => {
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            const candidateJSON = event.candidate.toJSON();
            // Determine where to send based on role
            // This is tricky without explicit role state. 
            // We can check if we created the offer in db?
            // Simplified: if we are setting LocalDescription type 'offer', we are caller.
            
            if (peerConnection.localDescription) {
                 if (peerConnection.localDescription.type === 'offer') {
                      const callerCandidatesRef = child(roomRef, 'callerCandidates');
                      push(callerCandidatesRef, candidateJSON);
                 } else {
                      const calleeCandidatesRef = child(roomRef, 'calleeCandidates');
                      push(calleeCandidatesRef, candidateJSON);
                 }
            }
        }
    };
    
    peerConnection.onconnectionstatechange = () => {
        console.log('Connection state change:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'disconnected') {
             // Handle disconnect
        }
    };
};

const myUniqueId = Math.random().toString(36).substr(2, 9);

const sendMessage = async () => {
    if (!newMessage.value.trim() || !messagesRef) return;
    
    await push(messagesRef, {
        text: newMessage.value,
        senderId: myUniqueId,
        timestamp: Date.now()
    });
    newMessage.value = '';
};

const toggleAudio = () => {
    isAudioEnabled.value = !isAudioEnabled.value;
    if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = isAudioEnabled.value);
};

const toggleVideo = () => {
    isVideoEnabled.value = !isVideoEnabled.value;
    if (localStream) localStream.getVideoTracks().forEach(t => t.enabled = isVideoEnabled.value);
};

const leaveRoom = async () => {
    // If caller, maybe delete room? For now just reload/disconnect
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        localStream = null;
    }
    remoteStream = null;
    isJoined.value = false;
    messages.value = [];
    
    // Optional: Clean up room if empty or if we were the creator
    // location.reload(); // Simplest way to full reset in this demo
};

onUnmounted(() => {
    leaveRoom();
});

</script>

<template>
  <div class="flex flex-col h-screen bg-slate-900 text-white font-sans overflow-hidden">
    <!-- Header -->
    <header class="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-md flex justify-between items-center z-10">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
        <h1 class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          AI-Native Serverless P2P
        </h1>
      </div>
      <div v-if="!isJoined" class="flex gap-2">
         <input v-model="roomId" type="text" placeholder="Enter Room ID" class="px-3 py-1 bg-slate-700/50 rounded border border-slate-600 focus:outline-none focus:border-orange-400 transition-colors" />
         <button @click="createRoom" class="bg-orange-600 hover:bg-orange-500 px-4 py-1 rounded shadow-lg transition-all mr-1">Create/Call</button>
         <button @click="joinRoom" class="bg-slate-600 hover:bg-slate-500 px-4 py-1 rounded shadow-lg transition-all">Answer/Join</button>
      </div>
      <div v-else class="flex items-center gap-4">
          <span class="text-sm text-slate-400">Room: {{ roomId }}</span>
          <button @click="leaveRoom" class="bg-red-500/80 hover:bg-red-500 p-2 rounded-full transition-all">
              <PhoneOff size="20" />
          </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex relative">
      <!-- Video Area -->
      <div class="flex-1 relative flex flex-col md:flex-row gap-4 p-4 items-center justify-center">
        
        <!-- Welcome State -->
        <div v-if="!isJoined" class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-0">
            <Monitor size="64" class="mb-4 opacity-50" />
            <p class="text-lg font-light tracking-wide">CONNECTING INTELLIGENCE.</p>
            <p class="text-sm mt-2 opacity-70">Serverless Signaling • AI-Ready Architecture</p>
        </div>

        <!-- Remote Video -->
        <div v-show="isJoined" class="relative w-full h-full max-h-[80vh] bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 ring-1 ring-white/5">
             <video ref="remoteVideo" autoplay playsinline class="w-full h-full object-cover"></video>
             <div class="absolute bottom-4 left-4 bg-black/40 backdrop-blur px-3 py-1 rounded-full text-xs font-mono">
                 Remote Peer
             </div>
        </div>

        <!-- Local Video (floating) -->
        <div v-show="isJoined" class="absolute bottom-6 right-6 w-32 md:w-48 aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-600/50 transition-all hover:scale-105">
             <video ref="localVideo" autoplay playsinline muted class="w-full h-full object-cover"></video>
        </div>

        <!-- Controls -->
        <div v-if="isJoined" class="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-slate-900/80 backdrop-blur-lg px-6 py-3 rounded-full border border-white/10 shadow-xl">
             <button @click="toggleAudio" class="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-all" :class="{'bg-red-500/20 text-red-400': !isAudioEnabled}">
                 <Mic v-if="isAudioEnabled" size="24" />
                 <MicOff v-else size="24" />
             </button>
             <button @click="toggleVideo" class="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-all" :class="{'bg-red-500/20 text-red-400': !isVideoEnabled}">
                 <Video v-if="isVideoEnabled" size="24" />
                 <VideoOff v-else size="24" />
             </button>
        </div>
      </div>

      <!-- Chat Sidebar -->
      <aside v-if="isJoined" class="w-80 bg-slate-800/30 backdrop-blur-md border-l border-slate-700 flex flex-col transition-all">
          <div class="p-4 border-b border-white/5 font-semibold text-slate-300">
              Messages
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
              <div v-for="(msg, i) in messages" :key="i" class="flex flex-col" :class="msg.senderId === myUniqueId ? 'items-end' : 'items-start'">
                  <div class="max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm"
                    :class="msg.senderId === myUniqueId ? 'bg-orange-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'">
                      {{ msg.text }}
                  </div>
              </div>
          </div>
          <div class="p-4 bg-slate-800/50">
              <form @submit.prevent="sendMessage" class="flex gap-2">
                  <input v-model="newMessage" type="text" placeholder="Type a message..." class="flex-1 bg-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500" />
                  <button type="submit" class="p-2 bg-orange-600 rounded-full hover:bg-orange-500 transition-colors">
                      <Send size="18" />
                  </button>
              </form>
          </div>
      </aside>
    </main>
  </div>
</template>
