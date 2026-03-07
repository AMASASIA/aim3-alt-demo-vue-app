import React from 'react';
import { Globe, Mic, Delete, RotateCcw, ArrowRight, CornerDownLeft, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomKeyboardProps {
  theme: 'dark' | 'light';
  onKeyClick: (key: string) => void;
  isPaid?: boolean;
}

export const CustomKeyboard: React.FC<CustomKeyboardProps> = ({ theme, onKeyClick, isPaid = false }) => {
  const [layout, setLayout] = React.useState<'icons' | 'hiragana' | 'alphabet'>('icons');

  const hiraganaRows = [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['な', 'に', 'ぬ', 'ね', 'の'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    ['ま', 'み', 'む', 'め', 'も'],
    ['や', 'ゆ', 'よ', 'わ', 'を'],
    ['ら', 'り', 'る', 'れ', 'ろ'],
    ['ん', 'ー', '、', '。', 'Icons'],
  ];

  const alphabetRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Icons'],
  ];

  const iconRows = [
    [
      { label: <ArrowRight size={18} />, value: 'arrow' },
      { label: '🎫', value: '🎫' },
      { label: '✉️', value: '✉️' },
      { label: '🗓️', value: '🗓️' },
      { label: <Delete size={18} />, value: 'backspace' },
    ],
    [
      { label: <RotateCcw size={18} />, value: 'undo' },
      { label: '📍', value: '📍' },
      { label: '🧚', value: '🧚' },
      { label: '🔘', value: '🔘' },
      { 
        label: 'ひらがな', 
        value: 'switch-hiragana',
        special: true 
      },
    ],
    [
      { label: 'ABC', value: 'switch-alphabet', special: true },
      { label: '⛓️', value: '⛓️' },
      { label: '📞', value: '📞', locked: !isPaid },
      { label: '📷', value: '📷', locked: !isPaid },
      { label: <CornerDownLeft size={18} />, value: 'enter', primary: true },
    ],
    [
      { label: <ChevronDown size={18} />, value: 'close' },
      { label: '🎥', value: '🎥', locked: !isPaid },
      { label: '❤️', value: '❤️', locked: !isPaid },
      { label: '🪢', value: '🪢', locked: !isPaid },
      { label: '🦋', value: '🦋', locked: !isPaid },
    ],
  ];

  const onInternalKeyClick = (key: any) => {
    const val = typeof key === 'string' ? key : key.value;
    const locked = typeof key === 'object' && key.locked;

    if (locked) return;
    
    if (val === 'switch-hiragana') {
      setLayout('hiragana');
      return;
    }
    if (val === 'switch-alphabet') {
      setLayout('alphabet');
      return;
    }
    if (val === 'Icons') {
      setLayout('icons');
      return;
    }
    
    onKeyClick(val);
  };

  const renderRows = () => {
    if (layout === 'hiragana') {
      return hiraganaRows.map((row, i) => (
        <div id={`hiragana-row-${i}`} key={i} className="flex gap-1 h-8">
          {row.map((char) => (
            <button
              id={`btn-hiragana-${char}`}
              key={char}
              onClick={() => onInternalKeyClick(char)}
              className={cn(
                "flex-1 flex items-center justify-center rounded-sm shadow-sm text-sm transition-all active:scale-95",
                theme === 'dark' ? "bg-[#3a3a3c] text-white" : "bg-white text-black",
                char === 'Icons' && "bg-indigo-500 text-white font-bold text-[10px]"
              )}
            >
              {char}
            </button>
          ))}
        </div>
      ));
    }

    if (layout === 'alphabet') {
      return alphabetRows.map((row, i) => (
        <div id={`alphabet-row-${i}`} key={i} className="flex gap-1 h-10">
          {row.map((char) => (
            <button
              id={`btn-alphabet-${char}`}
              key={char}
              onClick={() => onInternalKeyClick(char)}
              className={cn(
                "flex-1 flex items-center justify-center rounded-md shadow-sm text-sm transition-all active:scale-95",
                theme === 'dark' ? "bg-[#3a3a3c] text-white" : "bg-white text-black",
                char === 'Icons' && "bg-indigo-500 text-white font-bold text-[10px]"
              )}
            >
              {char}
            </button>
          ))}
        </div>
      ));
    }

    return iconRows.map((row, rowIndex) => (
      <div id={`icon-row-${rowIndex}`} key={rowIndex} className="flex gap-1.5 h-11">
        {row.map((key, keyIndex) => (
          <button
            id={`btn-icon-key-${rowIndex}-${keyIndex}`}
            key={keyIndex}
            onClick={() => onInternalKeyClick(key)}
            disabled={key.locked}
            className={cn(
              "flex-1 flex items-center justify-center rounded-md shadow-[0_1px_0_rgba(0,0,0,0.3)] text-lg font-normal transition-all active:scale-95 active:opacity-70 relative overflow-hidden",
              theme === 'dark' 
                ? (key.primary ? "bg-[#636366] text-white" : "bg-[#3a3a3c] text-white") 
                : (key.primary ? "bg-[#adb4be] text-black" : "bg-white text-black"),
              key.locked && "opacity-50 grayscale cursor-not-allowed",
              key.special && "text-xs font-bold"
            )}
          >
            {key.label}
            {key.locked && (
              <div id={`locked-overlay-${rowIndex}-${keyIndex}`} className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-gray-800/40 pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    ));
  };

  return (
    <div id="custom-keyboard-root" className={cn(
      "w-full p-1.5 pb-8 flex flex-col gap-1.5 select-none transition-all duration-300",
      theme === 'dark' ? "bg-[#1c1c1e]" : "bg-[#d1d4d9]",
      layout !== 'icons' && "h-[300px] overflow-y-auto"
    )}>
      {renderRows()}
      
      <div id="keyboard-bottom-bar" className="flex items-center justify-between px-4 mt-1">
        <button id="btn-keyboard-globe" className={cn(
          "p-2 rounded-full",
          theme === 'dark' ? "text-white/80" : "text-black/80"
        )}>
          <Globe size={22} />
        </button>
        <button id="btn-keyboard-mic" className={cn(
          "p-2 rounded-full",
          theme === 'dark' ? "text-white/80" : "text-black/80"
        )}>
          <Mic size={22} />
        </button>
      </div>
    </div>
  );
};
