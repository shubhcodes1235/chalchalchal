// src/components/home/dream-progress-bar.tsx
"use client"

import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useCelebration } from "@/providers/celebration-provider";
import { toast } from "react-hot-toast";

export function DreamProgressBar() {
    const milestones = useLiveQuery(() => db.milestones.orderBy('stage').toArray());
    const { triggerCelebration } = useCelebration();
    const [prevCompleted, setPrevCompleted] = React.useState<number | null>(null);

    React.useEffect(() => {
        if (!milestones) return;
        const completedCount = milestones.filter(m => m.isCompleted).length;
        
        if (prevCompleted !== null && completedCount > prevCompleted) {
            triggerCelebration('milestone');
            const newMilestone = milestones.find((m, i) => m.isCompleted && i === completedCount - 1);
            if (newMilestone) {
                toast.success(`New Milestone Unlocked: ${newMilestone.title}! 🏆`, {
                    icon: newMilestone.emoji,
                    duration: 5000
                });
            }
        }
        setPrevCompleted(completedCount);
    }, [milestones, triggerCelebration, prevCompleted]);

    if (!milestones) return null;

    const handleStageClick = (m: any) => {
        if (m.isCompleted) {
            triggerCelebration('milestone');
            toast.success(`Stage ${m.stage} Completed! ${m.title}`);
        } else {
            toast(`Keep going! Reach stage ${m.stage} to unlock "${m.title}"`, { icon: '⚒️' });
        }
    };

    // Calculate progress percentage
    const total = milestones.length;
    const completed = milestones.filter(m => m.isCompleted).length;
    const progress = total > 1 ? ((completed - 1) / (total - 1)) * 100 : 0;

    return (
        <div className="w-full py-6 pb-14 space-y-6">
            <div className="relative">
                {/* Track Line Background */}
                <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 bg-night-100 dark:bg-night-900 rounded-full z-0" />

                {/* Active Progress Line */}
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full z-0 shadow-sm shadow-pink-500/20" 
                />

                {/* Steps Container */}
                <div className="relative z-10 flex justify-between w-full">
                    {milestones.map((m, i) => (
                        <div key={m.id} className="flex flex-col items-center group cursor-pointer" onClick={() => handleStageClick(m)}>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-500 border-4 bg-white dark:bg-night-950 shadow-sm z-10",
                                    m.isCompleted
                                        ? "border-pink-500 text-pink-500"
                                        : "border-night-100 dark:border-night-900 text-night-200 dark:text-night-800 grayscale opacity-80"
                                )}
                            >
                                {m.emoji}
                            </motion.div>

                            {/* Label - Absolute to not affect flex spacing, but centered */}
                            <div className="absolute -bottom-10 w-24 text-center">
                                <span className={cn(
                                    "text-[10px] sm:text-xs uppercase tracking-widest font-black transition-all block truncate px-0.5",
                                    m.isCompleted 
                                        ? "text-pink-500/80 dark:text-pink-400/80 opacity-100" 
                                        : "text-night-400 dark:text-night-600 opacity-40 sm:opacity-0 sm:group-hover:opacity-100"
                                )}>
                                    {m.title}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="text-center opacity-40">
                <span className="text-sm uppercase tracking-widest font-black text-night-600">
                    Step by step. Every mark counts.
                </span>
            </div>
        </div>
    );
}
