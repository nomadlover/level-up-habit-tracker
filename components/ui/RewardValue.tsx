import React from 'react';
import { Sparkles, Coins } from 'lucide-react';

export interface RewardValueProps {
  amount: number;
  type: 'xp' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  prefix?: string;
  showIcon?: boolean;
  className?: string;
}

export const RewardValue: React.FC<RewardValueProps> = ({
  amount,
  type,
  size = 'md',
  prefix = '+',
  showIcon = true,
  className = ''
}) => {
  const isXP = type === 'xp';

  const sizeClasses = {
    sm: {
      wrap: 'gap-1',
      icon: 'w-3 h-3',
      num: 'text-[11px]',
      label: 'text-[9px]'
    },
    md: {
      wrap: 'gap-1.5',
      icon: 'w-3.5 h-3.5',
      num: 'text-xs',
      label: 'text-[10px]'
    },
    lg: {
      wrap: 'gap-2',
      icon: 'w-4 h-4',
      num: 'text-sm',
      label: 'text-xs'
    }
  };

  const s = sizeClasses[size];

  const typeConfig = isXP
    ? {
        color: 'text-sky-400',
        icon: <Sparkles className={`${s.icon} text-sky-400 shrink-0`} />,
        label: 'XP',
        bg: 'bg-sky-500/10 border-sky-500/20'
      }
    : {
        color: 'text-[#F5B041]',
        icon: <Coins className={`${s.icon} text-[#F5B041] shrink-0`} />,
        label: 'G',
        bg: 'bg-[#F5B041]/10 border-[#F5B041]/20'
      };

  return (
    <span
      className={`inline-flex items-center ${s.wrap} px-2 py-0.5 rounded-md border font-stat font-semibold select-none ${typeConfig.bg} ${typeConfig.color} ${className}`}
    >
      {showIcon && typeConfig.icon}
      <span className={`font-bold ${s.num} tracking-tight leading-none`}>
        {prefix}{amount.toLocaleString()}
      </span>
      <span className={`opacity-80 font-medium ${s.label} uppercase tracking-wider leading-none`}>
        {typeConfig.label}
      </span>
    </span>
  );
};
