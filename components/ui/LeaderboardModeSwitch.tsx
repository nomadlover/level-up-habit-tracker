import React from 'react';
import { Sparkles, Trophy, Flame } from 'lucide-react';

export type LeaderboardMode = 'all_time' | 'daily' | 'streaks';

export interface LeaderboardModeSwitchProps {
  currentMode: LeaderboardMode;
  onModeChange: (mode: LeaderboardMode) => void;
  className?: string;
}

export const LeaderboardModeSwitch: React.FC<LeaderboardModeSwitchProps> = ({
  currentMode,
  onModeChange,
  className = ''
}) => {
  const modes: { id: LeaderboardMode; label: string; icon: React.ReactNode }[] = [
    {
      id: 'daily',
      label: 'DAILY',
      icon: <Sparkles className="w-3.5 h-3.5" />
    },
    {
      id: 'all_time',
      label: 'ALL TIME',
      icon: <Trophy className="w-3.5 h-3.5" />
    },
    {
      id: 'streaks',
      label: 'STREAKS',
      icon: <Flame className="w-3.5 h-3.5" />
    }
  ];

  return (
    <div
      role="tablist"
      aria-label="Leaderboard Mode"
      className={`grid grid-cols-3 p-1 rounded-xl bg-[#0E121B] border border-white/[0.08] gap-1 ${className}`}
    >
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onModeChange(mode.id)}
            className={`py-2 px-2 rounded-lg text-[11px] font-bold tracking-wider font-stat transition-all duration-200 flex items-center justify-center gap-1.5 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F5B041]/50 active:scale-[0.98] ${
              isActive
                ? 'bg-white/[0.10] text-[#F5B041] border border-white/10 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <span className={isActive ? 'text-[#F5B041]' : 'text-slate-500'}>
              {mode.icon}
            </span>
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};
