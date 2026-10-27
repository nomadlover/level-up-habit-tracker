import React from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';

export interface SettingsRowProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  isExternal?: boolean;
  destructive?: boolean;
  rightBadge?: React.ReactNode;
  className?: string;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  description,
  icon,
  children,
  onClick,
  href,
  isExternal = false,
  destructive = false,
  rightBadge,
  className = ''
}) => {
  const content = (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {icon && (
        <div
          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 text-sm ${
            destructive
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : 'bg-white/5 border-white/10 text-slate-300'
          }`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div
          className={`text-xs sm:text-sm font-semibold truncate leading-tight ${
            destructive ? 'text-rose-400' : 'text-slate-100'
          }`}
        >
          {label}
        </div>
        {description && (
          <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );

  const baseRowStyles = `min-h-[48px] py-3 px-3.5 rounded-xl border border-white/[0.06] bg-[#0E121B] flex items-center justify-between gap-3 transition-colors ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className={`${baseRowStyles} hover:bg-[#151A26] active:scale-[0.99] group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F5B041]`}
      >
        {content}
        <div className="flex items-center gap-2 shrink-0">
          {rightBadge}
          {isExternal ? (
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
          )}
        </div>
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseRowStyles} hover:bg-[#151A26] active:scale-[0.99] text-left w-full cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F5B041]`}
      >
        {content}
        <div className="flex items-center gap-2 shrink-0">
          {rightBadge}
          {children || <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>
    );
  }

  return (
    <div className={baseRowStyles}>
      {content}
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
};
