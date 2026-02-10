// src/lib/services/sync.service.ts
import { subscribeToDesigns, Design as FirebaseDesign } from "@/lib/firebase/services/designs";
import { designsRepo } from "@/lib/db/repositories/designs.repo";
import { Design as LocalDesign } from "@/lib/db/schemas";

export function startCloudSync() {
    console.log("☁️ Cloud Sync Started");

    // Subscribe to all designs (Shubham + Khushi)
    const unsubscribe = subscribeToDesigns(async (firebaseDesigns) => {
        for (const fbDesign of firebaseDesigns) {
            // Check if we already have this in local DB with full blob
            const local = await designsRepo.getDesignById(fbDesign.id);

            // If it exists locally and has a blob, we don't necessarily need to overwrite 
            // unless metadata changed (hype, etc). For now, simple upsert.

            const designToSync: LocalDesign = {
                id: fbDesign.id,
                person: fbDesign.uploadedByPersona as 'shubham' | 'khushi',
                title: fbDesign.title,
                description: fbDesign.description,
                imageUrl: fbDesign.imageUrl,
                thumbnailUrl: fbDesign.thumbnailUrl,
                tool: fbDesign.tool as any,
                toolDetail: fbDesign.toolDetail,
                tags: fbDesign.tags || [],
                moodRating: (fbDesign.moodRating as any) || 3,
                workType: 'practice', // Default or from FB if added
                isHallOfFame: fbDesign.isHallOfFame || false,
                isFirstDesign: false, // Metadata could be added to FB later
                hypeCount: 0, // Reactions count could be mapped here
                createdAt: fbDesign.createdAt?.toDate ? fbDesign.createdAt.toDate() : new Date(fbDesign.createdAt),
                updatedAt: new Date(),
                // Keep local bulbs if they exist
                imageBlob: local?.imageBlob,
                thumbnailBlob: local?.thumbnailBlob,
            };

            await designsRepo.upsertDesign(designToSync);
        }
    });

    return unsubscribe;
}
