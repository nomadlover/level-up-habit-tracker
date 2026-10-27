import React from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Bell,
  BellOff,
  Sparkles,
  FileText,
  Mail,
  LogOut,
  Trash2,
  Crown,
  Eye,
  Sliders
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SettingsToggle } from '../ui/SettingsToggle';
import { SettingsRow } from '../ui/SettingsRow';
import { Badge } from '../ui/Badge';
import { RankEmblem } from '../ui/RankEmblem';
import { UserPreferences, MotionPreference } from '../../app/utils/preferences';

export interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: {
    name: string;
    avatar: string;
    level: number;
    classTitle: string;
    isPro?: boolean;
  };
  currentUserEmail?: string | null;
  preferences: UserPreferences;
  isReducedMotion: boolean;
  onToggleSound: (enabled: boolean) => void;
  onToggleHaptics: (enabled: boolean) => void;
  onSetReducedMotion: (mode: MotionPreference) => void;
  onToggleNotifications: (enabled: boolean) => void;
  onSignOut: () => void;
  onRequestDeleteAccount: () => void;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  feedbackUrl: string;
  supportEmail: string;
  appVersion: string;
  buildNumber: string;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  player,
  currentUserEmail,
  preferences,
  isReducedMotion,
  onToggleSound,
  onToggleHaptics,
  onSetReducedMotion,
  onToggleNotifications,
  onSignOut,
  onRequestDeleteAccount,
  privacyPolicyUrl,
  termsOfServiceUrl,
  feedbackUrl,
  supportEmail,
  appVersion,
  buildNumber
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F5B041]/10 border border-[#F5B041]/30 flex items-center justify-center text-[#F5B041]">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">System Configuration</span>
            <p className="text-[10px] text-slate-400 font-normal">Sensory preferences & operative identity</p>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-left pb-2">
        {/* ---------------------------------------------------- */}
        {/* 1. ACCOUNT SECTION                                   */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Operative Account
          </span>

          <div className="p-3.5 rounded-xl bg-[#0E121B] border border-white/[0.08] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-[#080A0F] border border-[#F5B041]/50 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                {player.avatar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {player.name || 'Operative'}
                  </span>
                  {player.isPro && (
                    <span title="VIP Pro Hunter" className="inline-flex">
                      <Crown className="w-3.5 h-3.5 text-[#F5B041]" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {currentUserEmail || 'Local Hunter Profile'}
                </div>
                <div className="text-[10px] text-[#F5B041] font-stat font-medium mt-0.5">
                  Level {player.level} • {player.classTitle}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <RankEmblem level={player.level} size="compact" />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 2. APPEARANCE SECTION                                */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Appearance
          </span>

          <SettingsRow
            label="Visual Environment"
            description="Calibrated for dark luxury ergonomics & battery efficiency on OLED displays"
            icon={<Sparkles className="w-4 h-4 text-[#F5B041]" />}
            rightBadge={
              <Badge variant="gold" size="sm">
                Dark Luxury (OLED)
              </Badge>
            }
          />
        </div>

        {/* ---------------------------------------------------- */}
        {/* 3. GAMEPLAY FEEDBACK (SENSORY CONTROLS)              */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Gameplay Feedback
          </span>

          <div className="rounded-xl border border-white/[0.08] bg-[#0E121B] px-3.5 divide-y divide-white/[0.06]">
            {/* Sound Effects Toggle */}
            <SettingsToggle
              id="pref-sound"
              label="Procedural Sound Effects"
              description="Audio chime on quest completion, coin earnings, and level up"
              icon={
                preferences.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#F5B041]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )
              }
              checked={preferences.soundEnabled}
              onChange={onToggleSound}
            />

            {/* Haptic Feedback Toggle */}
            <SettingsToggle
              id="pref-haptics"
              label="Tactile Haptic Feedback"
              description="Native device vibration pulses on mission clears and item claims"
              icon={<Smartphone className="w-4 h-4 text-sky-400" />}
              checked={preferences.hapticsEnabled}
              onChange={onToggleHaptics}
            />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 4. ACCESSIBILITY & MOTION SYSTEM                     */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Accessibility
            </span>
            <span className="text-[10px] font-stat font-medium text-slate-400">
              Active: <strong className={isReducedMotion ? 'text-[#F5B041]' : 'text-slate-300'}>
                {isReducedMotion ? 'Reduced Motion' : 'Standard Motion'}
              </strong>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0E121B] border border-white/[0.08] space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-slate-300 mt-0.5">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-semibold text-white leading-tight">
                  Reduced Motion
                </div>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  Suppress floating particle bursts, confetti, and fast UI transitions
                </p>
              </div>
            </div>

            {/* Segmented 3-Way Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#080A0F] border border-white/10">
              {(
                [
                  { id: 'system', label: 'System' },
                  { id: 'reduced', label: 'Reduced' },
                  { id: 'full', label: 'Full Motion' }
                ] as const
              ).map((opt) => {
                const isSelected = preferences.reducedMotion === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSetReducedMotion(opt.id)}
                    className={`min-h-[38px] py-1.5 px-2 rounded-lg text-xs font-semibold transition-all touch-manipulation cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#F5B041] text-[#080A0F] font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 5. NOTIFICATIONS                                     */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Notifications
          </span>

          <div className="rounded-xl border border-white/[0.08] bg-[#0E121B] px-3.5">
            <SettingsToggle
              id="pref-reminder"
              label="9:00 PM Daily Streak Alert"
              description="Local notification scheduled if habit quests remain incomplete"
              icon={
                preferences.notificationsEnabled ? (
                  <Bell className="w-4 h-4 text-emerald-400" />
                ) : (
                  <BellOff className="w-4 h-4 text-slate-500" />
                )
              }
              checked={preferences.notificationsEnabled}
              onChange={onToggleNotifications}
            />
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 6. DATA & PRIVACY (PLAY STORE COMPLIANCE)            */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Data, Legal & Support
          </span>

          <div className="space-y-1.5">
            <SettingsRow
              label="Privacy Policy"
              description="Data usage, encryption, and player privacy guarantees"
              icon={<FileText className="w-4 h-4" />}
              href={privacyPolicyUrl}
              isExternal
            />

            <SettingsRow
              label="Terms of Service"
              description="Platform guidelines, rights, and terms of engagement"
              icon={<FileText className="w-4 h-4" />}
              href={termsOfServiceUrl}
              isExternal
            />

            <SettingsRow
              label="Give Beta Feedback"
              description="Report issues or suggest enhancements"
              icon={<Eye className="w-4 h-4 text-[#F5B041]" />}
              href={feedbackUrl}
              isExternal={Boolean(feedbackUrl && !feedbackUrl.startsWith('mailto:'))}
            />

            <SettingsRow
              label="Developer Support Email"
              description={supportEmail}
              icon={<Mail className="w-4 h-4" />}
              href={`mailto:${supportEmail}`}
            />
          </div>
        </div>

        {/* System Build Information */}
        <div className="text-center py-1">
          <span className="text-[10px] text-slate-500 font-stat">
            LEVEL UP v{appVersion} (Build {buildNumber}) • Production System
          </span>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 7. DANGER ZONE / ACCOUNT ACTIONS                     */}
        {/* ---------------------------------------------------- */}
        <div className="pt-2 border-t border-white/[0.08] space-y-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={<LogOut className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="w-full"
          >
            Sign Out of Account
          </Button>

          <Button
            type="button"
            variant="danger"
            size="md"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              onRequestDeleteAccount();
            }}
            className="w-full"
          >
            Delete Account & Purge Data
          </Button>
        </div>
      </div>
    </Modal>
  );
};
