'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  Trophy,
  Plus,
  Trash2,
  Check,
  Calendar,
  Sparkles,
  Award,
  Zap,
  Sword,
  Crown,
  Gift,
  CheckCircle2,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RotateCw,
  Bell,
  Settings,
  Pencil,
  Clock
} from 'lucide-react';
import {
  playQuestCompleteSound,
  playCoinSound,
  playLevelUpSound
} from './utils/audio';
import {
  initNativeApp,
  triggerHaptic,
  triggerGameHaptic,
  isNativePlatform
} from './utils/native';
import { usePreferences } from './hooks/usePreferences';
import { SystemSettingsModal } from '../components/settings/SystemSettingsModal';
import {
  AppShell,
  Button,
  Card,
  Badge,
  Modal,
  EmptyState,
  QuestCard,
  RewardValue,
  DifficultyBadge,
  RankEmblem,
  getHunterRank,
  LeaderboardModeSwitch,
  LeaderboardRow,
  LeaderboardPodium,
  GoldBalance,
  RewardCard,
  HunterIdentity,
  ProgressionCard,
  StatGrid,
  AchievementBadge
} from '@/components/ui';
import {
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
  SUPPORT_EMAIL,
  FEEDBACK_URL,
  APP_VERSION,
  BUILD_NUMBER
} from './constants/links';
import {
  auth,
  db,
  googleProvider,
  isFirebaseConfigured,
  UserProfile,
  HabitDocument,
  DIFFICULTY_REWARDS,
  MAX_FREE_HABITS,
  calculateLevel,
  getTodayKey,
  getTodayDateString,
  getYesterdayKey
} from './utils/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  deleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  addDoc
} from 'firebase/firestore';

// --- Type Definitions ---
type Difficulty = 'easy' | 'medium' | 'hard';
type MainTab = 'quests' | 'leaderboard' | 'shop' | 'profile';
type AppScreen = 'loading' | 'auth' | 'character_setup' | 'main';
type LeaderboardTab = 'all_time' | 'daily' | 'streaks';

interface Habit {
  id: string;
  name: string;
  icon: string;
  difficulty: Difficulty;
  xpReward: number;
  goldReward: number;
  completedDates: string[];
  createdAt?: string;
}

interface PlayerStats {
  id: string;
  name: string;
  avatar: string;
  classTitle: string;
  level: number;
  currentXP: number;
  totalXP: number;
  dailyXP: number;
  dailyXPDate: string | null;
  gold: number;
  streakDays: number;
  lastCompletedDate: string | null;
  isPro: boolean;
  interestedInPro: boolean;
  unlockedBadgeIds: string[];
}

interface RewardItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  claimedCount: number;
  category: 'perk' | 'treat' | 'custom';
}

interface FloatingParticle {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  reqText: string;
}

const DIFFICULTY_MAP: Record<Difficulty, { label: string; xp: number; gold: number }> = {
  easy: { label: 'Easy', xp: 15, gold: 5 },
  medium: { label: 'Medium', xp: 30, gold: 10 },
  hard: { label: 'Hard', xp: 50, gold: 20 }
};

// 6 Starting RPG Classes
const AVATAR_OPTIONS = [
  { icon: '⚔️', title: 'Warrior', role: 'Shadow Blade', desc: 'Discipline & Physical Strength' },
  { icon: '🧙‍♂️', title: 'Mage', role: 'Arcane Sage', desc: 'Wisdom & Deep Knowledge' },
  { icon: '🛡️', title: 'Guardian', role: 'Iron Paladin', desc: 'Unwavering Daily Consistency' },
  { icon: '🥷', title: 'Ninja', role: 'Cyber Rogue', desc: 'Speed & Laser Focus' },
  { icon: '🧘', title: 'Monk', role: 'Zen Master', desc: 'Calm Mind & Spiritual Flow' },
  { icon: '🏹', title: 'Archer', role: 'Star Hunter', desc: 'Precision Goals & Targets' }
];

const getAvatarIcon = (avatarId?: string): string => {
  if (!avatarId) return '⚔️';
  const found = AVATAR_OPTIONS.find(
    (a) => a.icon === avatarId || a.title.toLowerCase() === avatarId.toLowerCase()
  );
  return found ? found.icon : avatarId;
};

const EMOJI_BANK = ['⚡', '💧', '🏃', '📚', '🧘', '🥗', '💻', '💤', '✍️', '🏋️', '🎯', '🥑', '🔥', '🛡️', '🧠', '☕'];

// 1-Tap Student Starter Quests (Play Store empty state)
const STARTER_QUESTS: { name: string; icon: string; difficulty: Difficulty; xpReward: number; goldReward: number }[] = [
  { name: '2 Hours Study / Coding', icon: '📚', difficulty: 'hard', xpReward: 50, goldReward: 20 },
  { name: '45m Gym / Workout', icon: '💪', difficulty: 'medium', xpReward: 30, goldReward: 10 },
  { name: 'Drink 3L Water', icon: '💧', difficulty: 'easy', xpReward: 15, goldReward: 5 },
  { name: 'Wake Up Before 7 AM', icon: '🌅', difficulty: 'medium', xpReward: 30, goldReward: 10 }
];

// Date helpers
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const xpForLevel = (lvl: number): number => lvl * 120 + 80;

const getPlayerTitle = (lvl: number, baseRole = 'Hunter'): string => {
  if (lvl >= 25) return `Mythic ${baseRole}`;
  if (lvl >= 20) return `Grandmaster ${baseRole}`;
  if (lvl >= 15) return `Vanguard ${baseRole}`;
  if (lvl >= 10) return `Arcane ${baseRole}`;
  if (lvl >= 6) return `Elite ${baseRole}`;
  if (lvl >= 3) return `Adept ${baseRole}`;
  return `Novice ${baseRole}`;
};

const DEFAULT_REWARDS: RewardItem[] = [
  { id: 'r-1', name: '1 Hour Guilt-Free Gaming', icon: '🎮', cost: 100, claimedCount: 0, category: 'perk' },
  { id: 'r-2', name: 'Cheat Snack / Specialty Coffee', icon: '☕', cost: 80, claimedCount: 0, category: 'treat' },
  { id: 'r-3', name: 'Movie / Anime Binge Night', icon: '🎬', cost: 200, claimedCount: 0, category: 'perk' },
  { id: 'r-4', name: '30m Restful Power Nap', icon: '😴', cost: 60, claimedCount: 0, category: 'treat' }
];

const getSecondsUntilMidnight = (): number => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
};

const formatTimeUntilMidnight = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function LevelUpApp() {
  const [isClient, setIsClient] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('loading');
  const [activeTab, setActiveTab] = useState<MainTab>('quests');

  // Auth & Session State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Character Creation State
  const [hunterName, setHunterName] = useState('');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  // Live Real-Time Leaderboard State
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>('all_time');
  const [leaderboardData, setLeaderboardData] = useState<UserProfile[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(Date.now());
  const [secondsUntilMidnight, setSecondsUntilMidnight] = useState<number>(getSecondsUntilMidnight);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilMidnight(getSecondsUntilMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Player Profile State (Populated strictly from Firestore users/{uid})
  const [player, setPlayer] = useState<PlayerStats>({
    id: 'user_init',
    name: '',
    avatar: '⚔️',
    classTitle: 'Novice Hunter',
    level: 1,
    currentXP: 0,
    totalXP: 0,
    dailyXP: 0,
    dailyXPDate: null,
    gold: 0,
    streakDays: 0,
    lastCompletedDate: null,
    isPro: false,
    interestedInPro: false,
    unlockedBadgeIds: ['first_blood']
  });

  const [habits, setHabits] = useState<Habit[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>(DEFAULT_REWARDS);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modals & Notifications
  const [isAddQuestModal, setIsAddQuestModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editQuestName, setEditQuestName] = useState('');
  const [editQuestIcon, setEditQuestIcon] = useState('⚔️');
  const [editQuestDifficulty, setEditQuestDifficulty] = useState<Difficulty>('medium');
  const [isLevelUpModal, setIsLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; oldLevel: number; title: string } | null>(null);
  const [isAddRewardModal, setIsAddRewardModal] = useState(false);
  const [isSettingsModal, setIsSettingsModal] = useState(false);
  const [isDeleteAccountModal, setIsDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Centralized System Configuration & Sensory Preferences (P1 Phase 4B)
  const {
    preferences,
    isReducedMotion,
    setSoundEnabled,
    setHapticsEnabled,
    setReducedMotion,
    setNotificationsEnabled
  } = usePreferences();
  const soundEnabled = preferences.soundEnabled;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Particles
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const particleIdRef = useRef(0);
  const avatarCustomizerRef = useRef<HTMLDivElement>(null);

  // New Quest Form
  const [newQuestName, setNewQuestName] = useState('');
  const [newQuestIcon, setNewQuestIcon] = useState('⚡');
  const [newQuestDifficulty, setNewQuestDifficulty] = useState<Difficulty>('medium');

  // New Custom Reward Form
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardIcon, setNewRewardIcon] = useState('🎁');
  const [newRewardCost, setNewRewardCost] = useState(100);

  // Dates & Streaks
  const todayKey = useMemo(() => getTodayKey(), []);
  const yesterdayKey = useMemo(() => getYesterdayKey(), []);

  const todayFormatted = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).toUpperCase();
  }, []);

  const weekDays = useMemo(() => {
    const baseDate = addDays(new Date(), weekOffset * 7);
    const startOfWeek = getStartOfWeek(baseDate);

    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startOfWeek, i);
      const dateKey = formatDateKey(date);
      const isToday = dateKey === todayKey;
      const dayShort = date.toLocaleDateString('en-US', { weekday: 'narrow' });
      const dayNumber = date.getDate();
      const monthShort = date.toLocaleDateString('en-US', { month: 'short' });

      return { date, dateKey, isToday, dayShort, dayNumber, monthShort };
    });
  }, [weekOffset, todayKey]);

  const totalCompletedCount = useMemo(() => {
    return habits.reduce((acc, h) => acc + h.completedDates.length, 0);
  }, [habits]);

  const completedTodayCount = useMemo(() => {
    return habits.filter((h) => h.completedDates.includes(todayKey)).length;
  }, [habits, todayKey]);

  const activeQuests = useMemo(() => {
    return habits.filter((h) => !h.completedDates.includes(todayKey));
  }, [habits, todayKey]);

  const completedQuests = useMemo(() => {
    return habits.filter((h) => h.completedDates.includes(todayKey));
  }, [habits, todayKey]);

  const todayXP = useMemo(() => {
    return player.dailyXPDate === todayKey ? (player.dailyXP || 0) : 0;
  }, [player.dailyXPDate, player.dailyXP, todayKey]);

  const completionRate = useMemo(() => {
    return habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;
  }, [habits.length, completedTodayCount]);

  const xpNeeded = useMemo(() => xpForLevel(player.level), [player.level]);

  // Client-Side Derived Milestones (Strictly computed from actual player metrics - no fake databases)
  const hunterMilestones = useMemo(() => {
    return [
      {
        id: 'first_blood',
        title: 'First Blood',
        description: 'Complete your first daily habit quest',
        icon: '⚔️',
        reqText: '1 quest completed',
        isUnlocked: totalCompletedCount >= 1,
        progress: { current: Math.min(totalCompletedCount, 1), max: 1 }
      },
      {
        id: 'novice_hunter',
        title: 'Novice Hunter',
        description: 'Advance to Level 5 and earn D-Rank status',
        icon: '🛡️',
        reqText: 'Reach Level 5',
        isUnlocked: player.level >= 5,
        progress: { current: Math.min(player.level, 5), max: 5 }
      },
      {
        id: 'disciplined_streak',
        title: 'Unbroken Flame',
        description: 'Maintain a consecutive 7-day discipline streak',
        icon: '🔥',
        reqText: '7-day streak',
        isUnlocked: player.streakDays >= 7,
        progress: { current: Math.min(player.streakDays, 7), max: 7 }
      },
      {
        id: 'adept_hunter',
        title: 'Adept Hunter',
        description: 'Reach Level 10 and ascend to C-Rank classification',
        icon: '👑',
        reqText: 'Reach Level 10',
        isUnlocked: player.level >= 10,
        progress: { current: Math.min(player.level, 10), max: 10 }
      },
      {
        id: 'treasury_hoarder',
        title: 'Dragon Treasury',
        description: 'Accumulate 500 or more Gold in your Armory vault',
        icon: '💰',
        reqText: '500 Gold saved',
        isUnlocked: player.gold >= 500,
        progress: { current: Math.min(player.gold, 500), max: 500 }
      },
      {
        id: 'xp_vanguard',
        title: 'XP Vanguard',
        description: 'Earn 1,000 total career experience points',
        icon: '⚡',
        reqText: '1,000 total XP',
        isUnlocked: player.totalXP >= 1000,
        progress: { current: Math.min(player.totalXP, 1000), max: 1000 }
      },
      {
        id: 'iron_will',
        title: 'Iron Will',
        description: 'Demonstrate elite dedication with a 30-day streak',
        icon: '✨',
        reqText: '30-day streak',
        isUnlocked: player.streakDays >= 30,
        progress: { current: Math.min(player.streakDays, 30), max: 30 }
      },
      {
        id: 'elite_hunter',
        title: 'Elite Hunter',
        description: 'Achieve Level 20 and enter A-Rank dominion',
        icon: '🏆',
        reqText: 'Reach Level 20',
        isUnlocked: player.level >= 20,
        progress: { current: Math.min(player.level, 20), max: 20 }
      }
    ];
  }, [totalCompletedCount, player.level, player.streakDays, player.gold, player.totalXP]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  const spawnParticle = (text: string, color = '#F5B041', x?: number, y?: number) => {
    if (isReducedMotion) return; // Suppress particle animations when reduced motion is enabled
    const id = ++particleIdRef.current;
    const posX = x || (typeof window !== 'undefined' ? window.innerWidth / 2 : 200);
    const posY = y || (typeof window !== 'undefined' ? window.innerHeight / 2 : 300);

    setParticles((prev) => [...prev, { id, text, x: posX, y: posY, color }]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 850);
  };

  // ----------------------------------------------------
  // Dual-Layer Persistence: Auto-Save Profile, Habits, & Rewards
  // CRITICAL HYDRATION GUARD: isLoaded prevents initial default state from overwriting storage
  // ----------------------------------------------------
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('levelup_profile', JSON.stringify(player));
      localStorage.setItem('levelup_player', JSON.stringify(player));
    } catch (e) {
      console.warn('LocalStorage profile write failed:', e);
    }

    if (currentUserId && currentUserId !== 'user_init' && player.name && player.name.trim().length >= 3) {
      const profileData: Partial<UserProfile> = {
        uid: currentUserId,
        username: player.name,
        username_lowercase: player.name.toLowerCase(),
        avatar_id: player.avatar,
        level: player.level,
        xp: player.currentXP,
        total_xp: player.totalXP,
        daily_xp: player.dailyXPDate === todayKey ? player.dailyXP : 0,
        daily_xp_date: player.dailyXPDate,
        gold: player.gold,
        streak_days: player.streakDays,
        last_completed_date: player.lastCompletedDate,
        is_pro: player.isPro,
        interested_in_pro: player.interestedInPro
      };
      setDoc(doc(db, 'users', currentUserId), profileData, { merge: true }).catch((err) => {
        console.warn('Background profile cloud sync error:', err);
      });
    }
  }, [player, isLoaded, currentUserId]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('levelup_habits', JSON.stringify(habits));
    } catch (e) {
      console.warn('LocalStorage habits write failed:', e);
    }
  }, [habits, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('levelup_rewards', JSON.stringify(rewards));
    } catch (e) {
      console.warn('LocalStorage rewards write failed:', e);
    }
  }, [rewards, isLoaded]);

  // ----------------------------------------------------
  // Sync User Data & Habits on Auth Resolution (Offline to Online Push)
  // Auto-Heal: If user doc missing, auto-initialize from Firebase Auth displayName
  // ----------------------------------------------------
  const syncUserDataOnAuth = useCallback(async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      // Latest local profile
      let localPlayer: PlayerStats | null = null;
      try {
        const raw = localStorage.getItem('levelup_profile') || localStorage.getItem('levelup_player');
        if (raw) localPlayer = JSON.parse(raw);
      } catch {}

      if (userSnap.exists()) {
        const remoteData = userSnap.data() as UserProfile;
        const remoteTotalXP = remoteData.total_xp || 0;
        const localTotalXP = localPlayer?.totalXP || 0;

        // If user earned XP or progressed offline, push offline changes to Firestore
        if (localPlayer && localPlayer.name && localTotalXP > remoteTotalXP) {
          const offlineProfileData: Partial<UserProfile> = {
            uid: userId,
            username: localPlayer.name,
            username_lowercase: localPlayer.name.toLowerCase(),
            avatar_id: localPlayer.avatar || remoteData.avatar_id || '⚔️',
            level: localPlayer.level,
            xp: localPlayer.currentXP,
            total_xp: localPlayer.totalXP,
            gold: Math.max(localPlayer.gold, remoteData.gold || 0),
            streak_days: Math.max(localPlayer.streakDays, remoteData.streak_days || 0),
            last_completed_date: localPlayer.lastCompletedDate || remoteData.last_completed_date || null,
            is_pro: !!remoteData.is_pro,
            interested_in_pro: !!remoteData.interested_in_pro || !!localPlayer.interestedInPro
          };
          await setDoc(userDocRef, offlineProfileData, { merge: true });
          const merged: PlayerStats = { ...localPlayer, id: userId };
          setPlayer(merged);
          localStorage.setItem('levelup_profile', JSON.stringify(merged));
          localStorage.setItem('levelup_player', JSON.stringify(merged));
        } else if (remoteData.username && remoteData.username.trim().length >= 3) {
          // Firestore is newer/equal: hydrate local state with remote data
          const avatarIcon = getAvatarIcon(remoteData.avatar_id);
          const classOption = AVATAR_OPTIONS.find((a) => a.icon === avatarIcon) || AVATAR_OPTIONS[0];
          const calculatedLvl = calculateLevel(remoteData.total_xp || 0);
          const isRemoteToday = remoteData.daily_xp_date === todayKey;
          const remoteDailyXP = isRemoteToday ? (remoteData.daily_xp || 0) : 0;
          const mergedPlayer: PlayerStats = {
            id: userId,
            name: remoteData.username,
            avatar: avatarIcon,
            classTitle: getPlayerTitle(calculatedLvl, classOption.title),
            level: calculatedLvl,
            currentXP: remoteData.xp || 0,
            totalXP: remoteData.total_xp || 0,
            dailyXP: remoteDailyXP,
            dailyXPDate: todayKey,
            gold: remoteData.gold || 0,
            streakDays: remoteData.streak_days || 0,
            lastCompletedDate: remoteData.last_completed_date || null,
            isPro: !!remoteData.is_pro,
            interestedInPro: !!remoteData.interested_in_pro,
            unlockedBadgeIds: ['first_blood']
          };
          setPlayer(mergedPlayer);
          localStorage.setItem('levelup_profile', JSON.stringify(mergedPlayer));
          localStorage.setItem('levelup_player', JSON.stringify(mergedPlayer));

          // If player opens app after midnight, reset daily_xp in Firestore for the new day
          if (!isRemoteToday && (remoteData.daily_xp || 0) > 0) {
            setDoc(userDocRef, { daily_xp: 0, daily_xp_date: todayKey }, { merge: true }).catch(() => {});
          }
        } else {
          // Document exists but username is empty/short — route to character setup
          setCurrentScreen('character_setup');
          return;
        }

        setCurrentScreen('main');
      } else {
        // Document does NOT exist in Firestore yet — AUTO-HEAL for existing Firebase Auth users
        if (localPlayer && localPlayer.name && localPlayer.name.trim().length >= 3) {
          // Has valid local profile: push it to Firestore
          const newDoc: UserProfile = {
            uid: userId,
            username: localPlayer.name,
            username_lowercase: localPlayer.name.toLowerCase(),
            avatar_id: localPlayer.avatar || '⚔️',
            level: localPlayer.level || 1,
            xp: localPlayer.currentXP || 0,
            total_xp: localPlayer.totalXP || 0,
            gold: localPlayer.gold || 0,
            streak_days: localPlayer.streakDays || 0,
            last_completed_date: localPlayer.lastCompletedDate || null,
            is_pro: false,
            interested_in_pro: !!localPlayer.interestedInPro,
            created_at: new Date().toISOString()
          };
          await setDoc(userDocRef, newDoc, { merge: true });
          setCurrentScreen('main');
        } else {
          // User authenticated but users/{uid} does not exist in Firestore and no local profile exists -> route to Character Setup!
          console.log('[LEVELUP:STATE] User authenticated but profile missing -> routing to character_setup');
          setCurrentScreen('character_setup');
          return;
        }
      }

      // Sync habits bidirectionally (Push offline-created habits & merge completed dates)
      try {
        const habitsCol = collection(db, 'users', userId, 'habits');
        const habitsSnap = await getDocs(habitsCol);

        const remoteHabits: Habit[] = habitsSnap.docs.map((docSnap) => {
          const data = docSnap.data() as HabitDocument;
          const diffKey = (data.difficulty || 'medium') as Difficulty;
          const reward = DIFFICULTY_REWARDS[diffKey] || DIFFICULTY_REWARDS.medium;
          return {
            id: docSnap.id,
            name: data.title,
            icon: data.icon || '⚡',
            difficulty: diffKey,
            xpReward: reward.xp,
            goldReward: reward.gold,
            completedDates: Array.isArray(data.completed_dates) ? data.completed_dates : [],
            createdAt: data.created_at
          };
        });

        let localHabits: Habit[] = [];
        try {
          const raw = localStorage.getItem('levelup_habits');
          if (raw) localHabits = JSON.parse(raw);
        } catch {}

        const remoteIdMap = new Map(remoteHabits.map((h) => [h.id, h]));
        const mergedList: Habit[] = [...remoteHabits];

        for (const localH of localHabits) {
          if (!remoteIdMap.has(localH.id)) {
            try {
              const newDocRef = await addDoc(habitsCol, {
                title: localH.name,
                difficulty: localH.difficulty,
                icon: localH.icon,
                completed_dates: localH.completedDates || [],
                created_at: localH.createdAt || new Date().toISOString()
              });
              mergedList.push({ ...localH, id: newDocRef.id });
            } catch (upErr) {
              console.warn('Error pushing offline habit to Firestore:', upErr);
              mergedList.push(localH);
            }
          } else {
            const remoteH = remoteIdMap.get(localH.id)!;
            const combinedDates = Array.from(new Set([...(remoteH.completedDates || []), ...(localH.completedDates || [])]));
            if (combinedDates.length > remoteH.completedDates.length) {
              setDoc(
                doc(db, 'users', userId, 'habits', localH.id),
                { completed_dates: combinedDates },
                { merge: true }
              ).catch((e) => console.warn('Offline completed_dates sync error:', e));
              const idx = mergedList.findIndex((h) => h.id === localH.id);
              if (idx !== -1) {
                mergedList[idx] = { ...mergedList[idx], completedDates: combinedDates };
              }
            }
          }
        }

        if (mergedList.length > 0) {
          setHabits(mergedList);
          localStorage.setItem('levelup_habits', JSON.stringify(mergedList));
        }
      } catch (habitsErr) {
        console.warn('Bidirectional habits sync error:', habitsErr);
      }

    } catch (err: any) {
      console.error('[LEVELUP:PROFILE] User auth sync exception:', err);
      if (err?.code === 'permission-denied') {
        showToast('Firestore access denied. Verify authentication status.');
      } else if (err?.code === 'unavailable') {
        showToast('Offline mode: Using cached hunter data.');
      }
      const raw = localStorage.getItem('levelup_profile') || localStorage.getItem('levelup_player');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.name && parsed.name.trim().length >= 3) {
            setCurrentScreen('main');
            return;
          }
        } catch {}
      }
      if (auth.currentUser) {
        setCurrentScreen('character_setup');
      } else {
        setCurrentScreen('auth');
      }
    }
  }, []);

  // verifyUserProfile = syncUserDataOnAuth (handled by onAuthStateChanged)

  // ----------------------------------------------------
  // Real-time Habit (Quest) Sync via Firestore Subcollection
  // users/{uid}/habits/{habitId}
  // ----------------------------------------------------
  useEffect(() => {
    if (!currentUserId || currentScreen !== 'main') return;

    try {
      const habitsCol = collection(db, 'users', currentUserId, 'habits');
      const q = query(habitsCol, orderBy('created_at', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) return;
          const loadedHabits: Habit[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as HabitDocument;
            const diffKey = (data.difficulty || 'medium') as Difficulty;
            const reward = DIFFICULTY_REWARDS[diffKey] || DIFFICULTY_REWARDS.medium;
            return {
              id: docSnap.id,
              name: data.title,
              icon: data.icon || '⚡',
              difficulty: diffKey,
              xpReward: reward.xp,
              goldReward: reward.gold,
              completedDates: Array.isArray(data.completed_dates) ? data.completed_dates : [],
              createdAt: data.created_at
            };
          });
          setHabits((prev) => {
            const serverIds = new Set(loadedHabits.map((h) => h.id));
            const offlineHabits = prev.filter((h) => !serverIds.has(h.id) && h.id.startsWith('quest-'));
            const combined = [...loadedHabits, ...offlineHabits];
            try {
              localStorage.setItem('levelup_habits', JSON.stringify(combined));
            } catch {}
            return combined;
          });
        },
        (error) => {
          console.warn('Habits snapshot error:', error);
          const cached = localStorage.getItem('levelup_habits');
          if (cached) {
            try {
              setHabits(JSON.parse(cached));
            } catch {}
          }
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Habits subscription failed:', e);
    }
  }, [currentUserId, currentScreen]);

  // ----------------------------------------------------
  // Real-time Player Document Listener
  // ----------------------------------------------------
  useEffect(() => {
    if (!currentUserId || currentScreen !== 'main') return;

    try {
      const userDocRef = doc(db, 'users', currentUserId);
      const unsubscribe = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (!docSnap.exists()) return;
          const data = docSnap.data() as UserProfile;
          setPlayer((prev) => {
            // Guard: Never downgrade higher XP/level earned locally/offline
            if (prev.totalXP > (data.total_xp || 0)) {
              return prev;
            }
            const calculatedLvl = calculateLevel(data.total_xp || 0);
            const classOption = AVATAR_OPTIONS.find((a) => a.icon === data.avatar_id) || AVATAR_OPTIONS[0];
            const updated = {
              ...prev,
              name: data.username || prev.name,
              avatar: data.avatar_id || prev.avatar,
              classTitle: getPlayerTitle(calculatedLvl, classOption.title),
              level: calculatedLvl,
              currentXP: data.xp || 0,
              totalXP: data.total_xp || 0,
              gold: data.gold || 0,
              streakDays: data.streak_days || 0,
              lastCompletedDate: data.last_completed_date || null,
              isPro: !!data.is_pro,
              interestedInPro: !!data.interested_in_pro
            };
            try {
              localStorage.setItem('levelup_profile', JSON.stringify(updated));
              localStorage.setItem('levelup_player', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        },
        (err) => console.warn('User listener error:', err)
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('User subscription setup error:', e);
    }
  }, [currentUserId, currentScreen]);

  // ----------------------------------------------------
  // Live Real-Time Leaderboard Feed via Firestore onSnapshot (limit(30))
  // ----------------------------------------------------
  useEffect(() => {
    if (activeTab !== 'leaderboard') return;

    setLeaderboardLoading(true);

    try {
      const usersCol = collection(db, 'users');
      const q = query(usersCol, limit(30));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const rawUsers: UserProfile[] = snapshot.docs.map((d) => ({
            ...(d.data() as UserProfile),
            uid: d.id
          }));

          // Sort dynamically based on active leaderboardTab
          const sorted = [...rawUsers].sort((a, b) => {
            if (leaderboardTab === 'all_time') {
              return (b.total_xp || 0) - (a.total_xp || 0);
            } else if (leaderboardTab === 'daily') {
              const aDaily = a.daily_xp_date === todayKey ? (a.daily_xp || 0) : 0;
              const bDaily = b.daily_xp_date === todayKey ? (b.daily_xp || 0) : 0;
              if (bDaily !== aDaily) return bDaily - aDaily;
              return (b.total_xp || 0) - (a.total_xp || 0);
            } else {
              return (b.streak_days || 0) - (a.streak_days || 0);
            }
          });

          if (sorted.length > 0) {
            setLeaderboardData(sorted);
            const userIndex = sorted.findIndex(
              (p) => p.uid === currentUserId || (player.name && p.username?.toLowerCase() === player.name?.toLowerCase())
            );
            setUserRank(userIndex !== -1 ? userIndex + 1 : (sorted.length >= 30 ? 31 : sorted.length + 1));
          } else if (player.name) {
            const selfRow: UserProfile = {
              uid: player.id,
              username: player.name,
              username_lowercase: player.name.toLowerCase(),
              avatar_id: player.avatar,
              level: player.level,
              xp: player.currentXP,
              total_xp: player.totalXP,
              daily_xp: player.dailyXPDate === todayKey ? player.dailyXP : 0,
              daily_xp_date: player.dailyXPDate,
              gold: player.gold,
              streak_days: player.streakDays,
              last_completed_date: player.lastCompletedDate,
              is_pro: player.isPro,
              interested_in_pro: player.interestedInPro
            };
            setLeaderboardData([selfRow]);
            setUserRank(1);
          }

          setLeaderboardError(false);
          setLeaderboardLoading(false);
          setLastRefreshedAt(Date.now());
        },
        (error) => {
          console.warn('Leaderboard onSnapshot error:', error);
          setLeaderboardLoading(false);
          setLeaderboardError(true);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Leaderboard subscription error:', e);
      setLeaderboardLoading(false);
      setLeaderboardError(true);
    }
  }, [activeTab, leaderboardTab, currentUserId, player.name, player.id, player.avatar, player.level, player.currentXP, player.totalXP, player.dailyXP, player.dailyXPDate, player.gold, player.streakDays, player.lastCompletedDate, player.isPro, player.interestedInPro, todayKey]);

  const fetchLiveLeaderboard = useCallback((_force = false) => {
    setLastRefreshedAt(Date.now());
  }, []);

  // ----------------------------------------------------
  // Startup Data Loading (0ms Instant Hydration) & Auth State Subscription
  // ----------------------------------------------------
  useEffect(() => {
    setIsClient(true);
    initNativeApp();

    // 1. Instant 0ms Local Hydration: Player Profile
    const cachedProfileRaw = localStorage.getItem('levelup_profile') || localStorage.getItem('levelup_player');
    let hasValidCachedProfile = false;
    if (cachedProfileRaw) {
      try {
        const parsed = JSON.parse(cachedProfileRaw);
        if (parsed && parsed.name && parsed.name.trim().length >= 3) {
          // Automatic 12:00 AM Midnight reset for daily XP
          const todayDate = getTodayDateString();
          if (parsed.dailyXPDate !== todayDate) {
            parsed.dailyXP = 0;
            parsed.dailyXPDate = todayDate;
          }
          setPlayer(parsed);
          if (parsed.id && parsed.id !== 'user_init') {
            setCurrentUserId(parsed.id);
          }
          setCurrentScreen('main');
          hasValidCachedProfile = true;
        }
      } catch (err) {
        console.warn('Error hydrating cached profile:', err);
      }
    }

    // 2. Instant 0ms Local Hydration: Habits (Quests)
    const cachedHabitsRaw = localStorage.getItem('levelup_habits');
    if (cachedHabitsRaw) {
      try {
        const parsedHabits = JSON.parse(cachedHabitsRaw);
        if (Array.isArray(parsedHabits) && parsedHabits.length > 0) {
          setHabits(parsedHabits);
        }
      } catch (err) {
        console.warn('Error hydrating cached habits:', err);
      }
    }

    // 3. Instant 0ms Local Hydration: Rewards
    const cachedRewardsRaw = localStorage.getItem('levelup_rewards');
    if (cachedRewardsRaw) {
      try {
        const parsedRewards = JSON.parse(cachedRewardsRaw);
        if (Array.isArray(parsedRewards) && parsedRewards.length > 0) {
          setRewards(parsedRewards);
        }
      } catch (err) {
        console.warn('Error hydrating cached rewards:', err);
      }
    }

    // Unblock dual-layer auto-save effects
    setIsLoaded(true);

    // Safety watchdog: Guarantee transition off 'loading' screen within 2.5 seconds
    const watchdogTimer = setTimeout(() => {
      setCurrentScreen((prev) => {
        if (prev === 'loading') {
          return hasValidCachedProfile ? 'main' : 'auth';
        }
        return prev;
      });
    }, 2500);

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(watchdogTimer);
      if (user) {
        setCurrentUser(user);
        setCurrentUserId(user.uid);

        const raw = localStorage.getItem('levelup_profile') || localStorage.getItem('levelup_player');
        let hasProfile = false;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.name && parsed.name.trim().length >= 3) {
              hasProfile = true;
            }
          } catch {}
        }

        // Always advance off 'loading' and 'auth' screens instantaneously
        setCurrentScreen((prev) => {
          if (prev === 'loading' || prev === 'auth') {
            return hasProfile ? 'main' : 'character_setup';
          }
          return prev;
        });

        // Run sync asynchronously in background
        syncUserDataOnAuth(user.uid).catch((err) => {
          console.warn('Background sync on auth state change:', err);
        });
      } else {
        setCurrentUser(null);
        setCurrentUserId(null);
        // If user has no active Firebase session, present the Awakening / Auth screen
        setCurrentScreen('auth');
      }
    });

    return () => {
      clearTimeout(watchdogTimer);
      unsubscribe();
    };
  }, [syncUserDataOnAuth]);

  // ----------------------------------------------------
  // Auth Handlers (Email/Password & Google Sign-In)
  // ----------------------------------------------------
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isSignUpMode) {
        console.log('[LEVELUP:AUTH] Registering user with email/password');
        const cred = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        if (cred.user) {
          showToast('Account awakened! Choose your Hunter identity.');
          // onAuthStateChanged handles authoritative session transition
        }
      } else {
        console.log('[LEVELUP:AUTH] Signing in with email/password');
        await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
        // onAuthStateChanged handles authoritative session transition
      }
    } catch (err: any) {
      console.error('[LEVELUP:AUTH] Firebase Auth error:', err);
      let errorMsg = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errorMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already in use. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password must be at least 6 characters.';
      } else if (err.code === 'auth/user-not-found') {
        errorMsg = 'No Hunter found with this email. Please awaken a new account.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMsg = 'Network connection failed. Please verify connectivity.';
      }
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (isNativePlatform()) {
        console.log('[LEVELUP:GOOGLE_NATIVE] Triggering native Google account picker');
        const result = await FirebaseAuthentication.signInWithGoogle({
          serverClientId: '303219866607-0saenhf1rg8satlipfe371lq22jkstv9.apps.googleusercontent.com'
        } as any);

        console.log('[LEVELUP:GOOGLE_TOKEN]', {
          hasResult: Boolean(result),
          hasCredential: Boolean(result?.credential),
          hasIdToken: Boolean(result?.credential?.idToken)
        });

        const idToken = result.credential?.idToken;
        if (!idToken) {
          throw new Error('Google sign-in completed, but the secure authentication token could not be established. Please try again.');
        }

        // Bridge native credential into the WebView Web Firebase Auth session
        const credential = GoogleAuthProvider.credential(idToken);
        const userCred = await signInWithCredential(auth, credential);

        console.log('[LEVELUP:WEB_AUTH]', {
          uid: userCred.user?.uid,
          email: userCred.user?.email
        });
        // Authoritative onAuthStateChanged listener handles state transition
      } else {
        // Clean Web Browser Fallback: standard web popup
        console.log('[LEVELUP:WEB_AUTH] Triggering web popup sign-in');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('[LEVELUP:WEB_AUTH]', {
          uid: result.user?.uid,
          email: result.user?.email
        });
        // Authoritative onAuthStateChanged listener handles state transition
      }
    } catch (err: any) {
      console.error('[LEVELUP:AUTH] Google Sign-In error:', err);
      if (
        err.message?.includes('cancel') ||
        err.message?.includes('12501') ||
        err.code === '16' ||
        err.code === 'auth/popup-closed-by-user'
      ) {
        return;
      }
      setAuthError(err.message || 'Google sign-in completed, but the secure authentication token could not be established. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOfflineBypass = () => {
    const demoId = `demo_${Date.now()}`;
    setCurrentUserId(demoId);
    setCurrentScreen('character_setup');
  };

  // ----------------------------------------------------
  // Character Creation Handler
  // ----------------------------------------------------
  const handleCharacterAwaken = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);

    const cleanName = hunterName.trim();
    if (cleanName.length < 3 || cleanName.length > 15) {
      setSetupError('Hunter name must be between 3 and 15 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanName)) {
      setSetupError('Hunter name can only contain letters, numbers, and underscores.');
      return;
    }

    setSetupLoading(true);

    try {
      const lowerName = cleanName.toLowerCase();
      // Ensure Web Firebase Auth is authenticated before Firestore write
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setSetupError('Authentication session not found. Please sign in again.');
        setSetupLoading(false);
        setCurrentScreen('auth');
        return;
      }
      const targetUserId = firebaseUser.uid;

      // Check unique username_lowercase in Firestore
      const usersCol = collection(db, 'users');
      const q = query(usersCol, where('username_lowercase', '==', lowerName), limit(1));
      const existingSnap = await getDocs(q);

      if (!existingSnap.empty && existingSnap.docs[0].id !== targetUserId) {
        setSetupError('This Hunter name is already claimed by another operative. Choose another.');
        setSetupLoading(false);
        return;
      }

      const selectedClass = AVATAR_OPTIONS[selectedAvatarIdx] || AVATAR_OPTIONS[0];

      const newProfileData: UserProfile = {
        uid: targetUserId,
        username: cleanName,
        username_lowercase: lowerName,
        avatar_id: selectedClass.icon,
        level: 1,
        xp: 0,
        total_xp: 0,
        daily_xp: 0,
        daily_xp_date: todayKey,
        gold: 0,
        streak_days: 0,
        last_completed_date: null,
        is_pro: false,
        interested_in_pro: false,
        created_at: new Date().toISOString()
      };

      // Save to Firestore users/{uid}
      await setDoc(doc(db, 'users', targetUserId), newProfileData, { merge: true });

      const initializedPlayer: PlayerStats = {
        id: targetUserId,
        name: cleanName,
        avatar: selectedClass.icon,
        classTitle: getPlayerTitle(1, selectedClass.title),
        level: 1,
        currentXP: 0,
        totalXP: 0,
        dailyXP: 0,
        dailyXPDate: todayKey,
        gold: 0,
        streakDays: 0,
        lastCompletedDate: null,
        isPro: false,
        interestedInPro: false,
        unlockedBadgeIds: ['first_blood']
      };

      setPlayer(initializedPlayer);
      localStorage.setItem('levelup_profile', JSON.stringify(initializedPlayer));
      localStorage.setItem('levelup_player', JSON.stringify(initializedPlayer));

      playLevelUpSound(false);
      if (!isReducedMotion) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      }

      showToast(`System Awakened! Welcome Hunter ${cleanName}.`);
      setCurrentScreen('main');
    } catch (err: any) {
      console.error('[LEVELUP:PROFILE] Character awaken error:', err);
      setSetupError(err?.message || 'Failed to initialize Hunter profile. Please try again.');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (isNativePlatform()) {
        try {
          await FirebaseAuthentication.signOut();
        } catch {}
      }
      await signOut(auth);
    } catch {}
    localStorage.removeItem('levelup_profile');
    localStorage.removeItem('levelup_player');
    localStorage.removeItem('levelup_habits');
    localStorage.removeItem('levelup_rewards');
    setCurrentUserId(null);
    setCurrentUser(null);
    setIsSettingsModal(false);
    setCurrentScreen('auth');
    triggerHaptic('light');
    showToast('Signed out of LEVEL UP.');
  };

  // 1-Tap Student Starter Quest Quick Add
  const handleAddStarterQuest = async (sq: typeof STARTER_QUESTS[0]) => {
    triggerHaptic('light');
    if (!player.isPro && habits.length >= MAX_FREE_HABITS) {
      showToast(`Quest slots full (${MAX_FREE_HABITS}/${MAX_FREE_HABITS}). Upgrade slots or manage existing quests.`);
      return;
    }

    const newHabitData: HabitDocument = {
      title: sq.name,
      difficulty: sq.difficulty,
      icon: sq.icon,
      completed_dates: [],
      created_at: new Date().toISOString()
    };

    if (currentUserId && currentUserId !== 'user_init') {
      try {
        const docRef = await addDoc(collection(db, 'users', currentUserId, 'habits'), newHabitData);
        const newHabit: Habit = {
          id: docRef.id,
          name: sq.name,
          icon: sq.icon,
          difficulty: sq.difficulty,
          xpReward: sq.xpReward,
          goldReward: sq.goldReward,
          completedDates: []
        };
        setHabits((prev) => [newHabit, ...prev]);
      } catch (err) {
        console.warn('Starter quest add error:', err);
        const tempId = `quest-${Date.now()}`;
        setHabits((prev) => [
          {
            id: tempId,
            name: sq.name,
            icon: sq.icon,
            difficulty: sq.difficulty,
            xpReward: sq.xpReward,
            goldReward: sq.goldReward,
            completedDates: []
          },
          ...prev
        ]);
      }
    } else {
      const tempId = `quest-${Date.now()}`;
      setHabits((prev) => [
        {
          id: tempId,
          name: sq.name,
          icon: sq.icon,
          difficulty: sq.difficulty,
          xpReward: sq.xpReward,
          goldReward: sq.goldReward,
          completedDates: []
        },
        ...prev
      ]);
    }

    playCoinSound(!soundEnabled);
    showToast(`⚔️ Quest Enlisted: "${sq.name}"`);
  };

  // Google Play Store Mandatory Account & Data Deletion Flow
  const handleDeleteAccountAndData = async () => {
    setIsDeletingAccount(true);
    triggerHaptic('warning');
    try {
      const userToDelete = auth.currentUser;
      const uidToDelete = currentUserId || userToDelete?.uid;

      if (uidToDelete && uidToDelete !== 'user_init') {
        // 1. Delete habits subcollection
        try {
          const habitsSnap = await getDocs(collection(db, 'users', uidToDelete, 'habits'));
          for (const hDoc of habitsSnap.docs) {
            await deleteDoc(doc(db, 'users', uidToDelete, 'habits', hDoc.id)).catch(() => {});
          }
        } catch (habitsErr) {
          console.warn('Habits deletion warning:', habitsErr);
        }

        // 2. Delete rewards subcollection if exists
        try {
          const rewardsSnap = await getDocs(collection(db, 'users', uidToDelete, 'rewards'));
          for (const rDoc of rewardsSnap.docs) {
            await deleteDoc(doc(db, 'users', uidToDelete, 'rewards', rDoc.id)).catch(() => {});
          }
        } catch (rewardsErr) {
          console.warn('Rewards deletion warning:', rewardsErr);
        }

        // 3. Delete user document from Cloud Firestore
        await deleteDoc(doc(db, 'users', uidToDelete)).catch(() => {});
      }

      // 4. Delete user from Firebase Auth
      if (userToDelete) {
        try {
          await deleteUser(userToDelete);
        } catch (authErr: any) {
          if (authErr.code === 'auth/requires-recent-login') {
            showToast('Security verification required: Please re-login and retry account deletion.');
            setIsDeletingAccount(false);
            setIsDeleteAccountModal(false);
            return;
          }
          console.warn('Auth user delete error:', authErr);
        }
      }

      // 5. Purge local storage and reset state
      localStorage.removeItem('levelup_profile');
      localStorage.removeItem('levelup_player');
      localStorage.removeItem('levelup_habits');
      localStorage.removeItem('levelup_rewards');
      localStorage.removeItem('levelup_sound');
      localStorage.removeItem('levelup_reminder');
      localStorage.removeItem('levelup_haptics');
      localStorage.removeItem('levelup_reduced_motion');
      localStorage.removeItem('levelup_preferences');

      setCurrentUser(null);
      setCurrentUserId(null);
      setIsDeleteAccountModal(false);
      setIsSettingsModal(false);
      setCurrentScreen('auth');
      triggerHaptic('success');
      showToast('Account and all associated hunter data permanently purged.');
    } catch (err: any) {
      console.error('Account deletion error:', err);
      showToast(err.message || 'Error deleting account. Please contact support.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // ----------------------------------------------------
  // Habit (Quest) Completion / Uncheck with Atomic Firestore increment()
  // ----------------------------------------------------
  const handleToggleHabit = async (habitId: string, dateKey: string, e?: React.MouseEvent) => {
    triggerHaptic('light');

    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    const wasCompleted = targetHabit.completedDates.includes(dateKey);
    const willBeCompleted = !wasCompleted;

    // Optimistic local state update
    const updatedHabits = habits.map((h) => {
      if (h.id !== habitId) return h;
      return {
        ...h,
        completedDates: willBeCompleted
          ? [...new Set([...h.completedDates, dateKey])]
          : h.completedDates.filter((d) => d !== dateKey)
      };
    });
    setHabits(updatedHabits);

    if (willBeCompleted) {
      playQuestCompleteSound(!soundEnabled);
      const posX = e?.clientX;
      const posY = e?.clientY;
      spawnParticle(`+${targetHabit.xpReward} XP`, '#38BDF8', posX, posY);

      // Streak calculation
      let newStreak = player.streakDays;
      if (dateKey === todayKey) {
        if (player.lastCompletedDate === yesterdayKey) {
          newStreak = player.streakDays + 1;
        } else if (player.lastCompletedDate !== todayKey) {
          newStreak = 1;
        }
      }

      // Midnight check for Daily XP
      const isNewDay = player.dailyXPDate !== todayKey;
      const baseDaily = isNewDay ? 0 : (player.dailyXP || 0);
      const newDailyXP = baseDaily + targetHabit.xpReward;

      const newTotalXP = player.totalXP + targetHabit.xpReward;
      const newLevel = calculateLevel(newTotalXP);
      const newGold = player.gold + targetHabit.goldReward;

      // Check level up celebration
      if (newLevel > player.level) {
        const baseRole = player.classTitle.split(' ').pop() || 'Hunter';
        const newTitle = getPlayerTitle(newLevel, baseRole);
        setLevelUpData({ newLevel, oldLevel: player.level, title: newTitle });
        setIsLevelUpModal(true);
        triggerHaptic('heavy');
        playLevelUpSound(!soundEnabled);
        if (!isReducedMotion) {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
        }
      }

      setPlayer((prev) => ({
        ...prev,
        level: newLevel,
        currentXP: prev.currentXP + targetHabit.xpReward,
        totalXP: newTotalXP,
        dailyXP: newDailyXP,
        dailyXPDate: todayKey,
        gold: newGold,
        streakDays: newStreak,
        lastCompletedDate: dateKey === todayKey ? todayKey : prev.lastCompletedDate
      }));

      showToast(`+${targetHabit.xpReward} XP & +${targetHabit.goldReward} Gold earned!`);

      // Sync atomically to Firestore if logged in
      if (currentUserId && currentUserId !== 'user_init') {
        try {
          // 1. Update habit document
          const habitDocRef = doc(db, 'users', currentUserId, 'habits', habitId);
          await setDoc(habitDocRef, {
            completed_dates: arrayUnion(dateKey)
          }, { merge: true });

          // 2. Increment user XP, total_xp, and gold
          const userDocRef = doc(db, 'users', currentUserId);
          await setDoc(userDocRef, {
            uid: currentUserId,
            username: player.name,
            username_lowercase: player.name.toLowerCase(),
            avatar_id: player.avatar,
            level: newLevel,
            xp: player.currentXP + targetHabit.xpReward,
            total_xp: newTotalXP,
            daily_xp: newDailyXP,
            daily_xp_date: todayKey,
            gold: newGold,
            streak_days: newStreak,
            last_completed_date: dateKey === todayKey ? todayKey : (player.lastCompletedDate || todayKey),
            is_pro: player.isPro,
            interested_in_pro: player.interestedInPro
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore habit completion sync exception:', err);
        }
      }
    } else {
      // Unchecking habit completed today: Decrement XP and Gold so users cannot farm XP
      const penaltyXP = targetHabit.xpReward;
      const penaltyGold = targetHabit.goldReward;

      const newTotalXP = Math.max(0, player.totalXP - penaltyXP);
      const newLevel = calculateLevel(newTotalXP);
      const newGold = Math.max(0, player.gold - penaltyGold);
      const newDailyXP = Math.max(0, (player.dailyXP || 0) - penaltyXP);

      setPlayer((prev) => ({
        ...prev,
        level: newLevel,
        currentXP: Math.max(0, prev.currentXP - penaltyXP),
        totalXP: newTotalXP,
        dailyXP: newDailyXP,
        dailyXPDate: todayKey,
        gold: newGold
      }));

      showToast('Quest unchecked.');

      if (currentUserId && currentUserId !== 'user_init') {
        try {
          // 1. Remove from habit completed_dates
          const habitDocRef = doc(db, 'users', currentUserId, 'habits', habitId);
          await setDoc(habitDocRef, {
            completed_dates: arrayRemove(dateKey)
          }, { merge: true });

          // 2. Decrement user XP, total_xp, and gold atomically and clamped to >= 0
          const userDocRef = doc(db, 'users', currentUserId);
          await setDoc(userDocRef, {
            uid: currentUserId,
            username: player.name,
            username_lowercase: player.name.toLowerCase(),
            avatar_id: player.avatar,
            level: newLevel,
            xp: Math.max(0, player.currentXP - penaltyXP),
            total_xp: newTotalXP,
            daily_xp: newDailyXP,
            daily_xp_date: todayKey,
            gold: newGold,
            streak_days: player.streakDays,
            last_completed_date: player.lastCompletedDate,
            is_pro: player.isPro,
            interested_in_pro: player.interestedInPro
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore habit uncheck sync exception:', err);
        }
      }
    }
  };

  const handleMarkAllToday = async () => {
    const uncompletedHabits = habits.filter((h) => !h.completedDates.includes(todayKey));
    if (uncompletedHabits.length === 0) {
      showToast('All quests for today are already completed!');
      return;
    }

    let addedXP = 0;
    let addedGold = 0;
    for (const h of uncompletedHabits) {
      addedXP += h.xpReward;
      addedGold += h.goldReward;
    }

    playLevelUpSound(!soundEnabled);
    triggerHaptic('success');
    spawnParticle(`ALL QUESTS COMPLETED! 🔥`, '#F5B041');
    if (!isReducedMotion) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }

    // Mark all locally
    setHabits((prev) =>
      prev.map((h) => ({
        ...h,
        completedDates: [...new Set([...h.completedDates, todayKey])]
      }))
    );

    let newStreak = player.streakDays;
    if (player.lastCompletedDate === yesterdayKey) {
      newStreak = player.streakDays + 1;
    } else if (player.lastCompletedDate !== todayKey) {
      newStreak = 1;
    }

    const newTotalXP = player.totalXP + addedXP;
    const newLevel = calculateLevel(newTotalXP);
    const newGold = player.gold + addedGold;

    const isNewDay = player.dailyXPDate !== todayKey;
    const baseDaily = isNewDay ? 0 : (player.dailyXP || 0);
    const newDailyXP = baseDaily + addedXP;

    setPlayer((prev) => ({
      ...prev,
      level: newLevel,
      currentXP: prev.currentXP + addedXP,
      totalXP: newTotalXP,
      dailyXP: newDailyXP,
      dailyXPDate: todayKey,
      gold: newGold,
      streakDays: newStreak,
      lastCompletedDate: todayKey
    }));

    showToast(`Tactical Surge: Completed ${uncompletedHabits.length} quests!`);

    if (currentUserId && currentUserId !== 'user_init') {
      try {
        for (const h of uncompletedHabits) {
          const habitDocRef = doc(db, 'users', currentUserId, 'habits', h.id);
          setDoc(habitDocRef, { completed_dates: arrayUnion(todayKey) }, { merge: true }).catch(() => {});
        }
        const userDocRef = doc(db, 'users', currentUserId);
        await setDoc(userDocRef, {
          uid: currentUserId,
          username: player.name,
          username_lowercase: player.name.toLowerCase(),
          avatar_id: player.avatar,
          level: newLevel,
          xp: player.currentXP + addedXP,
          total_xp: newTotalXP,
          daily_xp: newDailyXP,
          daily_xp_date: todayKey,
          gold: newGold,
          streak_days: newStreak,
          last_completed_date: todayKey,
          is_pro: player.isPro,
          interested_in_pro: player.interestedInPro
        }, { merge: true });
      } catch (err) {
        console.warn('Batch mark all exception:', err);
      }
    }
  };

  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = newQuestName.trim().slice(0, 100);
    if (!cleanTitle) {
      showToast('Quest title cannot be empty.');
      return;
    }

    // Limit free users to 5 active habits (X/5 Active Quest Slots)
    if (!player.isPro && habits.length >= MAX_FREE_HABITS) {
      showToast(`Quest slots full (${MAX_FREE_HABITS}/${MAX_FREE_HABITS}). Upgrade slots or manage existing quests.`);
      return;
    }

    const diffReward = DIFFICULTY_MAP[newQuestDifficulty];
    const newHabitData: HabitDocument = {
      title: cleanTitle,
      difficulty: newQuestDifficulty,
      icon: newQuestIcon,
      completed_dates: [],
      created_at: new Date().toISOString()
    };

    if (currentUserId && currentUserId !== 'user_init') {
      try {
        const docRef = await addDoc(collection(db, 'users', currentUserId, 'habits'), newHabitData);
        const newHabit: Habit = {
          id: docRef.id,
          name: cleanTitle,
          icon: newHabitData.icon,
          difficulty: newHabitData.difficulty,
          xpReward: diffReward.xp,
          goldReward: diffReward.gold,
          completedDates: []
        };
        setHabits((prev) => [newHabit, ...prev]);
      } catch (err) {
        console.warn('Firestore create habit error:', err);
        const tempId = `quest-${Date.now()}`;
        const newHabit: Habit = {
          id: tempId,
          name: cleanTitle,
          icon: newHabitData.icon,
          difficulty: newHabitData.difficulty,
          xpReward: diffReward.xp,
          goldReward: diffReward.gold,
          completedDates: []
        };
        setHabits((prev) => [newHabit, ...prev]);
      }
    } else {
      const tempId = `quest-${Date.now()}`;
      const newHabit: Habit = {
        id: tempId,
        name: cleanTitle,
        icon: newHabitData.icon,
        difficulty: newHabitData.difficulty,
        xpReward: diffReward.xp,
        goldReward: diffReward.gold,
        completedDates: []
      };
      setHabits((prev) => [newHabit, ...prev]);
    }

    setNewQuestName('');
    setIsAddQuestModal(false);
    playCoinSound(!soundEnabled);
    triggerHaptic('light');
    showToast(`⚔️ Quest Enlisted: "${cleanTitle}"`);
  };

  const handleOpenEditQuest = (habit: Habit) => {
    setEditingHabit(habit);
    setEditQuestName(habit.name);
    setEditQuestIcon(habit.icon);
    setEditQuestDifficulty(habit.difficulty);
    triggerHaptic('light');
  };

  const handleUpdateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit) return;

    const cleanTitle = editQuestName.trim().slice(0, 100);
    if (!cleanTitle) {
      showToast('Quest title cannot be empty.');
      return;
    }

    const diffReward = DIFFICULTY_MAP[editQuestDifficulty];
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== editingHabit.id) return h;
        return {
          ...h,
          name: cleanTitle,
          icon: editQuestIcon,
          difficulty: editQuestDifficulty,
          xpReward: diffReward.xp,
          goldReward: diffReward.gold
        };
      })
    );

    if (currentUserId && currentUserId !== 'user_init') {
      try {
        const habitDocRef = doc(db, 'users', currentUserId, 'habits', editingHabit.id);
        await updateDoc(habitDocRef, {
          title: cleanTitle,
          difficulty: editQuestDifficulty,
          icon: editQuestIcon
        });
      } catch (err) {
        console.warn('Update quest error:', err);
      }
    }

    setEditingHabit(null);
    triggerHaptic('light');
    showToast(`Quest updated: "${cleanTitle}"`);
  };

  const handleDeleteQuest = async (id: string, name: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (currentUserId && currentUserId !== 'user_init') {
      try {
        await deleteDoc(doc(db, 'users', currentUserId, 'habits', id));
      } catch (err) {
        console.warn('Delete quest error:', err);
      }
    }
    showToast(`Removed quest "${name}"`);
  };

  const handleClaimReward = (reward: RewardItem) => {
    if (player.gold < reward.cost) {
      showToast(`Not enough Gold! Need ${reward.cost - player.gold} more gold.`);
      return;
    }

    const nextGold = player.gold - reward.cost;
    setPlayer((prev) => ({ ...prev, gold: nextGold }));

    if (currentUserId && currentUserId !== 'user_init') {
      setDoc(doc(db, 'users', currentUserId), { gold: nextGold }, { merge: true }).catch(() => {});
    }

    setRewards((prev) =>
      prev.map((r) => (r.id === reward.id ? { ...r, claimedCount: r.claimedCount + 1 } : r))
    );

    triggerHaptic('success');
    playCoinSound(!soundEnabled);
    spawnParticle(`REWARD CLAIMED! 🎁`, '#F5B041');
    showToast(`Unlocked: "${reward.name}"!`);
  };

  const handleAddCustomReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardName.trim()) return;

    const newR: RewardItem = {
      id: `reward-${Date.now()}`,
      name: newRewardName.trim(),
      icon: newRewardIcon,
      cost: Number(newRewardCost) || 50,
      claimedCount: 0,
      category: 'custom'
    };

    setRewards((prev) => [...prev, newR]);
    setNewRewardName('');
    setIsAddRewardModal(false);
    triggerHaptic('light');
    playCoinSound(!soundEnabled);
    showToast(`Custom reward added to Loot Shop!`);
  };

  // Notify Me on Launch CTA
  const handleNotifyPro = async () => {
    setPlayer((prev) => ({ ...prev, interestedInPro: true }));
    if (currentUserId && currentUserId !== 'user_init') {
      try {
        await setDoc(doc(db, 'users', currentUserId), { interested_in_pro: true }, { merge: true });
      } catch (err) {
        console.warn('Update interested_in_pro error:', err);
      }
    }
    playCoinSound(!soundEnabled);
    triggerHaptic('light');
    showToast('⚔️ Preference saved! We will notify you when Level Up Pro launches.');
  };

  // ----------------------------------------------------
  // RENDER: 1. Loading Screen
  // ----------------------------------------------------
  if (!isClient || currentScreen === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#F5B041] border-t-transparent rounded-full animate-spin" />
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#F5B041]">
            INITIALIZING LEVEL UP SYSTEM...
          </span>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: 2. Minimalist Gaming Auth Screen ("System Awakening")
  // ----------------------------------------------------
  if (currentScreen === 'auth') {
    return (
      <div className="min-h-screen bg-[#080A0F] text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-[#F5B041]/30">
        <div className="w-full max-w-sm flex flex-col space-y-5 animate-in fade-in duration-300">
          {/* System Awakening Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E121B] border border-white/10 text-[10px] font-black tracking-widest uppercase text-[#F5B041]">
              <Sparkles className="w-3 h-3" />
              <span>SYSTEM AWAKENING PROTOCOL</span>
            </div>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0E121B] border-2 border-[#F5B041] flex items-center justify-center text-2xl shadow-lg shadow-[#F5B041]/15 my-2">
              👑
            </div>

            <h1 className="text-2xl font-black tracking-wider text-white">LEVEL UP</h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Gamify your life. Sign in to synchronize your RPG Hunter progress and daily habit quests.
            </p>
          </div>

          {/* Auth Card */}
          <Card variant="base" padding="md" className="shadow-xl space-y-4">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#080A0F] border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsSignUpMode(false);
                  setAuthError(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  !isSignUpMode
                    ? 'bg-[#F5B041] text-[#080A0F] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUpMode(true);
                  setAuthError(null);
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition ${
                  isSignUpMode
                    ? 'bg-[#F5B041] text-[#080A0F] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{authError}</span>
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Hunter Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="hunter@levelup.app"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#080A0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#F5B041]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Access Code / Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#080A0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#F5B041]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={authLoading}
                className="w-full uppercase tracking-wider"
                icon={<ArrowRight className="w-3.5 h-3.5 stroke-[3]" />}
              >
                {isSignUpMode ? 'Initialize Hunter Account' : 'Enter the System'}
              </Button>
            </form>

            {/* Google Gateway */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink mx-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                OR PROTOCOL
              </span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl bg-[#080A0F] hover:bg-[#151A26] border border-white/10 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </Card>

          {/* Offline / Local Testing Bypass */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleOfflineBypass}
              className="text-[11px] text-slate-500 hover:text-[#F5B041] transition"
            >
              Skip & Play Offline (Demo Hunter Mode) →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: 3. Character Creation Screen (First-Time Users)
  // ----------------------------------------------------
  if (currentScreen === 'character_setup') {
    return (
      <div className="min-h-screen bg-[#080A0F] text-slate-100 flex flex-col items-center justify-center p-4 relative selection:bg-[#F5B041]/30">
        <div className="w-full max-w-sm flex flex-col space-y-4 animate-in fade-in duration-300">
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E121B] border border-white/10 text-[10px] font-black tracking-widest uppercase text-[#3B82F6]">
              <ShieldCheck className="w-3 h-3 text-[#3B82F6]" />
              <span>NEW OPERATIVE REGISTRATION</span>
            </div>

            <h1 className="text-xl font-black text-white">Awaken Your Character</h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Choose your Hunter identity and select your starting class.
            </p>
          </div>

          <form onSubmit={handleCharacterAwaken} className="p-5 rounded-2xl bg-[#0E121B] border border-white/10 shadow-xl space-y-4">
            {/* Error Message */}
            {setupError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{setupError}</span>
              </div>
            )}

            {/* Hunter Name Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Hunter Name / Username
                </label>
                <span className="text-[10px] text-slate-500 font-stat">{hunterName.length}/15</span>
              </div>
              <input
                type="text"
                required
                maxLength={15}
                placeholder="e.g. Valkyrie, IronClad, Phoenix..."
                value={hunterName}
                onChange={(e) => setHunterName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080A0F] border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-[#F5B041]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                3–15 characters (letters, numbers, underscores)
              </span>
            </div>

            {/* Starting Class Selection (6 Class Icons) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Starting Class
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVATAR_OPTIONS.map((av, idx) => {
                  const isSelected = selectedAvatarIdx === idx;
                  return (
                    <button
                      key={av.title}
                      type="button"
                      onClick={() => setSelectedAvatarIdx(idx)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition active:scale-95 ${
                        isSelected
                          ? 'bg-[#080A0F] border-[#F5B041] shadow-sm shadow-[#F5B041]/10'
                          : 'bg-[#080A0F]/60 border-white/10 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="text-2xl shrink-0">{av.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-black break-words leading-tight ${isSelected ? 'text-[#F5B041]' : 'text-slate-200'}`}>
                          {av.title}
                        </div>
                        <div className="text-[9px] text-slate-400 break-words leading-tight mt-0.5">{av.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Gold CTA Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={setupLoading}
              disabled={setupLoading || hunterName.trim().length < 3}
              className="w-full uppercase tracking-wider"
              icon={<Sparkles className="w-4 h-4 stroke-[2.5]" />}
            >
              Awaken & Start Quests
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: 4. Main App (Quests, Leaderboard, Shop, Profile)
  // ----------------------------------------------------
  return (
    <>
      <AppShell
        playerName={player.name}
        avatarIcon={player.avatar}
        classTitle={player.classTitle}
        level={player.level}
        currentXP={player.currentXP}
        requiredXP={xpNeeded}
        gold={player.gold}
        streakDays={player.streakDays}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        onOpenSettings={() => {
          triggerHaptic('light');
          setIsSettingsModal(true);
        }}
        floatingSlot={
          <>
            {/* Floating XP / Gold Particles */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="fixed pointer-events-none z-50 text-sm font-black tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] animate-float-xp font-stat"
                style={{ left: `${p.x - 25}px`, top: `${p.y - 20}px`, color: p.color }}
              >
                {p.text}
              </div>
            ))}

            {/* Floating Toast Notification */}
            {toastMessage && (
              <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#0E121B]/95 border border-white/10 text-slate-100 px-4 py-2 rounded-full shadow-2xl backdrop-blur-md animate-level-burst text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B041] shrink-0" />
                <span className="break-words">{toastMessage}</span>
              </div>
            )}
          </>
        }
      >
        {/* ======================================================== */}
        {/* TAB 1: QUESTS (HOME)                                     */}
        {/* ======================================================== */}
        {activeTab === 'quests' && (
          <div className="space-y-4">
            {/* 1. SCREEN HEADER */}
            <div className="flex items-center justify-between px-1">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="text-slate-300">TODAY</span>
                  <span className="text-slate-600">•</span>
                  <span>{todayFormatted}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white font-stat tracking-tight">
                    {completedTodayCount} / {habits.length} QUESTS COMPLETED
                  </span>
                  {habits.length > 0 && completedTodayCount === habits.length && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-stat">
                      ALL DONE
                    </span>
                  )}
                </div>
              </div>

              {habits.length > 0 && completedTodayCount < habits.length && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Zap className="w-3.5 h-3.5 text-[#F5B041]" />}
                  onClick={handleMarkAllToday}
                  title="Complete all remaining quests for today"
                >
                  Complete All
                </Button>
              )}
            </div>

            {/* 2. DAILY PROGRESSION MODULE (TACTICAL BRIEFING) */}
            <Card variant="base" padding="md" className="space-y-3 bg-[#0E121B] border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#F5B041]/10 border border-[#F5B041]/20 flex items-center justify-center text-[#F5B041]">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Daily Briefing
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#F5B041] font-stat">
                  <Sparkles className="w-3.5 h-3.5 text-[#F5B041]" />
                  <span>+{todayXP.toLocaleString()} XP TODAY</span>
                </div>
              </div>

              {/* Today's Momentum Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-stat">
                  <span className="text-slate-400 font-medium">Daily Objective Progress</span>
                  <span className="text-slate-200 font-bold">{completionRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#080A0F] border border-white/5 overflow-hidden p-[1px]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              {/* Tactical Streak / Status Indicator */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Flame className={`w-3.5 h-3.5 ${completedTodayCount > 0 ? 'text-orange-400 fill-orange-400/30' : 'text-slate-600'}`} />
                  <span>
                    {completedTodayCount > 0
                      ? `${player.streakDays}d streak secured for today`
                      : `Complete 1 quest to secure ${player.streakDays}d streak`}
                  </span>
                </div>
                <span className="font-stat text-slate-500">
                  {activeQuests.length} Remaining
                </span>
              </div>
            </Card>

            {/* 3. MINIMALIST HORIZONTAL 7-DAY CALENDAR STRIP */}
            <Card variant="base" padding="sm" className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-[#F5B041]" />
                  <span className="font-stat">
                    {weekDays[0].monthShort} {weekDays[0].dayNumber} – {weekDays[6].dayNumber}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((o) => o - 1)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {weekOffset !== 0 && (
                    <button
                      type="button"
                      onClick={() => setWeekOffset(0)}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#F5B041]/10 text-[#F5B041] border border-[#F5B041]/20 font-bold"
                    >
                      Today
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}
                    disabled={weekOffset === 0}
                    className={`p-1 rounded-lg transition ${
                      weekOffset === 0 ? 'text-slate-700' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Buttons */}
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const completedOnDay = habits.filter((h) => h.completedDates.includes(day.dateKey)).length;
                  const isAllDone = completedOnDay === habits.length && habits.length > 0;

                  return (
                    <div
                      key={day.dateKey}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl text-center transition ${
                        day.isToday
                          ? 'bg-[#F5B041]/10 border border-[#F5B041]/40 text-[#F5B041]'
                          : 'bg-[#080A0F]/60 border border-white/[0.06] text-slate-400'
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold tracking-wider">{day.dayShort}</span>
                      <span className={`text-xs font-black font-stat mt-0.5 ${day.isToday ? 'text-[#F5B041]' : 'text-slate-200'}`}>
                        {day.dayNumber}
                      </span>
                      <div className="mt-1 flex items-center justify-center">
                        {isAllDone ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
                        ) : completedOnDay > 0 ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F5B041]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 4. QUEST LIST */}
            {habits.length === 0 ? (
              <div className="space-y-3">
                <EmptyState
                  icon={<Sword className="w-6 h-6 text-[#F5B041]" />}
                  title="Your Quest Book is Ready"
                  description="Enlist daily habit quests to earn XP, maintain your streak, and level up your hunter rank."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => setIsAddQuestModal(true)}
                    >
                      Enlist Custom Quest
                    </Button>
                  }
                />

                {/* 1-Tap Quick-Add Starter Quests */}
                {STARTER_QUESTS.filter((sq) => !habits.some((h) => h.name.toLowerCase() === sq.name.toLowerCase())).length > 0 && (
                  <Card variant="base" padding="sm" className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B041] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#F5B041]" />
                        <span>Quick-Add Starter Quests</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">1-Tap Enlist</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {STARTER_QUESTS.filter((sq) => !habits.some((h) => h.name.toLowerCase() === sq.name.toLowerCase())).map((sq) => (
                        <button
                          key={sq.name}
                          type="button"
                          onClick={() => handleAddStarterQuest(sq)}
                          className="p-2.5 rounded-xl bg-[#080A0F]/80 hover:bg-[#151A26] border border-white/[0.06] hover:border-[#F5B041]/40 text-left flex items-center justify-between gap-3 transition active:scale-[0.99] group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="text-xl shrink-0">{sq.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-200 group-hover:text-white break-words leading-tight">
                                {sq.name}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <DifficultyBadge difficulty={sq.difficulty} size="sm" />
                                <span>•</span>
                                <RewardValue amount={sq.xpReward} type="xp" size="sm" />
                                <span>•</span>
                                <RewardValue amount={sq.goldReward} type="gold" size="sm" />
                              </div>
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-[#151A26] border border-white/10 flex items-center justify-center text-[#F5B041] shrink-0 group-hover:bg-[#F5B041] group-hover:text-[#080A0F] transition shadow-sm">
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* ACTIVE QUESTS SECTION */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Active Missions</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 text-[10px] font-stat">
                        {activeQuests.length}
                      </span>
                    </span>
                  </div>

                  {activeQuests.length > 0 ? (
                    <div className="space-y-2">
                      {activeQuests.map((habit) => (
                        <QuestCard
                          key={habit.id}
                          id={habit.id}
                          name={habit.name}
                          icon={habit.icon}
                          difficulty={habit.difficulty}
                          xpReward={habit.xpReward}
                          goldReward={habit.goldReward}
                          isCompleted={false}
                          onToggle={(e) => handleToggleHabit(habit.id, todayKey, e)}
                          onEdit={() => handleOpenEditQuest(habit)}
                          onDelete={() => handleDeleteQuest(habit.id, habit.name)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                      <div className="w-8 h-8 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div className="text-xs font-black uppercase tracking-wider text-emerald-400">
                        All Quests Completed For Today
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Daily objectives cleared. Streak secured. Rest or prepare for tomorrow.
                      </div>
                    </div>
                  )}
                </div>

                {/* COMPLETED QUESTS SECTION */}
                {completedQuests.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <span>Completed Today</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-stat">
                          {completedQuests.length}
                        </span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      {completedQuests.map((habit) => (
                        <QuestCard
                          key={habit.id}
                          id={habit.id}
                          name={habit.name}
                          icon={habit.icon}
                          difficulty={habit.difficulty}
                          xpReward={habit.xpReward}
                          goldReward={habit.goldReward}
                          isCompleted={true}
                          onToggle={(e) => handleToggleHabit(habit.id, todayKey, e)}
                          onEdit={() => handleOpenEditQuest(habit)}
                          onDelete={() => handleDeleteQuest(habit.id, habit.name)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 5-SLOT FREE TIER STATUS */}
                <div className="pt-1">
                  <div className="p-3 rounded-xl bg-[#0E121B]/60 border border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Capacity:</span>
                      <span className="font-stat font-bold text-slate-200">
                        {habits.length} / {MAX_FREE_HABITS} Slots Used
                      </span>
                    </div>
                    {habits.length >= MAX_FREE_HABITS ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('profile');
                        }}
                        className="text-[11px] font-bold text-[#F5B041] hover:underline flex items-center gap-1"
                      >
                        <span>Unlock with Pro</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold font-stat">
                        {MAX_FREE_HABITS - habits.length} Slots Free
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

          {/* -------------------------------------------------------- */}
          {/* TAB 2: TACTICAL ARENA (LEADERBOARD)                      */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              {/* 1. ARENA HEADER WITH STATUS & REFRESH */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#F5B041]/10 border border-[#F5B041]/20 flex items-center justify-center text-[#F5B041]">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-wider text-white leading-tight">
                      Tactical Arena
                    </h2>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Global Hunter Standings
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#151A26] border border-white/10 text-[9px] font-bold text-slate-300 font-stat">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIVE FEED</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      fetchLiveLeaderboard(true);
                      showToast('Live rankings synchronized.');
                    }}
                    disabled={leaderboardLoading}
                    className="p-1.5 rounded-lg bg-[#0E121B] border border-white/10 text-slate-400 hover:text-white transition active:scale-95 disabled:opacity-50"
                    title="Synchronize rankings"
                    aria-label="Synchronize rankings"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${leaderboardLoading ? 'animate-spin text-[#F5B041]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* 2. LEADERBOARD MODE SELECTOR */}
              <LeaderboardModeSwitch
                currentMode={leaderboardTab}
                onModeChange={(mode) => setLeaderboardTab(mode)}
              />

              {/* 3. DAILY RESET COUNTDOWN (Daily Mode Only) */}
              {leaderboardTab === 'daily' && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#0E121B] border border-[#F5B041]/30 text-xs shadow-sm">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#F5B041]" />
                    <span className="text-[11px]">Daily Reset at 12:00 AM Midnight:</span>
                  </div>
                  <span className="font-stat font-black text-[#F5B041] tracking-wider text-xs">
                    {formatTimeUntilMidnight(secondsUntilMidnight)}
                  </span>
                </div>
              )}

              {/* 4. YOUR POSITION (Persistent Player Dossier in Arena) */}
              <div className="p-3.5 rounded-2xl bg-[#0E121B] border border-[#F5B041]/40 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex flex-col items-center justify-center w-8 shrink-0">
                    <span className="text-[9px] uppercase font-bold text-slate-500 font-stat">Rank</span>
                    <span className="text-sm font-black font-stat text-[#F5B041]">
                      #{userRank ?? 1}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <RankEmblem rank={getHunterRank(player.level)} size="compact" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-xs font-bold text-white truncate">
                        {player.name || 'Your Hunter'}
                      </span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#F5B041]/20 text-[#F5B041] font-black uppercase tracking-wider shrink-0">
                        YOU
                      </span>
                      {player.isPro && (
                        <span title="Pro Operative" className="inline-flex">
                          <Crown className="w-3 h-3 text-[#F5B041] shrink-0" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-stat font-medium block mt-1 leading-none">
                      LV.{player.level} • {player.classTitle}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="text-xs font-black font-stat text-[#F5B041] block">
                    {leaderboardTab === 'all_time'
                      ? `${player.totalXP.toLocaleString()} XP`
                      : leaderboardTab === 'daily'
                      ? `+${(player.dailyXPDate === todayKey ? player.dailyXP : 0).toLocaleString()} XP`
                      : `${player.streakDays}d STREAK`}
                  </span>
                  <span className="text-[9px] text-slate-500 font-stat block mt-0.5">
                    Your Rating
                  </span>
                </div>
              </div>

              {/* 5. ERROR STATE */}
              {leaderboardError && leaderboardData.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#0E121B] border border-rose-500/20 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Arena Connection Lost
                    </h3>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Unable to retrieve current rankings from live feed.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<RotateCw className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setLeaderboardError(false);
                      fetchLiveLeaderboard(true);
                    }}
                  >
                    Retry Connection
                  </Button>
                </div>
              ) : leaderboardLoading && leaderboardData.length === 0 ? (
                /* Loading Skeleton */
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-[#0E121B] border border-white/[0.04] flex items-center justify-between animate-pulse"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-4 bg-white/10 rounded" />
                        <div className="w-8 h-8 bg-white/10 rounded-xl" />
                        <div className="space-y-1.5">
                          <div className="w-24 h-3 bg-white/10 rounded" />
                          <div className="w-16 h-2.5 bg-white/10 rounded" />
                        </div>
                      </div>
                      <div className="w-16 h-4 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : leaderboardData.length === 0 ? (
                /* Empty State */
                <EmptyState
                  icon={<Trophy className="w-6 h-6 text-[#F5B041]" />}
                  title="ARENA DATA UNAVAILABLE"
                  description="No operatives have entered the arena yet. Complete quests to take the lead!"
                />
              ) : (
                /* 6. TOP 3 PODIUM & REMAINING ROSTER */
                <div className="space-y-4">
                  {/* Top 3 Podium */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Top Operatives
                      </span>
                      <span className="text-[10px] text-slate-500 font-stat">
                        Podium Honors
                      </span>
                    </div>

                    <LeaderboardPodium
                      entries={leaderboardData.slice(0, 3).map((op, idx) => ({
                        rank: (idx + 1) as 1 | 2 | 3,
                        username: op.username || 'Hunter',
                        avatarIcon: getAvatarIcon(op.avatar_id),
                        level: op.level || 1,
                        metricLabel:
                          leaderboardTab === 'all_time'
                            ? `${(op.total_xp || 0).toLocaleString()} XP`
                            : leaderboardTab === 'daily'
                            ? `+${(op.daily_xp_date === todayKey ? (op.daily_xp || 0) : 0).toLocaleString()} XP`
                            : `${op.streak_days || 0}d STREAK`,
                        isCurrentUser:
                          op.uid === currentUserId ||
                          (Boolean(player.name) && op.username?.toLowerCase() === player.name?.toLowerCase()),
                        isPro: op.is_pro
                      }))}
                    />
                  </div>

                  {/* Remaining Roster (#4+) */}
                  {leaderboardData.length > 3 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Arena Roster
                        </span>
                        <span className="text-[10px] text-slate-500 font-stat">
                          Ranks 4 – ${leaderboardData.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {leaderboardData.slice(3).map((operative, idx) => {
                          const rankNum = idx + 4;
                          const isCurrentUser =
                            operative.uid === currentUserId ||
                            (Boolean(player.name) && operative.username?.toLowerCase() === player.name?.toLowerCase());
                          const metricLabel =
                            leaderboardTab === 'all_time'
                              ? `${(operative.total_xp || 0).toLocaleString()} XP`
                              : leaderboardTab === 'daily'
                              ? `+${(operative.daily_xp_date === todayKey ? (operative.daily_xp || 0) : 0).toLocaleString()} XP`
                              : `${operative.streak_days || 0}d STREAK`;

                          return (
                            <LeaderboardRow
                              key={operative.uid || rankNum}
                              rank={rankNum}
                              username={operative.username || 'Hunter'}
                              avatarIcon={getAvatarIcon(operative.avatar_id)}
                              level={operative.level || 1}
                              metricLabel={metricLabel}
                              isCurrentUser={isCurrentUser}
                              isPro={operative.is_pro}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 3: ARMORY (REWARD INVENTORY)                         */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'shop' && (
            <div className="space-y-4">
              {/* 1. ARMORY HEADER */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">
                    Armory
                  </h2>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Tactical Rewards & Personal Inventory
                  </span>
                </div>
                <Badge variant="gold" size="sm" className="font-stat">
                  {rewards.length} Requisitions
                </Badge>
              </div>

              {/* 2. GOLD BALANCE VAULT HEADER */}
              <GoldBalance
                gold={player.gold}
                onAddCustomReward={() => setIsAddRewardModal(true)}
              />

              {/* 3. REWARDS LIST */}
              {rewards.length === 0 ? (
                <EmptyState
                  icon={<Gift className="w-6 h-6 text-[#F5B041]" />}
                  title="YOUR ARMORY IS EMPTY"
                  description="Create custom personal rewards you can claim with your earned quest gold. Turn completed quests into something you actually want."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => setIsAddRewardModal(true)}
                    >
                      Create Personal Reward
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Available Requisitions
                    </span>
                    <span className="text-[10px] text-slate-500 font-stat">
                      Instant Gold Redeem
                    </span>
                  </div>

                  <div className="space-y-2">
                    {rewards.map((reward) => (
                      <RewardCard
                        key={reward.id}
                        id={reward.id}
                        name={reward.name}
                        icon={reward.icon}
                        cost={reward.cost}
                        claimedCount={reward.claimedCount}
                        category={reward.category}
                        currentGold={player.gold}
                        onClaim={() => handleClaimReward(reward)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* -------------------------------------------------------- */}
          {/* TAB 4: PROFILE                                           */}
          {/* -------------------------------------------------------- */}
          {activeTab === 'profile' && (
            <div className="space-y-3.5">
              {/* Profile Screen Header with Settings Gear Button */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Hunter Dossier
                  </span>
                  <span className="text-[10px] font-stat font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#F5B041]">
                    OPERATIVE RECORD
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsSettingsModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#0E121B] hover:bg-[#151A26] border border-white/10 text-slate-300 hover:text-[#F5B041] transition active:scale-95 flex items-center gap-1.5 shadow-sm"
                  title="Settings & System Configuration"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Settings</span>
                </button>
              </div>

              {/* 1. Hunter Identity Header */}
              <HunterIdentity
                name={player.name}
                avatar={player.avatar}
                classTitle={player.classTitle}
                level={player.level}
                isPro={player.isPro}
                onEditAvatar={() => {
                  triggerHaptic('light');
                  avatarCustomizerRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
              />

              {/* 2. Experience & Level Advancement */}
              <ProgressionCard
                level={player.level}
                currentXP={player.currentXP}
                requiredXP={xpNeeded}
                totalXP={player.totalXP}
              />

              {/* 3. Core Combat & Discipline Stats Grid */}
              <StatGrid
                level={player.level}
                totalXP={player.totalXP}
                streakDays={player.streakDays}
                gold={player.gold}
                completedQuestsCount={totalCompletedCount}
                userRank={userRank}
              />

              {/* 4. Hunter Milestones (Client-Side Derived Achievements) */}
              <Card variant="base" padding="md" className="shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#F5B041]/10 border border-[#F5B041]/20 flex items-center justify-center text-[#F5B041]">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Hunter Milestones
                      </h3>
                      <p className="text-[10px] text-slate-400 font-stat">
                        Battle honors & discipline achievements
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-stat font-bold px-2 py-0.5 rounded-md bg-[#080A0F] border border-white/10 text-[#F5B041]">
                    {hunterMilestones.filter((m) => m.isUnlocked).length} / {hunterMilestones.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hunterMilestones.map((m) => (
                    <AchievementBadge
                      key={m.id}
                      id={m.id}
                      title={m.title}
                      description={m.description}
                      icon={m.icon}
                      isUnlocked={m.isUnlocked}
                      reqText={m.reqText}
                      progress={m.progress}
                    />
                  ))}
                </div>
              </Card>

              {/* 5. Operative Archetype & Avatar Customizer */}
              <div ref={avatarCustomizerRef}>
                <Card variant="base" padding="md" className="space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#F5B041]/10 border border-[#F5B041]/20 flex items-center justify-center text-[#F5B041]">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                          Operative Archetype & Icon
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          Select your tactical RPG specialization
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVATAR_OPTIONS.map((av) => {
                      const isSelected = player.avatar === av.icon;
                      return (
                        <button
                          key={av.title}
                          type="button"
                          onClick={() => {
                            setPlayer((prev) => ({
                              ...prev,
                              avatar: av.icon,
                              classTitle: getPlayerTitle(prev.level, av.title)
                            }));
                            if (currentUserId && currentUserId !== 'user_init') {
                              setDoc(doc(db, 'users', currentUserId), { avatar_id: av.icon }, { merge: true }).catch(() => {});
                            }
                            triggerHaptic('light');
                            playCoinSound(!soundEnabled);
                            showToast(`Operative class updated: ${av.title}`);
                          }}
                          className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition active:scale-95 ${
                            isSelected
                              ? 'bg-[#151A26] border-[#F5B041] shadow-[0_0_12px_rgba(245,176,65,0.15)] ring-1 ring-[#F5B041]/50'
                              : 'bg-[#080A0F] border-white/[0.08] hover:border-white/20 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-2xl shrink-0 mt-0.5">{av.icon}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                {av.title}
                              </span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F5B041] shadow-[0_0_6px_#F5B041]" />
                              )}
                            </div>
                            <div className="text-[10px] text-[#F5B041] font-stat font-medium truncate mt-0.5">
                              {av.role}
                            </div>
                            <div className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">
                              {av.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* 6. Level Up Pro (₹49/mo) Teaser Card (Preserved) */}
              <Card variant="accent" padding="md" className="space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#F5B041]" />
                    <span className="text-xs font-black tracking-wider text-white">LEVEL UP PRO</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F5B041]/10 text-[#F5B041] border border-[#F5B041]/20">
                    ₹49/mo • Coming Soon
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Upgrade your productivity engine with VIP Hunter benefits:
                </p>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B041] shrink-0" />
                    <span>Unlimited Habits (Beyond 5 free slots)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B041] shrink-0" />
                    <span>2x Monthly Streak Shields</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B041] shrink-0" />
                    <span>Yearly Consistency Heatmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B041] shrink-0" />
                    <span>Gold Leaderboard Nameplate</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  icon={<Bell className="w-3.5 h-3.5" />}
                  onClick={handleNotifyPro}
                  disabled={player.interestedInPro}
                  className={`w-full ${player.interestedInPro ? 'bg-white/10 text-slate-400 border-white/10' : ''}`}
                >
                  {player.interestedInPro ? '✓ Notification Request Registered' : 'Notify Me on Launch'}
                </Button>
              </Card>

              {/* 7. Sign Out Action (Preserved) */}
              <div className="pt-1">
                <Button
                  variant="danger"
                  size="md"
                  icon={<LogOut className="w-3.5 h-3.5" />}
                  onClick={handleSignOut}
                  className="w-full"
                >
                  Sign Out of Hunter Account
                </Button>
              </div>
            </div>
          )}
        {/* CLEAN FLOATING + BUTTON IN BOTTOM-RIGHT (Quests Only) */}
        {activeTab === 'quests' && habits.length < MAX_FREE_HABITS && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setIsAddQuestModal(true);
            }}
            className="fixed bottom-20 right-5 md:right-[calc(50%-13rem)] z-40 w-12 h-12 rounded-2xl bg-gradient-to-r from-[#F5B041] to-[#E59866] hover:brightness-105 text-[#080A0F] flex items-center justify-center shadow-xl shadow-[#F5B041]/25 active:scale-95 transition-all border border-[#F5B041]/50"
            title="Add Habit Quest"
            aria-label="Add Habit Quest"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        )}
      </AppShell>

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW QUEST                                   */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddQuestModal}
        onClose={() => setIsAddQuestModal(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F5B041]/20 border border-[#F5B041]/30 flex items-center justify-center text-[#F5B041]">
              <Sword className="w-3.5 h-3.5" />
            </div>
            <span>Create Daily Habit Quest</span>
          </div>
        }
      >
        <form onSubmit={handleCreateQuest} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Quest Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Read 20 pages, 30m workout, meditate..."
              value={newQuestName}
              onChange={(e) => setNewQuestName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080A0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#F5B041]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Quest Icon
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {EMOJI_BANK.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewQuestIcon(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border transition ${
                    newQuestIcon === emoji
                      ? 'bg-[#F5B041]/20 border-[#F5B041] scale-105'
                      : 'bg-[#080A0F] border-white/10 hover:bg-white/5'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Difficulty & Rewards
              </label>
              <span className="text-[10px] text-slate-500 font-stat">
                {habits.length}/{MAX_FREE_HABITS} Slots Used
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
                const cfg = DIFFICULTY_MAP[diff];
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setNewQuestDifficulty(diff)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase border flex flex-col items-center justify-center transition ${
                      newQuestDifficulty === diff
                        ? 'bg-[#F5B041] text-[#080A0F] border-[#F5B041]'
                        : 'bg-[#080A0F] border-white/10 text-slate-400'
                    }`}
                  >
                    <span className="capitalize">{diff}</span>
                    <span className="text-[9px] opacity-80 mt-0.5 font-stat">+{cfg.xp} XP • +{cfg.gold}g</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddQuestModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Enlist Quest
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: EDIT EXISTING QUEST                               */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(editingHabit)}
        onClose={() => setEditingHabit(null)}
        title={
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
              <Pencil className="w-3.5 h-3.5" />
            </div>
            <span>Edit Habit Quest</span>
          </div>
        }
      >
        <form onSubmit={handleUpdateQuest} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Quest Title
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={editQuestName}
              onChange={(e) => setEditQuestName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080A0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#F5B041]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Quest Icon
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {EMOJI_BANK.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setEditQuestIcon(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border transition ${
                    editQuestIcon === emoji
                      ? 'bg-[#F5B041] border-[#F5B041] shadow-sm'
                      : 'bg-[#080A0F] border-white/10 hover:border-slate-500'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Difficulty & Rewards
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
                const cfg = DIFFICULTY_MAP[diff];
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setEditQuestDifficulty(diff)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase border flex flex-col items-center justify-center transition ${
                      editQuestDifficulty === diff
                        ? 'bg-[#F5B041] text-[#080A0F] border-[#F5B041]'
                        : 'bg-[#080A0F] border-white/10 text-slate-400'
                    }`}
                  >
                    <span className="capitalize">{diff}</span>
                    <span className="text-[9px] opacity-80 mt-0.5 font-stat">+{cfg.xp} XP • +{cfg.gold}g</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingHabit(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: LEVEL UP CELEBRATION                            */}
      {/* ======================================================== */}
      {isLevelUpModal && levelUpData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121722] border-2 border-[#F5B041] rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-level-burst">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F5B041] text-[#0A0D14] flex items-center justify-center text-3xl shadow-lg mb-3 animate-bounce">
              👑
            </div>

            <div className="text-[11px] font-black tracking-widest uppercase text-[#F5B041]">SYSTEM NOTICE</div>
            <h2 className="text-2xl font-black text-white mt-0.5">
              LEVEL {levelUpData.newLevel} ACHIEVED
            </h2>

            <p className="text-xs font-bold text-slate-300 mt-1.5">
              Rank Title: <span className="text-[#F5B041]">"{levelUpData.title}"</span>
            </p>

            <div className="my-4 p-3 rounded-xl bg-[#0A0D14] border border-[#1E2638] text-xs text-slate-300 space-y-1 text-left">
              <div className="text-[#F5B041] font-bold">✨ Level Milestone Rewards:</div>
              <div className="text-slate-400">• New Rank Title Unlocked</div>
              <div className="text-slate-400">• Global Leaderboard Rank Boosted 🏆</div>
            </div>

            <button
              onClick={() => setIsLevelUpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#F5B041] hover:bg-[#e5a031] text-[#0A0D14] font-black text-xs uppercase tracking-wider shadow-sm active:scale-95 transition"
            >
              Continue Journey
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CUSTOM REWARD MODAL                             */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddRewardModal}
        onClose={() => setIsAddRewardModal(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F5B041]/20 border border-[#F5B041]/30 flex items-center justify-center text-[#F5B041]">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <span>Create Custom Real-Life Reward</span>
          </div>
        }
      >
        <form onSubmit={handleAddCustomReward} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Reward Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 1hr gaming, movie ticket, iced coffee..."
              value={newRewardName}
              onChange={(e) => setNewRewardName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080A0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#F5B041]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Icon
              </label>
              <select
                value={newRewardIcon}
                onChange={(e) => setNewRewardIcon(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#080A0F] border border-white/10 text-white text-xs focus:outline-none focus:border-[#F5B041]"
              >
                <option value="🎁">🎁 Gift</option>
                <option value="🎮">🎮 Gaming</option>
                <option value="🍕">🍕 Food</option>
                <option value="🎬">🎬 Movie</option>
                <option value="☕">☕ Coffee</option>
                <option value="😴">😴 Nap</option>
                <option value="🛍️">🛍️ Shopping</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Cost (Gold)
              </label>
              <input
                type="number"
                min={10}
                max={1000}
                value={newRewardCost}
                onChange={(e) => setNewRewardCost(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#080A0F] border border-white/10 text-white text-xs font-stat focus:outline-none focus:border-[#F5B041]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddRewardModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Add Loot to Shop
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 4: SYSTEM CONFIGURATION SHEET (Phase 4B)           */}
      {/* ======================================================== */}
      <SystemSettingsModal
        isOpen={isSettingsModal}
        onClose={() => setIsSettingsModal(false)}
        player={{
          name: player.name,
          avatar: player.avatar,
          level: player.level,
          classTitle: player.classTitle,
          isPro: player.isPro
        }}
        currentUserEmail={currentUser?.email}
        preferences={preferences}
        isReducedMotion={isReducedMotion}
        onToggleSound={(enabled) => {
          setSoundEnabled(enabled);
          triggerGameHaptic('light');
        }}
        onToggleHaptics={(enabled) => {
          setHapticsEnabled(enabled);
          if (enabled) triggerHaptic('light');
        }}
        onSetReducedMotion={(mode) => {
          setReducedMotion(mode);
          triggerGameHaptic('light');
        }}
        onToggleNotifications={async (enabled) => {
          await setNotificationsEnabled(enabled);
          triggerGameHaptic('light');
        }}
        onSignOut={handleSignOut}
        onRequestDeleteAccount={() => {
          triggerGameHaptic('warning');
          setIsDeleteAccountModal(true);
        }}
        privacyPolicyUrl={PRIVACY_POLICY_URL}
        termsOfServiceUrl={TERMS_OF_SERVICE_URL}
        feedbackUrl={FEEDBACK_URL}
        supportEmail={SUPPORT_EMAIL}
        appVersion={APP_VERSION}
        buildNumber={BUILD_NUMBER}
      />

      {/* ======================================================== */}
      {/* MODAL 5: MANDATORY ACCOUNT DELETION CONFIRMATION         */}
      {/* ======================================================== */}
      <Modal
        isOpen={isDeleteAccountModal}
        onClose={() => !isDeletingAccount && setIsDeleteAccountModal(false)}
        maxWidth="sm"
        title={
          <div className="flex items-center gap-2 text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Delete Hunter Account?</span>
          </div>
        }
      >
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 text-left">
            <p className="text-xs text-slate-300 leading-relaxed">
              This action is <strong className="text-rose-400">permanent and irreversible</strong>. Your operative profile, level, earned XP, streak counters, quest log, and custom shop rewards will be permanently wiped from Cloud Firestore and Firebase Auth.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              type="button"
              variant="danger"
              size="lg"
              loading={isDeletingAccount}
              onClick={handleDeleteAccountAndData}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Permanently Purge All Data
            </Button>

            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={isDeletingAccount}
              onClick={() => setIsDeleteAccountModal(false)}
              className="w-full"
            >
              Cancel & Return
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
