
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot
} from "firebase/firestore";
import { db } from "../config";

// ============================================
// TYPES
// ============================================

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // YYYY-MM-DD
}

// ============================================
// STREAL HELPER
// ============================================

export function subscribeToStreak(
    callback: (streak: StreakData | null) => void
) {
    const docRef = doc(db, "streaks", "main_streak");

    return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data() as StreakData;
            callback(data);
        } else {
            callback(null);
        }
    });
}

export async function updateStreak(data: Partial<StreakData>) {
    const docRef = doc(db, "streaks", "main_streak");
    await setDoc(docRef, data, { merge: true });
}

// ============================================
// DAILY LOGIN CHECK
// ============================================

export async function checkDailyStreak() {
    try {
        const docRef = doc(db, "streaks", "main_streak");
        const snapshot = await getDoc(docRef);
        const today = new Date().toISOString().split('T')[0];

        if (!snapshot.exists()) {
            // Initial streak if not present
            await setDoc(docRef, {
                currentStreak: 1,
                longestStreak: 1,
                lastActiveDate: today,
            });
            return;
        }

        const streak = snapshot.data() as StreakData;
        const lastActive = streak.lastActiveDate;

        // Check if yesterday or older
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === today) {
            // Already logged in today
            return;
        } else if (lastActive === yesterdayStr) {
            // Streak continues!
            await updateStreak({
                currentStreak: streak.currentStreak + 1,
                lastActiveDate: today,
                longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1)
            });
        } else {
            // Streak broken :( But starting fresh!
            await updateStreak({
                currentStreak: 1,
                lastActiveDate: today,
            });
        }
    } catch (error) {
        // Suppress expected offline errors during local development
        if (error instanceof Error && !error.message.includes('offline')) {
            console.warn("Could not sync daily streak. Working in offline mode.");
        }
    }
}
