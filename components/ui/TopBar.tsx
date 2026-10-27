import React from 'react';
import { Flame, Coins, Settings } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

export interface TopBarProps {
  playerName: string;
  avatarIcon: string;
  classTitle: string;
  level: number;
  currentXP: number;
  gold: number;
  streakDays: number;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  playerName,
  avatarIcon,
  classTitle,
  level,
  currentXP,
  gold,
  streakDays,
  onOpenSettings
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#080A0F]/90 backdrop-blur-md border-b border-white/[0.08] pt-safe px-4 pb-3">
      <div className="max-w-md mx-auto flex flex-col gap-2.5">
        {/* Upper Row: Profile & Currency */}
        <div className="flex items-center justify-between">
          {/* Player Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#151A26] border border-white/15 flex items-center justify-center text-xl shadow-inner shrink-0">
              {avatarIcon || '⚔️'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-100 tracking-tight leading-none">
                  {playerName || 'Hunter'}
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#F5B041]/15 text-[#F5B041] border border-[#F5B041]/30 text-[9px] font-black tracking-widest font-stat">
                  LV.{level}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                {classTitle || 'Apprentice'}
              </span>
            </div>
          </div>

          {/* Tactical Stats Pills & Settings */}
          <div className="flex items-center gap-2">
            {/* Streak Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151A26] border border-orange-500/20 text-orange-400 font-stat text-xs font-bold shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-orange-500/30 text-orange-400 shrink-0" />
              <span>{streakDays}</span>
            </div>

            {/* Gold Pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#151A26] border border-[#F5B041]/25 text-[#F5B041] font-stat text-xs font-bold shadow-sm">
              <Coins className="w-3.5 h-3.5 text-[#F5B041] shrink-0" />
              <span>{gold.toLocaleString()}</span>
            </div>

            {/* Settings Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-[#151A26] hover:bg-[#1E2638] border border-white/10 text-slate-300 hover:text-white transition active:scale-95"
              aria-label="Settings and account"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Lower Row: XP Bar */}
        <div className="flex items-center gap-2.5">
          <ProgressBar
            value={currentXP % 200}
            max={200}
            color="gold"
            height="sm"
            className="flex-1"
          />
          <span className="text-[10px] font-stat text-slate-400 shrink-0 font-medium">
            {currentXP % 200} / 200 XP
          </span>
        </div>
      </div>
    </header>
  );
};
