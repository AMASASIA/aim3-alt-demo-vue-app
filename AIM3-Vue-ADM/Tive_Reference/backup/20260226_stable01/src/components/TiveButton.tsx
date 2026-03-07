import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TiveState } from '../lib/gemini';
import { cn, getTiveColor } from '../lib/utils';

interface TiveButtonProps {
  state: TiveState;
  usageCount: number;
  onClick: () => void;
  theme: 'dark' | 'light';
}

export const TiveButton: React.FC<TiveButtonProps> = ({ state, usageCount, onClick, theme }) => {
  const colors = getTiveColor(usageCount);
  
  // Calculate visualizer color based on theme
  // In dark mode, we use the evolution color (which starts white and gains color)
  // In light mode, we should use a darker version of the evolution color to ensure contrast
  const visualizerColor = theme === 'dark' 
    ? colors.primary 
    : colors.primary.replace('255, 255, 255', '0, 0, 0').replace('0.9', '0.7'); // Fallback to dark if it's the default white

  // More robust color handling for light mode
  const getThemeAwareColor = (baseColor: string) => {
    if (theme === 'dark') return baseColor;
    // If the color is white-ish, make it dark-ish
    if (baseColor.includes('255, 255, 255')) return 'rgba(0, 0, 0, 0.6)';
    return baseColor;
  };

  const activeColor = getThemeAwareColor(colors.primary);

  return (
    <div className="relative flex items-center justify-center">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: state === 'listening' ? [1, 1.2, 1] : state === 'speaking' ? [1, 1.1, 1] : 1,
          opacity: state === 'idle' ? 0.3 : 0.6,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-64 h-64 rounded-full blur-3xl"
        style={{ backgroundColor: colors.glow }}
      />

      {/* Main Button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative w-48 h-48 rounded-full border flex items-center justify-center overflow-hidden transition-colors duration-1000",
          state === 'error' ? "border-red-500/50" : (theme === 'dark' ? "border-white/20" : "border-black/20")
        )}
        style={{ 
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          boxShadow: `0 0 40px ${colors.glow}`
        }}
      >
        {/* Generative AI Visualizer */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {state !== 'idle' && state !== 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.2, scale: 1 }}
                className={cn("absolute w-4 h-4 rounded-sm", theme === 'dark' ? "bg-white" : "bg-black")}
              />
            )}

            {state === 'listening' && (
              <motion.div
                key="listening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-1 items-center"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: [10, 40, 10],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: activeColor }}
                  />
                ))}
              </motion.div>
            )}

            {state === 'thinking' && (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-2 border-t-transparent"
                style={{ borderColor: activeColor, borderTopColor: 'transparent' }}
              />
            )}

            {state === 'speaking' && (
              <motion.div
                key="speaking"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 rounded-full border-4 opacity-30"
                style={{ borderColor: activeColor }}
              />
            )}

            {state === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: activeColor }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
};
