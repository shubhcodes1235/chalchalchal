// src/components/home/visualization-garden.tsx
"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { subscribeToStreak, checkDailyStreak, StreakData } from "@/lib/firebase/services/streak"

export function VisualizationGarden() {
    const [streak, setStreak] = useState<StreakData | null>(null);

    useEffect(() => {
        checkDailyStreak();
        const unsubscribe = subscribeToStreak((data) => {
            setStreak(data);
        });
        return () => unsubscribe();
    }, []);

    if (streak === null) {
        return (
            <Card className="border-none bg-white dark:bg-card shadow-soft rounded-[2.5rem] overflow-hidden animate-pulse min-h-[380px] flex items-center justify-center">
                <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6 w-full">
                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-night-50 dark:bg-night-900 border-8 border-white dark:border-card" />
                    <div className="space-y-3 w-full max-w-[200px]">
                        <div className="h-6 bg-night-50 dark:bg-night-900 rounded-full w-full" />
                        <div className="h-4 bg-night-50 dark:bg-night-900 rounded-full w-3/4 mx-auto" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const count = streak?.currentStreak || 0;
    
    // Thresholds and next level logic
    const STAGE_CONFIGS = [
        { min: 0, max: 0, icon: "🌱", msg: "A new beginning. Time to plant the seeds of our dream.", class: "from-emerald-300 to-green-500", target: 1, nextIcon: "🪴" },
        { min: 1, max: 3, icon: "🪴", msg: "It's taking root! Keep watering it with daily wins.", class: "from-green-400 to-emerald-600", target: 4, nextIcon: "🌳" },
        { min: 4, max: 7, icon: "🌳", msg: "Our consistency is building a strong foundation.", class: "from-emerald-500 to-teal-700", target: 8, nextIcon: "🏡" },
        { min: 8, max: 14, icon: "🏡", msg: "The dream is taking shape! A real structure is forming.", class: "from-blue-400 to-indigo-600", target: 15, nextIcon: "🏰" },
        { min: 15, max: 30, icon: "🏰", msg: "Massive momentum! We are building an empire.", class: "from-purple-500 to-pink-600", target: 31, nextIcon: "🏙️" },
        { min: 31, max: 9999, icon: "🏙️", msg: "Unstoppable! We are designing our entire world.", class: "from-pink-500 to-rose-600", target: 100, nextIcon: "🚀" }
    ];

    const currentConfig = STAGE_CONFIGS.find(s => count >= s.min && count <= s.max) || STAGE_CONFIGS[0];
    const daysLeft = currentConfig.target - count;
    const progress = Math.min(((count - currentConfig.min) / (currentConfig.target - currentConfig.min)) * 100, 100);

    return (
        <Card className="border-none bg-white dark:bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:shadow-glow transition-all duration-500">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative inline-block mb-2">
                    <p className="text-sm font-handwritten text-pink-600 dark:text-pink-400 font-bold opacity-80">The Visualization Garden</p>
                </div>
                
                <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                    {/* Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="46%"
                            className="stroke-night-50 dark:stroke-night-900 fill-none"
                            strokeWidth="4"
                        />
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="46%"
                            className="stroke-pink-500 fill-none"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: progress / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>

                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={count} // Re-animate on streak change
                        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                        className={`w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br ${currentConfig.class} flex items-center justify-center text-5xl md:text-6xl shadow-xl shadow-pink-500/20 border-6 border-white dark:border-card group-hover:scale-105 transition-transform duration-500 relative`}
                    >
                        {/* Inner Glow Ring */}
                        <div className="absolute inset-4 rounded-full bg-white/20 backdrop-blur-[2px] border border-white/30" />
                        
                        <motion.div
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="relative z-10 drop-shadow-2xl filter brightness-110"
                        >
                            {currentConfig.icon}
                        </motion.div>
                        
                        {/* Streak Badge Overlay */}
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-night-950 dark:bg-white text-white dark:text-night-950 flex items-center justify-center text-lg font-black shadow-lg border-2 border-white dark:border-card transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            🔥
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-3 max-w-[250px] mx-auto pt-2">
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2">
                             <span className="text-3xl font-black text-pink-500">{count}</span>
                             <span className="text-xs font-bold text-night-600 dark:text-night-300 uppercase tracking-widest">Day Streak</span>
                        </div>
                        {daysLeft > 0 && (
                            <div className="flex items-center gap-1.5 mt-1 bg-pink-500/5 px-3 py-1 rounded-full border border-pink-500/10">
                                <span className="text-[10px] font-black uppercase text-pink-500/80 tracking-tighter">
                                    {daysLeft} days until {currentConfig.nextIcon}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-medium text-night-500 dark:text-night-400 leading-relaxed italic">
                        "{currentConfig.msg}"
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
