import React from 'react';
import { Crown, Medal } from 'lucide-react';
import { RankEmblem, getHunterRank } from './RankEmblem';

export interface PodiumEntry {
  rank: 1 | 2 | 3;
  username: string;
  avatarIcon?: string;
  level: number;
  metricLabel: string;
  isCurrentUser?: boolean;
  isPro?: boolean;
}

export interface LeaderboardPodiumProps {
  entries: PodiumEntry[];
  className?: string;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({
  entries,
  className = ''
}) => {
  const first = entries.find((e) => e.rank === 1);
  const second = entries.find((e) => e.rank === 2);
  const third = entries.find((e) => e.rank === 3);

  if (!first) return null;

  const renderCard = (entry: PodiumEntry | undefined, targetRank: 1 | 2 | 3) => {
    if (!entry) {
      return (
        <div className="flex-1 flex flex-col items-center justify-end p-2.5 rounded-2xl border border-white/[0.04] bg-[#0E121B]/40 opacity-40">
          <span className="text-[10px] font-bold text-slate-600 font-stat">#{targetRank}</span>
          <span className="text-[10px] text-slate-600 mt-1">Empty Slot</span>
        </div>
      );
    }

    const isFirst = targetRank === 1;
    const isSecond = targetRank === 2;
    const hunterRank = getHunterRank(entry.level);

    const borderColor = isFirst
      ? 'border-[#F5B041]/40'
      : isSecond
      ? 'border-slate-300/30'
      : 'border-amber-700/30';

    const rankBadge = isFirst ? (
      <div className="flex items-center gap-1 text-[#F5B041]">
        <Crown className="w-3.5 h-3.5 fill-[#F5B041]/30" />
        <span className="text-xs font-black font-stat">#1</span>
      </div>
    ) : isSecond ? (
      <div className="flex items-center gap-1 text-slate-300">
        <Medal className="w-3 h-3 text-slate-300" />
        <span className="text-xs font-black font-stat">#2</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-amber-500">
        <Medal className="w-3 h-3 text-amber-600" />
        <span className="text-xs font-black font-stat">#3</span>
      </div>
    );

    return (
      <div
        className={`flex-1 flex flex-col items-center justify-between p-3 rounded-2xl border bg-[#0E121B] shadow-sm relative transition-all duration-200 ${
          isFirst ? '-mt-2 pb-3.5 bg-gradient-to-b from-[#151A26] to-[#0E121B] shadow-[0_4px_20px_rgba(245,176,65,0.12)]' : 'mt-2'
        } ${borderColor} ${entry.isCurrentUser ? 'ring-1 ring-[#F5B041]/50' : ''}`}
      >
        {/* Top: Rank Badge & Emblem */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {rankBadge}

          <div className="relative my-0.5">
            <RankEmblem rank={hunterRank} size={isFirst ? 'default' : 'compact'} />
            {entry.avatarIcon && (
              <span className="absolute -bottom-1 -right-1 text-xs filter drop-shadow-sm">
                {entry.avatarIcon}
              </span>
            )}
          </div>
        </div>

        {/* Center: Operative Details */}
        <div className="text-center w-full min-w-0 mt-1">
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs font-bold text-white truncate max-w-[85px] leading-tight">
              {entry.username || 'Hunter'}
            </span>
            {entry.isCurrentUser && (
              <span className="text-[8px] px-1 py-0.2 rounded bg-[#F5B041]/20 text-[#F5B041] font-black uppercase">
                You
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-stat font-medium block mt-0.5">
            LV.{entry.level}
          </span>
        </div>

        {/* Bottom: Metric */}
        <div className="w-full text-center mt-2 pt-1.5 border-t border-white/5">
          <span
            className={`text-[11px] font-black font-stat truncate block ${
              isFirst ? 'text-[#F5B041]' : isSecond ? 'text-slate-200' : 'text-amber-400'
            }`}
          >
            {entry.metricLabel}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`grid grid-cols-3 gap-2 items-end pt-2 px-0.5 ${className}`}>
      {/* 2nd Place: Left */}
      {renderCard(second, 2)}

      {/* 1st Place: Center (Elevated) */}
      {renderCard(first, 1)}

      {/* 3rd Place: Right */}
      {renderCard(third, 3)}
    </div>
  );
};
