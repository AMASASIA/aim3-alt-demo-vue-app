<template>
  <div class="deployment-container">
    <header>
      <button class="back-link" @click="$emit('nav', 'dashboard')">
        <ArrowLeft :size="16" />
        <span>Back to Interface</span>
      </button>
      <h1>
        <Rocket class="title-icon" :size="48" />
        OPAL Deployment Generator
      </h1>
      <p>1-Click Landing Page Assembly</p>
    </header>

    <div class="workflow-input">
      <div class="input-group">
        <label>Atomic Facts (JSON)</label>
        <textarea v-model="atomicFactsJson" placeholder='{"projectName": "Zephyr", "mission": "Sustain speed", "tech": "Rust, Wasm"}'></textarea>
      </div>
      <div class="input-group">
        <label>Labels (Comma separated)</label>
        <input v-model="labelsInput" placeholder="Web3, High Performance, Cloud" />
      </div>
      <button @click="generateDashboard" :disabled="loading" class="generate-btn">
        <Zap v-if="!loading" :size="20" class="btn-icon" />
        <span v-if="loading">Generating...</span>
        <span v-else>Generate Deployment Dashboard</span>
      </button>
    </div>

    <!-- MINT Process Visualization -->
    <div v-if="loading || generated" class="mint-viz">
      <div class="step" :class="{ done: traceStep('synthesis') }">Synthesize Context</div>
      <div class="line"></div>
      <div class="step" :class="{ done: traceStep('media_gen') }">Generate Media</div>
      <div class="line"></div>
      <div class="step" :class="{ done: traceStep('assembly') }">Assemble Code</div>
    </div>

    <!-- Generated Output Preview -->
    <div v-if="generated" class="output-preview">
      <h2>Generated Dashboard Preview</h2>
      <div class="iframe-mockup">
        <div v-html="output.html"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ArrowLeft, Rocket, Zap, Database, Cpu, Layout } from 'lucide-vue-next';

const emit = defineEmits(['nav']);

const atomicFactsJson = ref('{\n  "projectName": "Nimbus Cloud",\n  "tagline": "Serverless at the Edge",\n  "description": "Deploy instances in milliseconds across 50 regions.",\n  "features": ["Global Low Latency", "Instant Scaling", "Pay per Millisecond"]\n}');
const labelsInput = ref('Cloud, Edge Computing, DevOps');
const loading = ref(false);
const generated = ref(false);
const output = ref(null);
const trace = ref([]);

const generateDashboard = async () => {
  try {
    loading.value = true;
    generated.value = false;
    trace.value = [];

    const facts = JSON.parse(atomicFactsJson.value);
    const labels = labelsInput.value.split(',').map(s => s.trim());

    const res = await fetch('/deployment/generate-dashboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atomicFacts: facts, labels })
    });

    const data = await res.json();
    if (data.status === 'success') {
      output.value = data.output;
      trace.value = data.trace;
      generated.value = true;
    }

  } catch (e) {
    console.error(e);
    alert('Generation failed. Check console.');
  } finally {
    loading.value = false;
  }
};

const traceStep = (stepName) => {
  if (!trace.value) return false;
  return trace.value.find(t => t.step === stepName && t.status === 'completed');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Outfit:wght@200;400;600&family=JetBrains+Mono&display=swap');

.deployment-container {
  font-family: 'Outfit', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 40px;
  color: #fff;
  background: #050202;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.deployment-container::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, transparent 70%);
    z-index: 0;
}

header {
    position: relative;
    z-index: 10;
    margin-bottom: 60px;
    text-align: center;
}

header h1 {
  font-family: 'Cinzel', serif;
  background: linear-gradient(to right, #fff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
  letter-spacing: 4px;
}

header p {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 5px;
    color: rgba(255,255,255,0.4);
    font-weight: 200;
}

.back-link {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: 0.3s;
    position: absolute;
    left: 0;
    top: 0;
}

.back-link:hover {
    color: #fff;
    transform: translateX(-5px);
}

.title-icon {
    display: block;
    margin: 0 auto 20px;
    color: #a78bfa;
    filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.5));
}

.workflow-input {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 60px;
  position: relative;
  z-index: 10;
}

.input-group {
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
}

textarea {
  width: 100%;
  height: 150px;
  background: rgba(0,0,0,0.3);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  transition: 0.3s;
}

textarea:focus {
    border-color: #a78bfa;
    outline: none;
    box-shadow: 0 0 20px rgba(167, 139, 250, 0.1);
}

input {
  width: 100%;
  background: rgba(0,0,0,0.3);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px 20px;
  font-size: 14px;
}

button {
  width: 100%;
  background: #fff;
  color: #000;
  border: none;
  padding: 20px;
  border-radius: 15px;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  margin-top: 10px;
}

button:hover { 
    background: #a78bfa; 
    color: #fff;
    box-shadow: 0 10px 40px rgba(167, 139, 250, 0.3);
    transform: translateY(-2px);
}
button:disabled { opacity: 0.3; cursor: not-allowed; }

.generate-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.btn-icon {
    color: #a78bfa;
}

.generate-btn:hover .btn-icon {
    color: #fff;
}

.mint-viz {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60px;
  gap: 15px;
}

.step {
  padding: 10px 25px;
  background: rgba(255,255,255,0.02);
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255,255,255,0.2);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.5s;
}

.step.done {
  background: rgba(167, 139, 250, 0.1);
  color: #a78bfa;
  border-color: rgba(167, 139, 250, 0.4);
  box-shadow: 0 0 20px rgba(167, 139, 250, 0.1);
}

.line {
  width: 40px;
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
}

.output-preview {
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 30px;
  padding: 40px;
  overflow: hidden;
  z-index: 10;
  position: relative;
}

.output-preview h2 {
  font-family: 'Cinzel', serif;
  color: #fff;
  margin-bottom: 30px;
  font-size: 1.2rem;
  letter-spacing: 2px;
}

.iframe-mockup {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  min-height: 400px;
}
</style>
