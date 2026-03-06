// src/lib/firebase/services/notes.ts
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    getDoc,
} from "firebase/firestore";
import { db } from "../config";
import { v4 as uuidv4 } from "uuid";
import { logActivityToFirebase } from "./activity";

export interface StickyNote {
    id: string;
    person: 'shubham' | 'khushi';
    content: string;
    type: 'idea' | 'boost' | 'goal' | 'resource' | 'future-self' | 'thought' | 'reminder';
    color: string;
    isPinned: boolean;
    linkedUrl?: string;
    reactions?: {
        emoji: string;
        byPersona: string;
        at: unknown;
    }[];
    createdAt: unknown;
}

export async function addNoteToFirebase(noteData: Omit<StickyNote, 'id' | 'createdAt'>, customId?: string) {
    const id = customId || uuidv4();
    const noteRef = doc(db, "notes", id);
    const note: StickyNote = {
        ...noteData,
        id,
        createdAt: serverTimestamp(),
        reactions: [],
    };
    await setDoc(noteRef, note);
    return id;
}

export async function deleteNoteFromFirebase(id: string) {
    await deleteDoc(doc(db, "notes", id));
}

export async function togglePinInFirebase(id: string, isPinned: boolean) {
    const noteRef = doc(db, "notes", id);
    await updateDoc(noteRef, { isPinned });
}

export async function addNoteReactionToFirebase(noteId: string, emoji: string, byPersona: string) {
    try {
        const noteRef = doc(db, "notes", noteId);
        const noteSnap = await getDoc(noteRef);

        if (noteSnap.exists()) {
            const note = noteSnap.data() as StickyNote;
            const currentReactions = note.reactions || [];
            
            const existingReactionIndex = currentReactions.findIndex(r => r.byPersona === byPersona);
            let updatedReactions = [...currentReactions];
            
            let shouldLogActivity = false;

            if (existingReactionIndex > -1) {
                const existingReaction = currentReactions[existingReactionIndex];
                
                if (existingReaction.emoji === emoji) {
                    updatedReactions.splice(existingReactionIndex, 1);
                } else {
                    updatedReactions[existingReactionIndex] = {
                        emoji,
                        byPersona,
                        at: new Date()
                    };
                    shouldLogActivity = true;
                }
            } else {
                updatedReactions.push({
                    emoji,
                    byPersona,
                    at: new Date()
                });
                shouldLogActivity = true;
            }

            await updateDoc(noteRef, {
                reactions: updatedReactions,
            });

            // Activity Log for Notification
            if (shouldLogActivity && note.person !== byPersona) {
                await logActivityToFirebase({
                    person: byPersona as any,
                    type: 'reaction',
                    title: 'New Note Reaction!',
                    message: `${byPersona === 'shubham' ? 'Shubham' : 'Khushi'} reacted with ${emoji} to your note: "${note.content.substring(0, 20)}..." 📝`
                });
            }
        }
    } catch (error) {
        console.error("Failed to add note reaction:", error);
    }
}

export function subscribeToNotes(callback: (notes: StickyNote[]) => void) {
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const notes: StickyNote[] = [];
        snapshot.forEach((doc) => {
            notes.push(doc.data() as StickyNote);
        });
        callback(notes);
    });
}
