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

    const count = streak?.currentStreak || 0;
    
    // Determine the visualization state based on streak
    let visualAsset = "🌱";
    let message = "A new beginning. Time to plant the seeds of our dream.";
    let stageClass = "from-green-400 to-emerald-600";
    
    if (count === 0) {
        visualAsset = "🌱"; // Seed/Sprout
        message = "A new beginning. Log your first 'Win of the Day' below to plant the seeds of our shared dream!";
        stageClass = "from-emerald-300 to-green-500";
    } else if (count >= 1 && count <= 3) {
        visualAsset = "🪴"; // Growing plant
        message = "It's taking root! Keep watering it with daily wins.";
        stageClass = "from-green-400 to-emerald-600";
    } else if (count >= 4 && count <= 7) {
        visualAsset = "🌳"; // Small tree
        message = "Our consistency is building a strong foundation.";
        stageClass = "from-emerald-500 to-teal-700";
    } else if (count >= 8 && count <= 14) {
        visualAsset = "🏡"; // Small house
        message = "The dream is taking shape! A real structure is forming.";
        stageClass = "from-blue-400 to-indigo-600";
    } else if (count >= 15 && count <= 30) {
        visualAsset = "🏰"; // Castle/Mansion
        message = "Massive momentum! We are building an empire.";
        stageClass = "from-purple-500 to-pink-600";
    } else if (count > 30) {
        visualAsset = "🏙️"; // City Skyline
        message = "Unstoppable! We are designing our entire world.";
        stageClass = "from-pink-500 to-rose-600";
    }

    return (
        <Card className="border-none bg-white dark:bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:shadow-glow transition-all duration-500">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative inline-block mb-2">
                    <p className="text-sm font-handwritten text-pink-600 dark:text-pink-400 font-bold opacity-80">The Visualization Garden</p>
                </div>
                
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className={`w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br ${stageClass} flex items-center justify-center text-6xl md:text-7xl shadow-xl shadow-pink-500/20 border-8 border-white dark:border-night-800 group-hover:scale-105 transition-transform duration-500 relative`}
                >
                    {/* Inner Glow Ring */}
                    <div className="absolute inset-4 rounded-full bg-white/20 backdrop-blur-[2px] border border-white/30" />
                    
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="relative z-10 drop-shadow-2xl filter brightness-110"
                    >
                        {visualAsset}
                    </motion.div>
                    
                    {/* Streak Badge Overlay */}
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-night-950 dark:bg-white text-white dark:text-night-950 flex items-center justify-center text-xl font-black shadow-lg border-4 border-white dark:border-night-800 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                        {count}
                    </div>
                </motion.div>

                <div className="space-y-2 max-w-[250px] mx-auto pt-4">
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-black text-pink-500">{count}</span>
                        <span className="text-sm font-bold text-night-600 dark:text-night-300 uppercase tracking-widest">Day Streak</span>
                    </div>
                    <p className="text-sm font-medium text-night-500 dark:text-night-400 leading-relaxed">
                        {message}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
