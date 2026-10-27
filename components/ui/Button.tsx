import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading = false, disabled, icon, children, type = 'button', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B041]/50';

    const variants = {
      primary:
        'bg-gradient-to-r from-[#F5B041] to-[#E59866] text-[#080A0F] font-bold shadow-lg shadow-[#F5B041]/15 hover:brightness-105 active:brightness-95 border border-[#F5B041]/40 rounded-xl',
      secondary:
        'bg-[#121722] hover:bg-[#1A2234] text-slate-100 border border-white/10 hover:border-white/20 rounded-xl shadow-sm',
      outline:
        'bg-transparent hover:bg-white/5 text-slate-200 border border-white/15 hover:border-white/25 rounded-xl',
      ghost:
        'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white rounded-lg',
      danger:
        'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
      md: 'px-4 py-2.5 text-xs font-semibold gap-2 rounded-xl',
      lg: 'px-5 py-3.5 text-sm font-bold gap-2.5 rounded-xl',
      icon: 'p-2 rounded-lg'
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
