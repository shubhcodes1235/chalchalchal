// src/lib/db/schemas.ts

// ═══════════════════════════════════════════════════════
// ALL DATABASE TABLE SCHEMAS
// ═══════════════════════════════════════════════════════

export interface Design {
  id: string;                    // nanoid
  person: 'shubham' | 'khushi';
  title: string;
  description?: string;
  imageBlob?: Blob;               // Stored locally in IndexedDB
  thumbnailBlob?: Blob;           // Compressed thumbnail
  imageUrl?: string;             // For cloud-synced items
  thumbnailUrl?: string;         // For cloud-synced items
  tool: 'photoshop' | 'illustrator' | 'figma' | 'other';
  toolDetail?: string;           // e.g., "After Effects"
  tags: string[];                // ['logo', 'poster', etc.]
  moodRating: 1 | 2 | 3 | 4 | 5; // 😕😐🙂😊🤩
  workType: 'practice' | 'client';
  isHallOfFame: boolean;
  hallOfFameMonth?: string;      // "2024-03"
  isFirstDesign: boolean;        // Permanently pinned
  challengeId?: string;          // If from a daily challenge
  hypeCount: number;             // Number of 🔥 received
  createdAt: Date;
  updatedAt: Date;
}

export interface StickyNote {
  id: string;
  person: 'shubham' | 'khushi';
  content: string;
  type: 'idea' | 'boost' | 'goal' | 'resource' | 'future-self' | 'thought' | 'reminder';
  color: string;                  // Note color
  isPinned: boolean;
  linkedUrl?: string;             // For resource links
  reactions?: {
    emoji: string;
    byPersona: string;
    at: Date;
  }[];
  createdAt: Date;
}

export interface DailyWin {
  id: string;
  person: 'shubham' | 'khushi';
  content: string;
  date: string;                   // "2024-03-15"
  createdAt: Date;
}

export interface StreakData {
  id: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;         // "2024-03-15"
  totalActiveDays: number;
  streakHistory: {
    date: string;
    persons: ('shubham' | 'khushi')[];
  }[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  emoji: string;
  stage: number;                  // 1-5 (seed to trophy)
  isCompleted: boolean;
  completedDate?: Date;
  completionNote?: string;
  createdAt: Date;
}

export interface Income {
  id: string;
  person: 'shubham' | 'khushi';
  amount: number;
  currency: 'INR';
  clientName?: string;
  projectDescription: string;
  designId?: string;              // Link to the design
  date: Date;
  note?: string;
  createdAt: Date;
}

export interface WeeklyReflection {
  id: string;
  person: 'shubham' | 'khushi';
  weekStart: string;              // "2024-03-11"
  weekEnd: string;                // "2024-03-17"
  learned: string;
  biggestChallenge: string;
  proudOf: string;
  nextWeekGoal?: string;
  createdAt: Date;
}

export interface Letter {
  id: string;
  fromPerson: 'shubham' | 'khushi';
  toPerson: 'shubham' | 'khushi' | 'future-self';
  type: 'appreciation' | 'time-capsule' | 'future-self' | 'if-reading-this';
  content: string;
  isLocked: boolean;
  unlockDate?: Date;              // For time capsules
  isRead: boolean;
  createdAt: Date;
}

export interface GratitudeEntry {
  id: string;
  person: 'shubham' | 'khushi';
  content: string;
  date: string;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  prompt: string;
  date: string;                   // "2024-03-15"
  submissions: {
    person: 'shubham' | 'khushi';
    designId: string;
  }[];
  createdAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: string;               // "fundamentals" | "tools" | "specialization"
  parentSkillId?: string;         // For tree structure
  isUnlocked: boolean;
  unlockedDate?: Date;
  level: number;                  // 0-100
  requiredDesigns: number;        // Designs needed to unlock
  icon: string;                   // Emoji or icon name
  createdAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  deadline?: Date;
  isCompleted: boolean;
  completedDate?: Date;
  person: 'shared' | 'shubham' | 'khushi';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface Resource {
  id: string;
  person: 'shubham' | 'khushi';
  title: string;
  url?: string;
  type: 'tutorial' | 'youtube' | 'font' | 'asset' | 'palette' | 'inspiration' | 'other';
  description?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
}

export interface DreamBoardItem {
  id: string;
  person: 'shubham' | 'khushi' | 'both';
  title: string;
  imageUrl?: string;
  category: 'shared' | 'personal';
  isAchieved: boolean;
  targetDate?: Date;
  createdAt: Date;
}

export interface HypeEvent {
  id: string;
  fromPerson: 'shubham' | 'khushi';
  toPerson: 'shubham' | 'khushi';
  designId: string;
  type: 'fire' | 'heart' | 'star';
  createdAt: Date;
}

export interface LearningNote {
  id: string;
  person: 'shubham' | 'khushi';
  content: string;                // "Watched tutorial on masking"
  date: string;
  tutorialUrl?: string;
  createdAt: Date;
}

export interface AppSettings {
  id: string;                     // Always "main"
  manifestationQuote: string;
  sharedWhy: string;
  theme: 'sunrise' | 'midnight' | 'celebration' | 'auto';
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  customCursorEnabled: boolean;
  currentPerson: 'shubham' | 'khushi' | 'both'; // Who's using right now
  shubhamAvatarLevel: 'beginner' | 'intermediate' | 'advanced';
  khushiAvatarLevel: 'beginner' | 'intermediate' | 'advanced';
  seasonalThemeEnabled: boolean;
  lastBackupDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
