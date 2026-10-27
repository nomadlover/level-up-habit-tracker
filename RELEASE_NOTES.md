# LEVEL UP — Version 1.0.0-beta.1 Release Notes

## Product Overview
LEVEL UP is a gamified RPG habit tracker engineered for students and young adults. It transforms daily routines and habit building into an interactive hunter mission progression system with XP, gold rewards, live leaderboards, and custom player-defined loot.

## What's Included in This Beta Build
- **Authentication Gateway**: Firebase Authentication with Email/Password and native Android Google Sign-In with OAuth token bridge. Includes Offline Simulation Mode for immediate trial.
- **Hunter Dossier & Progression**: Character setup (6 hunter classes), level progression (Levels 1–100), dynamic rank emblems (E-Rank through National-Rank), tabular stat tracking, and career milestones.
- **Tactical Mission Control (Quests)**: Daily habit tracking with 4 difficulty tiers (Easy, Medium, Hard, Boss), procedural audio chimes, tactile haptics, and particle animations.
- **Tactical Arena (Leaderboard)**: Live real-time community rankings categorized by All-Time XP, Daily XP (with automated midnight reset), and Consecutive Streaks.
- **Tactical Armory (Loot Shop)**: Gold-based reward shop featuring player-defined real-world incentives, debounced rapid-tap prevention, and balance protection.
- **Sensory & Accessibility Architecture**: Dedicated System Configuration menu with independent toggles for Procedural Audio, Native Haptics, 9:00 PM Daily Streak Reminders, and a 3-way Reduced Motion engine (System / Reduced / Full Motion).
- **Android Native Enhancements**: Hardware back button dismissal hierarchy, dark luxury status bar theming, and edge-to-edge safe area adaptation.
- **Integrated Feedback System**: One-tap structured feedback link sending pre-formatted bug reports directly to developer support (`anandshivam1209@gmail.com`).

## Known Beta Limitations & Accepted Trade-offs
1. **Client-Side Firebase Game Economy**: As an offline-first serverless architecture on Firebase Spark (free tier), game state mutations (XP, Gold, Streaks) are computed on-client and synchronized to Firestore. While client-side debounce locks and transaction clamps are active, malicious clients with physical device access could manipulate local values. (Standard limitation for client-centric single-player habit trackers on Firebase Spark).
2. **Offline Leaderboard Synchronization**: The global leaderboard requires an active internet connection to stream live user documents from Cloud Firestore. When offline, cached local stats are displayed.
3. **Google Sign-In Signing Dependency**: The bundled Debug APK is signed with the development debug certificate (`SHA1: 09:43:96:F8:BC:3C:70:C6:8A:A3:5C:93:74:CE:0F:1A:D3:D2:C1:90`), which matches the Firebase Console configuration. Generating a signed release bundle requires creating a private keystore and registering its SHA-1 fingerprint in Firebase Console.
4. **Physical Device Touch Testing**: Automated CI/headless compilation verified builds, linting, and asset bundling; end-to-end tactile feel and manufacturer-specific WebView variations require manual validation following the Physical Device Test Plan.

## Feedback & Bug Reporting
Beta testers can report bugs or suggest enhancements directly through:
- **In-App**: Profile Tab → Gear Icon (Settings) → "Give Beta Feedback"
- **Direct Email**: `anandshivam1209@gmail.com`
