import React from 'react';
import { Globe, Mic, Delete, RotateCcw, ArrowRight, Smile, CornerDownLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomKeyboardProps {
  theme: 'dark' | 'light';
  onKeyClick: (key: string) => void;
}

export const CustomKeyboard: React.FC<CustomKeyboardProps> = ({ theme, onKeyClick }) => {
  const rows = [
    [
      { label: <ArrowRight size={18} />, value: 'arrow' },
      { label: 'あ', value: 'あ' },
      { label: 'か', value: 'か' },
      { label: 'さ', value: 'さ' },
      { label: <Delete size={18} />, value: 'backspace' },
    ],
    [
      { label: <RotateCcw size={18} />, value: 'undo' },
      { label: 'た', value: 'た' },
      { label: 'な', value: 'な' },
      { label: 'は', value: 'は' },
      { label: '空白', value: ' ' },
    ],
    [
      { label: 'ABC', value: 'abc' },
      { label: 'ま', value: 'ま' },
      { label: 'や', value: 'や' },
      { label: 'ら', value: 'ら' },
      { label: <CornerDownLeft size={18} />, value: 'enter', primary: true },
    ],
    [
      { label: <Smile size={18} />, value: 'emoji' },
      { label: '^^', value: '^^' },
      { label: 'わ', value: 'わ' },
      { label: '、。?!', value: 'punct' },
      { label: <Mic size={18} />, value: 'mic' },
    ],
  ];

  return (
    <div className={cn(
      "w-full p-1.5 pb-8 flex flex-col gap-1.5 select-none",
      theme === 'dark' ? "bg-[#1c1c1e]" : "bg-[#d1d4d9]"
    )}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5 h-11">
          {row.map((key, keyIndex) => (
            <button
              key={keyIndex}
              onClick={() => onKeyClick(key.value)}
              className={cn(
                "flex-1 flex items-center justify-center rounded-md shadow-[0_1px_0_rgba(0,0,0,0.3)] text-lg font-normal transition-all active:scale-95 active:opacity-70",
                theme === 'dark' 
                  ? (key.primary ? "bg-[#636366] text-white" : "bg-[#3a3a3c] text-white") 
                  : (key.primary ? "bg-[#adb4be] text-black" : "bg-white text-black")
              )}
            >
              {key.label}
            </button>
          ))}
        </div>
      ))}
      
      <div className="flex items-center justify-between px-4 mt-1">
        <button className={cn(
          "p-2 rounded-full",
          theme === 'dark' ? "text-white/80" : "text-black/80"
        )}>
          <Globe size={22} />
        </button>
        <button className={cn(
          "p-2 rounded-full",
          theme === 'dark' ? "text-white/80" : "text-black/80"
        )}>
          <Mic size={22} />
        </button>
      </div>
    </div>
  );
};
