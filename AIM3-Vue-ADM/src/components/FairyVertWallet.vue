<script setup>
import { ref, onMounted } from 'vue';
import { X, Zap, Fingerprint, Ticket, History, ShieldCheck, ArrowLeft, Gem } from 'lucide-vue-next';

const emit = defineEmits(['close']);

const transactions = ref([
  { id: 1, type: 'INTENT_CAPTURE', title: 'INTENT CAPTURE EVENT', subtitle: 'Validated via Attention Gap Mechanism', amount: '+1.98 SOL', block: '#49,211' },
  { id: 2, type: 'INTENT_CAPTURE', title: 'INTENT CAPTURE EVENT', subtitle: 'Validated via Attention Gap Mechanism', amount: '+0.82 SOL', block: '#49,214' },
  { id: 3, type: 'INTENT_CAPTURE', title: 'INTENT CAPTURE EVENT', subtitle: 'Validated via Attention Gap Mechanism', amount: '+1.89 SOL', block: '#49,218' },
]);

const activeTab = ref('ledger'); // ledger, sbt, tickets, biometrics

const props = defineProps({
  balance: { type: String, default: '2,440.85' }
});
</script>

<template>
  <div class="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0 md:p-10 animate-fade-in text-white/90">
    <!-- Obsidian Card -->
    <div class="w-full h-full max-w-7xl bg-[#080808] border border-white/10 rounded-none md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative">
      
      <!-- Top Navigation Bar -->
      <nav class="p-8 md:px-12 md:py-10 flex items-center justify-between border-b border-white/5">
        <div class="flex items-center gap-8">
           <button @click="$emit('close')" class="p-2 hover:bg-white/5 rounded-full transition-colors group">
             <ArrowLeft :size="20" class="text-white/40 group-hover:text-white group-hover:-translate-x-1 transition-all" />
           </button>
           <div class="flex flex-col">
             <h1 class="font-serif-luxury text-3xl md:text-4xl text-white tracking-tight leading-none mb-1">Invisible Finance</h1>
             <p class="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">Amane Protocol v4.2 Obsidian</p>
           </div>
        </div>

        <!-- Navigation Tabs (Center) -->
        <div class="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10">
          <button 
            v-for="tab in [
              { id: 'ledger', label: 'Resonance Ledger', icon: History },
              { id: 'sbt', label: 'SBT Proof', icon: ShieldCheck },
              { id: 'tickets', label: 'Ticket System', icon: Ticket },
              { id: 'biometrics', label: 'Biometrics', icon: Fingerprint }
            ]"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['flex items-center gap-3 px-6 py-3 rounded-xl transition-all font-bold uppercase tracking-[0.15em] text-[9px]', activeTab === tab.id ? 'bg-[#1A1A1A] text-emerald-400 shadow-xl border border-white/10' : 'text-white/20 hover:text-white/40']"
          >
            <component :is="tab.icon" :size="14" />
            {{ tab.label }}
          </button>
        </div>

        <button @click="$emit('close')" class="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
          <X :size="20" class="text-white/40" />
        </button>
      </nav>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        <!-- Left Panel: Ledger List -->
        <div class="flex-1 p-10 md:p-16 overflow-y-auto custom-scrollbar">
          <div class="flex items-center gap-6 mb-12">
            <h2 class="font-serif-luxury italic text-4xl text-white/90">Resonance Ledger</h2>
            <div class="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent opacity-20"></div>
            <span class="text-[9px] uppercase tracking-[0.3em] font-black text-white/20">Immutable Transaction History</span>
          </div>

          <!-- Transaction Items -->
          <div class="space-y-6">
            <div 
              v-for="tx in transactions" 
              :key="tx.id"
              class="group relative overflow-hidden bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 rounded-[2.5rem] p-8 transition-all duration-700 hover:bg-white/[0.05]"
            >
              <div class="flex justify-between items-center relative z-10">
                <div class="flex items-center gap-8">
                  <div class="w-14 h-14 rounded-full bg-black border border-white/10 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.1)] group-hover:shadow-[0_0_40px_rgba(52,211,153,0.3)] transition-all">
                    <Zap :size="20" stroke-width="3" />
                  </div>
                  <div>
                    <div class="text-[12px] font-black uppercase tracking-[0.2em] text-white mb-4 flex items-center gap-3">
                       {{ tx.title }}
                       <span class="w-8 h-[1px] bg-emerald-500/30"></span>
                    </div>
                    <div class="text-[10px] text-white/30 tracking-[0.1em] font-medium">{{ tx.subtitle }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-mono text-2xl text-emerald-400 tracking-tighter mb-1">{{ tx.amount }}</div>
                  <div class="text-[8px] font-mono text-emerald-500/20 tracking-widest uppercase">{{ tx.block }}</div>
                </div>
              </div>
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1500ms] ease-in-out"></div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Balance & Sidebar Stats -->
        <div class="w-full md:w-[450px] bg-black/40 border-l border-white/5 p-12 md:p-16 flex flex-col justify-between relative">
          <div class="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent pointer-events-none"></div>

          <!-- Status Indicator -->
          <div class="mb-12 bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col gap-6 group hover:bg-white/[0.05] transition-all duration-700">
            <div class="flex items-center gap-5">
               <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Gem :size="20" class="text-emerald-400" />
               </div>
               <div>
                  <div class="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-2">Secure Unit Active</div>
                  <p class="text-[9px] text-white/30 uppercase tracking-widest font-medium">Resonance encryption: Amane L3</p>
               </div>
            </div>
          </div>

          <!-- Balance Main Display (Matches Photo) -->
          <div class="flex-1 flex flex-col justify-center">
             <div class="flex items-baseline gap-2 mb-6 ml-2">
                <ShieldCheck :size="12" class="text-emerald-500/40" />
                <div class="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Total Soul Balance</div>
             </div>
             <div class="font-serif-luxury text-[80px] md:text-[90px] text-white leading-none tracking-tighter flex items-end gap-5 mb-8 group cursor-default">
                {{ balance }} <span class="text-3xl font-sans font-extralight text-white/20 pb-4 group-hover:text-emerald-500/40 transition-colors">SOL</span>
             </div>
             <div class="flex items-center gap-3 ml-2 group cursor-pointer">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all border border-white/5">
                   <Gem :size="14" class="text-emerald-400 opacity-50 group-hover:opacity-100" />
                </div>
                <div class="flex flex-col">
                   <span class="text-[10px] font-black tracking-widest text-emerald-500/60 uppercase">Amans Verified Ledger</span>
                   <span class="text-[8px] text-white/20 uppercase tracking-widest">Amane Protocol v4.2 Obsidian</span>
                </div>
             </div>
          </div>

          <!-- Footer Metadata -->
          <div class="space-y-10 pt-16 border-t border-white/5">
            <div class="grid grid-cols-2 gap-10 font-mono">
               <div>
                 <p class="text-[8px] uppercase tracking-widest text-white/20 mb-3">Node Entity</p>
                 <p class="text-[11px] text-emerald-500/60 tracking-wider">DID:AMANE:0X8BF2...</p>
               </div>
               <div class="text-right">
                 <p class="text-[8px] uppercase tracking-widest text-white/20 mb-3">Series Registry</p>
                 <p class="text-[11px] text-emerald-500/60 tracking-wider">V4.2 OBSIDIAN</p>
               </div>
            </div>
            
            <p class="text-[9px] font-black text-center uppercase tracking-[0.4em] text-white/10 select-none">
              Amane Protocol Ledger System
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,700&display=swap');

.animate-fade-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.font-serif-luxury {
  font-family: "Cormorant Garamond", serif;
  font-weight: 700;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
