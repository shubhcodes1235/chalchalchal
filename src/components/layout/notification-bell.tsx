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
    const [allActivities, setAllActivities] = useState<Activity[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [lastSeen, setLastSeen] = useState<number>(0);

    const localStorageKey = `last_seen_activity_${currentPerson}`;

    useEffect(() => {
        const saved = localStorage.getItem(localStorageKey);
        // If first time, consider last 24h as previously seen to avoid flooding
        const defaultTS = Date.now() - (24 * 60 * 60 * 1000);
        const currentTS = saved ? parseInt(saved) : defaultTS;
        setLastSeen(currentTS);

        const partnerPerson = currentPerson === 'shubham' ? 'khushi' : (currentPerson === 'khushi' ? 'shubham' : null);
        
        // Subscriber for realtime and context
        const qContext = query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(50));
        
        const unsubscribe = onSnapshot(qContext, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Activity));
            setAllActivities(items);
            
            if (partnerPerson) {
                const unread = items.filter(a => {
                    if (a.person !== partnerPerson) return false;
                    const ts = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp instanceof Date ? a.timestamp.getTime() : 0);
                    return ts > currentTS;
                });
                setUnreadCount(unread.length);
            }
        });

        return () => unsubscribe();
    }, [currentPerson, localStorageKey]); // Re-run when person changes

    const toggleOpen = () => {
        const wasOpen = isOpen;
        setIsOpen(!wasOpen);
        if (!wasOpen) {
            // Marking as read when opening
            setUnreadCount(0);
            const now = Date.now();
            setLastSeen(now);
            localStorage.setItem(localStorageKey, now.toString());
        }
    };

    const partnerPerson = currentPerson === 'shubham' ? 'khushi' : (currentPerson === 'khushi' ? 'shubham' : null);
    
    // Split activities into New and Earlier
    const newItems = allActivities.filter(a => {
        if (!partnerPerson || a.person !== partnerPerson) return false;
        const ts = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp instanceof Date ? a.timestamp.getTime() : 0);
        return ts > lastSeen;
    });

    const earlierItems = allActivities.filter(a => {
        const ts = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp instanceof Date ? a.timestamp.getTime() : 0);
        return ts <= lastSeen || a.person === currentPerson;
    });

    return (
        <div className="relative">
            <button 
                onClick={toggleOpen}
                className="relative p-2 rounded-xl text-night-600 dark:text-muted-foreground hover:bg-night-50 dark:hover:bg-muted transition-all group"
            >
                <Bell className={cn("w-5 h-5 group-hover:scale-110 transition-transform", unreadCount > 0 && "animate-wiggle text-pink-500")} />
                {unreadCount > 0 && (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-pink-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-night-950 shadow-sm"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
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
                            <div className="p-4 border-b border-night-50 dark:border-night-800 bg-night-50/50 dark:bg-night-900/50 backdrop-blur-sm flex justify-between items-center">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-night-950 dark:text-foreground flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-pink-500" />
                                    Recap & Updates
                                </h3>
                            </div>
                            
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                                {allActivities.length === 0 ? (
                                    <div className="p-10 text-center space-y-2">
                                        <p className="text-2xl opacity-20">🔔</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-night-400">No activity yet</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        {/* New Items Section */}
                                        {newItems.length > 0 && (
                                            <div className="bg-pink-500/5 dark:bg-pink-500/10">
                                                <div className="px-4 py-2 border-b border-pink-100 dark:border-pink-900/30">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgb(236,72,153,0.5)]" />
                                                        New Updates
                                                    </span>
                                                </div>
                                                {newItems.map((activity) => (
                                                    <ActivityItem key={activity.id} activity={activity} isNew />
                                                ))}
                                            </div>
                                        )}

                                        {/* Earlier Items Section */}
                                        {earlierItems.length > 0 && (
                                            <div className="divide-y divide-night-50 dark:divide-night-800">
                                                {newItems.length > 0 && (
                                                    <div className="px-4 py-2 bg-night-50 dark:bg-night-900/50 border-b border-night-100 dark:border-night-800">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-night-400">Earlier</span>
                                                    </div>
                                                )}
                                                {earlierItems.map((activity) => (
                                                    <ActivityItem key={activity.id} activity={activity} isNew={false} />
                                                ))}
                                            </div>
                                        )}
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

function ActivityItem({ activity, isNew }: { activity: Activity, isNew: boolean }) {
    const { currentPerson } = useAppStore();
    const Icon = TYPE_ICONS[activity.type] || Sparkles;
    const isOther = activity.person !== currentPerson;

    return (
        <div 
            className={cn(
                "p-4 flex gap-3 transition-colors",
                isNew ? "bg-white dark:bg-card border-l-4 border-pink-500" : (isOther ? "bg-white dark:bg-card hover:bg-pink-50/30 dark:hover:bg-pink-900/10" : "bg-night-50/20 dark:bg-night-900/20 opacity-60")
            )}
        >
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                isOther ? "bg-pink-50 dark:bg-pink-900/30 text-pink-500" : "bg-muted text-muted-foreground"
            )}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs font-black text-night-900 dark:text-foreground leading-tight truncate">
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
}

