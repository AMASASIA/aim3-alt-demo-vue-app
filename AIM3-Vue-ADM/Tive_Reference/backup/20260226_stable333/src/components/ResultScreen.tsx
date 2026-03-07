import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, ChevronDown, Sparkles, X, Copy, PenLine, Plus, Mic, Square, Check, Sun, Moon, BookOpen, History, Settings, CircleDot, ArrowUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, translations } from '../lib/i18n';

type AIModel = 'Claude' | 'Gemini' | 'ChatGPT';

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
  content?: string;
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
  content = "Tive◎AI Result Content"
}) => {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'copy' | 'ok'>('copy');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showCardMic, setShowCardMic] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const t = translations[language];
  const models: AIModel[] = ['Claude', 'Gemini', 'ChatGPT'];

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
      setShowCardMic(true);
      setIsLongPressing(false);
    }, 3000);
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={cn(
        "fixed inset-0 z-[60] flex flex-col transition-colors duration-500",
        theme === 'dark' ? "bg-black text-white" : "bg-white text-black"
      )}
    >
      {/* Top Navigation */}
      <header className="p-4 flex justify-between items-center relative">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-current/10 rounded-lg transition-colors">
            <Menu size={20} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-1 font-medium hover:bg-current/10 px-2 py-1 rounded-lg transition-colors"
            >
              <span>{selectedModel}</span>
              <ChevronDown size={16} className={cn("opacity-50 transition-transform", showModelSelector && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showModelSelector && (
                <motion.div
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

          <div className="hidden sm:flex items-center gap-2 bg-pink-500/10 text-pink-500 px-3 py-1.5 rounded-full text-xs font-medium border border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
            <Sparkles size={12} />
            <span>{t.plus}</span>
            <X size={12} className="ml-1 cursor-pointer opacity-50 hover:opacity-100" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onShowHistory}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <History size={20} className="opacity-60" />
          </button>
          <button 
            onClick={onShowNotebook}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <BookOpen size={20} className="opacity-60" />
          </button>
          <button 
            onClick={onThemeToggle}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            {theme === 'dark' ? <Sun size={20} className="opacity-60" /> : <Moon size={20} className="opacity-60" />}
          </button>
          <button 
            onClick={onShowSettings}
            className={cn("p-2 rounded-full transition-colors", theme === 'dark' ? "hover:bg-white/10" : "hover:bg-black/10")}
          >
            <Settings size={20} className="opacity-60" />
          </button>
          <button className="p-2 hover:bg-current/10 rounded-lg transition-colors">
            <div className="w-5 h-5 border-2 border-current/20 rounded-sm" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="min-h-full flex flex-col items-center justify-center p-4 py-12">
          <div className="relative w-full max-w-lg flex flex-col items-center">
          {/* Action Icons Repositioned to Card Top-Right */}
          <div className="absolute -top-12 right-4 flex gap-6 z-20">
            <button 
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onMouseDown={handleCardPressStart}
            onMouseUp={handleCardPressEnd}
            onMouseLeave={handleCardPressEnd}
            onTouchStart={handleCardPressStart}
            onTouchEnd={handleCardPressEnd}
            transition={{ delay: 0.2, duration: 1 }}
            className={cn(
              "w-full aspect-square rounded-[3rem] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] group transition-all duration-300",
              isDrawingMode && "cursor-crosshair",
              isLongPressing && "scale-[0.98] brightness-90"
            )}
          >
            {/* Base Layer: Soft Fluid Gradient */}
            <motion.div 
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
              animate={{
                opacity: [0.1, 0.3, 0.1, 0.2, 0.1],
                scale: [0.8, 1.1, 0.9, 1.2, 0.8],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute inset-[-20%] bg-[radial-gradient(circle_at_70%_20%,_rgba(186,242,255,0.5),_transparent_50%)] blur-[40px] mix-blend-screen" 
            />
            
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] pointer-events-none" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10 pointer-events-none">
              <AnimatePresence mode="wait">
                {showCardMic ? (
                  <motion.button
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
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                    />
                  </motion.button>
                ) : (
                  <motion.div
                    key="thinking-status"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col items-center gap-8"
                  >
                    <div className="relative flex items-center justify-center">
                      {/* 核 (Core) */}
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)] z-10" 
                      />
                      {/* オーラ (Aura) */}
                      <motion.div 
                        animate={{ scale: [1, 2.5, 1], opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-8 h-8 rounded-full bg-pink-400 blur-[10px]" 
                      />
                      <motion.div 
                        animate={{ scale: [1, 4, 1], opacity: [0.05, 0.2, 0.05] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute w-12 h-12 rounded-full bg-purple-400 blur-[15px]" 
                      />
                    </div>
                    <span className="text-2xl font-extralight tracking-[0.25em] uppercase opacity-80 text-zinc-900 drop-shadow-sm">
                      {t.thinking}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Handwriting Canvas Overlay */}
            <canvas
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
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          </motion.div>

          {/* Overlapping Square Icons Below Card */}
          <div className="mt-10 flex -space-x-3">
            <button 
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

          {/* Notebook Integration Button */}
          <motion.button
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
          <div className="mt-10 w-full">
            <div className={cn(
              "flex items-center gap-3 p-2 pl-4 rounded-full border transition-all shadow-sm",
              theme === 'dark' ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            )}>
              <button className="p-2 hover:bg-current/10 rounded-full transition-colors">
                <Plus size={20} className="opacity-60" />
              </button>
              
              <input 
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

              <div className="flex items-center gap-1 pr-1">
                {prompt.trim() ? (
                  <button 
                    onClick={handlePromptSubmit}
                    className={cn(
                      "p-2 rounded-full transition-all",
                      theme === 'dark' ? "bg-white text-black" : "bg-black text-white"
                    )}
                  >
                    <ArrowUp size={18} />
                  </button>
                ) : (
                  <button className="p-2 hover:bg-current/10 rounded-full transition-colors">
                    <Mic size={20} className="opacity-60" />
                  </button>
                )}
                <button 
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
