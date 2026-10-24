# ⚔️ LEVEL UP — Gamified RPG Habit Tracker

[![Android](https://img.shields.io/badge/Platform-Android%208.0%2B-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://github.com/nomadlover/level-up-habit-tracker/raw/main/release/app-debug.apk)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.5-blue?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **Gamify your discipline.** Turn your daily habits and goals into high-stakes RPG quests. Slay procrastination, level up your hunter class, maintain streaks, and dominate the Global Arena Leaderboard.

---

## 📲 Download Release APK

| Artifact | Version | Size | Direct Download |
|:---|:---:|:---:|:---:|
| **LEVEL UP Android App** | `v1.0.0 (Release)` | `~8.5 MB` | [📥 **Download app-debug.apk**](https://github.com/nomadlover/level-up-habit-tracker/raw/main/release/app-debug.apk) |

### Quick Installation:
1. Download [`release/app-debug.apk`](release/app-debug.apk) directly to your Android device.
2. Tap the downloaded file to install (allow *"Install unknown apps"* if prompted).
3. Sign in with Google or Email/Password, awaken your Hunter, and embark on your quests!

---

## 🏗️ System Architecture

The application is built on a hybrid architecture combining a high-performance **Next.js 16** responsive client inside an **Android Capacitor 8** native runtime container, backed by **Google Cloud Firestore** and **Firebase Authentication**.

```mermaid
graph TD
    subgraph Client ["📱 Android Mobile App (Capacitor Container)"]
        UI["Tailwind CSS Dark Gaming UI (app/page.tsx)"]
        Audio["Web Audio Synthesizer (audio.ts)"]
        Haptics["Tactile Haptics Bridge (@capacitor/haptics)"]
        Notif["Local Notifications (@capacitor/local-notifications)"]
        Cache["Local Storage Dual-Layer Cache (0ms Hydration)"]
    end

    subgraph NativeBridge ["🔌 Capacitor Native Plugins"]
        Bridge["Capacitor Android Bridge (MainActivity.java)"]
        AuthBridge["@capacitor-firebase/authentication"]
        StatusBar["@capacitor/status-bar"]
    end

    subgraph Cloud ["☁️ Google Cloud & Firebase Backend"]
        FBAuth["Firebase Authentication (Google OAuth + Email)"]
        Firestore["Cloud Firestore (asia-south1)"]
        UsersCol["/users/{uid} (Profiles, XP, Stats)"]
        HabitsSub["/users/{uid}/habits/{habitId}"]
        Arena["Global Arena Feed (Real-Time Leaderboard)"]
    end

    UI --> Audio
    UI --> Haptics
    UI --> Cache
    UI <--> Bridge
    Bridge <--> AuthBridge
    AuthBridge <--> FBAuth
    UI <--> Firestore
    Firestore --> UsersCol
    Firestore --> HabitsSub
    Firestore --> Arena
    Notif -->|9:00 PM Daily Reminder| Client
```

---

## 🔄 User Authentication & Character Awakening Flow

New and returning operatives undergo a zero-friction onboarding flow with automatic session healing, fail-safe watchdogs, and immediate screen transitions:

```mermaid
flowchart TD
    Start([App Launched]) --> Hydrate[0ms Local Storage Hydration]
    Hydrate --> CheckAuth{Firebase Auth State}

    CheckAuth -->|Logged In| SessionValid{Session Active?}
    SessionValid -->|Valid| HasProfile{Hunter Profile Exists?}
    SessionValid -->|Deleted in Console| Purge[Auto-Purge Zombie Session] --> ShowAuth[Display Awakening Screen]

    HasProfile -->|Yes| MainDashboard[Enter Quests Dashboard]
    HasProfile -->|No| SetupScreen[Display Character Setup Screen]

    CheckAuth -->|Signed Out| ShowAuth

    ShowAuth -->|Google / Email Auth| Authenticate[Authenticate Credentials]
    Authenticate -->|Success| ImmediateTransition[Instant 0ms Screen Advancement]
    ImmediateTransition --> HasProfile
    Authenticate -->|Guest Bypass| SetupScreen

    SetupScreen --> PickHunter[Choose Name & Class: Warrior, Ranger, Mage, Paladin]
    PickHunter --> SaveProfile[Atomic Write to Firestore users/uid]
    SaveProfile --> MainDashboard
```

---

## ⚡ Dual-Layer Persistence & Real-Time Sync Lifecycle

Every quest action triggers an **instant local update** (0ms latency with audio/haptic feedback) followed by a **background Cloud Firestore synchronization**:

```mermaid
sequenceDiagram
    autonumber
    actor Hunter as ⚔️ Hunter
    participant App as 📱 Level Up Client
    participant Local as 💾 LocalStorage & Cache
    participant Cloud as ☁️ Cloud Firestore

    Hunter->>App: Tap Habit Complete (Checkbox)
    App->>App: Trigger Haptic Feedback + Audio SFX + Confetti
    App->>Local: Write updated XP, Level, Gold & Habits (0ms)
    App->>Hunter: Immediate UI Update (+30 XP Particle)

    Note over App,Cloud: Non-blocking Background Sync
    App->>Cloud: setDoc(users/uid, { total_xp, daily_xp, gold })
    App->>Cloud: setDoc(users/uid/habits/id, { completed_dates })
    Cloud-->>App: Firestore Ack
    Cloud->>Cloud: Trigger Leaderboard onSnapshot Update
```

---

## 🕛 Automatic 12:00 AM Midnight Reset & Arena Ranking

The Daily Arena dynamically tracks high-performing hunters without burning database quotas:

```mermaid
flowchart LR
    A[Date Verification] -->|getTodayKey YYYY-MM-DD| B{Is Date == todayKey?}
    B -->|Yes| C[Accumulate daily_xp]
    B -->|New Day 12:00 AM| D[Reset daily_xp to 0]
    D --> E[Preserve cumulative total_xp]
    D --> F[Verify & Protect Streak Days]
    C --> G[Stream into Today's Daily Leaderboard]
    E --> H[Stream into All-Time Arena Rank]
```

---

## 🎮 Game Mechanics & RPG Progression

### 1. Hunter Classes & Archetypes
Operatives select their identity upon awakening:
* **⚔️ Warrior / Paladin**: Frontline discipline, armor against procrastination.
* **🏹 Ranger / Archer**: Swift, consistent daily task executions.
* **🪄 Mage / Sorcerer**: Deep-work mastery, knowledge and study spells.
* **🛡️ Guardian**: Defensive consistency, bulletproof streak shields.

### 2. Level Progression Formula
Player level escalates exponentially with total earned XP:
$$\text{XP Required for Level } n = \text{round}\left(100 \times 1.25^{n - 1}\right)$$

### 3. Quest Difficulty Rewards
| Quest Difficulty | XP Reward | Gold Reward | Use Case |
|:---|:---:|:---:|:---|
| **🟢 Easy** | `+15 XP` | `🪙 5 Gold` | Quick wins (Drink water, make bed) |
| **🟡 Medium** | `+30 XP` | `🪙 10 Gold` | Standard habits (30m workout, read 10 pages) |
| **🟠 Hard** | `+60 XP` | `🪙 20 Gold` | High effort (2h deep study, coding project) |
| **🔴 Epic** | `+120 XP` | `🪙 40 Gold` | Breakthrough milestones (Exam completion, major launch) |

### 4. Streak Protection & Daily Reminders
* **Daily Streak**: Increments automatically when at least 1 quest is completed today and yesterday was maintained.
* **9:00 PM Protection**: Scheduled native notification triggers at 21:00 local time if quests remain unfinished before midnight.

### 5. Loot Shop & Treasury
Spend earned gold on custom and default rewards:
* Cheat meal / specialty coffee
* Movie or anime binge night
* Power nap or custom gaming sessions

---

## 📂 Repository Structure

```
level-up-habit-tracker/
├── android/                        # Capacitor Android native project
│   ├── app/
│   │   ├── google-services.json    # Firebase Android configuration
│   │   └── src/main/AndroidManifest.xml
│   └── build.gradle                # Android Gradle build scripts
├── app/                            # Next.js 16 source code
│   ├── constants/                  # App links, versioning, links.ts
│   ├── utils/
│   │   ├── audio.ts                # Synthesized Web Audio sound effects
│   │   ├── firebase.ts             # Firebase Auth & Firestore client setup
│   │   └── native.ts               # Capacitor Haptics & Notification bridges
│   ├── globals.css                 # Custom gaming dark theme
│   ├── layout.tsx                  # Root metadata & fonts
│   └── page.tsx                    # Main single-page application & Arena UI
├── release/                        # Compiled distribution binaries
│   └── app-debug.apk               # Ready-to-install Android APK (~8.5 MB)
├── capacitor.config.json           # Native bridge configuration
├── firebase.json                   # Firebase Auth & Firestore rules configuration
├── firestore.indexes.json          # Database query indexes
├── firestore.rules                 # Strict security rules (public read, owner write)
├── package.json                    # Dependencies and scripts
└── tsconfig.json                   # TypeScript configuration
```

---

## 🛡️ Cloud Firestore Security Rules

Cloud Firestore is protected by declarative security rules allowing public read access for the Global Arena Leaderboard while strictly restricting all document writes to authenticated owners:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow read so the Global Leaderboard works seamlessly across all auth states
      allow read: if true;
      // Strictly restrict write operations to the authenticated document owner
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Habits and custom rewards subcollections
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 💻 Local Development & Build Setup

### Prerequisites
* **Node.js**: v18.0 or higher
* **Java SDK**: OpenJDK 17 or 21
* **Android Studio / SDK**: Android SDK Platform 34+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/nomadlover/level-up-habit-tracker.git
cd level-up-habit-tracker
npm install
```

### 2. Run Local Web Development Server
```bash
npm run dev
# Open http://localhost:3000
```

### 3. Build & Sync Native Android Assets
```bash
# 1. Compile Next.js static build
npm run build

# 2. Sync web assets into Android Capacitor container
npx cap sync android
```

### 4. Compile Android APK
```bash
# Windows
cd android
.\gradlew.bat assembleDebug

# macOS / Linux
cd android
./gradlew assembleDebug
```
The output APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute.
