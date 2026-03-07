
import {
    collection,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    updateDoc,
    query,
    orderBy,
    onSnapshot,
    where,
} from "firebase/firestore";
import { db } from "../config";
import { v4 as uuidv4 } from "uuid";
import { logActivityToFirebase } from "./activity";

// ============================================
// TYPES
// ============================================

export interface Design {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    thumbnailUrl: string; // We might just use the same URL if we don't have a separate thumbnail service
    storagePath: string;
    tool: string;
    toolDetail?: string;
    moodRating: number;
    tags: string[];
    isHallOfFame: boolean;
    uploadedByPersona: 'shubham' | 'khushi' | 'both';
    createdAt: any;
    reactions: Reaction[];
    hypeCount?: number;
}

export interface Reaction {
    emoji: string;
    byPersona: string;
    at: any;
}

// ============================================
// UPLOAD IMAGE TO STORAGE
// ============================================

async function uploadToImgBB(file: File): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("ImgBB upload failed");
    }

    const result = await response.json();
    return result.data.url;
}

// ============================================
// CREATE DESIGN (FIRESTORE + IMGBB)
// ============================================

export async function createDesignInFirebase(
    file: File,
    data: {
        title: string;
        description: string;
        tool: string;
        toolDetail?: string;
        moodRating: number;
        tags: string[];
        uploadedByPersona: 'shubham' | 'khushi' | 'both';
        workType?: 'practice' | 'client';
        isFirstDesign?: boolean;
        id?: string;
    }
): Promise<Design> {
    const designId = data.id || uuidv4();

    // 1. Upload Image to ImgBB
    const imageUrl = await uploadToImgBB(file);

    // 2. Create Document in Firestore
    const design: Design = {
        id: designId,
        title: data.title,
        description: data.description,
        imageUrl,
        thumbnailUrl: imageUrl,
        storagePath: "imgbb", // Marker that we are using ImgBB
        tool: data.tool,
        toolDetail: data.toolDetail,
        moodRating: data.moodRating,
        tags: data.tags,
        isHallOfFame: false,
        uploadedByPersona: data.uploadedByPersona,
        reactions: [],
        createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "designs", designId), design);

    return design;
}

// ============================================
// ADD REACTION
// ============================================

export async function addReactionToFirebase(
    designId: string,
    emoji: string,
    byPersona: string
): Promise<void> {
    try {
        const designRef = doc(db, "designs", designId);
        const designSnap = await getDoc(designRef);

        if (designSnap.exists()) {
            const design = designSnap.data() as Design;
            const currentReactions = design.reactions || [];
            
            // Check if user already reacted
            const existingReactionIndex = currentReactions.findIndex(r => r.byPersona === byPersona);
            let updatedReactions = [...currentReactions];
            
            let shouldLogActivity = false;

            if (existingReactionIndex > -1) {
                const existingReaction = currentReactions[existingReactionIndex];
                
                if (existingReaction.emoji === emoji) {
                    // SAME EMOJI: Remove reaction (toggle off)
                    updatedReactions.splice(existingReactionIndex, 1);
                } else {
                    // DIFFERENT EMOJI: Replace old reaction
                    updatedReactions[existingReactionIndex] = {
                        emoji,
                        byPersona,
                        at: new Date()
                    };
                    shouldLogActivity = true;
                }
            } else {
                // NO PREVIOUS REACTION: Add new one
                updatedReactions.push({
                    emoji,
                    byPersona,
                    at: new Date()
                });
                shouldLogActivity = true;
            }

            await updateDoc(designRef, {
                reactions: updatedReactions,
            });

            // Activity Log for Notification
            const otherPersona = design.uploadedByPersona;
            if (shouldLogActivity && otherPersona && otherPersona !== byPersona) {
                await logActivityToFirebase({
                    person: byPersona as any,
                    type: 'reaction',
                    title: 'New Reaction!',
                    message: `${byPersona === 'shubham' ? 'Shubham' : 'Khushi'} reacted with ${emoji} to your design: "${design.title}" ✨`
                });
            }
        }
    } catch (error) {
        console.error("Failed to add reaction:", error);
        throw error; // Re-throw to let UI handle it, or handle silently
    }
}

// ============================================
// SUBSCRIBE TO DESIGNS
// ============================================

export function subscribeToDesigns(
    callback: (designs: Design[]) => void,
    filterPersona?: 'shubham' | 'khushi'
) {
    let q;

    if (filterPersona) {
        q = query(
            collection(db, "designs"),
            where("uploadedByPersona", "==", filterPersona),
            orderBy("createdAt", "desc")
        );
    } else {
        q = query(
            collection(db, "designs"),
            orderBy("createdAt", "desc")
        );
    }

    return onSnapshot(q, (snapshot) => {
        const designs: Design[] = [];
        snapshot.forEach((doc) => {
            designs.push(doc.data() as Design);
        });
        callback(designs);
    });
}
export async function updateDesignHype(id: string, newHypeCount: number) {
    const designRef = doc(db, "designs", id);
    await updateDoc(designRef, { hypeCount: newHypeCount });
}

export async function deleteDesignFromFirebase(id: string) {
    const { deleteDoc } = await import("firebase/firestore"); // Dynamic import for safety/consistency if needed
    const designRef = doc(db, "designs", id);
    await deleteDoc(designRef);
}
