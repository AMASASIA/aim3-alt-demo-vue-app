import { ref } from 'vue';
import { learningService } from '../services/learningService';

let audioCtx: AudioContext | null = null;
const activeSources = new Set<AudioBufferSourceNode | OscillatorNode>();
let nextStartTime = 0;

const getAudioCtx = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
};

export const useAmasAudio = () => {
    // Shared Volume Multiplier from Neural Learning
    const getClampedVol = (base: number) => base * learningService.getVolumeMultiplier();

    const stopAll = () => {
        activeSources.forEach(source => {
            try { source.stop(); } catch (e) { }
        });
        activeSources.clear();
        nextStartTime = 0;
    };

    const registerSource = (source: AudioBufferSourceNode | OscillatorNode) => {
        activeSources.add(source);
        source.onended = () => {
            activeSources.delete(source);
        };
    };

    const playChunk = async (audioData: ArrayBuffer) => {
        const ctx = getAudioCtx();
        if (ctx.state === 'suspended') await ctx.resume();

        try {
            const buffer = await ctx.decodeAudioData(audioData);
            const source = ctx.createBufferSource();
            const gainNode = ctx.createGain();

            source.buffer = buffer;
            gainNode.gain.setValueAtTime(getClampedVol(1.0), ctx.currentTime);

            source.connect(gainNode).connect(ctx.destination);

            // Scheduling logic
            const now = ctx.currentTime;
            if (nextStartTime < now) {
                nextStartTime = now + 0.05;
            }

            source.start(nextStartTime);
            registerSource(source);

            nextStartTime += buffer.duration;
        } catch (e) {
            console.error("Audio chunk decode error:", e);
        }
    };

    const playSanctuaryBell = () => {
        const ctx = getAudioCtx();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const vol = getClampedVol(0.12);

        oscillator.frequency.setValueAtTime(2637.02, ctx.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.1); // Gentler ramp
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.5);

        oscillator.connect(gainNode).connect(ctx.destination);
        if (ctx.state === 'suspended') ctx.resume();

        registerSource(oscillator);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 4.0);
    };

    const playSemanticTone = (type: 'task' | 'reflection' | 'success' | 'error') => {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const vol = getClampedVol(0.1);

        switch (type) {
            case 'task':
                osc.frequency.setValueAtTime(1760, ctx.currentTime);
                osc.type = 'sine';
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
                break;
            case 'reflection':
                osc.frequency.setValueAtTime(329.63, ctx.currentTime);
                osc.type = 'sine';
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(vol * 1.5, ctx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
                break;
            case 'success':
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
                osc.type = 'sine';
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
                break;
            case 'error':
                osc.frequency.setValueAtTime(150, ctx.currentTime);
                osc.type = 'triangle';
                gain.gain.setValueAtTime(0, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.05);
                gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                break;
        }

        osc.connect(gain).connect(ctx.destination);
        if (ctx.state === 'suspended') ctx.resume();

        registerSource(osc);
        osc.start();
        osc.stop(ctx.currentTime + 2.0);
    };

    return { playSanctuaryBell, playSemanticTone, playChunk, stopAll };
};
