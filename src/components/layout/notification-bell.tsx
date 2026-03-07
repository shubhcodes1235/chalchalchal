"use client";

import React, { useEffect, useState } from "react";
import { Bell, Sparkles, MessageSquare, Heart, Trophy, Target, Zap } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Activity } from "@/lib/firebase/services/activity";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils/cn";

const TYPE_ICONS: Record<string, any> = {
    upload: Sparkles,
    win: Trophy,
    note: MessageSquare,
    hype: Zap,
    milestone: Heart,
    task: Target,
    reaction: Heart
};

export function NotificationBell() {
    const { currentPerson } = useAppStore();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [hasNew, setHasNew] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [lastSeen, setLastSeen] = useState<number>(0);

    useEffect(() => {
        const saved = localStorage.getItem('last_seen_activity');
        if (saved) setLastSeen(parseInt(saved));

        const q = query(
            collection(db, "activities"),
            orderBy("timestamp", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => doc.data() as Activity);
            setActivities(items);
            
            const otherPerson = currentPerson === 'shubham' ? 'khushi' : (currentPerson === 'khushi' ? 'shubham' : null);
            if (otherPerson) {
                const latestFromOther = items.find(a => a.person === otherPerson);
                if (latestFromOther && latestFromOther.timestamp) {
                    const ts = latestFromOther.timestamp.toMillis ? latestFromOther.timestamp.toMillis() : latestFromOther.timestamp;
                    if (ts > lastSeen) setHasNew(true);
                }
            }
        });

        return () => unsubscribe();
    }, [currentPerson, lastSeen]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasNew(false);
            const now = Date.now();
            setLastSeen(now);
            localStorage.setItem('last_seen_activity', now.toString());
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={toggleOpen}
                className="relative p-2 rounded-xl text-night-600 dark:text-muted-foreground hover:bg-night-50 dark:hover:bg-muted transition-all group"
            >
                <Bell className={cn("w-5 h-5 group-hover:scale-110 transition-transform", hasNew && "animate-wiggle text-pink-500")} />
                {hasNew && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-white dark:ring-night-950" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 z-40 bg-white dark:bg-card rounded-[2rem] overflow-hidden border border-night-100 dark:border-border shadow-2xl"
                        >
                            <div className="p-4 border-b border-night-50 dark:border-night-800 bg-night-50/50 dark:bg-night-900/50 backdrop-blur-sm">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-night-950 dark:text-foreground flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-pink-500" />
                                    Latest Activity
                                </h3>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                {activities.length === 0 ? (
                                    <div className="p-10 text-center space-y-2">
                                        <p className="text-2xl opacity-20">🔔</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-night-400">No activity yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-night-50 dark:divide-night-800">
                                        {activities.map((activity, i) => {
                                            const Icon = TYPE_ICONS[activity.type] || Sparkles;
                                            const isOther = activity.person !== currentPerson;
                                            
                                            return (
                                                <div 
                                                    key={activity.id}
                                                    className={cn(
                                                        "p-4 flex gap-3 transition-colors",
                                                        isOther ? "bg-white dark:bg-card hover:bg-pink-50/30 dark:hover:bg-pink-900/10" : "bg-night-50/20 dark:bg-night-900/20 opacity-60"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                                        isOther ? "bg-pink-50 dark:bg-pink-900/30 text-pink-500" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-black text-night-900 dark:text-foreground leading-tight">
                                                            {activity.title}
                                                        </p>
                                                        <p className="text-[11px] font-bold text-night-500 dark:text-muted-foreground leading-snug">
                                                            {activity.message}
                                                        </p>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-night-300 dark:text-night-600 mt-1">
                                                            {activity.timestamp ? formatDistanceToNow(activity.timestamp.toDate ? activity.timestamp.toDate() : activity.timestamp, { addSuffix: true }) : 'Just now'}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-night-50/50 dark:bg-night-900/50 text-center border-t border-night-50 dark:border-night-800">
                                <button className="text-[9px] font-black uppercase tracking-widest text-night-400 hover:text-pink-500 transition-colors">
                                    All caught up ✨
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
