// src/components/home/team-streak-counter.tsx
"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app-store";
import { subscribeToStreak, checkDailyStreak, StreakData } from "@/lib/firebase/services/streak"

export function TeamStreakCounter() {
    const { currentPerson } = useAppStore();
    const [streak, setStreak] = useState<StreakData | null>(null);

    useEffect(() => {
        // Initialize/Check streak on load
        checkDailyStreak();

        // Subscribe to real-time updates
        const unsubscribe = subscribeToStreak((data) => {
            setStreak(data);
        });

        return () => unsubscribe();
    }, []);

    const count = streak?.currentStreak || 0;

    return (
        <Card className="border-none bg-white shadow-soft rounded-[2.5rem] overflow-hidden group hover:shadow-glow transition-all duration-500">
            <CardContent className="p-8 flex items-center space-x-8">
                <div className="flex -space-x-4">
                    <div className="w-14 h-14 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center shadow-sm text-2xl group-hover:-translate-x-1 transition-transform">👦</div>
                    <div className="w-14 h-14 rounded-full border-4 border-white bg-pink-100 flex items-center justify-center shadow-sm text-2xl group-hover:translate-x-1 transition-transform">👧</div>
                </div>
                <div className="flex flex-col text-left">
                    <div className="relative inline-block mb-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-night-400 font-bold opacity-70">Our Momentum</p>
                        <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-primary/30 rounded-full" />
                    </div>
                    {count === 0 ? (
                        <h3 className="text-xl font-bold text-night-800 leading-tight">Your journey starts today.</h3>
                    ) : (
                        <div className="flex flex-col">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-4xl font-black text-pink-500">{count}</span>
                                <span className="text-lg font-bold text-night-700">Days Together</span>
                                <span className="text-2xl">🔥</span>
                            </div>
                            <p className="text-[10px] text-pink-400 font-bold mt-1 tracking-wide animate-pulse-gentle">
                                {currentPerson === 'shubham' ? "Khushi is right here with you ✨" : "Shubham noticed your progress 💖"}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
