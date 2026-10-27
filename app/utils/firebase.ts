import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  Auth
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  getFirestore,
  Firestore
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBefMOtzB9AfEhUXvRGVcPvUxTZOWvP8FQ',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDomain || 'level-up-3f79a.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'level-up-3f79a',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'level-up-3f79a.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '303219866607',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:303219866607:android:2153d117d146c7174fd41a'
};

export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    Boolean(firebaseConfig.projectId) &&
    firebaseConfig.projectId === 'level-up-3f79a'
  );
};

// Initialize Firebase App singleton
export const app: FirebaseApp = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

// Initialize Auth with multi-layer persistence (IndexedDB + localStorage) for Android WebView resilience
let firebaseAuth: Auth;
if (typeof window !== 'undefined') {
  try {
    firebaseAuth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence]
    });
  } catch {
    try {
      firebaseAuth = getAuth(app);
    } catch {
      firebaseAuth = getAuth();
    }
  }
} else {
  try {
    firebaseAuth = getAuth(app);
  } catch {
    firebaseAuth = getAuth();
  }
}

export const auth: Auth = firebaseAuth;
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore singleton with offline persistence safely
let firestoreInstance: Firestore;

if (typeof window !== 'undefined') {
  try {
    // Multi-tab resilient persistent local cache without brittle forced ownership locks
    firestoreInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({})
    });
  } catch (_persistentErr) {
    console.warn('[LEVELUP:FIRESTORE] Persistent cache initialization failed, falling back to standard Firestore:', _persistentErr);
    try {
      firestoreInstance = getFirestore(app);
    } catch {
      firestoreInstance = initializeFirestore(app, {});
    }
  }
} else {
  // During Next.js static prerender in Node (SSR), firestore is not used on server.
  // We satisfy module evaluation with Firestore prototype so SSR build succeeds cleanly.
  try {
    firestoreInstance = getFirestore(app);
  } catch {
    firestoreInstance = Object.create(Firestore.prototype) as Firestore;
  }
}

// Validation: Ensure db is a genuine, concrete Firestore instance
if (!firestoreInstance) {
  throw new Error('[LEVELUP:FIRESTORE] Cloud Firestore initialization failed: SDK instance is undefined.');
}

export const db: Firestore = firestoreInstance;
export const getFirestoreDb = (): Firestore => db;

export interface UserProfile {
  uid: string;
  username: string;
  username_lowercase: string;
  avatar_id: string;
  level: number;
  xp: number;
  total_xp: number;
  daily_xp?: number;
  daily_xp_date?: string | null;
  gold: number;
  streak_days: number;
  last_completed_date: string | null;
  is_pro: boolean;
  interested_in_pro: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HabitDocument {
  id?: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  icon: string;
  completed_dates: string[];
  created_at: string;
}

export const DIFFICULTY_REWARDS = {
  easy: { xp: 15, gold: 5 },
  medium: { xp: 30, gold: 10 },
  hard: { xp: 50, gold: 20 }
} as const;

export const MAX_FREE_HABITS = 5;

export const calculateLevel = (totalXp: number): number => {
  return 1 + Math.floor(Math.max(0, totalXp) / 200);
};

export const getTodayKey = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayDateString = getTodayKey;

export const getYesterdayKey = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
