import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, ChevronDown, Sparkles, X, Copy, PenLine, Plus, Mic, Square, Check } from 'lucide-react';
import { cn } from '../lib/utils';

type AIModel = 'Claude' | 'Gemini' | 'ChatGPT';

interface ResultScreenProps {
  onClose: () => void;
  theme: 'dark' | 'light';
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ 
  onClose, 
  theme, 
  selectedModel, 
  onModelChange 
}) => {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [aiStatus, setAiStatus] = useState('Thinking..');
  const [isOke, setIsOke] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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

  const handleCopyToggle = () => {
    setIsOke(!isOke);
    if (!isOke) {
      // Simulate copy
      navigator.clipboard.writeText("Tive AI Result Content");
    }
  };

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
            <span>Plus をはじめる</span>
            <X size={12} className="ml-1 cursor-pointer opacity-50 hover:opacity-100" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-current/10 rounded-lg transition-colors">
            <div className="w-5 h-5 border-2 border-current/20 rounded-sm" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 relative items-center justify-center">
        <div className="relative w-full max-w-lg aspect-square">
          {/* Action Icons Repositioned to Card Top-Right */}
          <div className="absolute -top-12 right-4 flex gap-6 z-20">
            <button 
              onClick={handleCopyToggle}
              className={cn(
                "transition-all duration-300 flex flex-col items-center gap-1",
                isOke ? "text-emerald-500 scale-110" : "opacity-40 hover:opacity-100"
              )}
            >
              {isOke ? <Check size={22} /> : <Copy size={22} />}
              <span className="text-[10px] uppercase tracking-tighter font-bold">
                {isOke ? 'OKE' : 'Copy'}
              </span>
            </button>
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
                {isDrawingMode ? 'Clear' : 'Sign'}
              </span>
            </button>
          </div>

          {/* Gradient Card */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className={cn(
              "w-full h-full rounded-[3rem] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.1)] group",
              isDrawingMode && "cursor-crosshair"
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-pink-400 blur-[2px]" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 2, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-pink-400 blur-[8px]" 
                  />
                </div>
                <span className="text-4xl font-light tracking-[0.15em] opacity-100 text-zinc-900 drop-shadow-md">
                  Thinking..
                </span>
              </motion.div>
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
        </div>
      </main>

      {/* Bottom Input Bar */}
      <footer className="p-6 max-w-3xl mx-auto w-full">
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
            placeholder={`${selectedModel} に質問してみましょう`} 
            className="flex-1 bg-transparent border-none outline-none text-sm py-2"
          />

          <div className="flex items-center gap-1 pr-1">
            <button className="p-2 hover:bg-current/10 rounded-full transition-colors">
              <Mic size={20} className="opacity-60" />
            </button>
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
      </footer>
    </motion.div>
  );
};
