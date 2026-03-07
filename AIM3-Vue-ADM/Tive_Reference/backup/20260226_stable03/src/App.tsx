/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Settings, History, MapPin, CircleDot, MessageSquare } from 'lucide-react';
import { TiveButton } from './components/TiveButton';
import { ResultScreen } from './components/ResultScreen';
import { TiveState, getAI, SYSTEM_INSTRUCTION } from './lib/gemini';
import { getUsageCount, incrementUsageCount, cn } from './lib/utils';
import { LiveServerMessage, Modality } from "@google/genai";

export default function App() {
  const [state, setState] = useState<TiveState>('idle');
  const [usageCount, setUsageCount] = useState(0);
  const [transcript, setTranscript] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedModel, setSelectedModel] = useState<'Claude' | 'Gemini' | 'ChatGPT'>('ChatGPT');
  const [history, setHistory] = useState<{ role: 'user' | 'aura', text: string }[]>([]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueue = useRef<Int16Array[]>([]);
  const isPlaying = useRef(false);

  useEffect(() => {
    setUsageCount(getUsageCount());
    return () => {
      stopAudioInput();
      playbackContextRef.current?.close();
    };
  }, []);

  const startLiveSession = async () => {
    try {
      setShowResult(false);
      setState('listening');
      const ai = getAI();
      
      // Initialize playback context
      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
        nextStartTimeRef.current = 0;
      }

      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }, { googleMaps: {} }],
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log("Session opened");
            setupAudioInput(session);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn) {
              const part = message.serverContent.modelTurn.parts[0];
              
              // Handle transcription
              if (message.serverContent.modelTurn.parts.some(p => p.text)) {
                const text = message.serverContent.modelTurn.parts.find(p => p.text)?.text;
                if (text) {
                  setHistory(prev => [...prev, { role: 'aura', text }]);
                }
              }

              if (part?.inlineData?.data) {
                const base64Audio = part.inlineData.data;
                const binaryString = atob(base64Audio);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const pcmData = new Int16Array(bytes.buffer);
                schedulePlayback(pcmData);
              }
            }

            if (message.serverContent?.interrupted) {
              stopPlayback();
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setState('error');
          },
          onclose: () => {
            console.log("Session closed");
            stopAudioInput();
            stopPlayback();
            setState('idle');
          }
        }
      });

      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to start session:", error);
      setState('error');
    }
  };

  const schedulePlayback = (chunk: Int16Array) => {
    const ctx = playbackContextRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const buffer = ctx.createBuffer(1, chunk.length, 24000);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < chunk.length; i++) {
      data[i] = chunk[i] / 32768;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;

    if (!isPlaying.current) {
      isPlaying.current = true;
      setState('speaking');
    }

    source.onended = () => {
      if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
        isPlaying.current = false;
        setState('idle');
      }
    };
  };

  const stopPlayback = () => {
    audioQueue.current = [];
    isPlaying.current = false;
    nextStartTimeRef.current = 0;
    // We don't close the context here to allow reuse, but we could suspend it
  };

  const setupAudioInput = async (session: any) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

    processorRef.current.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      session.sendRealtimeInput({
        media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    sourceRef.current.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
  };

  const stopAudioInput = () => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();
    processorRef.current = null;
    sourceRef.current = null;
    audioContextRef.current = null;
  };

  const handleToggle = () => {
    if (state === 'idle' || state === 'error') {
      startLiveSession();
      const newCount = incrementUsageCount();
      setUsageCount(newCount);
    } else {
      // Robust closure
      if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
      }
      stopAudioInput();
      stopPlayback();
      setState('idle');

      // Trigger transition to ResultScreen after 1.5 seconds
      setTimeout(() => {
        setShowResult(true);
      }, 1500);
    }
  };

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-white/20 overflow-hidden flex flex-col transition-colors duration-500",
      theme === 'dark' ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <motion.div 
            animate={{ 
              scale: state !== 'idle' ? [1, 1.5, 1] : [1, 1.2, 1],
              opacity: state !== 'idle' ? [0.5, 1, 0.5] : 0.5
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn("w-2 h-2 rounded-full", theme === 'dark' ? "bg-white" : "bg-black")} 
          />
          <span className="text-xs uppercase tracking-[0.3em] font-medium opacity-50">Tive AI</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <History size={20} className="opacity-60" />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <Settings size={20} className="opacity-60" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-6">
        <AnimatePresence>
          {!showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
                Ask Me Anythings
              </h1>
              <p className="text-sm md:text-base opacity-40 max-w-md mx-auto leading-relaxed">
                Tap the Tive to start a communicate. I can discovery the web, find places, or save your Memo and Notebook.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <TiveButton 
          state={state} 
          usageCount={usageCount} 
          onClick={handleToggle} 
          theme={theme}
        />

        {/* Status Indicators */}
        <div className="mt-12 flex gap-8 opacity-30">
          <div className="flex items-center gap-2">
            <CircleDot size={14} />
            <span className="text-[10px] uppercase tracking-widest">Discovery</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span className="text-[10px] uppercase tracking-widest">AI Map</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare size={14} />
            <span className="text-[10px] uppercase tracking-widest">Memos</span>
          </div>
        </div>
      </main>

      {/* History Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className={cn(
              "fixed inset-0 z-50 p-8 overflow-y-auto backdrop-blur-xl",
              theme === 'dark' ? "bg-black/90" : "bg-white/90"
            )}
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-light">Recent Interactions</h2>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-sm uppercase tracking-widest opacity-50 hover:opacity-100"
                >
                  Close
                </button>
              </div>
              
              <div className="space-y-8">
                {history.length === 0 ? (
                  <p className="opacity-30 italic">No history yet. Start a conversation!</p>
                ) : (
                  history.map((item, i) => (
                    <div key={i} className={cn(
                      "flex flex-col gap-2",
                      item.role === 'user' ? "items-end" : "items-start"
                    )}>
                      <span className="text-[10px] uppercase tracking-widest opacity-30">
                        {item.role}
                      </span>
                      <div className={cn(
                        "p-4 rounded-2xl max-w-[80%]",
                        item.role === 'user' 
                          ? (theme === 'dark' ? "bg-white/10" : "bg-black/10") 
                          : (theme === 'dark' ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10")
                      )}>
                        {item.text}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className={cn(
              "fixed inset-0 z-50 p-8 overflow-y-auto backdrop-blur-xl",
              theme === 'dark' ? "bg-black/90" : "bg-white/90"
            )}
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-light">Settings</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-sm uppercase tracking-widest opacity-50 hover:opacity-100"
                >
                  Close
                </button>
              </div>
              
              <div className="space-y-12">
                <section>
                  <h3 className="text-xs uppercase tracking-[0.3em] opacity-30 mb-6">Appearance</h3>
                  <div className="flex items-center justify-between p-6 rounded-2xl border border-current opacity-20 hover:opacity-100 transition-opacity">
                    <span className="text-lg font-light">Theme</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all",
                          theme === 'dark' ? "bg-white text-black" : "border border-black/20"
                        )}
                      >
                        Dark
                      </button>
                      <button 
                        onClick={() => setTheme('light')}
                        className={cn(
                          "px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all",
                          theme === 'light' ? "bg-black text-white" : "border border-white/20"
                        )}
                      >
                        Light
                      </button>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs uppercase tracking-[0.3em] opacity-30 mb-6">Model Selection</h3>
                  <div className="flex flex-col gap-2">
                    {(['Claude', 'Gemini', 'ChatGPT'] as const).map((model) => (
                      <button
                        key={model}
                        onClick={() => setSelectedModel(model)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all",
                          selectedModel === model 
                            ? (theme === 'dark' ? "bg-white text-black border-white" : "bg-black text-white border-black")
                            : (theme === 'dark' ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5")
                        )}
                      >
                        <span className="text-sm font-medium">{model}</span>
                        {selectedModel === model && <CircleDot size={14} />}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xs uppercase tracking-[0.3em] opacity-30 mb-6">About</h3>
                  <p className="text-sm opacity-50 leading-relaxed">
                    Tive AI is an experimental voice-first interface designed to evolve with your interactions. 
                    It uses advanced generative models to discovery the web and manage your personal memo.
                  </p>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Usage Info */}
      <footer className="p-8 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className={cn("h-[1px] w-12 mb-2", theme === 'dark' ? "bg-white/20" : "bg-black/20")} />
          <span className="text-[10px] uppercase tracking-[0.4em] opacity-30">
            Evolution Level: {Math.floor(usageCount / 10)}
          </span>
        </div>
      </footer>

      {/* Result Screen Overlay */}
      <AnimatePresence>
        {showResult && (
          <ResultScreen 
            theme={theme} 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onClose={() => setShowResult(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
