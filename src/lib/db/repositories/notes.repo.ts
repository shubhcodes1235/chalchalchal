// src/lib/db/repositories/notes.repo.ts
import { db } from "../database";
import { StickyNote } from "../schemas";
import { nanoid } from "nanoid";

export const notesRepo = {
    async addNote(noteData: Omit<StickyNote, 'id' | 'createdAt'>, id?: string) {
        const note: StickyNote = {
            ...noteData,
            id: id || nanoid(),
            createdAt: new Date(),
        };
        return await db.stickyNotes.add(note);
    },

    async getAllNotes() {
        return await db.stickyNotes.orderBy('createdAt').reverse().toArray();
    },

    async getNotesByType(type: StickyNote['type']) {
        return await db.stickyNotes.where('type').equals(type).reverse().toArray();
    },

    async getNotesByPerson(person: 'shubham' | 'khushi') {
        return await db.stickyNotes.where('person').equals(person).reverse().toArray();
    },

    async deleteNote(id: string) {
        return await db.stickyNotes.delete(id);
    },

    async updateNote(id: string, data: Partial<StickyNote>) {
        return await db.stickyNotes.update(id, data);
    },

    async togglePin(id: string) {
        const note = await db.stickyNotes.get(id);
        if (note) {
            return await db.stickyNotes.update(id, { isPinned: !note.isPinned });
        }
    }
};
