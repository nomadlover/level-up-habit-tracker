import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'elevated' | 'interactive' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'base', padding = 'md', children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-200';

    const variants = {
      base: 'bg-[#0E121B] border border-white/[0.08] shadow-sm',
      elevated: 'bg-[#151A26] border border-white/[0.12] shadow-lg shadow-black/40',
      interactive: 'bg-[#0E121B] hover:bg-[#131926] border border-white/[0.08] hover:border-white/[0.18] active:scale-[0.99] cursor-pointer shadow-sm',
      accent: 'bg-gradient-to-b from-[#151A26] to-[#0E121B] border border-[#F5B041]/30 shadow-lg shadow-[#F5B041]/5'
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5 sm:p-6'
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
