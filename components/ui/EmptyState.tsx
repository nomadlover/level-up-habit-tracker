import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#0E121B]/60 border border-white/[0.06] ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#151A26] border border-white/10 flex items-center justify-center text-slate-300 mb-3.5 shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-200 tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
