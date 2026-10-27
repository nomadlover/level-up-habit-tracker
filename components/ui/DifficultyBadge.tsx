import React from 'react';
import { Shield, Zap, Flame } from 'lucide-react';

export type QuestDifficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyBadgeProps {
  difficulty: QuestDifficulty;
  size?: 'sm' | 'md';
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  size = 'md',
  className = ''
}) => {
  const configs: Record<QuestDifficulty, {
    label: string;
    icon: React.ReactNode;
    style: string;
    pips: number;
  }> = {
    easy: {
      label: 'Easy',
      icon: <Shield className="w-3 h-3 text-emerald-400" />,
      style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      pips: 1
    },
    medium: {
      label: 'Medium',
      icon: <Zap className="w-3 h-3 text-sky-400" />,
      style: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
      pips: 2
    },
    hard: {
      label: 'Hard',
      icon: <Flame className="w-3 h-3 text-amber-400" />,
      style: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      pips: 3
    }
  };

  const cfg = configs[difficulty] || configs.easy;

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[10px] px-2 py-0.5 gap-1.5'
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-stat font-bold uppercase tracking-wider select-none ${cfg.style} ${sizeClasses[size]} ${className}`}
    >
      <span className="shrink-0">{cfg.icon}</span>
      <span>{cfg.label}</span>
      <span className="flex items-center gap-0.5 opacity-60 ml-0.5" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className={`w-1 h-1 rounded-full ${
              i < cfg.pips ? 'bg-current' : 'bg-white/10'
            }`}
          />
        ))}
      </span>
    </span>
  );
};
