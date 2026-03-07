import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, ChevronDown, Sparkles, X, Copy, PenLine, Plus, Mic, Square, Check, Sun, Moon, BookOpen, History, Settings, CircleDot, ArrowUp, GitBranch, History as HistoryIcon, Languages, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, translations } from '../lib/i18n';

type AIModel = 'Claude' | 'Gemini' | 'ChatGPT' | 'Tive';

interface EtymologyNodeProps {
  label: string;
  sublabel?: string;
  type: 'root' | 'prefix' | 'suffix' | 'word';
  delay?: number;
}

const EtymologyNode: React.FC<EtymologyNodeProps> = ({ label, sublabel, type, delay = 0 }) => {
  const colors = {
    root: 'bg-pink-500/20 border-pink-500/50 text-pink-700',
    prefix: 'bg-blue-500/20 border-blue-500/50 text-blue-700',
    suffix: 'bg-purple-500/20 border-purple-500/50 text-purple-700',
    word: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={cn(
        "flex flex-col items-center px-4 py-2 rounded-xl border backdrop-blur-sm",
        colors[type]
      )}
    >
      <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">{type}</span>
      <span className="text-sm font-bold">{label}</span>
      {sublabel && <span className="text-[10px] italic opacity-80">{sublabel}</span>}
    </motion.div>
  );
};

interface ResultScreenProps {
  onClose: () => void;
  theme: 'dark' | 'light';
  language: Language;
  onThemeToggle: () => void;
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  onShowSettings?: () => void;
  onShowHistory?: () => void;
  onShowNotebook?: () => void;
  onShowChat?: () => void;
  onMicClick?: () => void;
  content?: string;
  voiceInsight?: string;
  isOmotenashiMode?: boolean;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ 
  onClose, 
  theme, 
  language,
  onThemeToggle,
  selectedModel, 
  onModelChange,
  onShowSettings,
  onShowHistory,
  onShowNotebook,
  onShowChat,
  onMicClick,
  content = "Tive◎AI Result Content",
  voiceInsight,
  isOmotenashiMode
}) => {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'copy' | 'ok'>('copy');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showCardMic, setShowCardMic] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  
  const [isTiveEnhanced, setIsTiveEnhanced] = useState(false);
  const [tiveAnalysis, setTiveAnalysis] = useState('');
  const [currentVoiceInsight, setCurrentVoiceInsight] = useState(voiceInsight || '');
  
  // Etymology Data Parsing
  const etymologyData = useMemo(() => {
    if (!content) return null;
    
    // Simple parser for demo purposes - in real app, AI would return structured JSON
    // We look for patterns like "Root: *spec-" or "Prefix: pre-"
    const nodes: EtymologyNodeProps[] = [];
    
    const rootMatch = content.match(/Root:\s*\*?([^\s\-\>]+)/i);
    if (rootMatch) nodes.push({ label: rootMatch[1], type: 'root', sublabel: 'Origin' });
    
    const prefixMatch = content.match(/Prefix:\s*([^\s\-\>]+)/i);
    if (prefixMatch) nodes.push({ label: prefixMatch[1], type: 'prefix' });
    
    const suffixMatch = content.match(/Suffix:\s*([^\s\-\>]+)/i);
    if (suffixMatch) nodes.push({ label: suffixMatch[1], type: 'suffix' });
    
    // If we found nodes, add the target word
    if (nodes.length > 0) {
      const wordMatch = content.match(/【ステップ2[^】]*】\s*([^\s\n]+)/i);
      if (wordMatch) nodes.push({ label: wordMatch[1], type: 'word' });
    }
    
    return nodes.length > 0 ? nodes : null;
  }, [content]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];
  const models: AIModel[] = ['Tive', 'Claude', 'Gemini', 'ChatGPT'];

  // Handwriting logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingMode || !canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isDrawingMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handlePromptSubmit = () => {
    if (!prompt.trim()) return;
    
    // Check for @amas trigger
    if (prompt.toLowerCase().includes('@amas')) {
      if (onShowChat) onShowChat();
      setPrompt('');
      return;
    }

    // In a real app, this would send the prompt to the AI
    console.log("Submitting prompt:", prompt);
    setPrompt('');
  };

  const handleActionSelect = (action: 'copy' | 'ok') => {
    setSelectedAction(action);
    if (action === 'copy') {
      navigator.clipboard.writeText(content);
    } else if (action === 'ok') {
      saveToNotebook();
      if (onShowChat) onShowChat();
    }
  };

  const saveToNotebook = () => {
    const notebookData = JSON.parse(localStorage.getItem('tive_notebook') || '[]');
    const newEntry = {
      id: Date.now(),
      model: selectedModel,
      content: content,
      timestamp: new Date().toISOString(),
      language: language
    };
    notebookData.push(newEntry);
    localStorage.setItem('tive_notebook', JSON.stringify(notebookData));
  };

  const handleNotebookClick = () => {
    saveToNotebook();
    if (onShowChat) onShowChat();
  };

  const handleCardPressStart = () => {
    setIsLongPressing(true);
    longPressTimer.current = setTimeout(() => {
      if (onShowChat) onShowChat();
      setIsLongPressing(false);
    }, 500); // Even shorter for better responsiveness
  };

  const handleCardPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPressing(false);
  };

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  return (
    <motion.div
      id="result-screen-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col transition-colors duration-500",
        theme === 'dark' ? "bg-black text-white" : "bg-white text-black"
      )}
    >
      {/* Top Navigation */}
      <header id="result-header" className="p-4 flex justify-between items-center relative">
        <div id="result-header-left" className="flex items-center gap-4">
          <button id="btn-result-menu" className="p-2 hover:bg-current/10 rounded-lg transition-colors">
            <Menu size={20} />
          </button>
          
          <div id="model-selector-container" className="relative">
            <button 
              id="btn-model-selector"
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-1 font-medium hover:bg-current/10 px-2 py-1 rounded-lg transition-colors"
            >
              <span>{selectedModel}</span>
              <ChevronDown size={16} className={cn("opacity-50 transition-transform", showModelSelector && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showModelSelector && (
                <motion.div
                  id="model-dropdown"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={cn(
                    "absolute top-full left-0 mt-2 w-48 rounded-xl border shadow-xl z-50 overflow-hidden",
                    theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                  )}
                >
                  {models.map((model) => (
                    <button
                      id={`btn-select-model-${model}`}
                      key={model}
                      onClick={() => {
                        onModelChange(model);
                        setShowModelSelector(false);
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-current/5 transition-colors",
                        selectedModel === model && "font-semibold"
                      )}
                    >
                      {model}
                      {selectedModel === model && <Check size={14} className="text-indigo-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div id="plus-badge" className="hidden sm:flex items-center gap-2 bg-pink-500/10 text-pink-500 px-3 py-1.5 rounded-full text-xs font-medium border border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
            <Sparkles size={12} />
            <span>{t.plus}</span>
            <X id="btn-close-plus" size={12} className="ml-1 cursor-pointer opacity-50 hover:opacity-100" />
          </div>
        </div>
        <div id="result-header-right" className="flex items-center gap-2">
          <button 
            id="btn-result-history"
            onClick={onShowHistory}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <History size={20} className="opacity-60" />
          </button>
          <button 
            id="btn-result-notebook"
            onClick={onShowNotebook}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <BookOpen size={20} className="opacity-60" />
          </button>
          <button 
            id="btn-result-theme"
            onClick={onThemeToggle}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            {theme === 'dark' ? <Sun size={20} className="opacity-60" /> : <Moon size={20} className="opacity-60" />}
          </button>
          <button 
            id="btn-result-settings"
            onClick={onShowSettings}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <Settings size={20} className="opacity-60" />
          </button>
          <button id="btn-result-extra" className="p-2 hover:bg-current/10 rounded-lg transition-colors">
            <div className="w-5 h-5 border-2 border-current/20 rounded-sm" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="result-main-content" className="flex-1 overflow-y-auto relative">
        <div id="result-scroll-container" className="min-h-full flex flex-col items-center justify-center p-4 py-12">
          <div id="result-card-wrapper" className="relative w-full max-w-lg flex flex-col items-center">
          {/* Action Icons Repositioned to Card Top-Right */}
          <div id="result-action-icons" className="absolute -top-12 right-4 flex gap-6 z-20 select-none">
            <button 
              id="btn-drawing-mode"
              onClick={() => {
                setIsDrawingMode(!isDrawingMode);
                if (isDrawingMode) clearCanvas();
              }}
              className={cn(
                "transition-all duration-300 flex flex-col items-center gap-1",
                isDrawingMode ? "text-pink-500 scale-110" : "opacity-40 hover:opacity-100"
              )}
            >
              <PenLine size={22} />
              <span className="text-[10px] uppercase tracking-tighter font-bold">
                {isDrawingMode ? t.clear : t.sign}
              </span>
            </button>
          </div>

          {/* Gradient Card */}
          <motion.div 
            id="result-gradient-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onMouseDown={handleCardPressStart}
            onMouseUp={handleCardPressEnd}
            onMouseLeave={handleCardPressEnd}
            onTouchStart={handleCardPressStart}
            onTouchEnd={handleCardPressEnd}
            transition={{ delay: 0.2, duration: 1 }}
            className={cn(
              "w-full aspect-square rounded-[3rem] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] group transition-all duration-300 select-none touch-manipulation",
              isDrawingMode && "cursor-crosshair",
              isLongPressing && "scale-[0.98] brightness-90"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Base Layer: Soft Fluid Gradient */}
            <motion.div 
              id="card-bg-gradient"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 100%", "100% 0%", "0% 0%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-[length:300%_300%] bg-gradient-to-br from-[#fff5f5] via-[#fdf2ff] via-[#f0f4ff] via-[#fff0f5] to-[#f5f5ff]" 
            />
            
            {/* Resonant Layers ... (keeping existing animations) */}
            <motion.div 
              id="aura-layer-1"
              animate={{
                scale: [1, 1.2, 0.9, 1.1, 1],
                x: [0, 30, -20, 40, 0],
                y: [0, -40, 50, -30, 0],
                opacity: [0.4, 0.6, 0.4, 0.5, 0.4]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-[-20%] bg-[radial-gradient(circle_at_50%_50%,_rgba(255,182,193,0.7),_transparent_60%)] blur-[60px] mix-blend-multiply" 
            />

            <motion.div 
              id="aura-layer-2"
              animate={{
                scale: [1.1, 0.8, 1.2, 0.9, 1.1],
                x: [0, -50, 40, -30, 0],
                y: [0, 30, -40, 50, 0],
                opacity: [0.3, 0.5, 0.3, 0.4, 0.3]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute inset-[-20%] bg-[radial-gradient(circle_at_30%_70%,_rgba(199,182,255,0.7),_transparent_60%)] blur-[60px] mix-blend-multiply" 
            />

            <motion.div 
              id="aura-layer-3"
              animate={{
                opacity: [0.1, 0.3, 0.1, 0.2, 0.1],
                scale: [0.8, 1.1, 0.9, 1.2, 0.8],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute inset-[-20%] bg-[radial-gradient(circle_at_70%_20%,_rgba(186,242,255,0.5),_transparent_50%)] blur-[40px] mix-blend-screen" 
            />
            
            <div id="card-glass-overlay" className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />
            
            {/* Content Overlay */}
            <div id="card-content-overlay" className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10 pointer-events-none">
              <AnimatePresence mode="wait">
                {showCardMic ? (
                  <motion.button
                    id="btn-card-mic"
                    key="card-mic"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="w-24 h-24 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center pointer-events-auto shadow-2xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCardMic(false);
                      onClose(); // Close result screen to go back to main for recording
                    }}
                  >
                    <motion.div 
                      id="card-mic-indicator"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                    />
                  </motion.button>
                ) : (
                  <motion.div
                    id="thinking-status-container"
                    key="thinking-status"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col items-center gap-8 w-full"
                  >
                    {/* Etymology Tree Visualization */}
                    {etymologyData && (
                      <div id="etymology-tree-container" className="flex flex-col items-center gap-4 mb-8 w-full">
                        <div className="flex items-center justify-center gap-2 w-full">
                          {etymologyData.filter(n => n.type !== 'word').map((node, i) => (
                            <React.Fragment key={i}>
                              <EtymologyNode {...node} delay={1.2 + i * 0.1} />
                              {i < etymologyData.filter(n => n.type !== 'word').length - 1 && (
                                <motion.div 
                                  initial={{ opacity: 0, scaleX: 0 }}
                                  animate={{ opacity: 1, scaleX: 1 }}
                                  transition={{ delay: 1.4 + i * 0.1 }}
                                  className="h-[1px] w-4 bg-zinc-300 origin-left" 
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        
                        <motion.div 
                          initial={{ opacity: 0, scaleY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          transition={{ delay: 1.8 }}
                          className="w-[1px] h-6 bg-zinc-300 origin-top" 
                        />
                        
                        {etymologyData.find(n => n.type === 'word') && (
                          <EtymologyNode 
                            {...etymologyData.find(n => n.type === 'word')!} 
                            delay={2.0} 
                          />
                        )}
                      </div>
                    )}

                    <div id="thinking-visual" className="relative flex items-center justify-center">
                      {/* 核 (Core) */}
                      <motion.div 
                        id="thinking-core"
                        animate={{ 
                          scale: [1, 1.3, 1], 
                          opacity: [0.8, 1, 0.8],
                          boxShadow: [
                            "0 0 15px rgba(236,72,153,0.5)",
                            "0 0 30px rgba(236,72,153,0.8)",
                            "0 0 15px rgba(236,72,153,0.5)"
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-5 h-5 rounded-full bg-pink-500 z-10" 
                      />
                      {/* オーラ (Aura) */}
                      <motion.div 
                        id="thinking-aura-1"
                        animate={{ scale: [1, 2.5, 1], opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-8 h-8 rounded-full bg-pink-400 blur-[10px]" 
                      />
                      <motion.div 
                        id="thinking-aura-2"
                        animate={{ scale: [1, 4, 1], opacity: [0.05, 0.2, 0.05] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute w-12 h-12 rounded-full bg-purple-400 blur-[15px]" 
                      />
                    </div>
                    <span id="thinking-label" className="text-2xl font-extralight tracking-[0.25em] uppercase opacity-80 text-zinc-900 drop-shadow-sm">
                      {isOmotenashiMode ? "Omotenashi Concierge" : (selectedModel === 'Tive' ? "Tive◎AI" : (currentVoiceInsight ? "Voice Insight" : t.thinking))}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Omotenashi Mode Indicator */}
            <AnimatePresence>
              {isOmotenashiMode && (
                <motion.div
                  id="omotenashi-badge"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-pink-500/20 border border-pink-500/30 backdrop-blur-md z-30"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-pink-600">
                    Concierge Active 🍵
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voice Insight Text Overlay - Stable positioning */}
            <AnimatePresence>
              {currentVoiceInsight && !isTiveEnhanced && (
                <motion.div
                  id="voice-insight-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-x-0 bottom-24 px-12 text-center z-10 pointer-events-none"
                >
                  <p className="text-xs font-medium tracking-widest uppercase opacity-40 text-zinc-800 line-clamp-2">
                    {currentVoiceInsight}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tive AI Integration Button - Floating inside card */}
            <AnimatePresence>
              {selectedModel !== 'Tive' && (
                <motion.button
                  id="btn-tive-enhance"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTiveEnhanced(true);
                    setTiveAnalysis("Tive Intelligence Analysis: This response is highly relevant. I recommend focusing on the key action items identified in the second paragraph. I've also cross-referenced this with your recent notebook entries for consistency.");
                  }}
                  className={cn(
                    "absolute bottom-8 right-8 w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg z-30 border border-white/30 transition-all",
                    isTiveEnhanced ? "bg-emerald-500" : "bg-pink-500"
                  )}
                >
                  <Sparkles size={20} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Handwriting Canvas Overlay */}
            <canvas
              id="handwriting-canvas"
              ref={canvasRef}
              width={512}
              height={512}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className={cn(
                "absolute inset-0 z-20 w-full h-full transition-opacity duration-300",
                isDrawingMode ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              )}
            />

            {/* Subtle Noise Texture */}
            <div id="noise-texture" className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          </motion.div>

          {/* Overlapping Square Icons Below Card */}
          <div id="card-action-buttons" className="mt-10 flex -space-x-3">
            <button 
              id="btn-copy-result"
              onClick={() => handleActionSelect('copy')}
              className={cn(
                "w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 z-10 border-2",
                selectedAction === 'copy' 
                  ? "bg-indigo-500 text-white border-indigo-400 shadow-xl scale-110" 
                  : "bg-white/10 text-current border-current/10 opacity-40 hover:opacity-100"
              )}
            >
              <Copy size={20} />
              <span className="text-[8px] mt-1 font-bold uppercase tracking-tighter">{t.copy}</span>
            </button>
            <button 
              id="btn-ok-result"
              onClick={() => handleActionSelect('ok')}
              className={cn(
                "w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 z-0 border-2",
                selectedAction === 'ok' 
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-xl scale-110" 
                  : "bg-white/10 text-current border-current/10 opacity-40 hover:opacity-100"
              )}
            >
              <Check size={20} />
              <span className="text-[8px] mt-1 font-bold uppercase tracking-tighter">{t.ok}</span>
            </button>
          </div>

          {/* Tive Analysis Section */}
          <AnimatePresence>
            {isTiveEnhanced && (
              <motion.div
                id="tive-analysis-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "mt-6 w-full p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/5",
                  theme === 'dark' ? "text-emerald-400" : "text-emerald-700"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Tive Intelligence Analysis</span>
                  </div>
                  {etymologyData && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      <GitBranch size={10} />
                      <span className="text-[8px] font-bold uppercase tracking-tighter">Deep Structure Mapped</span>
                    </div>
                  )}
                </div>
                <p className="text-sm leading-relaxed italic mb-4">
                  "{tiveAnalysis}"
                </p>
                
                {etymologyData && (
                  <div className="mt-4 pt-4 border-t border-emerald-500/10">
                    <div className="flex items-center gap-2 mb-2 opacity-60">
                      <HistoryIcon size={12} />
                      <span className="text-[9px] uppercase tracking-widest font-bold">Semantic Evolution</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-medium">Origin: {etymologyData.find(n => n.type === 'root')?.label} ({etymologyData.find(n => n.type === 'root')?.sublabel})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-50" />
                        <span className="text-[11px] font-medium">Current: {etymologyData.find(n => n.type === 'word')?.label}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notebook Integration Button */}
          <motion.button
            id="btn-save-to-notebook"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNotebookClick}
            className={cn(
              "mt-8 w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-medium transition-all shadow-lg border",
              theme === 'dark' 
                ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" 
                : "bg-black/5 border-black/10 hover:bg-black/10 text-black"
            )}
          >
            <BookOpen size={20} className="text-pink-500" />
            <span className="tracking-widest uppercase text-sm">{t.notebook}</span>
          </motion.button>

          {/* Prompt Input Bar - Re-positioned below the card and notebook button */}
          <div id="result-prompt-container" className="mt-10 w-full">
            <div id="result-prompt-bar" className={cn(
              "flex items-center gap-3 p-2 pl-4 rounded-full border transition-all shadow-sm",
              theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            )}>
              <button id="btn-result-plus" className="p-2 hover:bg-current/10 rounded-full transition-colors">
                <Plus size={20} className="opacity-60" />
              </button>
              
              <input 
                id="result-prompt-input"
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePromptSubmit();
                  }
                }}
                placeholder={t.promptPlaceholder} 
                className="flex-1 bg-transparent border-none outline-none text-sm py-2"
              />

              <div id="result-prompt-actions" className="flex items-center gap-1 pr-1">
                {prompt.trim() ? (
                  <button 
                    id="btn-send-result-prompt"
                    onClick={handlePromptSubmit}
                    className={cn(
                      "p-2 rounded-full transition-all",
                      theme === 'dark' ? "bg-white text-black" : "bg-black text-white"
                    )}
                  >
                    <ArrowUp size={18} />
                  </button>
                ) : (
                  <button 
                    id="btn-result-mic"
                    onClick={onMicClick}
                    className="p-2 hover:bg-current/10 rounded-full transition-colors"
                  >
                    <Mic size={20} className="opacity-60" />
                  </button>
                )}
                <button 
                  id="btn-close-result"
                  onClick={onClose}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    theme === 'dark' ? "bg-white text-black" : "bg-black text-white"
                  )}
                >
                  <Square size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </motion.div>
  );
};
