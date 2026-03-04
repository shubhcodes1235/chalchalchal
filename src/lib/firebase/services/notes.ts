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
} from "firebase/firestore";
import { db } from "../config";
import { v4 as uuidv4 } from "uuid";

export interface StickyNote {
    id: string;
    person: 'shubham' | 'khushi';
    content: string;
    type: 'idea' | 'boost' | 'goal' | 'resource' | 'future-self' | 'thought' | 'reminder';
    color: string;
    isPinned: boolean;
    linkedUrl?: string;
    createdAt: unknown;
}

export async function addNoteToFirebase(noteData: Omit<StickyNote, 'id' | 'createdAt'>, customId?: string) {
    const id = customId || uuidv4();
    const noteRef = doc(db, "notes", id);
    const note: StickyNote = {
        ...noteData,
        id,
        createdAt: serverTimestamp(),
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
