import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'gold' | 'blue' | 'emerald';
  height?: 'sm' | 'md' | 'lg';
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'gold',
  height = 'md',
  label,
  showPercent = false,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));

  const colors = {
    gold: 'bg-gradient-to-r from-[#F5B041] to-[#E59866] shadow-[0_0_12px_rgba(245,176,65,0.35)]',
    blue: 'bg-gradient-to-r from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.35)]',
    emerald: 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-[11px] font-stat text-slate-300">
          {label && <span className="font-semibold text-slate-400">{label}</span>}
          {showPercent && <span className="font-bold text-slate-200">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-[#080A0F] border border-white/10 rounded-full overflow-hidden ${heights[height]} p-0.5`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
