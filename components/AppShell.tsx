import React from 'react';
import { TopBar } from './ui/TopBar';
import { BottomNav, MainTab } from './ui/BottomNav';

export interface AppShellProps {
  playerName: string;
  avatarIcon?: string;
  classTitle: string;
  level: number;
  currentXP: number;
  requiredXP?: number;
  gold: number;
  streakDays: number;
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenSettings: () => void;
  children: React.ReactNode;
  floatingSlot?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  playerName,
  avatarIcon,
  classTitle,
  level,
  currentXP,
  requiredXP,
  gold,
  streakDays,
  activeTab,
  onTabChange,
  onOpenSettings,
  children,
  floatingSlot
}) => {
  return (
    <div className="min-h-[100dvh] bg-[#080A0F] text-slate-100 flex flex-col items-center justify-start relative selection:bg-[#F5B041]/30 selection:text-[#F5B041]">
      {/* Floating particles or notifications */}
      {floatingSlot}

      {/* Persistent Mobile Smartphone Container */}
      <div className="w-full max-w-md min-h-[100dvh] flex flex-col relative pb-[calc(4.5rem+env(safe-area-inset-bottom,16px))]">
        {/* Persistent Top Player Status HUD */}
        <TopBar
          playerName={playerName}
          avatarIcon={avatarIcon}
          classTitle={classTitle}
          level={level}
          currentXP={currentXP}
          requiredXP={requiredXP}
          gold={gold}
          streakDays={streakDays}
          onOpenSettings={onOpenSettings}
        />

        {/* Dynamic Screen Content Viewport */}
        <main className="flex-1 px-4 py-3 space-y-4">
          {children}
        </main>

        {/* Persistent Mobile Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </div>
    </div>
  );
};

export default AppShell;
