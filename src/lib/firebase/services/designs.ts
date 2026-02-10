
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../config";
import { v4 as uuidv4 } from "uuid";

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
}

export interface Reaction {
    emoji: string;
    byPersona: string;
    at: any;
}

// ============================================
// UPLOAD IMAGE TO STORAGE
// ============================================

async function uploadDesignImage(
    file: File,
    persona: string,
    designId: string
): Promise<{ imageUrl: string; storagePath: string }> {
    const fileExtension = file.name.split(".").pop();
    const storagePath = `designs/${persona}/${designId}.${fileExtension}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
            uploadedBy: persona,
            designId: designId,
        },
    });

    const imageUrl = await getDownloadURL(snapshot.ref);
    return { imageUrl, storagePath };
}

// ============================================
// CREATE DESIGN (FIRESTORE + STORAGE)
// ============================================

export async function createDesignInFirebase(
    file: File,
    data: {
        title: string;
        description: string;
        tool: string;
        toolDetail?: string; // e.g. "After Effects"
        moodRating: number;
        tags: string[];
        uploadedByPersona: 'shubham' | 'khushi' | 'both';
        workType?: 'practice' | 'client';
        isFirstDesign?: boolean;
    }
): Promise<Design> {
    const designId = uuidv4();

    // 1. Upload Image
    const { imageUrl, storagePath } = await uploadDesignImage(file, data.uploadedByPersona, designId);

    // 2. Create Document
    const design: Design = {
        id: designId,
        title: data.title,
        description: data.description,
        imageUrl,
        thumbnailUrl: imageUrl, // Using same for now
        storagePath,
        tool: data.tool,
        toolDetail: data.toolDetail,
        moodRating: data.moodRating,
        tags: data.tags,
        isHallOfFame: false,
        uploadedByPersona: data.uploadedByPersona,
        reactions: [], // Init empty
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
            const newReaction: Reaction = {
                emoji,
                byPersona,
                at: new Date(), // Using client date for optmistic UI, or serverTimestamp if strict
            };

            await updateDoc(designRef, {
                reactions: [...(design.reactions || []), newReaction],
            });
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
