import React from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { DifficultyBadge, QuestDifficulty } from './DifficultyBadge';
import { RewardValue } from './RewardValue';

export interface QuestCardProps {
  id: string;
  name: string;
  icon?: string;
  difficulty: QuestDifficulty;
  xpReward: number;
  goldReward: number;
  isCompleted: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  name,
  icon,
  difficulty,
  xpReward,
  goldReward,
  isCompleted,
  onToggle,
  onEdit,
  onDelete,
  className = ''
}) => {
  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-[#0E121B]/50 border-emerald-500/20 opacity-75'
          : 'bg-[#0E121B] border-white/[0.08] hover:border-white/[0.16] shadow-sm hover:shadow-md'
      } ${className}`}
    >
      <div className="p-3.5 flex items-center justify-between gap-3">
        {/* Checkbox Trigger & Habit Information */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Tactical Checkbox Button */}
          <button
            type="button"
            onClick={onToggle}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B041]/50 ${
              isCompleted
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.25)]'
                : 'bg-[#080A0F] border-white/15 text-slate-500 hover:border-slate-400 hover:text-slate-300'
            }`}
            aria-label={isCompleted ? `Mark ${name} incomplete` : `Complete ${name}`}
          >
            {isCompleted ? (
              <Check className="w-5 h-5 stroke-[3] text-emerald-400" />
            ) : icon ? (
              <span className="text-lg leading-none" aria-hidden="true">{icon}</span>
            ) : (
              <div className="w-2.5 h-2.5 rounded-sm bg-white/20" />
            )}
          </button>

          {/* Title & Metadata */}
          <div className="min-w-0 flex-1">
            <span
              className={`font-bold text-sm block break-words tracking-tight transition-colors duration-200 ${
                isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
              }`}
            >
              {name}
            </span>

            {/* Badges & Rewards */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <DifficultyBadge difficulty={difficulty} size="sm" />
              <RewardValue amount={xpReward} type="xp" size="sm" />
              <RewardValue amount={goldReward} type="gold" size="sm" />
            </div>
          </div>
        </div>

        {/* Secondary Action Controls */}
        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#F5B041] hover:bg-white/5 transition active:scale-95"
              title="Edit Quest"
              aria-label="Edit Quest"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition active:scale-95"
              title="Delete Quest"
              aria-label="Delete Quest"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
