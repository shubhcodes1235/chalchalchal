// src/components/home/dream-progress-bar.tsx
"use client"

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useCelebration } from "@/providers/celebration-provider";
import { toast } from "react-hot-toast";

export function DreamProgressBar() {
    const milestones = useLiveQuery(() => db.milestones.orderBy('stage').toArray());
    const { triggerCelebration } = useCelebration();

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
        <div className="w-full py-6 space-y-6">
            <div className="relative">
                {/* Track Line Background */}
                <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-night-50 rounded-full z-0" />

                {/* Active Progress Line */}
                <div className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-pink-300 rounded-full z-0 transition-all duration-1000" style={{ width: `${progress}%` }} />

                {/* Steps Container */}
                <div className="relative z-10 flex justify-between w-full">
                    {milestones.map((m, i) => (
                        <div key={m.id} className="flex flex-col items-center group cursor-pointer" onClick={() => handleStageClick(m)}>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-500 border-4 bg-white shadow-sm z-10",
                                    m.isCompleted
                                        ? "border-pink-300 text-pink-500"
                                        : "border-night-50 text-night-200 grayscale opacity-80"
                                )}
                            >
                                {m.emoji}
                            </motion.div>

                            {/* Label - Absolute to not affect flex spacing, but centered */}
                            <div className="absolute -bottom-8 w-24 text-center">
                                <span className={cn(
                                    "text-sm uppercase tracking-widest font-black transition-all block truncate px-1",
                                    m.isCompleted ? "text-pink-400 opacity-100" : "text-night-500 opacity-0 group-hover:opacity-100"
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
