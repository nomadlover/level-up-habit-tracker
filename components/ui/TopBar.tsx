import React from 'react';
import { Flame, Coins, Settings } from 'lucide-react';
import { RankEmblem, getHunterRank } from './RankEmblem';
import { ProgressBar } from './ProgressBar';

export interface TopBarProps {
  playerName: string;
  avatarIcon?: string;
  classTitle: string;
  level: number;
  currentXP: number;
  requiredXP?: number;
  gold: number;
  streakDays: number;
  onOpenSettings: () => void;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  playerName,
  avatarIcon,
  classTitle,
  level,
  currentXP,
  requiredXP = 200,
  gold,
  streakDays,
  onOpenSettings,
  className = ''
}) => {
  const rank = getHunterRank(level);
  const safeRequiredXP = Math.max(1, requiredXP);
  const xpPercent = Math.min(100, Math.round((currentXP / safeRequiredXP) * 100));

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[#080A0F]/90 backdrop-blur-md border-b border-white/[0.08] pt-safe px-4 pb-2.5 ${className}`}
    >
      <div className="max-w-md mx-auto flex flex-col gap-2">
        {/* Upper Row: Rank + Identity + Currency / Streak Stats */}
        <div className="flex items-center justify-between gap-2">
          {/* Player Rank & Level Dossier */}
          <div className="flex items-center gap-2.5 min-w-0">
            <RankEmblem rank={rank} size="default" />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-none">
                {avatarIcon && <span className="text-xs shrink-0">{avatarIcon}</span>}
                <span className="text-xs font-bold text-slate-100 truncate max-w-[110px]">
                  {playerName || 'Hunter'}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-slate-300 border border-white/10 text-[9px] font-black tracking-wider font-stat shrink-0">
                  LV.{level}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 block truncate mt-1 leading-none">
                {classTitle || 'Novice Hunter'}
              </span>
            </div>
          </div>

          {/* Tactical Resource HUD & Settings */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Streak Indicator */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0E121B] border border-orange-500/25 text-orange-400 font-stat text-xs font-bold shadow-sm"
              title={`${streakDays} Day Streak`}
            >
              <Flame className="w-3.5 h-3.5 fill-orange-500/30 text-orange-400 shrink-0" />
              <span>{streakDays}d</span>
            </div>

            {/* Gold Balance */}
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#0E121B] border border-[#F5B041]/25 text-[#F5B041] font-stat text-xs font-bold shadow-sm"
              title={`${gold.toLocaleString()} Gold`}
            >
              <Coins className="w-3.5 h-3.5 text-[#F5B041] shrink-0" />
              <span>{gold.toLocaleString()}</span>
            </div>

            {/* Settings Trigger */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-[#0E121B] hover:bg-[#151A26] border border-white/10 text-slate-400 hover:text-white transition active:scale-95"
              aria-label="Settings and account configuration"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lower Row: Sleek Tabular XP Progression Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-stat text-slate-400 leading-none">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">EXP</span>
            <span className="font-bold text-slate-300">
              <span className="text-[#F5B041]">{currentXP.toLocaleString()}</span> / {safeRequiredXP.toLocaleString()} XP{' '}
              <span className="text-slate-500 font-normal">({xpPercent}%)</span>
            </span>
          </div>

          <ProgressBar
            value={currentXP}
            max={safeRequiredXP}
            color="gold"
            height="sm"
          />
        </div>
      </div>
    </header>
  );
};
