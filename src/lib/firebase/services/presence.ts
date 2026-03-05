import {
    doc,
    onSnapshot,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../config";

// ============================================
// REAL-TIME PARTNER STATUS & SYNC
// ============================================

export interface PresenceData {
    isOnline: boolean;
    lastSeen: Date | null;
    sessionMood: string | null;
    confettiTrigger: any;
}

export function subscribeToPartnerPresence(
    partnerUid: string,
    callback: (data: PresenceData) => void
) {
    return onSnapshot(doc(db, "partners", partnerUid), (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            const lastSeen = data.lastSeen?.toDate?.() || null;
            
            let isOnline = data.isOnline;
            if (lastSeen) {
                const now = new Date();
                const diff = (now.getTime() - lastSeen.getTime()) / 60000;
                // If last seen more than 2 minutes ago, consider offline
                if (diff > 2) isOnline = false;
            }
            
            callback({
                isOnline,
                lastSeen,
                sessionMood: data.sessionMood || null,
                confettiTrigger: data.confettiTrigger || null
            });
        } else {
            callback({ isOnline: false, lastSeen: null, sessionMood: null, confettiTrigger: null });
        }
    });
}

// Keep backward compatibility
export function subscribeToPartnerStatus(
    partnerUid: string,
    callback: (isOnline: boolean, lastSeen: Date | null) => void
) {
    return subscribeToPartnerPresence(partnerUid, (data) => callback(data.isOnline, data.lastSeen));
}

// ============================================
// HEARTBEAT & TRIGGERS
// ============================================

export function startHeartbeat(persona: string) {
    const updatePresence = async () => {
        try {
            await setDoc(
                doc(db, "partners", persona),
                {
                    isOnline: true,
                    lastSeen: serverTimestamp(),
                },
                { merge: true }
            );
        } catch (e) {
            console.warn("Heartbeat failed:", e);
        }
    };

    const interval = setInterval(updatePresence, 60000);
    updatePresence(); // Initial

    if (typeof window !== "undefined") {
        window.addEventListener("beforeunload", () => {
            navigator.sendBeacon && navigator.sendBeacon('');
        });
    }

    return () => clearInterval(interval);
}

export function triggerPartnerConfetti(targetPersona: string) {
    return setDoc(
        doc(db, "partners", targetPersona),
        {
            confettiTrigger: serverTimestamp(),
        },
        { merge: true }
    ).catch(console.error);
}

export function updatePresenceMood(persona: string, mood: string | null) {
    return setDoc(
        doc(db, "partners", persona),
        {
            sessionMood: mood,
            lastSeen: serverTimestamp(),
        },
        { merge: true }
    ).catch(console.error);
}
