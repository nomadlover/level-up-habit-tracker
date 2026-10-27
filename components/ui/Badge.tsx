import React from 'react';

export type BadgeVariant = 'gold' | 'blue' | 'emerald' | 'rose' | 'slate';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  difficulty?: 'easy' | 'medium' | 'hard';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'slate',
  difficulty,
  size = 'md',
  children,
  ...props
}) => {
  let effectiveVariant: BadgeVariant = variant;
  if (difficulty) {
    if (difficulty === 'easy') effectiveVariant = 'emerald';
    else if (difficulty === 'medium') effectiveVariant = 'blue';
    else if (difficulty === 'hard') effectiveVariant = 'rose';
  }

  const variants: Record<BadgeVariant, string> = {
    gold: 'bg-[#F5B041]/10 text-[#F5B041] border-[#F5B041]/30',
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    slate: 'bg-white/5 text-slate-300 border-white/10'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-bold tracking-wider',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border uppercase ${variants[effectiveVariant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
