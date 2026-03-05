// src/lib/services/sync.service.ts
import { subscribeToDesigns } from "@/lib/firebase/services/designs";
import { subscribeToNotes } from "@/lib/firebase/services/notes";
import { subscribeToOtherActivities } from "@/lib/firebase/services/activity";
import { subscribeToAllWins } from "@/lib/firebase/services/wins";
import { subscribeToStreak } from "@/lib/firebase/services/streak";
import { designsRepo } from "@/lib/db/repositories/designs.repo";
import { notesRepo } from "@/lib/db/repositories/notes.repo";
import { winsRepo } from "@/lib/db/repositories/wins.repo";
import { streaksRepo } from "@/lib/db/repositories/streaks.repo";
import { db } from "@/lib/db/database";
import { Design as LocalDesign, StickyNote as LocalNote } from "@/lib/db/schemas";
import { toast } from "react-hot-toast";

export function startCloudSync(currentPerson: string) {
    console.log("☁️ Cloud Sync Initialized for", currentPerson);
    // Visual feedback for debugging
    toast("Sync engine online 🚀", { icon: '☁️', duration: 2000 });
    // Diagnostic: Check if env variables are loaded
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
        console.error("❌ Firebase Project ID missing! Did you restart the server?");
        toast.error("Firebase not configured. Check .env.local and restart system.", { duration: 5000 });
    } else {
        console.log("🔥 Connected to Firebase project:", projectId);
    }

    const unsubscribes: (() => void)[] = [];

    // 1. SYNC DESIGNS
    const unsubDesigns = subscribeToDesigns(async (firebaseDesigns) => {
        console.log(`📥 Received ${firebaseDesigns.length} designs from Cloud`);
        for (const fbDesign of firebaseDesigns) {
            try {
                let designDate = new Date();
                if (fbDesign.createdAt) {
                    const fbCreatedAt = fbDesign.createdAt as any;
                    designDate = fbCreatedAt.toDate ? fbCreatedAt.toDate() : new Date(fbCreatedAt);
                }
                const local = await designsRepo.getDesignById(fbDesign.id);
                const designToSync: LocalDesign = {
                    id: fbDesign.id,
                    person: (fbDesign.uploadedByPersona as "shubham" | "khushi" | "both") === 'both' ? 'shubham' : fbDesign.uploadedByPersona as "shubham" | "khushi",
                    title: fbDesign.title,
                    description: fbDesign.description,
                    imageUrl: fbDesign.imageUrl,
                    thumbnailUrl: fbDesign.thumbnailUrl,
                    tool: (fbDesign.tool?.toLowerCase() as LocalDesign["tool"]) || 'other',
                    toolDetail: fbDesign.toolDetail,
                    tags: fbDesign.tags || [],
                    moodRating: (fbDesign.moodRating as 1 | 2 | 3 | 4 | 5) || 3,
                    workType: 'practice',
                    isHallOfFame: fbDesign.isHallOfFame || false,
                    isFirstDesign: false,
                    hypeCount: fbDesign.hypeCount || 0,
                    createdAt: designDate,
                    updatedAt: new Date(),
                    imageBlob: local?.imageBlob,
                    thumbnailBlob: local?.thumbnailBlob,
                };
                await designsRepo.upsertDesign(designToSync);
            } catch (err) {
                console.error("❌ Sync design failed:", fbDesign.id, err);
            }
        }
    });
    unsubscribes.push(unsubDesigns);

    // 2. SYNC NOTES (Board)
    const unsubNotes = subscribeToNotes(async (firebaseNotes) => {
        console.log(`📥 Received ${firebaseNotes.length} notes from Cloud`);
        for (const fbNote of firebaseNotes) {
            try {
                const fbCreatedAt = fbNote.createdAt as any;
                const noteToSync: LocalNote = {
                    ...fbNote,
                    createdAt: fbCreatedAt?.toDate ? fbCreatedAt.toDate() : new Date(fbCreatedAt),
                };
                await notesRepo.upsertNote(noteToSync);
            } catch (err) {
                console.error("❌ Sync note failed:", fbNote.id, err);
            }
        }
    });
    unsubscribes.push(unsubNotes);

    // 3. LIVE NOTIFICATIONS (Toasts & Native Push)
    const unsubActivity = subscribeToOtherActivities(currentPerson, (activity) => {
        const emoji = activity.person === 'shubham' ? '👦' : '👧';
        const icon = activity.type === 'note' ? '📝' : activity.type === 'upload' ? '🎨' : '✨';
        const titleText = `Dream & Design • ${activity.person === 'shubham' ? 'Shubham' : 'Khushi'}`;
        const bodyText = `${icon} ${activity.message}`;

        // In-app toast notification
        toast(`${emoji} ${activity.message}`, {
            duration: 5000,
            icon: icon,
            style: {
                borderRadius: '1.5rem',
                background: '#fff',
                color: '#1a1a1a',
                fontWeight: 'bold',
                border: '1px solid #f0f0f0',
                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)'
            }
        });

        // Trigger native OS push notification
        if ("Notification" in window && Notification.permission === "granted") {
            const options = {
                body: bodyText,
                icon: `/${activity.person}.jpg`, // e.g., /shubham.jpg or /khushi.jpg
                badge: '/icons/icon-192x192.png',
                vibrate: [200, 100, 200, 100, 200, 100, 200],
                tag: activity.id,
                renotify: true,
            };
            
            try {
                if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then(registration => {
                        registration.showNotification(titleText, options);
                    });
                } else {
                    new Notification(titleText, options);
                }
            } catch (e) {
                new Notification(titleText, options);
            }
        }
    });
    unsubscribes.push(unsubActivity);
    
    // 4. SYNC WINS
    const unsubWins = subscribeToAllWins(async (firebaseWins) => {
        console.log(`📥 Received ${firebaseWins.length} wins from Cloud`);
        for (const fbWin of firebaseWins) {
            try {
                const localWin = await winsRepo.getWinByDate(fbWin.date, fbWin.person);
                if (!localWin) {
                    await winsRepo.addWin({
                        person: fbWin.person,
                        content: fbWin.content,
                        date: fbWin.date
                    });
                }
            } catch (err) {
                console.error("❌ Sync win failed:", fbWin.id, err);
            }
        }
    });
    unsubscribes.push(unsubWins);

    // 5. SYNC STREAK
    const unsubStreak = subscribeToStreak(async (cloudStreak) => {
        if (!cloudStreak) return;
        console.log(`📥 Received Streak update from Cloud: ${cloudStreak.currentStreak} days`);
        try {
            const localStreak = await streaksRepo.getStreakData();
            if (localStreak) {
                await db.streakData.update('main-streak', {
                    currentStreak: cloudStreak.currentStreak,
                    longestStreak: cloudStreak.longestStreak,
                    lastActiveDate: cloudStreak.lastActiveDate
                });
            }
        } catch (err) {
            console.error("❌ Sync streak failed:", err);
        }
    });
    unsubscribes.push(unsubStreak);

    return () => unsubscribes.forEach(unsub => unsub());
}
