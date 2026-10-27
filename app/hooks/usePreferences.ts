'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserPreferences,
  DEFAULT_PREFERENCES,
  MotionPreference,
  loadStoredPreferences,
  saveStoredPreferences,
  resolveIsReducedMotion
} from '../utils/preferences';
import { setSoundActive } from '../utils/audio';
import { setHapticsActive, scheduleStreakProtectionReminder } from '../utils/native';

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Initial client-side hydration from localStorage & system preferences
  useEffect(() => {
    const stored = loadStoredPreferences();
    setPreferences(stored);
    setSoundActive(stored.soundEnabled);
    setHapticsActive(stored.hapticsEnabled);
    setIsReducedMotion(resolveIsReducedMotion(stored.reducedMotion));
    setIsHydrated(true);

    // Synchronize daily streak protection schedule
    scheduleStreakProtectionReminder(stored.notificationsEnabled);
  }, []);

  // Media query listener for prefers-reduced-motion when preference is 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      if (preferences.reducedMotion === 'system') {
        setIsReducedMotion(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.reducedMotion]);

  // Synchronize .reduce-motion CSS class on document element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('reduce-motion', isReducedMotion);
    }
  }, [isReducedMotion]);

  // Update sound preference
  const updateSound = useCallback((enabled: boolean) => {
    setSoundActive(enabled);
    setPreferences((prev) => {
      const next = { ...prev, soundEnabled: enabled };
      saveStoredPreferences(next);
      return next;
    });
  }, []);

  // Update haptics preference
  const updateHaptics = useCallback((enabled: boolean) => {
    setHapticsActive(enabled);
    setPreferences((prev) => {
      const next = { ...prev, hapticsEnabled: enabled };
      saveStoredPreferences(next);
      return next;
    });
  }, []);

  // Update reduced motion preference
  const updateReducedMotion = useCallback((mode: MotionPreference) => {
    const active = resolveIsReducedMotion(mode);
    setIsReducedMotion(active);
    setPreferences((prev) => {
      const next = { ...prev, reducedMotion: mode };
      saveStoredPreferences(next);
      return next;
    });
  }, []);

  // Update notification preference
  const updateNotifications = useCallback(async (enabled: boolean) => {
    setPreferences((prev) => {
      const next = { ...prev, notificationsEnabled: enabled };
      saveStoredPreferences(next);
      return next;
    });
    await scheduleStreakProtectionReminder(enabled);
  }, []);

  return {
    preferences,
    isReducedMotion,
    isHydrated,
    setSoundEnabled: updateSound,
    setHapticsEnabled: updateHaptics,
    setReducedMotion: updateReducedMotion,
    setNotificationsEnabled: updateNotifications
  };
}
