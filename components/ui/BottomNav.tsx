import React from 'react';
import { Swords, Trophy, Sparkles, User } from 'lucide-react';

export type MainTab = 'quests' | 'leaderboard' | 'shop' | 'profile';

export interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'quests',
      label: 'Quests',
      icon: <Swords className="w-5 h-5" />
    },
    {
      id: 'leaderboard',
      label: 'Rankings',
      icon: <Trophy className="w-5 h-5" />
    },
    {
      id: 'shop',
      label: 'Loot Shop',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      id: 'profile',
      label: 'Hunter',
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#080A0F]/95 backdrop-blur-lg border-t border-white/[0.08] px-2 pb-safe"
      aria-label="Main Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center h-full transition-all duration-200 active:scale-95 relative ${
                isActive ? 'text-[#F5B041]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#F5B041] shadow-[0_0_8px_#F5B041]" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-semibold tracking-tight ${isActive ? 'text-[#F5B041]' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
