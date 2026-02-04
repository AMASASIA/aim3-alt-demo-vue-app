<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { db } from '../firebase';
import { ref as dbRef, set, onValue, push, update, child, onChildAdded, get } from "firebase/database";
import { Video, Terminal as TerminalIcon, Map as MapIcon, Share2, Copy } from 'lucide-vue-next';

import VideoFrame from './VideoFrame.vue';
import ChatMessaging from './ChatMessaging.vue';
import NotebookView from './NotebookView.vue';
import WakuLog from './WakuLog.vue';
import DataDefenseConsent from './DataDefenseConsent.vue';
import A2UISimulation from './A2UISimulation.vue';
import CoreOSEntry from './CoreOSEntry.vue';
import { BookOpen, Sparkles } from 'lucide-vue-next';


// --- Configuration ---
const configuration = {
  iceServers: JSON.parse(import.meta.env.VITE_ICE_SERVERS || '[{"urls":"stun:stun.l.google.com:19302"}]')
};

// --- State ---
const myId = ref(localStorage.getItem('aim3_did') || Math.random().toString(36).substr(2, 9));
localStorage.setItem('aim3_did', myId.value); // Persist ID

const roomId = ref('');
const bridgeUrl = computed(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?bridge=${roomId.value}`;
});

const isJoined = ref(false);
const isInitiator = ref(false);
const localStream = ref(null);
const remoteStream = ref(null);
const messages = ref([]);
const logs = ref([]);
const showLogs = ref(false);
const showCopyToast = ref(false);
const showDemo = ref(false);
const hasAnchored = ref(localStorage.getItem('amas_anchor_verified') === 'true'); // Persist Anchor state
const anchorHandle = ref(localStorage.getItem('amas_anchor_handle') || 'GUEST');

const isAudioEnabled = ref(true);
const isVideoEnabled = ref(true);

const a2uiItems = ref([]);
const showConsent = ref(false);
const pendingPayload = ref(null);

const showNotebook = ref(false);
const showMobileChat = ref(false); // Mobile chat toggle
const notebookEntries = ref(JSON.parse(localStorage.getItem('amas_notebook') || '[]'));
const isAiLoading = ref(false);

const saveToNotebook = (entry) => {
    notebookEntries.value.unshift({
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        ...entry
    });
    localStorage.setItem('amas_notebook', JSON.stringify(notebookEntries.value));
    log(`Saved to Notebook: ${entry.title}`, 'success');
};


// --- Refs ---
let peerConnection = null;
let roomRef = null;
let messagesRef = null;

// --- Logging Helper ---
const log = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    logs.value.push({
        timestamp: Date.now(),
        message,
        type
    });
};

// --- Ecosystem Actions ---
const captureAndAnalyze = async () => {
    // Prefer remote stream if available, fallback to local
    const streamToUse = remoteStream.value || localStream.value;
    if (!streamToUse) {
        log('No video stream to analyze', 'warn');
        return;
    }
    
    log('Capturing frame for A2UI Neural Engine...', 'info');
    
    // Find correctly associated video element
    const videoElements = document.querySelectorAll('video');
    const videoEl = Array.from(videoElements).find(v => v.srcObject === streamToUse);
    
    if (!videoEl) {
        log('Video element not found for analysis', 'error');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    canvas.getContext('2d').drawImage(videoEl, 0, 0);
    const frameBase64 = canvas.toDataURL('image/jpeg', 0.8);
    
    try {
        const res = await fetch('/analyze-scene', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ frame: frameBase64 })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            a2uiItems.value = data.items;
            log(`Neural Engine detected ${data.items.length} commerce opportunities.`, 'info');
        }
    } catch (e) {
        log('Analysis failed.', 'error');
    }
};

const handleItemClick = (item) => {
    log(`User Intent detected: ${item.label}`, 'info');
    
    // Construct Payload for Audit
    pendingPayload.value = {
        intent: 'AGENTIC_PURCHASE',
        itemId: item.id,
        price: item.price,
        currency: item.currency,
        timestamp: Date.now(),
        userAddress: '0xPlaceholderDID', // In real app, from Wallet
        metadata: item.metadata,
        signature: `SIG_${Math.random().toString(36)}` // Mock signature
    };
    
    showConsent.value = true;
};

const executeTransaction = async () => {
    showConsent.value = false;
    log('Authorization received. Executing Agentic Transaction...', 'info');
    
    try {
        const res = await fetch('/execute-agentic-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pendingPayload.value)
        });
        
        const result = await res.json();
        if (result.status === 'success') {
            log(`Transaction Complete. TxHash: ${result.txHashes.base}`, 'success');
            alert('Assetization Complete. SBT Minted.');
        } else {
             log(`Transaction Rejected: ${result.error}`, 'error');
        }
    } catch (e) {
        log('Network Failure during execution.', 'error');
    }
};

// --- Initialization ---
const initializeSystem = async () => {
    log('System initialized. Antigravity OS v1.0', 'info');
    log(`Identity anchored: ${myId.value} (${anchorHandle.value})`, 'info');

    // Check URL for bridge
    const params = new URLSearchParams(window.location.search);
    const bridgeId = params.get('bridge');
    
    if (bridgeId) {
        log(`Bridge detected. Initiating handshake with ${bridgeId}...`, 'info');
        roomId.value = bridgeId;
        await joinRoomAction(false); // Join existing
    } else {
        // Create new identity/room for self
        roomId.value = myId.value;
        log(`Self-Node active. Bridge ID: ${roomId.value}`, 'info');
        await joinRoomAction(true);
    }
};

onMounted(() => {
    if (hasAnchored.value) {
        initializeSystem();
    }
});

const handleAnchored = (handle) => {
    log('Anchor verification successful.', 'success');
    anchorHandle.value = handle;
    hasAnchored.value = true;
    localStorage.setItem('amas_anchor_verified', 'true');
    localStorage.setItem('amas_anchor_handle', handle);
    initializeSystem();
};

// --- Actions ---

const copyBridgeUrl = async () => {
    try {
        await navigator.clipboard.writeText(bridgeUrl.value);
        showCopyToast.value = true;
        log('Bridge URL copied to clipboard.', 'info');
        setTimeout(() => showCopyToast.value = false, 3000);
    } catch (err) {
        log('Failed to copy Bridge URL', 'error');
    }
};

const joinRoomAction = async (create) => {
    if (!roomId.value) return;
    
    // Cleanup
    if (isJoined.value) await leaveRoom();

    roomRef = dbRef(db, `rooms/${roomId.value}`);
    messagesRef = dbRef(db, `rooms/${roomId.value}/messages`);

    isInitiator.value = create;

    // Get Media
    try {
        localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        log('Media devices acquired.', 'info');
    } catch (e) {
        log(`Media Access Error: ${e.message}`, 'error');
        alert('Could not access camera/microphone');
        return;
    }

    isJoined.value = true;
    
    // Setup PeerConnection
    peerConnection = new RTCPeerConnection(configuration);
    registerPeerConnectionListeners();

    // Add Tracks
    localStream.value.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream.value);
    });

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
        log('Remote track received.', 'info');
        if (!remoteStream.value) remoteStream.value = new MediaStream();
        event.streams[0].getTracks().forEach(track => {
            remoteStream.value.addTrack(track);
        });
    };

    // Chat Listeners
    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data && !messages.value.some(m => m.id === snapshot.key)) {
            messages.value.push({ ...data, id: snapshot.key });
        }
    });

    // Signaling Logic
    if (create) {
        log('Initializing Room as Host...', 'info');
        await set(roomRef, { created: Date.now(), hostId: myId.value }); 

        // Create Offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        await update(roomRef, { 
            offer: { sdp: offer.sdp, type: offer.type } 
        });
        log('SDP Offer generated and posted to signaling channel.', 'info');
        
        // Listen for Answer
        onValue(child(roomRef, 'answer'), (snapshot) => {
            const data = snapshot.val();
            if (!peerConnection.currentRemoteDescription && data && data.sdp) {
                log('SDP Answer received from peer.', 'info');
                const answer = new RTCSessionDescription(data);
                peerConnection.setRemoteDescription(answer);
            }
        });
        
        // Listen for Callee Candidates
        onChildAdded(child(roomRef, 'calleeCandidates'), (snapshot) => {
             // simplified logic
             const candidate = snapshot.val();
             if (candidate) peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });

    } else {
        // Guest Joining
        log('Joining existing resonance bridge...', 'info');
        
        // Check if room exists
        const roomSnapshot = await get(roomRef);
        if (!roomSnapshot.exists()) {
             log('Bridge invalid or expired.', 'error');
             alert('This bridge is invalid.');
             return;
        }

        // Get Offer
        const offer = roomSnapshot.val().offer;
        if (offer) {
            log('Found Host Offer. Generating Answer...', 'info');
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            await update(roomRef, { 
                answer: { sdp: answer.sdp, type: answer.type } 
            });
            log('SDP Answer posted.', 'info');
            
            // Listen for Host Candidates
            onChildAdded(child(roomRef, 'callerCandidates'), (snapshot) => {
                const candidate = snapshot.val();
                if (candidate) peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            });
        }
    }
};

const registerPeerConnectionListeners = () => {
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            const candidateJSON = event.candidate.toJSON();
            if (isInitiator.value) {
                push(child(roomRef, 'callerCandidates'), candidateJSON);
            } else {
                push(child(roomRef, 'calleeCandidates'), candidateJSON);
            }
        }
    };
    
    peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        log(`Connection state changed: ${state}`, state === 'connected' ? 'info' : 'warn');
    };
};

const sendMessage = async (text) => {
    // 1. Log locally first so it feels responsive
    const localMsg = {
        id: 'local_' + Date.now(),
        text,
        senderId: myId.value,
        timestamp: Date.now()
    };
    messages.value.push(localMsg);

    // 2. Try to sync to Firebase but don't block if it fails
    if (messagesRef) {
        try {
            await push(messagesRef, {
                text,
                senderId: myId.value,
                timestamp: Date.now()
            });
        } catch (e) {
            log('Firebase sync failed. Maintaining local state.', 'warn');
        }
    }
    
    // 3. Call Gemini Agent Backend
    isAiLoading.value = true;
    try {
        const res = await fetch('/agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: text, userId: myId.value })
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            const aiMsg = {
                id: 'ai_' + Date.now(),
                text: data.response,
                senderId: 'GEMINI_AI',
                timestamp: Date.now()
            };
            
            // Push to local UI
            messages.value.push(aiMsg);

            // Sync AI response to Firebase if possible
            if (messagesRef) {
                push(messagesRef, {
                    text: data.response,
                    senderId: 'GEMINI_AI',
                    timestamp: Date.now()
                });
            }

            // 4. Auto-Notebook logical check
            if (data.response.length > 50) {
                saveToNotebook({
                    title: `AI Insight: ${text.substring(0, 20)}...`,
                    content: data.response,
                    metadata: { type: 'chat_resonance' }
                });
            }
        }
    } catch (e) {
        log('AI Engine connection lost.', 'error');
    } finally {
        isAiLoading.value = false;
    }
};


const leaveRoom = async () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream.value) {
        localStream.value.getTracks().forEach(t => t.stop());
        localStream.value = null;
    }
    remoteStream.value = null;
    isJoined.value = false;
    messages.value = [];
    log('Session terminated.', 'warn');
};

const navigateToMap = () => {
    window.location.href = `https://aim3-ai-map-bright-luxury-608065432512.us-west1.run.app/?did=${myId.value}`;
};

onUnmounted(() => {
    leaveRoom();
});
</script>

<template>
  <div class="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
    
    <!-- Core OS Entry Gate -->
    <CoreOSEntry v-if="!hasAnchored" @anchored="handleAnchored" />

    <!-- Header -->
    <header class="h-16 px-6 border-b border-white/5 bg-slate-900/60 backdrop-blur-xl flex justify-between items-center z-30 shadow-2xl">
      <div class="flex items-center gap-4">
        <div class="relative flex items-center justify-center">
            <div class="w-3 h-3 rounded-full animate-pulse" :class="isJoined ? 'bg-cyan-500 shadow-[0_0_12px_#06b6d4]' : 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'"></div>
            <div v-if="isJoined" class="absolute w-6 h-6 rounded-full border border-cyan-500/20 animate-ping"></div>
        </div>
        <div class="flex flex-col">
            <h1 class="text-base md:text-lg font-black tracking-[0.15em] text-white uppercase leading-none">
            Amas <span class="text-cyan-500">Serend</span>
            </h1>
            <div class="flex items-center gap-2 mt-1">
                <span class="text-[9px] text-cyan-500/60 tracking-[0.3em] font-mono uppercase font-bold">Resonance Core v1.1</span>
                <div class="h-[1px] w-4 bg-slate-700"></div>
                <span class="text-[9px] text-slate-500 tracking-[0.2em] font-mono uppercase">Anchor: {{ anchorHandle }}</span>
            </div>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- AI MAP -->
        <button @click="navigateToMap" class="hidden lg:flex items-center gap-2.5 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-[11px] font-bold tracking-widest hover:bg-indigo-500/20 transition-all text-indigo-300 uppercase shadow-lg shadow-indigo-500/5 group">
            <MapIcon size="14" class="group-hover:rotate-12 transition-transform" />
            <span>Geo-Map</span>
        </button>

        <!-- Dynamic Token/Status (Mock) -->
        <div class="hidden sm:flex flex-col items-end px-3 border-r border-white/10 h-8 justify-center mr-2">
            <span class="text-[10px] text-slate-500 font-mono uppercase leading-none">Protocol Integrity</span>
            <span class="text-[11px] text-green-400 font-mono font-bold mt-0.5">99.9% UNVARYING</span>
        </div>

        <!-- Bridge/Share -->
        <button @click="copyBridgeUrl" class="flex items-center gap-2.5 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-[11px] font-bold tracking-widest hover:bg-cyan-500/20 transition-all text-cyan-300 uppercase shadow-lg shadow-cyan-500/5 group relative">
             <Video size="14" class="group-hover:scale-110 transition-transform" />
             <span class="hidden md:inline">Establish Bridge</span>
             <Share2 size="12" class="opacity-40 group-hover:opacity-100" />
             
             <!-- Tooltip (Toast) -->
             <transition name="fade">
                <div v-if="showCopyToast" class="absolute top-[120%] right-0 w-max bg-cyan-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-md shadow-2xl pointer-events-none animate-bounce">
                    LINK ANCHORED TO CLIPBOARD
                </div>
             </transition>
        </button>

        <!-- Notebook System -->
        <button @click="showNotebook = !showNotebook" :class="['p-2.5 rounded-lg border transition-all shadow-inner group', showNotebook ? 'bg-teal-500/20 border-teal-500/50 text-teal-400' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-teal-400']">
             <BookOpen size="20" class="group-active:scale-90 transition-transform" />
        </button>

        <!-- Terminal System -->
        <button @click="showLogs = !showLogs" class="p-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-white/5 transition-all text-slate-400 hover:text-green-400 shadow-inner group">
             <TerminalIcon size="20" class="group-active:scale-90 transition-transform" />
        </button>

      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden relative">
        <!-- Video Layer (Main) -->
        <div class="flex-1 bg-black relative">
            <VideoFrame 
                :local-stream="localStream"
                :remote-stream="remoteStream"
                :is-joined="isJoined"
                :is-audio-enabled="isAudioEnabled"
                :is-video-enabled="isVideoEnabled"
                :a2ui-items="a2uiItems"
                @toggle-audio="isAudioEnabled = !isAudioEnabled"
                @toggle-video="isVideoEnabled = !isVideoEnabled"
                @analyze-request="captureAndAnalyze"
                @item-click="handleItemClick"
            />
        </div>

        <!-- Chat Layer (Sidebar) -->
        <div 
            :class="[
                'border-l border-slate-800 bg-slate-900/95 z-20 transition-all duration-300',
                showMobileChat ? 'fixed inset-0 w-full flex' : 'w-80 md:w-96 hidden md:flex flex-col'
            ]"
        >
            <div v-if="showMobileChat" class="absolute top-4 right-4 z-30">
                <button @click="showMobileChat = false" class="p-2 bg-white/10 rounded-full text-white">
                    <Share2 size="20" class="rotate-45" />
                </button>
            </div>
            <ChatMessaging 
                :messages="messages" 
                :my-id="myId"
                :is-loading="isAiLoading"
                @send-message="sendMessage"
                @save-to-notebook="saveToNotebook"
            />
        </div>
        
        <!-- Mobile Chat Toggle Button -->
        <button 
            @click="showMobileChat = true" 
            class="md:hidden fixed bottom-6 left-6 z-20 p-4 bg-cyan-500 rounded-full shadow-2xl shadow-cyan-500/50 text-white"
        >
            <TerminalIcon size="24" />
        </button>

        <!-- Notebook Layer (Overlay/Slide) -->
        <transition name="slide-up">
            <div v-if="showNotebook" class="absolute inset-0 z-50 bg-white shadow-2xl overflow-hidden">
                <div class="absolute top-6 right-6 z-[60]">
                    <button @click="showNotebook = false" class="bg-black text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-all">Close Notebook</button>
                </div>
                <NotebookView 
                    :user="{ id: myId, threadsId: anchorHandle, secretNotebook: 'Synchronized with Amas Core.' }"
                    :entries="notebookEntries"
                />
            </div>
        </transition>

    </div>

    <!-- WakuLog Overlay -->
    <WakuLog 
        :logs="logs" 
        :is-open="showLogs" 
        @close="showLogs = false" 
    />
    
    <!-- Data Defense Consent Modal -->
    <DataDefenseConsent 
        :is-open="showConsent" 
        :payload="pendingPayload"
        @approve="executeTransaction"
        @cancel="showConsent = false"
    />

    <!-- A2UI Demo Overlay -->
    <A2UISimulation 
        v-if="showDemo" 
        :stream="localStream" 
        @close="showDemo = false" 
    />

  </div>
</template>
