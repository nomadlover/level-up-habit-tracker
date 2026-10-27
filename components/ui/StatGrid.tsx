import React from 'react';
import { Flame, CheckCircle2, Coins, Zap, Award, Trophy } from 'lucide-react';
import { getHunterRank } from './RankEmblem';

export interface StatGridProps {
  level: number;
  totalXP: number;
  streakDays: number;
  gold: number;
  completedQuestsCount: number;
  userRank?: number | null;
  className?: string;
}

export const StatGrid: React.FC<StatGridProps> = ({
  level,
  totalXP,
  streakDays,
  gold,
  completedQuestsCount,
  userRank,
  className = ''
}) => {
  const rank = getHunterRank(level);

  const stats = [
    {
      id: 'streak',
      label: 'Discipline Streak',
      value: `${streakDays}d`,
      subtext: 'Consecutive Days',
      icon: <Flame className="w-3.5 h-3.5 text-amber-500" />,
      highlight: 'text-amber-400'
    },
    {
      id: 'quests',
      label: 'Quests Cleared',
      value: completedQuestsCount.toLocaleString(),
      subtext: 'Completed Missions',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />,
      highlight: 'text-sky-400'
    },
    {
      id: 'gold',
      label: 'Hunter Gold',
      value: gold.toLocaleString(),
      subtext: 'Armory Vault',
      icon: <Coins className="w-3.5 h-3.5 text-[#F5B041]" />,
      highlight: 'text-[#F5B041]'
    },
    {
      id: 'xp',
      label: 'Career Power',
      value: totalXP.toLocaleString(),
      subtext: 'Total Experience',
      icon: <Zap className="w-3.5 h-3.5 text-purple-400" />,
      highlight: 'text-purple-400'
    },
    {
      id: 'rank_tier',
      label: 'Hunter Classification',
      value: `Rank ${rank}`,
      subtext: `Level ${level} Hunter`,
      icon: <Award className="w-3.5 h-3.5 text-emerald-400" />,
      highlight: 'text-emerald-400'
    },
    {
      id: 'arena_rank',
      label: 'Arena Standing',
      value: userRank ? `#${userRank}` : '#1',
      subtext: 'Global Placement',
      icon: <Trophy className="w-3.5 h-3.5 text-amber-300" />,
      highlight: 'text-amber-300'
    }
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2.5 ${className}`}>
      {stats.map((item) => (
        <div
          key={item.id}
          className="rounded-xl bg-[#0E121B] border border-white/[0.08] p-3 flex flex-col justify-between hover:border-white/15 transition shadow-sm"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {item.label}
            </span>
            <div className="p-1 rounded-md bg-[#080A0F] border border-white/5 shrink-0">
              {item.icon}
            </div>
          </div>

          {/* Value Row */}
          <div className={`text-base sm:text-lg font-black font-stat tracking-tight ${item.highlight}`}>
            {item.value}
          </div>

          {/* Subtext */}
          <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
            {item.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};
