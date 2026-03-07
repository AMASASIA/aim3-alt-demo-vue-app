<script setup>
import { ref, computed } from 'vue';
import { 
  ShieldCheck, 
  Ticket, 
  History, 
  Fingerprint, 
  Coins, 
  ArrowRight,
  ChevronRight,
  Lock,
  Zap,
  CreditCard,
  Crown,
  X,
  Wallet,
  Globe,
  Activity,
  UserCheck,
  TrendingUp,
  ShoppingCart,
  BarChart3,
  Terminal
} from 'lucide-vue-next';

const props = defineProps({
  intentCount: { type: Number, default: 0 }
});

const emit = defineEmits(['close']);

const activeTab = ref('ledger'); // 'ledger' | 'sbt' | 'tickets' | 'biometrics' | 'awallet' | 'market'
const soulBalance = computed(() => (props.intentCount * 12.5).toFixed(2));
const ticketCount = ref(5);

// --- AWallet & Activity Brake Configuration ---
const dailyLimit = ref(10);
const singleTxLimit = ref(3);
const isA2AEnabled = ref(true);
const whitelist = ref([
  { domain: 'openai.com', status: 'Active', icon: Globe },
  { domain: 'stripe.com', status: 'Secure', icon: ShieldCheck },
  { domain: 'agentmail.ai', status: 'A2A-Fulfillment', icon: Zap },
  { domain: 'antigravity.run', status: 'Core-Mission', icon: Activity }
]);

const investmentRules = ref([
 { id: 1, trigger: 'Revenue Growth > 50%', action: 'Buy 10 Shares', asset: 'NVDA', status: 'Standby' },
 { id: 2, trigger: '10-K Sentiment >= 0.8', action: 'Scale Position', asset: 'AAPL', status: 'Enabled' }
]);

const isScanning = ref(false);
const scanComplete = ref(false);

const startScanning = () => {
    if (isScanning.value || scanComplete.value) return;
    isScanning.value = true;
    setTimeout(() => {
        isScanning.value = false;
        scanComplete.value = true;
    }, 3000);
};

const currentRank = computed(() => {
    if (props.intentCount >= 100) return 'Amane Elite';
    if (props.intentCount >= 50) return 'Semantic Architect';
    if (props.intentCount >= 10) return 'Resonance Adept';
    return 'Novice Responder';
});

const handlePurchaseTicket = () => {
  // Simulated Stripe Integration
  const confirmAction = window.confirm("Buy 1x Voice Card Ticket for ¥500? (Stripe Simulation)");
  if (confirmAction) {
    alert("Biometric validation required to finalize purchase...");
  }
};

const menuItems = [
  { id: 'ledger', icon: History, label: 'Resonance Ledger' },
  { id: 'awallet', icon: Wallet, label: 'AWallet & Control' },
  { id: 'market', icon: ShoppingCart, label: 'A2A Marketplace' },
  { id: 'sbt', icon: ShieldCheck, label: 'SBT Proof' },
  { id: 'tickets', icon: Ticket, label: 'Ticket System' },
  { id: 'biometrics', icon: Fingerprint, label: 'Biometrics' },
];

const ledgerItems = ref([
  { id: 1, title: 'Stock Purchase: NVDA', subtitle: 'Execute Logic: Growth > 50%', amount: '-$12.40', block: '40,225', icon: TrendingUp },
  { id: 2, title: '10-K Report Purchase', subtitle: 'Paid to EdgarSync API', amount: '-$0.50', block: '40,223', icon: BarChart3 },
  { id: 3, title: 'Design Fee Settlement', subtitle: 'Paid to @creativ_agent', amount: '-$150.00', block: '40,218', icon: UserCheck },
  { id: 4, title: 'Intent Reward', subtitle: 'Validated via Amane Core', amount: '+$2.50', block: '40,212', icon: Zap },
]);
</script>

<template>
  <div class="fixed inset-0 z-[5000] bg-[#050505] text-[#E5E5E5] flex flex-col font-sans overflow-hidden animate-fade-in select-none">
    <!-- Chic Header - Preserving the "Finance" Context -->
    <header class="px-10 py-12 flex justify-between items-center border-b border-white/[0.03] bg-black/80 backdrop-blur-3xl">
      <div class="flex items-center gap-6">
        <button @click="$emit('close')" class="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
          <ChevronRight class="rotate-180" :size="24" />
        </button>
        <div class="space-y-1">
          <h1 class="text-3xl font-serif-luxury italic tracking-tighter text-white/90">Invisible Finance</h1>
          <p class="text-[7px] font-black uppercase tracking-[0.5em] text-[#8b7e74]">Amane Protocol v4.2 Obsidian</p>
        </div>
      </div>
      
      <div class="flex items-center gap-10">
        <div class="text-right">
          <p class="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Resonance Points</p>
          <p class="text-3xl font-mono-light tracking-tighter text-[#c0a080] flex items-center gap-2">
            <Coins :size="16" class="opacity-50" />
            {{ soulBalance }} <span class="text-[10px] opacity-30">RP</span>
          </p>
        </div>
        <div class="space-y-1 text-right">
            <p class="text-[8px] font-black uppercase tracking-widest text-teal-500 mb-1">Verified Intents</p>
            <p class="text-2xl font-mono-light text-white/80">{{ intentCount }}</p>
        </div>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden">
      <!-- Navigation - Ultra Minimal Sidebar -->
      <aside class="w-80 border-r border-white/[0.03] p-10 flex flex-col gap-3">
        <button
          v-for="item in menuItems"
          :key="item.id"
          @click="activeTab = item.id"
          :class="[
            'flex items-center gap-5 p-6 rounded-2xl transition-all duration-500 group',
            activeTab === item.id 
            ? 'bg-white/[0.04] text-white shadow-[0_0_40px_rgba(255,255,255,0.01)]' 
            : 'text-white/20 hover:text-white/50'
          ]"
        >
          <component :is="item.icon" :size="18" :class="activeTab === item.id ? 'text-[#c0a080]' : 'text-white/10 group-hover:text-white/30'" />
          <span class="text-[10px] font-bold uppercase tracking-[0.3em]">{{ item.label }}</span>
          <span v-if="item.id === 'tickets' && ticketCount > 0" class="ml-auto w-5 h-5 rounded-full bg-[#c0a080] text-black text-[9px] font-black flex items-center justify-center">
            {{ ticketCount }}
          </span>
        </button>

        <div class="mt-auto p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.03] space-y-4">
          <div class="flex justify-between items-center">
            <Fingerprint :size="16" class="text-teal-500/50" />
            <span class="text-[7px] font-black uppercase tracking-widest text-white/30">Secure Unit Active</span>
          </div>
          <p class="text-[9px] font-light text-white/20 leading-relaxed italic">
            "Resonance keys are rotationally encrypted via Amane L3."
          </p>
        </div>
      </aside>

      <!-- Dynamic Content Panel -->
      <div class="flex-1 overflow-y-auto custom-scroll p-12 md:p-20 bg-gradient-to-br from-[#050505] to-black">
        
        <div v-if="activeTab === 'ledger'" class="space-y-12 animate-fade-in-up">
          <header class="flex justify-between items-end border-b border-white/[0.05] pb-8">
            <div class="space-y-2">
              <h2 class="text-4xl font-serif-luxury italic text-white/90">Resonance Ledger</h2>
              <p class="text-[9px] font-bold uppercase tracking-widest text-white/20">Immutable Transaction History</p>
            </div>
            <div class="text-right opacity-30">
              <span class="text-[8px] font-mono-light uppercase">Node: did:amane:0x88f2...</span>
            </div>
          </header>

          <div class="space-y-4">
            <div 
              v-for="item in ledgerItems" 
              :key="item.id" 
              class="group flex items-center justify-between p-8 bg-white/[0.01] rounded-3xl border border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all cursor-crosshair"
            >
              <div class="flex items-center gap-6">
                <div class="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-[#8b7e74] border border-white/5">
                  <component :is="item.icon || Zap" :size="18" />
                </div>
                <div class="space-y-1">
                  <p class="text-[11px] font-bold uppercase tracking-widest text-white/80">{{ item.title }}</p>
                  <p class="text-[9px] font-light text-white/20 italic">{{ item.subtitle }}</p>
                </div>
              </div>
              <div class="text-right space-y-1">
                <p class="text-[12px] font-mono-light text-[#c0a080]">{{ item.amount }}</p>
                <p class="text-[7px] text-white/10 uppercase tracking-[0.3em]">Block #{{ item.block }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'sbt'" class="max-w-2xl space-y-12 animate-fade-in-up">
          <div class="relative group">
            <div class="absolute inset-0 bg-[#c0a080]/5 blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div class="relative p-16 bg-gradient-to-br from-[#0a0a0a] to-black rounded-[4rem] border border-white/[0.05] space-y-10 shadow-2xl">
              <div class="flex justify-between items-start">
                <div class="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                  <ShieldCheck :size="40" class="text-[#c0a080]" />
                </div>
                <span class="text-[9px] font-black text-teal-500/80 uppercase tracking-[0.5em] border border-teal-500/20 px-3 py-1 rounded-full">Verified Identity</span>
              </div>
              
              <div class="space-y-4">
                <h2 class="text-5xl font-serif-luxury italic tracking-tighter text-white">Soul Bound Token</h2>
                <p class="text-[14px] font-light text-white/40 leading-relaxed max-w-lg">
                  Your identity is non-custodial and anchored to the Amane Protocol. 
                  This SBT encapsulates your expertise, resonance history, and behavior credentials.
                </p>
              </div>

              <div class="grid grid-cols-2 gap-8 pt-10 border-t border-white/[0.05]">
                <div class="space-y-2">
                  <p class="text-[8px] font-black uppercase text-white/20 tracking-widest">CDR Coefficient</p>
                  <p class="text-2xl font-mono-light text-white/90">{{ (0.8 + (intentCount * 0.002)).toFixed(4) }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-[8px] font-black uppercase text-white/20 tracking-widest">Amane Rank</p>
                  <p class="text-2xl font-mono-light text-[#c0a080]">{{ currentRank }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'tickets'" class="space-y-12 animate-fade-in-up">
          <header class="space-y-2">
            <h2 class="text-4xl font-serif-luxury italic text-white/90">Voice Card Tickets</h2>
            <p class="text-[9px] font-bold uppercase tracking-widest text-white/20">Expand your resonance potential</p>
          </header>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
            <div class="p-12 bg-white/[0.02] border border-white/[0.05] rounded-[3rem] space-y-10">
              <div class="flex items-center gap-5">
                <Ticket class="text-[#c0a080]" :size="28" />
                <span class="text-[11px] font-black uppercase tracking-widest">Balance</span>
              </div>
              <div class="flex items-baseline gap-4">
                <span class="text-8xl font-mono-light text-white">{{ ticketCount }}</span>
                <span class="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">🎟️ Available</span>
              </div>
              <div class="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                <p class="text-[10px] font-light text-white/40 italic leading-relaxed">
                  Tickets are required to trigger "Voice Card Notifications"—a high-priority resonance alert sent to non-active nodes.
                </p>
              </div>
            </div>

            <div class="p-12 bg-white rounded-[3rem] text-black space-y-10 shadow-2xl">
              <div class="flex justify-between items-start">
                <CreditCard :size="32" />
                <span class="text-[8px] font-black uppercase tracking-widest opacity-30">Secure Payment</span>
              </div>
              <div class="space-y-2">
                <p class="text-4xl font-serif-luxury italic tracking-tighter">Purchase Ticket</p>
                <p class="text-sm opacity-60">¥500 per Resonance Unit</p>
              </div>
              <button 
                @click="handlePurchaseTicket"
                class="w-full py-6 bg-black text-white rounded-2xl flex items-center justify-center gap-4 group hover:scale-[1.02] transition-all"
              >
                <span class="text-[10px] font-bold uppercase tracking-[0.4em]">Initiate Stripe Sync</span>
                <ArrowRight :size="14" class="group-hover:translate-x-2 transition-transform" />
              </button>
              <p class="text-[8px] text-center opacity-30 uppercase tracking-widest">Transactions are finalized via Face ID</p>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'awallet'" class="space-y-12 animate-fade-in-up">
          <header class="flex justify-between items-end border-b border-white/[0.05] pb-8">
            <div class="space-y-2">
              <h2 class="text-4xl font-serif-luxury italic text-white/90">AWallet & Activity Brake</h2>
              <p class="text-[9px] font-black uppercase tracking-widest text-[#c0a080]">Agent-to-Agent Financial Guardrails</p>
            </div>
            <div :class="['px-4 py-2 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all', 
                         isA2AEnabled ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' : 'bg-red-500/10 border-red-500/30 text-red-400']">
                 {{ isA2AEnabled ? 'Autonomous Agency: Active' : 'Manual Approval Only' }}
            </div>
          </header>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Left: Spending Controls & Logic Engine -->
            <div class="p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-10">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                   <Activity :size="24" class="text-teal-400" />
                   <span class="text-[11px] font-black uppercase tracking-widest">Activity Brake</span>
                </div>
                <button @click="isA2AEnabled = !isA2AEnabled" class="w-12 h-6 bg-white/5 rounded-full relative p-1 transition-all">
                   <div :class="['w-4 h-4 rounded-full transition-all', isA2AEnabled ? 'bg-teal-500 translate-x-6' : 'bg-white/20 translate-x-0']"></div>
                </button>
              </div>

              <div class="space-y-8">
                 <div class="space-y-4">
                    <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                       <span>Daily Spending Limit</span>
                       <span class="text-white">${{ dailyLimit }} / day</span>
                    </div>
                    <input v-model.number="dailyLimit" type="range" min="1" max="50" step="1" class="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#c0a080]" />
                 </div>

                 <div class="space-y-4">
                    <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                       <span>Transaction Threshold</span>
                       <span class="text-white">${{ singleTxLimit }} / tx</span>
                    </div>
                    <input v-model.number="singleTxLimit" type="range" min="0.1" max="10" step="0.1" class="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#c0a080]" />
                 </div>
              </div>

              <!-- Investment Logic -->
              <div class="pt-8 border-t border-white/5 space-y-6 text-left">
                 <div class="flex items-center gap-4">
                    <Terminal :size="20" class="text-indigo-400" />
                    <span class="text-[11px] font-black uppercase tracking-widest text-white/40">Investment Logic Engine</span>
                 </div>
                 <div class="space-y-3">
                    <div v-for="rule in investmentRules" :key="rule.id" class="p-4 bg-white/[0.01] border border-white/[0.03] rounded-2xl flex items-center justify-between">
                        <div class="space-y-1">
                           <p class="text-[10px] font-bold text-white/60">IF: {{ rule.trigger }}</p>
                           <p class="text-[9px] font-mono text-white/20 uppercase tracking-widest">DO: {{ rule.action }}</p>
                        </div>
                        <span class="text-[8px] px-2 py-0.5 rounded bg-white/5 text-slate-500 uppercase">{{ rule.status }}</span>
                    </div>
                 </div>
              </div>
            </div>

            <!-- Right: Permission Layer -->
            <div class="p-12 bg-black/40 border border-white/5 rounded-[3rem] space-y-10 text-left">
               <div class="flex items-center gap-4">
                  <Globe :size="24" class="text-[#c0a080]" />
                  <span class="text-[11px] font-black uppercase tracking-widest">A2A Permission Layer</span>
               </div>
               
               <div class="space-y-3">
                  <div v-for="site in whitelist" :key="site.domain" class="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.03] rounded-2xl hover:bg-white/[0.05] transition-all">
                     <div class="flex items-center gap-4">
                        <component :is="site.icon" :size="14" class="opacity-40" />
                        <span class="text-xs font-mono text-white/60">{{ site.domain }}</span>
                     </div>
                     <span class="text-[8px] font-black uppercase tracking-tighter text-teal-500">{{ site.status }}</span>
                  </div>
               </div>

               <div class="pt-6 border-t border-white/5 flex items-center gap-4 opacity-30">
                  <Lock :size="14" />
                  <p class="text-[9px] font-light italic leading-tight">
                    "Automatic on-boarding for AI Agents enabled via Gateway Protocol v2.4."
                  </p>
               </div>
            </div>
          </div>

          <!-- Startup Vision Banner -->
          <div class="p-12 bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-white/5 rounded-[4rem] text-center space-y-4">
              <h3 class="text-2xl font-serif-luxury italic text-white">The Agentic Economy Framework</h3>
              <p class="text-[11px] text-slate-400 max-w-xl mx-auto leading-relaxed font-serif italic">
                AIエージェントが自ら資金を管理し、商取引を完結させるための自律的金融基盤。
              </p>
              <div class="flex justify-center gap-8 pt-4">
                  <div class="flex flex-col items-center gap-1">
                      <span class="text-[18px] font-mono text-white">0.00s</span>
                      <span class="text-[8px] uppercase tracking-widest text-slate-500">A2A Latency</span>
                  </div>
                  <div class="flex flex-col items-center gap-1">
                      <span class="text-[18px] font-mono text-teal-400">Stable</span>
                      <span class="text-[8px] uppercase tracking-widest text-slate-500">Gateway Flow</span>
                  </div>
              </div>
          </div>
        </div>

        <!-- A2A Marketplace View -->
        <div v-if="activeTab === 'market'" class="space-y-12 animate-fade-in-up">
          <header class="flex justify-between items-end border-b border-white/[0.05] pb-8">
              <div class="space-y-2 text-left">
                <h2 class="text-4xl font-serif-luxury italic text-white/90">A2A Intelligent Market</h2>
                <p class="text-[9px] font-bold uppercase tracking-widest text-blue-400">Collaborative Agency & Service Settlement</p>
              </div>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div v-for="marketItem in [
                  { title: 'EdgarSync 10-K API', subtitle: 'SEC Financial Data Access', price: '$0.50/call', icon: BarChart3 },
                  { title: '@creative_agent', subtitle: 'UI/UX Generation & Assets', price: '$150/task', icon: UserCheck },
                  { title: 'Antigravity X Runtime', subtitle: 'Browser Cloud Compute', price: '$0.05/slot', icon: Activity }
              ]" :key="marketItem.title" class="p-8 bg-white/[0.01] border border-white/[0.03] rounded-[2rem] hover:bg-white/[0.04] transition-all flex flex-col gap-6 text-left">
                  <div class="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-white/40">
                     <component :is="marketItem.icon" :size="20" />
                  </div>
                  <div>
                     <h4 class="text-[12px] font-bold text-white/80 uppercase tracking-widest">{{ marketItem.title }}</h4>
                     <p class="text-[9px] text-white/30 italic">{{ marketItem.subtitle }}</p>
                  </div>
                  <div class="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                      <span class="text-mono text-sm text-[#c0a080]">{{ marketItem.price }}</span>
                      <button class="px-4 py-1.5 rounded-full bg-white/5 text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Contract</button>
                  </div>
              </div>
          </div>
        </div>

        <div v-if="activeTab === 'biometrics'" class="max-w-xl space-y-12 animate-fade-in-up">
          <div class="flex flex-col items-center justify-center space-y-12 py-20 bg-white/[0.01] rounded-[4rem] border border-white/[0.03]">
            <div class="relative group cursor-pointer" @click="startScanning">
              <div :class="['absolute inset-0 bg-[#c0a080]/20 blur-3xl rounded-full scale-150 transition-opacity duration-1000', isScanning ? 'opacity-100 animate-pulse' : 'opacity-0']" />
              <div :class="['relative w-32 h-32 rounded-full border-2 flex items-center justify-center bg-black/50 transition-all duration-700', isScanning ? 'border-[#c0a080] shadow-[0_0_50px_rgba(192,160,128,0.3)]' : 'border-white/10']">
                <Fingerprint :size="56" :class="[isScanning ? 'text-[#c0a080] animate-pulse' : 'text-white/20 group-hover:text-white/40']" />
              </div>
              <div v-if="isScanning" class="absolute inset-0 border-t-2 border-[#c0a080] rounded-full animate-spin-slow"></div>
            </div>
            <div class="text-center space-y-4">
              <h3 class="text-[12px] font-black uppercase tracking-[0.6em] text-white">
                  {{ isScanning ? 'Scanning Bio-Hash...' : (scanComplete ? 'Identity Anchored' : 'Touch to Authenticate') }}
              </h3>
              <p class="text-[10px] font-light text-white/30 italic max-w-xs mx-auto leading-relaxed">
                {{ scanComplete ? 'Encryption keys rotated. Your unique biometric signature is now mapped to did:amane:l3.' : 'Your unique biometric hash is used to sign all resonance events within the Amane OS.' }}
              </p>
            </div>
            
            <!-- Scan Progress Bar -->
            <div v-if="isScanning" class="w-48 h-[1px] bg-white/5 relative overflow-hidden">
                <div class="absolute inset-0 bg-teal-500/50 animate-progress"></div>
            </div>

            <div v-if="!isScanning" class="flex gap-1">
               <div v-for="i in 10" :key="i" :class="['w-1.5 h-1.5 rounded-full transition-colors duration-1000', scanComplete ? 'bg-teal-500' : 'bg-white/5']" />
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Chic Footer Branding -->
    <footer class="p-10 border-t border-white/[0.03] bg-black/20 flex justify-between items-center text-white/20">
      <p class="text-[8px] font-mono-light uppercase tracking-[0.6em]">Amane Protocol Ledger System</p>
      <p class="text-[8px] font-mono-light uppercase tracking-[0.6em]">V4.2 OBSIDIAN SERIES</p>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,700&display=swap');

.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.font-serif-luxury {
  font-family: "Cormorant Garamond", serif;
}

.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-progress {
  animation: progress 2s infinite linear;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}
</style>
