import React from 'react';

export interface SettingsToggleProps {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  icon,
  className = ''
}) => {
  const toggleId = id || `toggle-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleToggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div
      className={`min-h-[48px] py-2 flex items-center justify-between gap-3 ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${className}`}
    >
      {/* Label and description with full clickable target */}
      <div
        onClick={handleToggle}
        className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer select-none"
      >
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-slate-300">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <label
            htmlFor={toggleId}
            className="text-xs sm:text-sm font-semibold text-white block cursor-pointer leading-tight"
          >
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Semantic Switch Button with 44×44px touch container */}
      <div className="relative flex items-center justify-center shrink-0 min-w-[44px] min-h-[44px]">
        <button
          id={toggleId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`w-11 h-6 rounded-full transition-colors duration-200 relative p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B041] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080A0F] active:scale-95 touch-manipulation cursor-pointer ${
            checked ? 'bg-[#F5B041]' : 'bg-white/15'
          }`}
        >
          {/* Thumb */}
          <span
            className={`w-5 h-5 rounded-full bg-[#080A0F] shadow-sm transform transition-transform duration-200 block ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
