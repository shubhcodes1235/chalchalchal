
import {
    collection,
    doc,
    setDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    where,
    limit
} from "firebase/firestore";
import { db } from "../config";
import { v4 as uuidv4 } from "uuid";

// ============================================
// TYPES
// ============================================

export interface DailyWin {
    id: string;
    person: 'shubham' | 'khushi';
    content: string;
    date: string; // YYYY-MM-DD
    createdAt: any;
}

// ============================================
// ADD WIN
// ============================================

export async function addWinToFirebase(
    person: 'shubham' | 'khushi',
    content: string,
    date: string
): Promise<void> {
    const winId = uuidv4();
    const win: DailyWin = {
        id: winId,
        person,
        content,
        date,
        createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "wins", winId), win);
}

// ============================================
// SUBSCRIBE TO WINS
// ============================================

export function subscribeToTodayWin(
    date: string,
    person: 'shubham' | 'khushi',
    callback: (win: DailyWin | null) => void
) {
    const q = query(
        collection(db, "wins"),
        where("date", "==", date),
        where("person", "==", person),
        limit(1)
    );

    return onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data() as DailyWin;
            callback(data);
        } else {
            callback(null);
        }
    });
}

export function subscribeToAllWins(
    callback: (wins: DailyWin[]) => void
) {
    const q = query(
        collection(db, "wins"),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const wins: DailyWin[] = [];
        snapshot.forEach((doc) => {
            wins.push(doc.data() as DailyWin);
        });
        callback(wins);
    });
}
