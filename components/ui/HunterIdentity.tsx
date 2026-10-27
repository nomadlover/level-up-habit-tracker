import React from 'react';
import { Crown, Sparkles, UserCheck } from 'lucide-react';
import { RankEmblem, getHunterRank, HunterRank } from './RankEmblem';
import { Badge } from './Badge';

export interface HunterIdentityProps {
  name: string;
  avatar: string;
  classTitle: string;
  level: number;
  isPro?: boolean;
  onEditAvatar?: () => void;
  className?: string;
}

export const HunterIdentity: React.FC<HunterIdentityProps> = ({
  name,
  avatar,
  classTitle,
  level,
  isPro = false,
  onEditAvatar,
  className = ''
}) => {
  const rank: HunterRank = getHunterRank(level);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#151A26] to-[#0E121B] border border-white/[0.08] p-5 shadow-lg shadow-black/40 ${className}`}
    >
      {/* Subtle Tactical Grid Background Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(245,176,65,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute top-2 right-3 text-[9px] font-stat font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
        DOSSIER // IDENT-0{level}
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left relative z-10">
        {/* Operative Avatar Frame */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-[#080A0F] border-2 border-[#F5B041]/70 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(245,176,65,0.2)] transition-transform duration-300 hover:scale-[1.02]">
            {avatar}
          </div>

          {/* Attached Mini Rank Shield */}
          <div className="absolute -bottom-2 -right-2">
            <RankEmblem level={level} size="compact" />
          </div>
        </div>

        {/* Identity Details */}
        <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start justify-center">
          {/* Name & Pro Status */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <h2 className="text-lg font-black text-white tracking-wide break-words">
              {name || 'Unknown Operative'}
            </h2>
            {isPro && (
              <span title="Pro Operative" className="inline-flex">
                <Crown className="w-4 h-4 text-[#F5B041] drop-shadow-[0_0_6px_rgba(245,176,65,0.4)]" />
              </span>
            )}
          </div>

          {/* Hunter Class Title */}
          <div className="text-xs font-bold text-[#F5B041] uppercase tracking-wider mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F5B041]/80" />
            <span>{classTitle || 'Novice Hunter'}</span>
          </div>

          {/* Badges / Status Meta */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <Badge variant="gold" size="sm">
              RANK {rank} • LV.{level.toString().padStart(2, '0')}
            </Badge>

            {onEditAvatar && (
              <button
                type="button"
                onClick={onEditAvatar}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition active:scale-95 flex items-center gap-1"
                title="Change Avatar"
              >
                <UserCheck className="w-3 h-3 text-slate-400" />
                <span>Change Icon</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
