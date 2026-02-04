<script setup>
import { ref, watch, onMounted } from 'vue';
import { Menu, X, LayoutDashboard, MessageSquare, Video, Terminal, Compass, Shield, Fingerprint, Users } from 'lucide-vue-next';
import AnchorScreen from '../components/AnchorScreen.vue';
import ChatMessaging from '../components/ChatMessaging.vue';
import NotebookView from '../components/NotebookView.vue';
import PrimaryInterface from '../components/PrimaryInterface.vue';
import ContactBook from '../components/ContactBook.vue';
import InvisibleFinancePopup from '../components/InvisibleFinancePopup.vue';
import { createKernelSession, generateSecretNotebook, sendMessage, processVoiceNote, analyzeImage, analyzeIntent, analyzeSemanticDiff } from '../services/geminiService.js';
import { processAssetToGateway } from '../services/assetService.js';
import contactBook from '../services/contactBook.js';
import AmasLiaisonService from '../services/amasLiaisonService.js';
import peerService from '../services/peerService.js';
import VideoOverlay from '../components/VideoOverlay.vue';

// State
const user = ref(null);
const isSearchingPeer = ref(false);
const showVideoOverlay = ref(false);
const remoteStream = ref(null);
const localStream = ref(null);
const messages = ref([]);
const notebookEntries = ref([]);
const showMobileMenu = ref(false); // Mobile awareness
const isLoading = ref(false);
const isInitializing = ref(false);
const activeView = ref('dashboard');
const isSidebarOpen = ref(false);
const isListening = ref(false);
const kernelSession = ref(null);
const recognitionRef = ref(null);
const showContactBook = ref(false);
const activeCall = ref(null); // { targetName, intentType, contact }
const showFinancePopup = ref(false);
const isSanctuaryActive = ref(false);
const liaisonService = ref(null);

// Load user from localStorage
onMounted(() => {
  const savedUser = localStorage.getItem('amas_user_v4');
  if (savedUser) {
    user.value = JSON.parse(savedUser);
    kernelSession.value = createKernelSession();
  }
  
  const savedMessages = localStorage.getItem('amas_messages_v4');
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages).map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
  }

  const savedNotebook = localStorage.getItem('amas_notebook_v1');
  if (savedNotebook) {
    notebookEntries.value = JSON.parse(savedNotebook).map(e => ({
      ...e,
      timestamp: new Date(e.timestamp)
    }));
  }

  // Initialize Liaison Service [AMAS_GENESIS_REVIVAL]
  liaisonService.value = new AmasLiaisonService({
    onPresenceDetected: () => {
      isSanctuaryActive.value = true;
      // Sanctuary Bell is handled by InvisibleFinancePopup upon actual call
      // or we can manually play some background resonance here
    }
  });

  // Initialize speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ja-JP';

    recognition.onstart = () => {
      isListening.value = true;
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice input:', transcript);
      
      try {
        // Step 1: Analyze intent using AI
        const intent = await analyzeIntent(transcript);
        console.log('AI Intent analysis:', intent);
        
        // Step 2: Handle based on intent
        switch (intent.intent) {
          case 'CONNECT_VIDEO':
          case 'CONNECT_CHAT':
            // Find contact in address book
            if (intent.target_person) {
              const contact = contactBook.findContact(intent.target_person);
              if (contact && contact.peerId) {
                // Auto-connect to peer via Labeling Caller (Visible AI Liaison)
                console.log(`Auto-connecting to ${contact.nickname} (${contact.peerId})`);
                
                // Set active call data to trigger the sanctuary popup
                activeCall.value = {
                  targetName: contact.nickname,
                  intentType: intent.intent === 'CONNECT_VIDEO' ? 'Video Bridge' : 'Resonance Chat',
                  contact: contact
                };
                showFinancePopup.value = true;
                
                // Log to notebook
                const newEntry = {
                  id: Date.now().toString(),
                  type: 'system',
                  title: `Connection Request: ${contact.nickname}`,
                  content: `Initiated ${intent.intent === 'CONNECT_VIDEO' ? 'video' : 'chat'} connection via voice command.\nTarget: @${contact.threadsId || contact.instagramId}`,
                  timestamp: new Date(),
                };
                notebookEntries.value.unshift(newEntry);
              } else {
                alert(`❌ Contact "${intent.target_person}" not found.\n\nPlease add them to your contact book first.`);
              }
            } else {
              alert('🤔 Could not identify who you want to connect with.\nPlease say their name clearly.');
            }
            break;
            
          case 'ADD_CONTACT':
            // Show contact add dialog (simplified for now)
            alert(`📇 Add Contact Feature\n\nDetected: ${intent.target_person}\nMessage: ${intent.message}\n\n(Contact management UI will be added)`);
            break;
            
          case 'NOTEBOOK_MEMO':
          case 'MESSAGE':
          default:
            // Save as notebook entry
            const refinedNote = await processVoiceNote(transcript);
            const newEntry = {
              id: Date.now().toString(),
              type: 'standard',
              title: `Voice Memo: ${new Date().toLocaleTimeString()}`,
              content: refinedNote,
              timestamp: new Date(),
            };
            notebookEntries.value.unshift(newEntry);
            break;
        }
      } catch (e) {
        console.error('Voice processing error:', e);
      }
    };

    recognition.onend = () => {
      isListening.value = false;
    };

    recognitionRef.value = recognition;
  }
});

// Save messages and notebook when they change
watch(messages, (newMessages) => {
  localStorage.setItem('amas_messages_v4', JSON.stringify(newMessages));
}, { deep: true });

watch(notebookEntries, (newEntries) => {
  localStorage.setItem('amas_notebook_v1', JSON.stringify(newEntries));
}, { deep: true });

// Handle anchor/login
const handleAnchor = async (threadsId, igId) => {
  isInitializing.value = true;
  
  try {
    const notebook = await generateSecretNotebook(threadsId, igId);
    
    const newUser = {
      id: `node-${Date.now()}`,
      threadsId,
      instagramId: igId,
      secretNotebook: notebook,
      stateVector: []
    };
    
    user.value = newUser;
    localStorage.setItem('amas_user_v4', JSON.stringify(newUser));
    kernelSession.value = createKernelSession();
    
    // Initialize P2P with User ID
    peerService.initialize(newUser.threadsId);
    
    peerService.onIncomingCall = (call) => {
      if (confirm(`Incoming Liaison Bridge from ${call.peer}. Accept?`)) {
        startP2PMedia(call.peer, true, call);
      }
    };
  } catch (error) {
    console.error('Initialization error:', error);
    const newUser = {
      id: `node-${Date.now()}`,
      threadsId,
      instagramId: igId,
      secretNotebook: "Identity established via local protocol.",
      stateVector: []
    };
    user.value = newUser;
    localStorage.setItem('amas_user_v4', JSON.stringify(newUser));
  } finally {
    isInitializing.value = false;
  }
};

// Handle send message
const handleSendMessage = async (text) => {
  const userMsg = {
    id: Date.now().toString(),
    role: 'user',
    content: text,
    timestamp: new Date()
  };
  
  messages.value.push(userMsg);
  isLoading.value = true;
  
  try {
    const aiResponse = await sendMessage(kernelSession.value, text);
    
    const aiMsg = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: aiResponse,
      timestamp: new Date()
    };
    messages.value.push(aiMsg);

    // Auto-save significant AI insights to Notebook
    if (aiResponse.length > 150) {
      const newEntry = {
        id: 'ai-insight-' + Date.now(),
        type: 'standard',
        title: `AI Insight: ${text.substring(0, 20)}...`,
        content: aiResponse,
        timestamp: new Date(),
      };
      notebookEntries.value.unshift(newEntry);
    }
  } catch (error) {
    console.error('AI response error:', error);
    const errorMsg = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: 'Kernel execution fault. Please check your API configuration.',
      timestamp: new Date()
    };
    messages.value.push(errorMsg);
  } finally {
    isLoading.value = false;
  }
};

// Handle voice toggle
const handleToggleVoice = () => {
  if (isListening.value) {
    recognitionRef.value?.stop();
  } else {
    try {
      recognitionRef.value?.start();
    } catch (e) {
      recognitionRef.value?.stop();
      setTimeout(() => recognitionRef.value?.start(), 100);
    }
  }
};

// Handle image import
const handleImport = async (file) => {
  try {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fullBase64 = e.target?.result;
      const base64 = fullBase64.split(',')[1];
      
      try {
        // AI解析と同時に、独立バックエンド（Gateway）へ鑑定リクエスト
        const [insight, gatewayResult] = await Promise.all([
          analyzeImage(base64, file.type),
          processAssetToGateway(file, "Manual Import via Onyx Interface")
        ]);
        
        console.log("[Amane Gateway] Certification Received:", gatewayResult);

        const newEntry = {
          id: Date.now().toString(),
          type: 'visual_diary',
          title: `Visual Diary: ${file.name}`,
          content: insight,
          timestamp: new Date(),
          metadata: { 
            image: fullBase64,
            certification_id: gatewayResult.certification_id,
            oke_facts: gatewayResult.atomic_facts,
            amane_link: gatewayResult.amane_link
          }
        };
        
        notebookEntries.value.unshift(newEntry);
        
        // 通知
        alert(`[OKE CERTIFIED] ${file.name}\nCID: ${gatewayResult.certification_id}`);
      } catch (error) {
        console.error('Image analysis error:', error);
      }
    };
    reader.readAsDataURL(file);
  } catch (e) {
    console.error('File read error:', e);
  }
};

const handleContactConnect = ({ contact, type }) => {
  activeCall.value = {
    targetName: contact.nickname,
    intentType: type === 'video' ? 'Video Bridge' : 'Resonance Chat',
    contact: contact
  };
  showFinancePopup.value = true;
  showContactBook.value = false;
};

const startP2PMedia = async (peerId, isIncoming = false, incomingCall = null) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.value = stream;
    showVideoOverlay.value = true;

    if (isIncoming && incomingCall) {
      peerService.answerCall(incomingCall, stream);
    } else {
      await peerService.startVideoCall(peerId, stream);
    }
    
    remoteStream.value = peerService.remoteStream.value;
    
    // Sync remote stream ref
    watch(() => peerService.remoteStream.value, (newVal) => {
      remoteStream.value = newVal;
    });

  } catch (err) {
    console.error("Failed to get media stream", err);
    alert("Could not access camera/mic for P2P Bridge.");
  }
};

const handleCallAgreement = async (callData) => {
  console.log("[AMAS_GENESIS_REVIVAL] Agreement reached. Finalizing Directive...", callData);
  
  try {
    // Phase 4: Invisible Finance Execution
    const result = await liaisonService.value.completeDirective(callData);
    console.log("Directive Finalized:", result);

    // Phase 5: Start Actual P2P Connection
    if (callData.intentType.includes('Video')) {
      await startP2PMedia(callData.contact.peerId);
    } else {
      peerService.connectToPeer(callData.contact.peerId);
      alert(`[P2P] Data Liaison established with ${callData.targetName}`);
    }

    // Apple Watch / Status sync
    const newEntry = {
      id: Date.now().toString(),
      type: 'resonance',
      title: 'LIFE WAVE Synchronization',
      content: `Liaison Bridge Established with ${callData.targetName}.\n\nSBT: ${result.sbtId}\nTX: ${result.txHash}\nPeer ID: ${callData.contact.peerId}`,
      timestamp: new Date(),
    };
    notebookEntries.value.unshift(newEntry);
  } catch (e) {
    console.error("Finalization error:", e);
  }
};

const handleEndCall = () => {
  peerService.endCall();
  showVideoOverlay.value = false;
  localStream.value = null;
  remoteStream.value = null;
};

const handlePresenceTrigger = () => {
  // Simulate JP18991 Proximity Detection
  liaisonService.value.triggerPresence(0.85); // Above 0.5 threshold
};

const navigateTo = (view) => {
  activeView.value = view;
  isSidebarOpen.value = false;
};
</script>

<template>
  <!-- Show AnchorScreen if no user -->
  <AnchorScreen 
    v-if="!user" 
    @anchor="handleAnchor" 
    :isLoading="isInitializing" 
  />
  
  <!-- Main App -->
  <div v-else class="fixed inset-0 bg-[#E5E5E5] flex flex-col overflow-hidden font-sans select-none text-[#1A1A1A]">
    <div class="stardust-bg" />

    <!-- Sidebar -->
    <div :class="['fixed left-0 top-0 bottom-0 w-80 bg-white/50 backdrop-blur-3xl border-r border-black/5 z-[400] transition-transform duration-500 transform', isSidebarOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="p-10 h-full flex flex-col">
        <div class="flex justify-between items-center mb-16">
          <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Amane Core OS</h3>
          <button @click="isSidebarOpen = false" class="p-2 hover:bg-black/5 rounded-full">
            <X :size="16" />
          </button>
        </div>
        
        <div class="space-y-4">
          <button 
            @click="navigateTo('dashboard')"
            :class="['w-full text-left p-6 rounded-[2rem] border transition-all', activeView === 'dashboard' ? 'bg-black text-white shadow-xl' : 'bg-white/60 border-white/40 hover:border-black/20']"
          >
            <div class="flex items-center gap-4">
              <LayoutDashboard :size="14" />
              <span class="text-[11px] font-bold uppercase tracking-widest">Interface</span>
            </div>
          </button>
        </div>

        <div class="mt-12 space-y-2">
          <button 
            @click="showContactBook = true"
            class="w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all bg-teal-500/10 text-teal-600 hover:bg-teal-500/20"
          >
            <component :is="Users" :size="16" />
            Contacts
          </button>
          
          <button 
            v-for="item in [
              { id: 'chat', label: 'Messaging', icon: MessageSquare },
              { id: 'log', label: 'Logs', icon: Terminal },
            ]" 
            :key="item.id"
            @click="navigateTo(item.id)"
            :class="['w-full flex items-center gap-4 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all', activeView === item.id ? 'bg-black/5 text-black' : 'text-black/40 hover:text-black']"
          >
            <component :is="item.icon" :size="16" />
            {{ item.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 px-10 py-10 flex justify-between items-center z-[350]">
      <div class="flex items-center gap-6">
        <button @click="isSidebarOpen = true" class="p-3 bg-black text-white rounded-xl shadow-xl hover:scale-105 transition-transform active:scale-95">
          <Menu :size="18" />
        </button>
        <div class="hidden md:block border-l border-black/10 pl-6">
          <div class="flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span :class="['animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', isSanctuaryActive ? 'bg-teal-400' : 'bg-[#c0a080]']"></span>
              <span :class="['relative inline-flex rounded-full h-2 w-2', isSanctuaryActive ? 'bg-teal-500' : 'bg-[#8b7e74]']"></span>
            </span>
            <span :class="['text-[9px] tracking-widest font-bold uppercase', isSanctuaryActive ? 'text-teal-600' : 'text-[#8b7e74]']">
              {{ isSanctuaryActive ? 'Sanctuary: Active' : 'Resonance: Online' }}
            </span>
          </div>
          <p class="text-[7px] text-black/30 tracking-widest uppercase mt-1">
            {{ isSanctuaryActive ? 'JP18991 Proximity Protocol' : 'Amane Protocol Sync Active' }}
          </p>
        </div>
      </div>

      <button 
        @click="navigateTo('notebook')" 
        :class="['font-serif-luxury text-4xl md:text-5xl lg:text-6xl transition-all duration-700 tracking-tighter italic font-bold', activeView === 'notebook' ? 'text-black opacity-100 scale-105' : 'text-black/30 hover:text-black/60']"
      >
        Notebook
      </button>

      <div class="flex items-center gap-4">
        <button 
          @click="handlePresenceTrigger"
          :class="['w-12 h-12 flex items-center justify-center rounded-full border transition-all duration-700', isSanctuaryActive ? 'bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/20' : 'bg-white/40 border-white/40']"
        >
          <Fingerprint :size="16" :class="isSanctuaryActive ? 'text-teal-600' : 'opacity-30'" />
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative">
      <PrimaryInterface 
        v-if="activeView === 'dashboard'" 
        :user="user" 
        :isListening="isListening" 
        @toggleVoice="handleToggleVoice"
        @import="handleImport"
      />
      <ChatMessaging 
        v-if="activeView === 'chat'" 
        :messages="messages" 
        :isLoading="isLoading"
        @sendMessage="handleSendMessage" 
      />
      <NotebookView 
        v-if="activeView === 'notebook'" 
        :user="user" 
        :entries="notebookEntries" 
      />
    </main>

    <!-- Invisible Finance Popup (Labeling Caller UI) -->
    <InvisibleFinancePopup 
      v-if="showFinancePopup" 
      :targetName="activeCall?.targetName"
      :intentType="activeCall?.intentType"
      @close="showFinancePopup = false"
      @agreed="handleCallAgreement"
    />

    <!-- Contact Book Modal -->
    <ContactBook 
      v-if="showContactBook" 
      @close="showContactBook = false"
      @connect="handleContactConnect"
    />

    <!-- P2P Video Overlay -->
    <VideoOverlay 
      v-if="showVideoOverlay"
      :localStream="localStream"
      :remoteStream="remoteStream"
      :targetName="activeCall?.targetName"
      @endCall="handleEndCall"
    />
  </div>
</template>
