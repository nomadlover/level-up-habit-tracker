import React from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';

export interface ProgressionCardProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  totalXP: number;
  className?: string;
}

export const ProgressionCard: React.FC<ProgressionCardProps> = ({
  level,
  currentXP,
  requiredXP,
  totalXP,
  className = ''
}) => {
  const remainingXP = Math.max(0, requiredXP - currentXP);
  const progressPercent = Math.min(100, Math.max(0, requiredXP > 0 ? (currentXP / requiredXP) * 100 : 0));

  return (
    <Card variant="base" padding="md" className={`space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#F5B041]/10 border border-[#F5B041]/20 flex items-center justify-center text-[#F5B041]">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Experience Progression
            </h3>
            <div className="text-[10px] text-slate-400 font-stat">
              Target Level: <span className="text-[#F5B041] font-bold">LV.{level + 1}</span>
            </div>
          </div>
        </div>

        {/* Remaining XP Tag */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#080A0F] border border-white/10 text-[10px] font-stat font-semibold text-slate-300">
          <TrendingUp className="w-3 h-3 text-[#F5B041]" />
          <span>+{remainingXP.toLocaleString()} XP to Next</span>
        </div>
      </div>

      {/* Progress Bar & Numerical Metrics */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline text-xs font-stat">
          <span className="text-slate-400 font-medium">Current XP Pool</span>
          <span className="font-bold text-white">
            <span className="text-[#F5B041]">{currentXP.toLocaleString()}</span>
            <span className="text-slate-500 font-normal"> / </span>
            <span>{requiredXP.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-normal ml-1">({Math.round(progressPercent)}%)</span>
          </span>
        </div>

        <ProgressBar
          value={currentXP}
          max={requiredXP}
          color="gold"
          height="md"
        />
      </div>

      {/* Career XP Stats Footer */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-stat">
        <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
          Lifetime Career XP
        </span>
        <span className="font-bold text-slate-200 flex items-center gap-1">
          <span className="text-[#F5B041]">⚡</span>
          <span>{totalXP.toLocaleString()} XP</span>
        </span>
      </div>
    </Card>
  );
};
