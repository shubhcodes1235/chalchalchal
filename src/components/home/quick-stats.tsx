// src/components/home/quick-stats.tsx
"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { Palette, CalendarDays, Coins, Timer } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export function QuickStats() {
    const designsCount = useLiveQuery(() => db.designs.count()) || 0
    const streak = useLiveQuery(() => db.streakData.get('main-streak'))
    const totalDays = streak?.totalActiveDays || 0
    const income = useLiveQuery(() => db.income.toArray())
    const totalIncome = income?.reduce((sum, item) => sum + item.amount, 0) || 0

    const stats = [
        { label: "Designs Created", value: designsCount, icon: Palette, color: "text-pink-500" },
        { label: "Days Active", value: totalDays, icon: CalendarDays, color: "text-coral-500" },
        { label: "Total Earnings", value: totalIncome, icon: Coins, color: "text-night-700", prefix: "₹" },
        { label: "Current Streak", value: streak?.currentStreak || 0, icon: Timer, color: "text-blue-500", suffix: " 🔥" },
    ]

    return (
        <div className="flex flex-wrap items-center justify-center gap-12">
            {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-2 group min-w-[120px]">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                        i === 0 ? "bg-pink-100 text-pink-600" :
                            i === 1 ? "bg-orange-100 text-orange-600" :
                                i === 2 ? "bg-green-100 text-green-600" :
                                    "bg-blue-100 text-blue-600"
                    )}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className={cn("text-lg font-bold tracking-tight", stat.value === 0 ? "text-night-500 font-medium italic text-base" : "text-night-800")}>
                            {stat.value === 0 ? (
                                i === 0 ? "First mark waiting" :
                                    i === 1 ? "Just beginning" :
                                        i === 2 ? "Ready to earn" : "Day 0"
                            ) : (
                                <span className={cn("font-black", stat.color)}>
                                    {stat.prefix}{stat.value}{stat.suffix}
                                </span>
                            )}
                        </span>
                        <span className="text-sm text-night-600 font-medium italic opacity-80 mt-1">
                            {i === 0 ? "first bricks laid" :
                                i === 1 ? "steps taken together" :
                                    i === 2 ? "fruits of your labor" : "momentum building"}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}
