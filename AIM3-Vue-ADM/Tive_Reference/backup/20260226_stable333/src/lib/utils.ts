import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUsageCount(): number {
  const count = localStorage.getItem('aura_usage_count');
  return count ? parseInt(count, 10) : 0;
}

export function incrementUsageCount(): number {
  const count = getUsageCount() + 1;
  localStorage.setItem('aura_usage_count', count.toString());
  return count;
}

export function getTiveColor(usage: number) {
  // 0 usage = pure monochrome (white/gray)
  // 100 usage = full vibrant colors
  const intensity = Math.min(usage / 50, 1); // Maxes out at 50 interactions
  
  if (intensity === 0) {
    return {
      primary: 'rgba(255, 255, 255, 0.8)',
      secondary: 'rgba(150, 150, 150, 0.3)',
      glow: 'rgba(255, 255, 255, 0.1)',
    };
  }

  // Interpolate between white and a vibrant blue/purple/cyan mix
  const r = Math.round(255 - (255 - 66) * intensity);
  const g = Math.round(255 - (255 - 135) * intensity);
  const b = Math.round(255 - (255 - 245) * intensity);

  return {
    primary: `rgba(${r}, ${g}, ${b}, 0.9)`,
    secondary: `rgba(${r}, ${g}, ${b}, 0.4)`,
    glow: `rgba(${r}, ${g}, ${b}, 0.2)`,
  };
}
