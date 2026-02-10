// src/lib/db/repositories/designs.repo.ts
import { db } from "../database";
import { Design } from "../schemas";
import { nanoid } from "nanoid";

export const designsRepo = {
    async addDesign(designData: Omit<Design, 'id' | 'createdAt' | 'updatedAt' | 'hypeCount' | 'isHallOfFame'>) {
        const id = nanoid();
        const now = new Date();
        const design: Design = {
            ...designData,
            id,
            hypeCount: 0,
            isHallOfFame: false,
            createdAt: now,
            updatedAt: now,
        };
        return await db.designs.add(design);
    },

    async getAllDesigns() {
        return await db.designs.orderBy('createdAt').reverse().toArray();
    },

    async upsertDesign(design: Design) {
        return await db.designs.put(design);
    },

    async getDesignsByPerson(person: 'shubham' | 'khushi') {
        return await db.designs.where('person').equals(person).reverse().toArray();
    },

    async getDesignsByTool(tool: string) {
        return await db.designs.where('tool').equals(tool).reverse().toArray();
    },

    async getDesignById(id: string) {
        return await db.designs.get(id);
    },

    async getFirstDesign(person: 'shubham' | 'khushi') {
        return await db.designs
            .where('person')
            .equals(person)
            .filter(d => d.isFirstDesign)
            .first();
    },

    async getDesignCount() {
        return await db.designs.count();
    },

    async getDesignsByMonth(month: string) {
        return await db.designs
            .filter(d => d.createdAt.toISOString().startsWith(month))
            .toArray();
    },

    async updateDesign(id: string, data: Partial<Design>) {
        return await db.designs.update(id, { ...data, updatedAt: new Date() });
    },

    async deleteDesign(id: string) {
        const design = await this.getDesignById(id);
        if (design?.isFirstDesign) {
            throw new Error("Cannot delete your first design! It's part of your history.");
        }
        return await db.designs.delete(id);
    },

    async getHallOfFame() {
        return await db.designs.where('isHallOfFame').equals(1).toArray(); // Dexie uses 1/0 for boolean indices sometimes
    },

    async setHallOfFame(id: string, month: string) {
        return await db.designs.update(id, { isHallOfFame: true, hallOfFameMonth: month });
    },

    async incrementHype(id: string) {
        const design = await db.designs.get(id);
        if (design) {
            return await db.designs.update(id, { hypeCount: (design.hypeCount || 0) + 1 });
        }
    }
};
