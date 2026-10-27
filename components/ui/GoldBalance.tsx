import React, { useEffect, useState, useRef } from 'react';
import { Coins, Plus } from 'lucide-react';

export interface GoldBalanceProps {
  gold: number;
  onAddCustomReward?: () => void;
  className?: string;
}

export const GoldBalance: React.FC<GoldBalanceProps> = ({
  gold,
  onAddCustomReward,
  className = ''
}) => {
  const [displayedGold, setDisplayedGold] = useState(gold);
  const [recentDeduction, setRecentDeduction] = useState<number | null>(null);
  const prevGoldRef = useRef(gold);

  useEffect(() => {
    const prev = prevGoldRef.current;
    if (gold < prev) {
      // User spent gold
      const diff = prev - gold;
      setRecentDeduction(diff);
      const timer = setTimeout(() => {
        setRecentDeduction(null);
      }, 700);

      // Smooth number step transition
      const startTime = performance.now();
      const duration = 400; // ms

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const currentVal = Math.round(prev - diff * progress);
        setDisplayedGold(currentVal);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          setDisplayedGold(gold);
        }
      };

      requestAnimationFrame(step);
      prevGoldRef.current = gold;
      return () => clearTimeout(timer);
    } else {
      setDisplayedGold(gold);
      prevGoldRef.current = gold;
    }
  }, [gold]);

  return (
    <div
      className={`p-4 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm flex items-center justify-between relative overflow-hidden ${className}`}
    >
      {/* Balance Details */}
      <div className="space-y-0.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Your Armory Vault
        </span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F5B041]/10 border border-[#F5B041]/25 flex items-center justify-center text-[#F5B041]">
            <Coins className="w-4 h-4 text-[#F5B041]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-stat text-white tracking-tight">
              {displayedGold.toLocaleString()}
            </span>
            <span className="text-xs font-black font-stat text-[#F5B041] uppercase">
              GOLD
            </span>

            {/* Spent Gold Deduction Pill */}
            {recentDeduction !== null && (
              <span className="text-xs font-bold font-stat text-rose-400 animate-in fade-in slide-in-from-bottom-1 duration-200 ml-1">
                -{recentDeduction} G
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Button: Custom Reward */}
      {onAddCustomReward && (
        <button
          type="button"
          onClick={onAddCustomReward}
          className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-sm"
          title="Create a personal reward"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5] text-[#F5B041]" />
          <span>New Reward</span>
        </button>
      )}
    </div>
  );
};
