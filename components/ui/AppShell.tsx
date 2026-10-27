import React from 'react';
import { TopBar } from './TopBar';
import { BottomNav, MainTab } from './BottomNav';

export interface AppShellProps {
  playerName: string;
  avatarIcon: string;
  classTitle: string;
  level: number;
  currentXP: number;
  gold: number;
  streakDays: number;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenSettings: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  playerName,
  avatarIcon,
  classTitle,
  level,
  currentXP,
  gold,
  streakDays,
  activeTab,
  onTabChange,
  onOpenSettings,
  children
}) => {
  return (
    <div className="min-h-screen bg-[#080A0F] text-slate-100 flex flex-col selection:bg-[#F5B041]/30">
      {/* Persistent Player Top HUD */}
      <TopBar
        playerName={playerName}
        avatarIcon={avatarIcon}
        classTitle={classTitle}
        level={level}
        currentXP={currentXP}
        gold={gold}
        streakDays={streakDays}
        onOpenSettings={onOpenSettings}
      />

      {/* Main View Area with Mobile Bottom Navigation Padding */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-24">
        {children}
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};
