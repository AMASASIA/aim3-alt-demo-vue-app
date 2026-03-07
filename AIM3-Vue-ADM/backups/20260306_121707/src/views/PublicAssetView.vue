<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import OKECertificationCard from '../components/OKECertificationCard.vue';
import { Fingerprint, ArrowLeft } from 'lucide-vue-next';

const route = useRoute();
const assetData = ref(null);
const isLoading = ref(true);
const error = ref(null);

onMounted(async () => {
    const hash = route.params.hash;
    // In a real app, this would fetch from your PostgreSQL backend (Amane Gateway)
    // For now, we simulate the fetch or check localStorage as fallback
    try {
        // Try to find in local storage first (for local testing)
        const savedNotebook = localStorage.getItem('amas_notebook_v1');
        if (savedNotebook) {
            const entries = JSON.parse(savedNotebook);
            const found = entries.find(e => e.metadata?.amane_link?.includes(hash));
            if (found) {
                assetData.value = {
                    facts: found.metadata.oke_facts,
                    cid: found.metadata.certification_id,
                    link: found.metadata.amane_link,
                    timestamp: new Date(found.timestamp).toLocaleDateString()
                };
                isLoading.value = false;
                return;
            }
        }

        // If not found locally, would fetch from Gateway:
        // const res = await fetch(`http://localhost:8000/v1/asset/${hash}`);
        // assetData.value = await res.json();
        
        // Fallback demo data
        setTimeout(() => {
          if (!assetData.value) {
            error.value = "Asset not found in the Amane Archive.";
            isLoading.value = false;
          }
        }, 1500);

    } catch (e) {
        error.value = "Resonance Failure: Could not connect to the Amane Archive.";
        isLoading.value = false;
    }
});
</script>

<template>
  <div class="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden font-sans">
    <div class="stardust-bg opacity-30" />
    
    <!-- Branding -->
    <header class="fixed top-0 left-0 right-0 p-10 flex justify-between items-center z-10">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <Fingerprint :size="18" class="text-teal-400" />
        </div>
        <h2 class="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Amane L0 / Open Fact</h2>
      </div>
      <router-link to="/" class="text-[10px] font-bold uppercase tracking-widest text-black/20 hover:text-black transition-all flex items-center gap-2">
        <ArrowLeft :size="12" />
        Back to Node
      </router-link>
    </header>

    <!-- Content -->
    <main class="w-full max-w-2xl relative z-10">
      <div v-if="isLoading" class="flex flex-col items-center gap-6 py-20">
        <div class="w-12 h-12 border-2 border-black/5 border-t-black rounded-full animate-spin" />
        <p class="text-[11px] font-bold uppercase tracking-[0.4em] animate-pulse">Synchronizing Truth...</p>
      </div>

      <div v-else-if="error" class="text-center py-20">
        <h1 class="font-serif-luxury text-4xl italic mb-4">{{ error }}</h1>
        <p class="text-[11px] uppercase tracking-widest opacity-40">Please verify the URL or resonance hash.</p>
      </div>

      <div v-else class="space-y-8 animate-fade-in-up">
        <div class="text-center mb-12">
            <p class="text-[9px] font-black uppercase tracking-[0.5em] text-teal-600 mb-4">Verified Amane Artifact</p>
            <h1 class="font-serif-luxury text-5xl md:text-7xl italic font-bold">Provenance Identified.</h1>
        </div>

        <OKECertificationCard 
          :facts="assetData.facts"
          :cid="assetData.cid"
          :amaneLink="assetData.link"
          :timestamp="assetData.timestamp"
        />

        <div class="text-center pt-12">
            <p class="text-[9px] font-mono-light text-black/30 tracking-[0.3em] uppercase max-w-xs mx-auto leading-relaxed">
                This certification is signed with the Amane L0 Protocol and immutably stored on the decentralised fact ledger.
            </p>
        </div>
      </div>
    </main>

    <footer class="fixed bottom-0 left-0 right-0 p-10 text-center pointer-events-none">
        <p class="text-[8px] font-bold uppercase tracking-[0.6em] text-black/10">Archive Integrity: Secure</p>
    </footer>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
    animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
