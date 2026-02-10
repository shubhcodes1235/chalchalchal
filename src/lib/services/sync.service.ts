// src/lib/services/sync.service.ts
import { subscribeToDesigns, Design as FirebaseDesign } from "@/lib/firebase/services/designs";
import { subscribeToNotes, StickyNote as FirebaseNote } from "@/lib/firebase/services/notes";
import { subscribeToOtherActivities, logActivityToFirebase } from "@/lib/firebase/services/activity";
import { designsRepo } from "@/lib/db/repositories/designs.repo";
import { db } from "@/lib/db/database";
import { Design as LocalDesign, StickyNote as LocalNote } from "@/lib/db/schemas";
import { toast } from "react-hot-toast";

export function startCloudSync(currentPerson: string) {
    console.log("☁️ Cloud Sync Initialized for", currentPerson);
    // Visual feedback for debugging
    toast("Sync engine online 🚀", { icon: '☁️', duration: 2000 });
    const unsubscribes: (() => void)[] = [];

    // 1. SYNC DESIGNS
    const unsubDesigns = subscribeToDesigns(async (firebaseDesigns) => {
        console.log(`📥 Received ${firebaseDesigns.length} designs from Cloud`);
        for (const fbDesign of firebaseDesigns) {
            try {
                let designDate = new Date();
                if (fbDesign.createdAt) {
                    designDate = fbDesign.createdAt.toDate ? fbDesign.createdAt.toDate() : new Date(fbDesign.createdAt);
                }
                const local = await designsRepo.getDesignById(fbDesign.id);
                const designToSync: LocalDesign = {
                    id: fbDesign.id,
                    person: (fbDesign.uploadedByPersona as any) === 'both' ? 'shubham' : fbDesign.uploadedByPersona as any,
                    title: fbDesign.title,
                    description: fbDesign.description,
                    imageUrl: fbDesign.imageUrl,
                    thumbnailUrl: fbDesign.thumbnailUrl,
                    tool: (fbDesign.tool?.toLowerCase() as any) || 'other',
                    toolDetail: fbDesign.toolDetail,
                    tags: fbDesign.tags || [],
                    moodRating: (fbDesign.moodRating as any) || 3,
                    workType: 'practice',
                    isHallOfFame: fbDesign.isHallOfFame || false,
                    isFirstDesign: false,
                    hypeCount: 0,
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
                const noteToSync: LocalNote = {
                    ...fbNote,
                    createdAt: fbNote.createdAt?.toDate ? fbNote.createdAt.toDate() : new Date(fbNote.createdAt),
                };
                await db.stickyNotes.put(noteToSync);
            } catch (err) {
                console.error("❌ Sync note failed:", fbNote.id, err);
            }
        }
    });
    unsubscribes.push(unsubNotes);

    // 3. LIVE NOTIFICATIONS (Toasts)
    const unsubActivity = subscribeToOtherActivities(currentPerson, (activity) => {
        const emoji = activity.person === 'shubham' ? '👦' : '👧';
        const icon = activity.type === 'note' ? '📝' : activity.type === 'upload' ? '🎨' : '✨';

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
    });
    unsubscribes.push(unsubActivity);

    return () => unsubscribes.forEach(unsub => unsub());
}
