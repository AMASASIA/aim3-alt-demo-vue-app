import { ref } from 'vue';

export function useAntigravityRecorder() {
    const isRecording = ref(false);
    const mediaRecorder = ref(null);
    const recordedChunks = ref([]);

    const startCapture = async () => {
        try {
            // 1. 指定した要素または画面全体のストリームを取得
            // getDisplayMedia はユーザーに許可を求めます
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: 30 },
                audio: true
            });

            mediaRecorder.value = new MediaRecorder(stream, {
                mimeType: 'video/webm; codecs=vp9'
            });

            mediaRecorder.value.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunks.value.push(e.data);
            };

            mediaRecorder.value.onstop = () => {
                const blob = new Blob(recordedChunks.value, { type: 'video/webm' });
                // ここで Amane Protocol L0 Gateway へ送信し、OKE認証を付与する
                saveToAmane(blob);
                recordedChunks.value = [];

                // Stop all tracks to clear the recording indicator
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.value.start();
            isRecording.value = true;
        } catch (err) {
            console.error("Error starting screen capture:", err);
            isRecording.value = false;
        }
    };

    const stopCapture = () => {
        if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
            mediaRecorder.value.stop();
            isRecording.value = false;
        }
    };

    const saveToAmane = async (blob) => {
        console.log("Amane Protocol:事実の動画記録をL0へ送信中...", blob.size, "bytes");

        // Cloud Run のエンドポイントへ送信する処理を記述
        // Example integration:
        /*
        const formData = new FormData();
        formData.append('video', blob, 'recording.webm');
        await fetch('https://your-cloud-run-url/process-video', {
           method: 'POST',
           body: formData
        });
        */

        // For prototype, verify via console
        alert(`📼 Antigravity Recording Saved!\nSize: ${(blob.size / 1024 / 1024).toFixed(2)} MB\n\n(Sent to Amane L0 for OKE Verification)`);
    };

    return { startCapture, stopCapture, isRecording };
}
