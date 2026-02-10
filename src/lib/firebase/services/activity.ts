// src/lib/firebase/services/activity.ts
import {
    collection,
    doc,
    setDoc,
    onSnapshot,
    query,
    orderBy,
    limit,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { db } from "../config";
import { v4 as uuidv4 } from "uuid";

export interface Activity {
    id: string;
    person: 'shubham' | 'khushi';
    type: 'upload' | 'win' | 'note' | 'hype' | 'milestone';
    title: string;
    message: string;
    timestamp: any;
}

export async function logActivityToFirebase(activityData: Omit<Activity, 'id' | 'timestamp'>) {
    const id = uuidv4();
    const activityRef = doc(db, "activities", id);
    const activity: Activity = {
        ...activityData,
        id,
        timestamp: serverTimestamp(),
    };
    await setDoc(activityRef, activity);
}

export function subscribeToOtherActivities(
    currentPerson: string,
    callback: (activity: Activity) => void
) {
    // Only listen for activities from the other person
    const otherPerson = currentPerson === 'shubham' ? 'khushi' : 'shubham';

    // We only want new activities, but onSnapshot returns the initial state.
    // We'll use a timestamp to filter, or just track the first run.
    let isInitial = true;
    const now = new Date();

    const q = query(
        collection(db, "activities"),
        orderBy("timestamp", "desc"),
        limit(1)
    );

    return onSnapshot(q, (snapshot) => {
        if (isInitial) {
            isInitial = false;
            return;
        }

        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const activity = change.doc.data() as Activity;
                // Filter in-memory to avoid composite index requirement
                if (activity.person === otherPerson) {
                    callback(activity);
                }
            }
        });
    });
}
