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
        message = "A new beginning. Time to plant the seeds of our dream.";
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
                    <p className="text-xs uppercase tracking-widest text-night-600 dark:text-night-400 font-bold opacity-90">The Visualization Garden</p>
                </div>
                
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${stageClass} flex items-center justify-center text-6xl md:text-7xl shadow-xl shadow-pink-500/20 border-4 border-white dark:border-night-800 group-hover:scale-105 transition-transform duration-500`}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    >
                        {visualAsset}
                    </motion.div>
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
