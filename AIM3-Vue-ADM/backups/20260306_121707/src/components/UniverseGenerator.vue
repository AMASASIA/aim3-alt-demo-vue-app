<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';

const canvasEl = ref(null);
const abstraction = ref(0.6);
const isAudioActive = ref(false);
const isEvolving = ref(false);
const fitnessScore = ref(0.0);
const audioLevel = ref(0.0);
const statusText = ref('Original Logic Fixed');

const physics = reactive({
  G: 1.0, C: 1.0, H: 1.0,
  gravity: -0.32, purity: 0.8,
  aim: 0.5, symmetry: 6.0, soul: 0.5
});

let useGPU = false;
let gpuDevice, gpuContext, gpuPipeline, gpuUniformBuf, gpuBindGroup, gpuTexture, gpuSampler;
let sourceImage = null;
let audioCtx = null, analyser = null;
const freqData = new Uint8Array(256);
let audioBass = 0, audioMid = 0, audioHigh = 0;
let animId = 0, evoInterval = 0;

const WGSL = `
struct Uniforms {
  resolution: vec2<f32>, time: f32, gravity: f32,
  purity: f32, soul: f32, aim: f32, symmetry: f32,
  abstraction: f32, audio: f32, G: f32, C: f32,
  H: f32, bass: f32, mid_b: f32, high_b: f32
};
@group(0) @binding(0) var<uniform> U: Uniforms;
@group(0) @binding(1) var tex: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4<f32> {
  var p = array<vec2<f32>,3>(vec2(-1.0,-1.0),vec2(3.0,-1.0),vec2(-1.0,3.0));
  return vec4<f32>(p[i], 0.0, 1.0);
}
fn rot(a:f32)->mat2x2<f32>{return mat2x2<f32>(cos(a),-sin(a),sin(a),cos(a));}

@fragment fn fs(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {
  var uv = pos.xy / U.resolution;
  var p2 = uv * 2.0 - 1.0;
  
  // RIPPLE: 432Hz Sacred Frequency Simulation
  let r = length(p2);
  let time = U.time * 0.5;
  let ripple = sin(r * 28.0 - time * 6.0 + U.audio * 4.0) * 0.04;
  p2 += (p2 / (r + 0.01)) * ripple; // Liquid displacement
  
  var a = atan2(p2.y, p2.x);
  let sym = U.symmetry + U.bass * 8.0;
  let sl = 6.2831853 / sym;
  a = abs(a - floor(a/sl)*sl - sl*0.5);
  var k = vec2<f32>(cos(a),sin(a)) * length(p2);
  
  let base = textureSample(tex, samp, vec2f(uv.x, 1.0-uv.y));
  let kale = textureSample(tex, samp, k*0.5+0.5);
  var col: f32 = 0.0;
  var q = k;
  let energy = U.aim * pow(U.C, 2.0);
  let cx = 1.0 + U.mid_b * 4.0;
  
  // CYMATIC INTERFERENCE
  for(var i:f32=1.0; i<4.0; i+=1.0){
    q = rot(time*0.1 + i) * q * (1.5 + energy);
    q = abs(q) - 0.5;
    let d = length(q);
    let pu = pow(U.purity, 2.5);
    // 432Hz wave harmonics
    let fi = sin(d * U.H * 14.0 * cx + time * 3.0 + U.audio * 8.0);
    col += (0.003 * U.G) / abs(fi / (10.0 * pu));
  }
  
  let aquaticGlow = vec3f(0.85, 0.92, 1.0) * col;
  let out = base.rgb + (kale.rgb - base.rgb)*U.abstraction + aquaticGlow*U.abstraction;
  return vec4<f32>(out, 1.0);
}
`;

async function initWebGPU() {
  if (!navigator.gpu) return false;
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return false;
    gpuDevice = await adapter.requestDevice();
    const c = canvasEl.value;
    gpuContext = c.getContext('webgpu');
    if (!gpuContext) return false;
    const fmt = navigator.gpu.getPreferredCanvasFormat();
    gpuContext.configure({ device: gpuDevice, format: fmt, alphaMode: 'opaque' });
    const mod = gpuDevice.createShaderModule({ code: WGSL });
    gpuPipeline = gpuDevice.createRenderPipeline({
      layout: 'auto',
      vertex: { module: mod, entryPoint: 'vs' },
      fragment: { module: mod, entryPoint: 'fs', targets: [{ format: fmt }] },
      primitive: { topology: 'triangle-list' }
    });
    gpuUniformBuf = gpuDevice.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    gpuSampler = gpuDevice.createSampler({ magFilter: 'linear', minFilter: 'linear' });
    const dummy = await createImageBitmap(new ImageData(2, 2));
    await loadGPUTexture(dummy);
    return true;
  } catch (e) { return false; }
}

async function loadGPUTexture(bitmap) {
  if (gpuTexture) gpuTexture.destroy();
  gpuTexture = gpuDevice.createTexture({
    size: [bitmap.width, bitmap.height, 1], format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
  });
  gpuDevice.queue.copyExternalImageToTexture({ source: bitmap }, { texture: gpuTexture }, [bitmap.width, bitmap.height]);
  gpuBindGroup = gpuDevice.createBindGroup({
    layout: gpuPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: gpuUniformBuf } },
      { binding: 1, resource: gpuTexture.createView() },
      { binding: 2, resource: gpuSampler }
    ]
  });
}

const uniArr = new Float32Array(16);
function render(t) {
  if (isAudioActive.value && analyser) {
    analyser.getByteFrequencyData(freqData);
    audioBass = freqData[10]/255; audioMid = freqData[50]/255; audioHigh = freqData[150]/255;
    audioLevel.value = (audioBass + audioMid + audioHigh) / 3;
  }
  
  if (useGPU && gpuBindGroup) {
    uniArr[0]=280; uniArr[1]=280; uniArr[2]=t/1000;
    uniArr[3]=physics.gravity; uniArr[4]=physics.purity; uniArr[5]=physics.soul;
    uniArr[6]=physics.aim; uniArr[7]=physics.symmetry; uniArr[8]=abstraction.value;
    uniArr[9]=audioLevel.value; uniArr[10]=physics.G; uniArr[11]=physics.C;
    uniArr[12]=physics.H; uniArr[13]=audioBass; uniArr[14]=audioMid; uniArr[15]=audioHigh;
    gpuDevice.queue.writeBuffer(gpuUniformBuf, 0, uniArr);
    const enc = gpuDevice.createCommandEncoder();
    const pass = enc.beginRenderPass({ colorAttachments: [{
      view: gpuContext.getCurrentTexture().createView(),
      clearValue: { r:0, g:0, b:0, a:1 }, loadOp:'clear', storeOp:'store'
    }]});
    pass.setPipeline(gpuPipeline); pass.setBindGroup(0, gpuBindGroup); pass.draw(3); pass.end();
    gpuDevice.queue.submit([enc.finish()]);
  } else if (canvasEl.value) {
    const ctx = canvasEl.value.getContext('2d');
    const time = t/1000;
    ctx.fillStyle = '#000'; ctx.fillRect(0,0,280,280);
    const sym = Math.max(3, Math.round(physics.symmetry + audioBass * 8));
    const slice = Math.PI*2/sym;
    ctx.save(); ctx.translate(140,140); ctx.rotate(time*physics.gravity*0.2);
    for(let i=0; i<sym; i++) {
        ctx.rotate(slice); ctx.save(); if(i%2) ctx.scale(1,-1);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,200,-slice/2,slice/2); ctx.clip();
        if(sourceImage) ctx.drawImage(sourceImage, -140,-140,280,280);
        ctx.restore();
    }
    ctx.restore();
  }
  animId = requestAnimationFrame(render);
}

defineExpose({
  injectImage: async (file) => { sourceImage = await createImageBitmap(file); if (useGPU) await loadGPUTexture(sourceImage); },
  toggleAudio: () => {
    if (isAudioActive.value) { isAudioActive.value = false; if (audioCtx) audioCtx.close(); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      audioCtx = new AudioContext(); analyser = audioCtx.createAnalyser();
      audioCtx.createMediaStreamSource(stream).connect(analyser); isAudioActive.value = true;
    });
  },
  toggleEvolution: () => {
    isEvolving.value = !isEvolving.value;
    if (isEvolving.value) evoInterval = setInterval(() => {
        physics.symmetry = 4 + Math.random()*12;
        fitnessScore.value = 50 + Math.random()*50;
    }, 2000);
    else clearInterval(evoInterval);
  },
  setAbstraction: (v) => abstraction.value = v,
  exportDataURL: () => canvasEl.value?.toDataURL('image/png') || '',
  getPhysics: () => ({ ...physics, fitness: fitnessScore.value, abstraction: abstraction.value }),
  statusText, fitnessScore, isEvolving
});

onMounted(async () => {
  useGPU = await initWebGPU();
  render(0);
});

onBeforeUnmount(() => { cancelAnimationFrame(animId); clearInterval(evoInterval); });
</script>

<template>
  <canvas ref="canvasEl" width="280" height="280" class="universe-canvas"></canvas>
</template>

<style scoped>
.universe-canvas { width: 280px; height: 280px; background: #000; border-radius: 4px; }
</style>
