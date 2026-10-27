import React from 'react';

export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export const getHunterRank = (level: number): HunterRank => {
  if (level >= 25) return 'S';
  if (level >= 20) return 'A';
  if (level >= 15) return 'B';
  if (level >= 10) return 'C';
  if (level >= 5) return 'D';
  return 'E';
};

export interface RankEmblemProps {
  rank?: HunterRank;
  level?: number;
  size?: 'compact' | 'default' | 'large';
  showLabel?: boolean;
  className?: string;
}

export const RankEmblem: React.FC<RankEmblemProps> = ({
  rank: explicitRank,
  level,
  size = 'default',
  showLabel = false,
  className = ''
}) => {
  const rank: HunterRank = explicitRank ?? (level !== undefined ? getHunterRank(level) : 'E');

  // Strict tactical styling per rank tier
  const tierConfig: Record<HunterRank, {
    border: string;
    bg: string;
    text: string;
    glow: string;
    label: string;
  }> = {
    S: {
      border: 'border-[#F5B041]/70',
      bg: 'bg-gradient-to-b from-[#F5B041]/25 to-[#F5B041]/5',
      text: 'text-[#F5B041]',
      glow: 'shadow-[0_0_12px_rgba(245,176,65,0.35)]',
      label: 'S-Rank'
    },
    A: {
      border: 'border-purple-500/60',
      bg: 'bg-gradient-to-b from-purple-500/25 to-purple-500/5',
      text: 'text-purple-400',
      glow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
      label: 'A-Rank'
    },
    B: {
      border: 'border-sky-500/60',
      bg: 'bg-gradient-to-b from-sky-500/25 to-sky-500/5',
      text: 'text-sky-400',
      glow: 'shadow-[0_0_10px_rgba(56,189,248,0.25)]',
      label: 'B-Rank'
    },
    C: {
      border: 'border-emerald-500/50',
      bg: 'bg-gradient-to-b from-emerald-500/20 to-emerald-500/5',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_8px_rgba(52,211,153,0.2)]',
      label: 'C-Rank'
    },
    D: {
      border: 'border-slate-400/40',
      bg: 'bg-gradient-to-b from-slate-400/15 to-slate-400/5',
      text: 'text-slate-300',
      glow: 'shadow-[0_0_6px_rgba(148,163,184,0.15)]',
      label: 'D-Rank'
    },
    E: {
      border: 'border-white/15',
      bg: 'bg-gradient-to-b from-white/10 to-white/[0.02]',
      text: 'text-slate-400',
      glow: 'shadow-none',
      label: 'E-Rank'
    }
  };

  const config = tierConfig[rank];

  const sizeClasses = {
    compact: {
      box: 'w-6 h-6 text-[11px]',
      svg: 'w-6 h-6',
      fontSize: 'text-[11px]'
    },
    default: {
      box: 'w-8 h-8 text-xs',
      svg: 'w-8 h-8',
      fontSize: 'text-xs'
    },
    large: {
      box: 'w-10 h-10 text-sm',
      svg: 'w-10 h-10',
      fontSize: 'text-sm'
    }
  };

  const s = sizeClasses[size];

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {/* Geometric Tactical Shield Emblem */}
      <div
        className={`relative ${s.box} flex items-center justify-center font-stat font-black tracking-wider rounded-lg border ${config.border} ${config.bg} ${config.text} ${config.glow} transition-all duration-300`}
        title={`${config.label} Hunter`}
        aria-label={`${config.label} Hunter`}
      >
        {/* Subtle internal corner brackets for tactical HUD feel */}
        <span className="absolute top-0.5 left-0.5 w-1 h-1 border-t border-l border-white/20" />
        <span className="absolute bottom-0.5 right-0.5 w-1 h-1 border-b border-r border-white/20" />
        <span className="leading-none">{rank}</span>
      </div>

      {showLabel && (
        <span className={`font-stat font-bold ${config.text} ${s.fontSize}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};
