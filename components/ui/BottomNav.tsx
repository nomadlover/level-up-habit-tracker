import React from 'react';
import { Swords, Trophy, Sparkles, User } from 'lucide-react';

export type MainTab = 'quests' | 'leaderboard' | 'shop' | 'profile';

export interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  className?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'quests',
      label: 'Quests',
      icon: <Swords className="w-5 h-5" />
    },
    {
      id: 'leaderboard',
      label: 'Rank',
      icon: <Trophy className="w-5 h-5" />
    },
    {
      id: 'shop',
      label: 'Loot',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[#080A0F]/95 backdrop-blur-lg border-t border-white/[0.08] px-3 pb-safe ${className}`}
      aria-label="Main Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center gap-1" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 active:scale-95 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F5B041]/50 ${
                isActive
                  ? 'bg-white/[0.06] text-[#F5B041]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'scale-100 opacity-70'
                }`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-[10px] mt-1 font-stat tracking-wider uppercase font-semibold leading-none ${
                  isActive ? 'text-[#F5B041]' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
