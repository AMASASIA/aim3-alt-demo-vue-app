import { ref } from 'vue';
import { audioStorageService } from '../services/audioStorageService';

export function useAmasAudioRecorder() {
    const isRecording = ref(false);
    const mediaRecorder = ref(null);
    const audioChunks = ref([]);
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

    const lastAudioUrl = ref(null);
    const lastAudioBlob = ref(null);
    const lastAudioId = ref(null);
    const isUploading = ref(false);

    // --- 🛡️ Protective Monitoring (Mimamori) & Local Buffer ---
    const audioCtx = ref(null);
    const analyser = ref(null);
    const silenceStartTime = ref(null);
    const silenceLimit = 15000; // Increased to 15s to be more patient during thought
    const sessionLimit = 60000; // 60 Seconds: The 'Small Step' Success Habit
    const sessionStartTime = ref(null);
    let monitorId = null;

    const startRecording = async () => {
        try {
            console.log("[Tive◎AI] 🎤 Initializing Resilient Local Recording...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Prefer high-compression codecs to save bandwidth on batch upload
            const options = { mimeType: 'audio/webm;codecs=opus' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/mp4';
            }

            // 🧠 Intelligent Sensory Layer (Local Volume Monitoring)
            audioCtx.value = new (window.AudioContext || window.webkitAudioContext)();
            analyser.value = audioCtx.value.createAnalyser();
            const source = audioCtx.value.createMediaStreamSource(stream);
            source.connect(analyser.value);
            analyser.value.fftSize = 256;

            const dataArray = new Uint8Array(analyser.value.frequencyBinCount);
            silenceStartTime.value = null;
            sessionStartTime.value = Date.now();

            const runMimamori = () => {
                if (!isRecording.value) return;

                analyser.value.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                const volume = sum / dataArray.length;

                // Detect No Intent (Silence Protection)
                if (volume < 4) {
                    if (!silenceStartTime.value) silenceStartTime.value = Date.now();
                    else if (Date.now() - silenceStartTime.value > silenceLimit) {
                        console.log("[Tive◎AI] 🍃 Silence auto-stop (Mimamori Mode)");
                        stopRecording();
                        return;
                    }
                } else {
                    silenceStartTime.value = null;
                }

                // Hard Limit (Prevention of accidental long recording)
                if (Date.now() - sessionStartTime.value > sessionLimit) {
                    console.log("[Tive◎AI] ⏲️ Protection limit reached.");
                    stopRecording();
                    return;
                }

                monitorId = requestAnimationFrame(runMimamori);
            };

            mediaRecorder.value = new MediaRecorder(stream, options);
            audioChunks.value = [];

            mediaRecorder.value.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunks.value.push(e.data);
            };

            mediaRecorder.value.start(1000); // 1s slice chunks for safety
            isRecording.value = true;
            runMimamori();
            console.log("[Tive◎AI] ✅ Shield Active. Recording to Local Buffer.");

        } catch (err) {
            console.error("[Tive◎AI] Hardware access failed:", err);
            throw err;
        }
    };

    const stopRecording = () => {
        return new Promise((resolve) => {
            if (monitorId) cancelAnimationFrame(monitorId);

            if (!mediaRecorder.value || mediaRecorder.value.state === 'inactive') {
                resolve(null);
                return;
            }

            mediaRecorder.value.onstop = async () => {
                console.log("[Tive◎AI] 📦 Packaging Local Recording for Batch Processing...");
                const audioBlob = new Blob(audioChunks.value, { type: mediaRecorder.value.mimeType });
                lastAudioBlob.value = audioBlob;
                lastAudioUrl.value = URL.createObjectURL(audioBlob);

                // Close Hardware Interface Immediately
                if (audioCtx.value) {
                    audioCtx.value.close();
                    audioCtx.value = null;
                }
                mediaRecorder.value.stream.getTracks().forEach(t => t.stop());
                isRecording.value = false;

                // Step 1: Secure Local Persistence (IndexedDB)
                const id = `atomic-voice-${Date.now()}`;
                try {
                    await audioStorageService.saveAudio(id, audioBlob);
                    lastAudioId.value = id;
                } catch (e) { console.warn("[Tive◎AI] Storage fail:", e); }

                // Step 2: Background Batch Upload (Non-blocking)
                isUploading.value = true;
                try {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64data = reader.result;
                        const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                audioBase64: base64data,
                                mimeType: mediaRecorder.value.mimeType,
                                metadata: { duration: (Date.now() - sessionStartTime.value) / 1000 }
                            })
                        });
                        const data = await response.json();
                        isUploading.value = false;
                        resolve(data.transcript);
                    };
                    reader.readAsDataURL(audioBlob);
                } catch (e) {
                    console.error("[Tive◎AI] Batch dispatch failed:", e);
                    isUploading.value = false;
                    resolve(null);
                }
            };

            mediaRecorder.value.stop();
        });
    };

    return {
        isRecording,
        isUploading,
        lastAudioUrl,
        lastAudioBlob,
        lastAudioId,
        startRecording,
        stopRecording
    };
}
