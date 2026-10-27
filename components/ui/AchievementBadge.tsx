import React from 'react';
import { Lock, Check } from 'lucide-react';

export interface AchievementBadgeProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  reqText?: string;
  progress?: { current: number; max: number };
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  isUnlocked,
  reqText,
  progress,
  className = ''
}) => {
  return (
    <div
      className={`relative p-3 rounded-xl border transition-all duration-200 flex items-start gap-2.5 ${
        isUnlocked
          ? 'bg-gradient-to-b from-[#151A26] to-[#0E121B] border-[#F5B041]/35 shadow-[0_0_12px_rgba(245,176,65,0.06)]'
          : 'bg-[#080A0F]/60 border-white/[0.06] opacity-65'
      } ${className}`}
    >
      {/* Icon Frame */}
      <div
        className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-lg border transition ${
          isUnlocked
            ? 'bg-[#080A0F] border-[#F5B041]/50 text-[#F5B041] shadow-[0_0_8px_rgba(245,176,65,0.2)]'
            : 'bg-white/[0.02] border-white/10 text-slate-500 grayscale'
        }`}
      >
        {icon}
      </div>

      {/* Info Block */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <h4
            className={`text-xs font-bold leading-tight truncate ${
              isUnlocked ? 'text-white' : 'text-slate-400'
            }`}
          >
            {title}
          </h4>

          {/* Status Indicator (Lock vs Check) */}
          <div className="shrink-0">
            {isUnlocked ? (
              <span
                className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400"
                title="Achievement Unlocked"
              >
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            ) : (
              <span
                className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500"
                title="Locked Achievement"
              >
                <Lock className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-tight line-clamp-2 mt-0.5">
          {description}
        </p>

        {/* Progress or Requirement */}
        {reqText && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-stat">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                isUnlocked
                  ? 'bg-[#F5B041]/10 text-[#F5B041] border border-[#F5B041]/20'
                  : 'bg-white/5 text-slate-500 border border-white/5'
              }`}
            >
              {isUnlocked ? 'Completed' : reqText}
            </span>

            {!isUnlocked && progress && (
              <span className="text-slate-500 text-[10px]">
                ({progress.current}/{progress.max})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
