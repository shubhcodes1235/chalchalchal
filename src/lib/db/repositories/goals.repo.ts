// src/lib/db/repositories/goals.repo.ts
import { db } from "../database";
import { Goal } from "../schemas";
import { nanoid } from "nanoid";

export const goalsRepo = {
    async addGoal(goalData: Omit<Goal, 'id' | 'createdAt'>, id?: string) {
        const goal: Goal = {
            ...goalData,
            id: id || nanoid(),
            createdAt: new Date(),
        };
        return await db.goals.add(goal);
    },

    async getAllGoals() {
        const results = await db.goals.toArray();
        return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    async getGoalsByPerson(person: 'shared' | 'shubham' | 'khushi') {
        return await db.goals.where('person').equals(person).reverse().toArray();
    },

    async deleteGoal(id: string) {
        return await db.goals.delete(id);
    },

    async updateGoal(id: string, data: Partial<Goal>) {
        return await db.goals.update(id, data);
    },

    async toggleGoalCompletion(id: string) {
        const goal = await db.goals.get(id);
        if (goal) {
            return await db.goals.update(id, { 
                isCompleted: !goal.isCompleted,
                completedDate: !goal.isCompleted ? new Date() : undefined
            });
        }
    },

    async upsertGoal(goal: Goal) {
        return await db.goals.put(goal);
    }
};
