import React from 'react';
import { Crown, Medal } from 'lucide-react';
import { RankEmblem, getHunterRank } from './RankEmblem';

export interface LeaderboardRowProps {
  rank: number;
  username: string;
  avatarIcon?: string;
  level: number;
  metricLabel: string;
  isCurrentUser?: boolean;
  isPro?: boolean;
  className?: string;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  rank,
  username,
  avatarIcon,
  level,
  metricLabel,
  isCurrentUser = false,
  isPro = false,
  className = ''
}) => {
  const hunterRank = getHunterRank(level);

  const isRank1 = rank === 1;
  const isRank2 = rank === 2;
  const isRank3 = rank === 3;

  let rankDisplay: React.ReactNode = (
    <span className="text-xs font-bold font-stat text-slate-500 w-6 text-center shrink-0">
      #{rank}
    </span>
  );

  let borderStyle = 'border-white/[0.06] bg-[#0E121B]';

  if (isCurrentUser) {
    borderStyle = 'border-[#F5B041]/40 bg-[#0E121B] shadow-[0_0_12px_rgba(245,176,65,0.08)]';
  } else if (isRank1) {
    borderStyle = 'border-amber-400/30 bg-[#0E121B]';
    rankDisplay = (
      <div className="flex flex-col items-center justify-center w-6 shrink-0">
        <Crown className="w-3.5 h-3.5 text-[#F5B041]" />
        <span className="text-xs font-black font-stat text-[#F5B041]">#1</span>
      </div>
    );
  } else if (isRank2) {
    borderStyle = 'border-slate-300/25 bg-[#0E121B]';
    rankDisplay = (
      <div className="flex flex-col items-center justify-center w-6 shrink-0">
        <Medal className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-xs font-black font-stat text-slate-300">#2</span>
      </div>
    );
  } else if (isRank3) {
    borderStyle = 'border-amber-700/25 bg-[#0E121B]';
    rankDisplay = (
      <div className="flex flex-col items-center justify-center w-6 shrink-0">
        <Medal className="w-3.5 h-3.5 text-amber-600" />
        <span className="text-xs font-black font-stat text-amber-500">#3</span>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-2xl border flex items-center justify-between transition-all duration-150 ${borderStyle} ${className}`}
    >
      {/* Left Column: Rank + Emblem/Avatar + Operative Name/Level */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {rankDisplay}

        {/* Tactical Rank Emblem */}
        <div className="shrink-0">
          <RankEmblem rank={hunterRank} size="compact" />
        </div>

        {/* Avatar + Operative Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 leading-none">
            {avatarIcon && (
              <span className="text-sm shrink-0" aria-hidden="true">
                {avatarIcon}
              </span>
            )}
            <span
              className={`text-xs font-bold truncate ${
                isCurrentUser ? 'text-white' : 'text-slate-200'
              }`}
            >
              {username || 'Anonymous Hunter'}
            </span>
            {isCurrentUser && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#F5B041]/20 text-[#F5B041] font-black uppercase tracking-wider shrink-0">
                You
              </span>
            )}
            {isPro && (
              <span title="Pro Operative" className="inline-flex">
                <Crown className="w-3 h-3 text-[#F5B041] shrink-0" />
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-stat font-medium block mt-1 leading-none">
            LV.{level}
          </span>
        </div>
      </div>

      {/* Right Column: Mode Metric */}
      <div className="text-right shrink-0 pl-2">
        <span
          className={`text-xs font-black font-stat tracking-tight ${
            isRank1
              ? 'text-[#F5B041]'
              : isRank2
              ? 'text-slate-200'
              : isRank3
              ? 'text-amber-400'
              : isCurrentUser
              ? 'text-[#F5B041]'
              : 'text-slate-300'
          }`}
        >
          {metricLabel}
        </span>
      </div>
    </div>
  );
};
