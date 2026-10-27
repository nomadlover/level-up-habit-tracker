import React, { useState } from 'react';
import { Coins, Check, Gift } from 'lucide-react';
import { RewardValue } from './RewardValue';

export interface RewardCardProps {
  id: string;
  name: string;
  icon?: string;
  cost: number;
  claimedCount?: number;
  category?: 'perk' | 'treat' | 'custom' | string;
  currentGold: number;
  onClaim: () => void;
  className?: string;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  name,
  icon,
  cost,
  claimedCount = 0,
  category,
  currentGold,
  onClaim,
  className = ''
}) => {
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);
  const canAfford = currentGold >= cost;
  const missingGold = cost - currentGold;

  const handleClaimClick = () => {
    if (!canAfford) return;
    setIsSuccessFeedback(true);
    onClaim();
    setTimeout(() => {
      setIsSuccessFeedback(false);
    }, 1200);
  };

  const categoryLabel = category
    ? category === 'perk'
      ? 'Productivity Perk'
      : category === 'treat'
      ? 'Personal Treat'
      : 'Custom Reward'
    : null;

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all duration-200 bg-[#0E121B] ${
        canAfford
          ? 'border-white/[0.08] hover:border-white/[0.16] shadow-sm'
          : 'border-white/[0.04] opacity-80'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Column: Icon + Details */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Tactical Item Icon Frame */}
          <div className="w-11 h-11 rounded-xl bg-[#080A0F] border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner">
            {icon ? (
              <span aria-hidden="true">{icon}</span>
            ) : (
              <Gift className="w-5 h-5 text-[#F5B041]" />
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            {categoryLabel && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                {categoryLabel}
              </span>
            )}
            <h4 className="text-xs font-bold text-white break-words leading-snug mt-0.5">
              {name}
            </h4>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <RewardValue amount={cost} type="gold" size="sm" />

              {claimedCount > 0 && (
                <span className="text-[10px] text-slate-400 font-stat">
                  • Claimed {claimedCount}×
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Claim Action */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            type="button"
            disabled={!canAfford || isSuccessFeedback}
            onClick={handleClaimClick}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-stat transition-all duration-150 select-none flex items-center justify-center gap-1.5 active:scale-95 ${
              isSuccessFeedback
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : canAfford
                ? 'bg-gradient-to-r from-[#F5B041] to-[#E59866] text-[#080A0F] hover:brightness-105 shadow-sm shadow-[#F5B041]/20 font-black'
                : 'bg-white/[0.04] text-slate-500 border border-white/[0.06] cursor-not-allowed'
            }`}
            aria-label={
              canAfford
                ? `Claim ${name} for ${cost} gold`
                : `Cannot claim ${name}. Need ${missingGold} more gold.`
            }
          >
            {isSuccessFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                <span>Unlocked!</span>
              </>
            ) : canAfford ? (
              <>
                <Coins className="w-3.5 h-3.5 fill-[#080A0F]/20 text-[#080A0F]" />
                <span>Claim</span>
              </>
            ) : (
              <span>Locked</span>
            )}
          </button>

          {/* Missing Gold Informative Label */}
          {!canAfford && (
            <span className="text-[9px] font-stat text-slate-500">
              Need +{missingGold} Gold
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
