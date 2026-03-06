// src/lib/firebase/services/goals.ts
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

export interface GoalData {
  id: string;
  title: string;
  description?: string;
  deadline?: unknown;
  isCompleted: boolean;
  completedDate?: unknown;
  person: 'shared' | 'shubham' | 'khushi';
  priority: 'low' | 'medium' | 'high';
  createdAt: unknown;
}

export async function addGoalToFirebase(goalData: Omit<GoalData, 'id' | 'createdAt'>, customId?: string) {
    const id = customId || uuidv4();
    const goalRef = doc(db, "goals", id);
    const goal: GoalData = {
        ...goalData,
        id,
        createdAt: serverTimestamp(),
    };
    await setDoc(goalRef, goal);
    return id;
}

export async function deleteGoalFromFirebase(id: string) {
    await deleteDoc(doc(db, "goals", id));
}

export async function toggleGoalCompletionInFirebase(id: string, isCompleted: boolean) {
    const goalRef = doc(db, "goals", id);
    await updateDoc(goalRef, { 
        isCompleted,
        completedDate: isCompleted ? serverTimestamp() : null
    });
}

export async function updateGoalInFirebase(id: string, data: Partial<GoalData>) {
    const goalRef = doc(db, "goals", id);
    await updateDoc(goalRef, data);
}

export function subscribeToGoals(callback: (goals: GoalData[]) => void) {
    const q = query(collection(db, "goals"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
        const goals: GoalData[] = [];
        snapshot.forEach((doc) => {
            goals.push(doc.data() as GoalData);
        });
        callback(goals);
    });
}
