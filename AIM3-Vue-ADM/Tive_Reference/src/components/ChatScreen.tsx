import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Square, Key, CreditCard, MapPin, Check, ChevronLeft, Send, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language, translations } from '../lib/i18n';
import { CustomKeyboard } from './CustomKeyboard';

interface ChatScreenProps {
  theme: 'dark' | 'light';
  language: Language;
  onClose: () => void;
  initialContent?: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  theme,
  language,
  onClose,
  initialContent = ""
}) => {
  const [input, setInput] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>(
    initialContent ? [{ role: 'assistant', content: initialContent }] : []
  );
  const t = translations[language];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput("");
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm processing your request based on the previous context..." }]);
    }, 1000);
  };

  const handleKeyboardKey = (key: string) => {
    if (key === 'backspace') {
      setInput(prev => prev.slice(0, -1));
    } else if (key === 'enter') {
      handleSend();
    } else if (key === 'close') {
      // Logic to close keyboard could go here, for now we just log
      console.log('Keyboard close requested');
    } else if (key === ' ' || key.length === 1 || key === '、。?!' || key === '^^' || key.length > 1) {
      // Handle emoji or special keys
      const val = key === 'punct' ? '。' : key;
      setInput(prev => prev + val);
    }
  };

  return (
    <motion.div
      id="chat-screen-root"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed inset-0 z-[75] flex flex-col",
        theme === 'dark' ? "bg-black text-white" : "bg-white text-black"
      )}
    >
      {/* Header */}
      <header id="chat-header" className="p-4 flex justify-between items-center border-b border-current/5">
        <button id="btn-chat-back" onClick={onClose} className="p-2 hover:bg-current/10 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div id="chat-header-title" className="flex flex-col items-center">
          <span id="chat-header-subtitle" className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-50">Tive◎Editor</span>
          <span id="chat-header-main-title" className="text-xs font-semibold">New Session</span>
        </div>
        <button id="btn-chat-more" className="p-2 hover:bg-current/10 rounded-full transition-colors">
          <MoreHorizontal size={24} />
        </button>
      </header>

      {/* Messages Area */}
      <div id="chat-messages-area" className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map((msg, i) => (
          <div id={`chat-msg-wrapper-${i}`} key={i} className={cn(
            "flex flex-col gap-2",
            msg.role === 'user' ? "items-end" : "items-start"
          )}>
            <div id={`chat-msg-bubble-${i}`} className={cn(
              "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? (theme === 'dark' ? "bg-white/10" : "bg-black/10")
                : (theme === 'dark' ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50/50 border border-indigo-100")
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div id="chat-empty-state" className="h-full flex flex-col items-center justify-center opacity-20">
            <div id="chat-empty-placeholder" className="w-16 h-16 rounded-full border-2 border-dashed border-current mb-4" />
            <p id="chat-empty-text" className="text-sm uppercase tracking-widest">Start editing...</p>
          </div>
        )}
      </div>

      {/* Input Area (Based on Image) */}
      <div id="chat-input-container" className="p-4 pb-4 space-y-4">
        <div id="chat-input-wrapper" className={cn(
          "relative rounded-[2rem] border p-2 flex flex-col gap-2 transition-all duration-300",
          theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-zinc-50 border-black/10"
        )}>
          <textarea
            id="chat-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Tive..."
            className="w-full bg-transparent border-none outline-none text-base px-4 pt-4 resize-none min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          
          <div id="chat-input-actions" className="flex items-center justify-between px-2 pb-2">
            <button id="btn-chat-plus" className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              theme === 'dark' ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"
            )}>
              <Plus size={20} />
            </button>
            
            <button 
              id="btn-chat-send"
              onClick={handleSend}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                input.trim() 
                  ? (theme === 'dark' ? "bg-white text-black" : "bg-black text-white")
                  : (theme === 'dark' ? "bg-white/10 text-white/30" : "bg-black/10 text-black/30")
              )}
            >
              {input.trim() ? <Send size={18} /> : <Square size={18} fill="currentColor" />}
            </button>
          </div>
        </div>

        {/* Toolbar (Based on Image) */}
        <div id="chat-toolbar" className={cn(
          "flex items-center justify-end gap-6 px-6 py-2 rounded-2xl",
          theme === 'dark' ? "bg-white/5" : "bg-black/5"
        )}>
          <button 
            id="btn-toolbar-key"
            onClick={() => setInput(prev => prev + "[Key]")}
            className="opacity-40 hover:opacity-100 transition-opacity p-2 active:scale-90"
          >
            <Key size={20} />
          </button>
          <button 
            id="btn-toolbar-card"
            onClick={() => {
              setIsPaid(!isPaid);
              if (!isPaid) {
                setMessages(prev => [...prev, { role: 'assistant', content: "Payment successful! Premium features unlocked. 🔓" }]);
              }
            }}
            className={cn(
              "transition-all p-2 active:scale-90",
              isPaid ? "opacity-100 text-emerald-500" : "opacity-40 hover:opacity-100"
            )}
          >
            <CreditCard size={20} />
          </button>
          <button 
            id="btn-toolbar-map"
            onClick={() => setInput(prev => prev + "[Map]")}
            className="opacity-40 hover:opacity-100 transition-opacity p-2 active:scale-90"
          >
            <MapPin size={20} />
          </button>
          <button 
            id="btn-toolbar-check"
            onClick={() => setInput(prev => prev + "[Check]")}
            className="opacity-40 hover:opacity-100 transition-opacity p-2 active:scale-90"
          >
            <Check size={20} className="text-emerald-500" />
          </button>
        </div>
      </div>

      {/* Custom Keyboard (Based on Image) */}
      <div id="chat-keyboard-container" className="select-none touch-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
        <CustomKeyboard theme={theme} onKeyClick={handleKeyboardKey} isPaid={isPaid} />
      </div>
    </motion.div>
  );
};
