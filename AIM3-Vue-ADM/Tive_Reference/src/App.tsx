/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Settings, History, MapPin, CircleDot, MessageSquare, Plus, BookOpen, ArrowUp, Trash2, Square, Key, CreditCard, Check, Map, StickyNote } from 'lucide-react';
import { TiveButton } from './components/TiveButton';
import { ResultScreen } from './components/ResultScreen';
import { ChatScreen } from './components/ChatScreen';
import { TiveState, getAI, SYSTEM_INSTRUCTION, TIVE_SYSTEM_INSTRUCTION, OMOTENASHI_CONCIERGE_INSTRUCTION } from './lib/gemini';
import { getUsageCount, incrementUsageCount, cn } from './lib/utils';
import { Language, translations, languages } from './lib/i18n';
import { LiveServerMessage, Modality } from "@google/genai";
import { Sun, Moon, Globe } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<TiveState>('idle');
  const [usageCount, setUsageCount] = useState(0);
  const [transcript, setTranscript] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [voiceInsight, setVoiceInsight] = useState<string>("");
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'history' | 'notebook' | 'settings' | 'result' | 'chat'>('none');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<Language>('ja');
  const [selectedModel, setSelectedModel] = useState<'Claude' | 'Gemini' | 'ChatGPT' | 'Tive'>('Tive');
  const [isOmotenashiMode, setIsOmotenashiMode] = useState(false);
  const [isProcessingOmotenashi, setIsProcessingOmotenashi] = useState(false);
  const [history, setHistory] = useState<{ role: 'user' | 'aura', text: string }[]>([]);
  const [mainPrompt, setMainPrompt] = useState("");
  const [notebookEntries, setNotebookEntries] = useState<any[]>([]);

  const t = translations[language];

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isPlaying = useRef(false);

  useEffect(() => {
    setUsageCount(getUsageCount());
    loadNotebook();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Support both Ctrl+A and Cmd+A for cross-platform consistency
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveOverlay('chat');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopAudioInput();
      stopPlayback();
      playbackContextRef.current?.close();
    };
  }, []);

  const loadNotebook = () => {
    try {
      const entries = JSON.parse(localStorage.getItem('tive_notebook') || '[]');
      setNotebookEntries(entries);
    } catch (e) {
      console.error("Failed to load notebook", e);
      setNotebookEntries([]);
    }
  };

  const handleMainPromptSubmit = () => {
    if (!mainPrompt.trim()) return;
    
    // Check for @amas trigger
    if (mainPrompt.toLowerCase().includes('@amas')) {
      setActiveOverlay('chat');
      setMainPrompt("");
      return;
    }

    // Otherwise, add to history and clear
    setHistory(prev => [...prev, { role: 'user', text: mainPrompt }]);
    setMainPrompt("");
    // In a real app, this would trigger an AI response
    setState('thinking');
    setTimeout(() => {
      setState('idle');
      setActiveOverlay('result');
    }, 1500);
  };

  const handleMainPromptChange = (val: string) => {
    setMainPrompt(val);
  };

  const deleteNotebookEntry = (id: number) => {
    const updated = notebookEntries.filter((entry: any) => entry.id !== id);
    localStorage.setItem('tive_notebook', JSON.stringify(updated));
    setNotebookEntries(updated);
  };

  const clearAllNotebook = () => {
    if (confirm('Clear all entries?')) {
      localStorage.setItem('tive_notebook', '[]');
      setNotebookEntries([]);
    }
  };

  const startLiveSession = async () => {
    try {
      // 1. Immediate UI feedback
      setActiveOverlay('none');
      setState('listening');
      
      // 2. Start audio input immediately (don't wait for session)
      const audioInputPromise = setupAudioInput();

      // 3. Initialize playback context in parallel
      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
        nextStartTimeRef.current = 0;
      } else if (playbackContextRef.current.state === 'suspended') {
        playbackContextRef.current.resume();
      }

      // 4. Start AI session in parallel
      const ai = getAI();
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: isOmotenashiMode 
            ? OMOTENASHI_CONCIERGE_INSTRUCTION 
            : (selectedModel === 'Tive' ? TIVE_SYSTEM_INSTRUCTION : SYSTEM_INSTRUCTION),
          tools: [{ googleSearch: {} }, { googleMaps: {} }],
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            console.log("Session opened");
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn) {
              const part = message.serverContent.modelTurn.parts[0];
              
              // Handle transcription
              if (message.serverContent.modelTurn.parts.some(p => p.text)) {
                const text = message.serverContent.modelTurn.parts.find(p => p.text)?.text;
                if (text) {
                  setHistory(prev => [...prev, { role: 'aura', text }]);
                  setAiResponse(text);
                  setVoiceInsight(text);
                  
                  // Trigger Omotenashi Mode
                  if (/おもてなし|omotenashi/i.test(text)) {
                    setIsOmotenashiMode(true);
                  }
                  
                  // Trigger ChatScreen if "AMAS" is detected in voice
                  const amasPattern = /amas|アマス|あます|アマスる/i;
                  if (amasPattern.test(text)) {
                    setActiveOverlay('chat');
                    if (sessionRef.current) sessionRef.current.close();
                  }
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
      
      // Wait for audio input to be ready if it's not yet
      await audioInputPromise;
      
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
    
    activeSourcesRef.current.push(source);

    if (!isPlaying.current) {
      isPlaying.current = true;
      setState('speaking');
    }

    source.onended = () => {
      // Remove from active sources
      activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      
      if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
        isPlaying.current = false;
        setState('idle');
      }
    };
  };

  const stopPlayback = () => {
    // Stop all active sources
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might have already stopped
      }
    });
    activeSourcesRef.current = [];
    isPlaying.current = false;
    nextStartTimeRef.current = 0;
  };

  const setupAudioInput = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

    processorRef.current.onaudioprocess = (e) => {
      if (!sessionRef.current) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      sessionRef.current.sendRealtimeInput({
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

  const startWebSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ja' ? 'ja-JP' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState('listening');
    };

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setVoiceInsight(text);
      
      // Call AI
      await handleOmotenashiAI(text);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      setState('error');
    };

    recognition.onend = () => {
      if (!isProcessingOmotenashi) {
        setState('idle');
      }
    };

    recognition.start();
  };

  const handleOmotenashiAI = async (text: string) => {
    setIsProcessingOmotenashi(true);
    setState('thinking');
    
    try {
      const ai = getAI();
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: text,
        config: {
          systemInstruction: OMOTENASHI_CONCIERGE_INSTRUCTION,
        }
      });
      
      const response = await model;
      const aiText = response.text || "";
      
      setAiResponse(aiText);
      setHistory(prev => [...prev, { role: 'user', text }, { role: 'aura', text: aiText }]);
      
      // Trigger result screen
      setActiveOverlay('result');
      setState('idle');
    } catch (error) {
      console.error("Omotenashi AI Error:", error);
      setState('error');
    } finally {
      setIsProcessingOmotenashi(false);
    }
  };

  const handleToggle = () => {
    if (isOmotenashiMode) {
      startWebSpeechRecognition();
      return;
    }
    
    if (state === 'idle' || state === 'error') {
      startLiveSession();
      const newCount = incrementUsageCount();
      setUsageCount(newCount);
    } else {
      // Robust closure - stop everything twice as requested
      const cleanup = () => {
        if (sessionRef.current) {
          sessionRef.current.close();
          sessionRef.current = null;
        }
        stopAudioInput();
        stopPlayback();
        setState('idle');
      };

      cleanup();
      // Second call for extra robustness as requested
      setTimeout(cleanup, 50);

      // Trigger transition to ResultScreen with minimal delay for responsiveness
      setTimeout(() => {
        setActiveOverlay('result');
      }, 100);
    }
  };

  return (
    <div id="app-root" className={cn(
      "min-h-screen font-sans selection:bg-white/20 overflow-hidden flex flex-col transition-colors duration-500 select-none",
      theme === 'dark' ? "bg-black text-white" : "bg-white text-black"
    )}>
      {/* Header */}
      <header id="main-header" className="p-6 flex justify-between items-center z-10">
        <div id="brand-container" className="flex items-center gap-2">
          <motion.div 
            id="status-indicator"
            animate={{ 
              scale: state !== 'idle' ? [1, 1.5, 1] : [1, 1.2, 1],
              opacity: state !== 'idle' ? [0.5, 1, 0.5] : 0.5
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn("w-2 h-2 rounded-full", theme === 'dark' ? "bg-white" : "bg-black")} 
          />
          <span id="brand-name" className="text-xs uppercase tracking-[0.3em] font-medium opacity-50">Tive◎AI</span>
        </div>
        <div id="header-actions" className="flex gap-4">
          <button 
            id="btn-history"
            onClick={() => setActiveOverlay('history')}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <History size={20} className="opacity-60" />
          </button>
          <button 
            id="btn-notebook"
            onClick={() => {
              loadNotebook();
              setActiveOverlay('notebook');
            }}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <BookOpen size={20} className="opacity-60" />
          </button>
          <button 
            id="btn-theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            {theme === 'dark' ? <Sun size={20} className="opacity-60" /> : <Moon size={20} className="opacity-60" />}
          </button>
          <button 
            id="btn-settings"
            onClick={() => setActiveOverlay('settings')}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <Settings size={20} className="opacity-60" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center relative px-6 pb-32">
        <AnimatePresence>
          {activeOverlay === 'none' && (
            <motion.div
              id="idle-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-12"
            >
              <div id="hero-text" className="text-center space-y-4">
                <motion.h1 
                  id="main-title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-5xl font-extralight tracking-tighter"
                >
                  {t.title}
                </motion.h1>
                <p id="main-subtitle" className="text-sm opacity-40 max-w-xs mx-auto leading-relaxed font-light">
                  {t.subtitle}
                </p>
              </div>

              <TiveButton 
                id="main-record-button"
                state={state} 
                usageCount={usageCount} 
                onClick={handleToggle}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Main Screen Input Bar - Fixed at bottom */}
      <div id="bottom-input-container" className="fixed bottom-0 left-0 right-0 p-8 z-20 pointer-events-none">
        <div id="input-bar-wrapper" className="max-w-lg mx-auto pointer-events-auto">
          <div id="input-bar" className={cn(
            "flex items-center gap-3 p-2 pl-4 rounded-full border transition-all shadow-lg backdrop-blur-md",
            theme === 'dark' ? "bg-zinc-900/80 border-zinc-800" : "bg-white/80 border-zinc-200"
          )}>
            <button id="btn-input-plus" className="p-2 hover:bg-current/10 rounded-full transition-colors">
              <Plus size={20} className="opacity-60" />
            </button>
            
            <input 
              id="main-input-field"
              type="text" 
              value={mainPrompt}
              onChange={(e) => handleMainPromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleMainPromptSubmit();
                }
              }}
              placeholder={t.promptPlaceholder} 
              className="flex-1 bg-transparent border-none outline-none text-sm py-2"
            />

            <div id="input-actions" className="flex items-center gap-1 pr-1">
              {mainPrompt.trim() ? (
                <button 
                  id="btn-send-prompt"
                  onClick={handleMainPromptSubmit}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    theme === 'dark' ? "bg-white text-black" : "bg-black text-white"
                  )}
                >
                  <ArrowUp size={18} />
                </button>
              ) : (
                <button id="btn-input-mic" className="p-2 hover:bg-current/10 rounded-full transition-colors">
                  <Mic size={20} className="opacity-60" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Overlay */}
      <AnimatePresence>
        {activeOverlay === 'history' && (
          <motion.div
            id="overlay-history"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className={cn(
              "fixed inset-0 z-[80] p-8 overflow-y-auto backdrop-blur-xl",
              theme === 'dark' ? "bg-black" : "bg-white"
            )}
          >
            <div id="history-container" className="max-w-2xl mx-auto">
              <div id="history-header" className="flex justify-between items-center mb-12">
                <h2 id="history-title" className="text-2xl font-light">{t.history}</h2>
                <button 
                  id="btn-close-history"
                  onClick={() => setActiveOverlay('none')}
                  className="text-sm uppercase tracking-widest opacity-50 hover:opacity-100"
                >
                  {t.close}
                </button>
              </div>
              
              <div id="history-list" className="space-y-8">
                {history.length === 0 ? (
                  <p id="no-history-msg" className="opacity-30 italic">{t.noHistory}</p>
                ) : (
                  history.map((item, i) => (
                    <div id={`history-item-${i}`} key={i} className={cn(
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

      {/* Notebook Overlay */}
      <AnimatePresence>
        {activeOverlay === 'notebook' && (
          <motion.div
            id="overlay-notebook"
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            className={cn(
              "fixed inset-0 z-[70] p-8 overflow-y-auto backdrop-blur-xl",
              theme === 'dark' ? "bg-black" : "bg-white"
            )}
          >
            <div id="notebook-container" className="max-w-2xl mx-auto">
              <div id="notebook-header" className="flex justify-between items-center mb-12">
                <h2 id="notebook-title" className="text-2xl font-light">{t.notebook}</h2>
                <div id="notebook-actions" className="flex items-center gap-4">
                  {notebookEntries.length > 0 && (
                    <button 
                      id="btn-clear-notebook"
                      onClick={clearAllNotebook}
                      className="text-[10px] uppercase tracking-widest opacity-30 hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      Clear All
                    </button>
                  )}
                  <button 
                    id="btn-close-notebook"
                    onClick={() => setActiveOverlay('none')}
                    className="text-sm uppercase tracking-widest opacity-50 hover:opacity-100"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
              
              <div id="notebook-list" className="space-y-6">
                {notebookEntries.length === 0 ? (
                  <p id="no-notebook-msg" className="opacity-30 italic">No entries in your notebook yet.</p>
                ) : (
                  [...notebookEntries].reverse().map((entry: any) => (
                    <div id={`notebook-entry-${entry.id}`} key={entry.id} className={cn(
                      "p-6 rounded-3xl border",
                      theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                    )}>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest opacity-40">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                          <span className="text-[10px] mt-1 uppercase tracking-widest px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-500 w-fit">
                            {entry.model}
                          </span>
                        </div>
                        <button 
                          id={`btn-delete-entry-${entry.id}`}
                          onClick={() => deleteNotebookEntry(entry.id)}
                          className="p-2 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 rounded-full transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed opacity-80">{entry.content}</p>
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
        {activeOverlay === 'settings' && (
          <motion.div
            id="overlay-settings"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className={cn(
              "fixed inset-0 z-[90] p-8 overflow-y-auto backdrop-blur-xl",
              theme === 'dark' ? "bg-black" : "bg-white"
            )}
          >
            <div id="settings-container" className="max-w-2xl mx-auto">
              <div id="settings-header" className="flex justify-between items-center mb-12">
                <h2 id="settings-title" className="text-2xl font-light">{t.settings}</h2>
                <button 
                  id="btn-close-settings"
                  onClick={() => setActiveOverlay('none')}
                  className="text-sm uppercase tracking-widest opacity-50 hover:opacity-100"
                >
                  {t.close}
                </button>
              </div>
              
              <div id="settings-sections" className="space-y-12">
                <section id="section-appearance">
                  <h3 className="text-xs uppercase tracking-[0.3em] opacity-30 mb-6">{t.appearance}</h3>
                  <div id="theme-selector" className="flex items-center justify-between p-6 rounded-2xl border border-current opacity-20 hover:opacity-100 transition-opacity">
                    <span className="text-lg font-light">{t.theme}</span>
                    <div className="flex gap-2">
                      <button 
                        id="btn-theme-dark"
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all",
                          theme === 'dark' ? "bg-white text-black" : "border border-black/20"
                        )}
                      >
                        {t.dark}
                      </button>
                      <button 
                        id="btn-theme-light"
                        onClick={() => setTheme('light')}
                        className={cn(
                          "px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all",
                          theme === 'light' ? "bg-black text-white" : "border border-white/20"
                        )}
                      >
                        {t.light}
                      </button>
                    </div>
                  </div>
                </section>

                <section id="section-language">
                  <h3 className="text-xs uppercase tracking-[0.3em] opacity-30 mb-6">{t.language}</h3>
                  <div id="language-grid" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {languages.map((lang) => (
                      <button
                        id={`btn-lang-${lang.code}`}
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border transition-all",
                          language === lang.code 
                            ? (theme === 'dark' ? "bg-white text-black border-white" : "bg-black text-white border-black")
                            : (theme === 'dark' ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5")
                        )}
                      >
                        <Globe size={14} className="opacity-50" />
                        <span className="text-sm font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section id="section-model">
                  <h3 className="text-xs uppercase tracking-[0.3em] opacity-30 mb-6">{t.modelSelection}</h3>
                  <div id="model-list" className="flex flex-col gap-2">
                    {(['Claude', 'Gemini', 'ChatGPT'] as const).map((model) => (
                      <button
                        id={`btn-model-${model}`}
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

                <section id="section-about">
                  <h3 className="text-xs uppercase tracking-[0.3em] opacity-30 mb-6">{t.about}</h3>
                  <p id="about-text" className="text-sm opacity-50 leading-relaxed">
                    {t.aboutText}
                  </p>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Usage Info */}
      <footer id="main-footer" className="pb-20 pt-8 flex justify-center">
        <div id="footer-content" className="flex flex-col items-center gap-6">
          <div id="footer-nav" className="flex items-center gap-12">
            <button id="btn-discovery" className="flex flex-col items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-all hover:scale-110">
              <CircleDot size={16} />
              <span>{t.discovery}</span>
            </button>
            <button id="btn-aimap" className="flex flex-col items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-all hover:scale-110">
              <Map size={16} />
              <span>{t.aimap}</span>
            </button>
            <button id="btn-memo" className="flex flex-col items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-all hover:scale-110">
              <StickyNote size={16} />
              <span>{t.memo}</span>
            </button>
          </div>
          <div id="usage-info" className="flex flex-col items-center gap-2">
            <div id="footer-divider" className={cn("h-[1px] w-12 mb-2", theme === 'dark' ? "bg-white/20" : "bg-black/20")} />
            <span id="evolution-stat" className="text-[10px] uppercase tracking-[0.4em] opacity-30">
              {t.evolution}: {Math.floor(usageCount / 10)}
            </span>
          </div>
        </div>
      </footer>

      {/* Transcription Overlay for Omotenashi Flow */}
      <AnimatePresence>
        {(state === 'listening' || state === 'thinking') && isOmotenashiMode && (
          <motion.div
            id="omotenashi-processing-overlay"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-xs text-center z-40 pointer-events-none"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-widest text-pink-500 mb-2">
                {state === 'listening' ? "Listening..." : "Tive Intelligence Thinking..."}
              </p>
              <p className="text-sm font-medium opacity-80">
                {transcript || "..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {activeOverlay === 'result' && (
          <ResultScreen 
            key="result"
            theme={theme} 
            language={language}
            onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onClose={() => setActiveOverlay('none')} 
            onShowHistory={() => setActiveOverlay('history')}
            onShowSettings={() => setActiveOverlay('settings')}
            onShowNotebook={() => {
              loadNotebook();
              setActiveOverlay('notebook');
            }}
            onShowChat={() => {
              setActiveOverlay('chat');
            }}
            onMicClick={() => {
              setActiveOverlay('none');
              startLiveSession();
            }}
            content={aiResponse}
            voiceInsight={voiceInsight}
            isOmotenashiMode={isOmotenashiMode}
          />
        )}
        {activeOverlay === 'chat' && (
          <ChatScreen
            key="chat"
            theme={theme}
            language={language}
            onClose={() => setActiveOverlay('none')}
            initialContent={aiResponse}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
