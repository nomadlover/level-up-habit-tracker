// Centralized System Configuration & Sensory Preferences (P1 Phase 4B)
// Pure client-side persistence via localStorage with safe hydration fallbacks

export type MotionPreference = 'system' | 'reduced' | 'full';

export interface UserPreferences {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: MotionPreference;
  notificationsEnabled: boolean;
  theme: 'dark';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  soundEnabled: true,
  hapticsEnabled: true,
  reducedMotion: 'system',
  notificationsEnabled: true,
  theme: 'dark'
};

const STORAGE_KEY_PREFS = 'levelup_preferences';
const STORAGE_KEY_SOUND = 'levelup_sound';
const STORAGE_KEY_REMINDER = 'levelup_reminder';
const STORAGE_KEY_HAPTICS = 'levelup_haptics';
const STORAGE_KEY_REDUCED_MOTION = 'levelup_reduced_motion';

/**
 * Checks system-level prefers-reduced-motion media query
 */
export const getSystemPrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

/**
 * Resolves whether reduced motion is actively in effect
 */
export const resolveIsReducedMotion = (preference: MotionPreference): boolean => {
  if (preference === 'reduced') return true;
  if (preference === 'full') return false;
  return getSystemPrefersReducedMotion();
};

/**
 * Safely loads user preferences from localStorage with fallback defaults.
 * Survives corrupt JSON, missing keys, and SSR / static export execution.
 */
export const loadStoredPreferences = (): UserPreferences => {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    // 1. Try reading combined preferences object if present
    const rawPrefs = localStorage.getItem(STORAGE_KEY_PREFS);
    let combinedPrefs: Partial<UserPreferences> = {};
    if (rawPrefs) {
      try {
        combinedPrefs = JSON.parse(rawPrefs) || {};
      } catch {
        console.warn('Preferences JSON corrupt, resetting to valid defaults');
      }
    }

    // 2. Read legacy individual keys for 100% backward compatibility
    const legacySound = localStorage.getItem(STORAGE_KEY_SOUND);
    const legacyReminder = localStorage.getItem(STORAGE_KEY_REMINDER);
    const legacyHaptics = localStorage.getItem(STORAGE_KEY_HAPTICS);
    const legacyMotion = localStorage.getItem(STORAGE_KEY_REDUCED_MOTION);

    const soundEnabled =
      combinedPrefs.soundEnabled !== undefined
        ? Boolean(combinedPrefs.soundEnabled)
        : legacySound !== null
        ? legacySound !== 'false'
        : DEFAULT_PREFERENCES.soundEnabled;

    const notificationsEnabled =
      combinedPrefs.notificationsEnabled !== undefined
        ? Boolean(combinedPrefs.notificationsEnabled)
        : legacyReminder !== null
        ? legacyReminder !== 'false'
        : DEFAULT_PREFERENCES.notificationsEnabled;

    const hapticsEnabled =
      combinedPrefs.hapticsEnabled !== undefined
        ? Boolean(combinedPrefs.hapticsEnabled)
        : legacyHaptics !== null
        ? legacyHaptics !== 'false'
        : DEFAULT_PREFERENCES.hapticsEnabled;

    let reducedMotion: MotionPreference = DEFAULT_PREFERENCES.reducedMotion;
    const motionVal = combinedPrefs.reducedMotion || legacyMotion;
    if (motionVal === 'reduced' || motionVal === 'full' || motionVal === 'system') {
      reducedMotion = motionVal;
    } else if (motionVal === 'true' || motionVal === 'on') {
      reducedMotion = 'reduced';
    } else if (motionVal === 'false' || motionVal === 'off') {
      reducedMotion = 'full';
    }

    return {
      soundEnabled,
      hapticsEnabled,
      reducedMotion,
      notificationsEnabled,
      theme: 'dark'
    };
  } catch (err) {
    console.warn('Failed to load user preferences, falling back to defaults:', err);
    return DEFAULT_PREFERENCES;
  }
};

/**
 * Safely persists user preferences to localStorage
 */
export const saveStoredPreferences = (prefs: UserPreferences): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));

    // Maintain legacy keys for backward compatibility
    localStorage.setItem(STORAGE_KEY_SOUND, String(prefs.soundEnabled));
    localStorage.setItem(STORAGE_KEY_REMINDER, String(prefs.notificationsEnabled));
    localStorage.setItem(STORAGE_KEY_HAPTICS, String(prefs.hapticsEnabled));
    localStorage.setItem(STORAGE_KEY_REDUCED_MOTION, prefs.reducedMotion);
  } catch (err) {
    console.warn('Failed to save user preferences:', err);
  }
};
