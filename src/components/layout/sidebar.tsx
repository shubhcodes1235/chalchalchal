// src/components/layout/sidebar.tsx
"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderHeart, Plus, MessageSquareHeart, LineChart, Quote, User2, Settings } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"
import Image from "next/image"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"

const navItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: FolderHeart, label: "Archive", href: "/archive" },
    { icon: Plus, label: "Upload Design", href: "/upload" },
    { icon: MessageSquareHeart, label: "Friendship Board", href: "/board" },
    { icon: LineChart, label: "Progress Hub", href: "/progress" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
    const pathname = usePathname()
    const settings = useLiveQuery(() => db.appSettings.get('main'))

    const currentPerson = settings?.currentPerson || 'shubham'
    const streak = useLiveQuery(() => db.streakData.get('main-streak'))

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 left-0 bg-transparent py-6 px-6 overflow-y-auto">
            <div className="flex items-center space-x-3 mb-10 px-2 group cursor-default">
                <div className="w-10 h-10 rounded-2xl bg-night-950 dark:bg-primary/20 flex items-center justify-center text-white dark:text-primary font-display font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                    D
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-display font-bold text-night-950 dark:text-foreground leading-tight tracking-tight">Dream & Design</span>
                    <span className="text-xs text-pink-500 dark:text-pink-400 font-body font-semibold tracking-widest uppercase opacity-90 mt-0.5">Companion</span>
                </div>
            </div>

            <nav className="flex-1 space-y-1.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={cn(
                                    "flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-white dark:bg-card shadow-soft text-night-950 dark:text-foreground font-display font-semibold"
                                        : "text-night-600 dark:text-muted-foreground hover:text-night-900 dark:hover:text-foreground hover:bg-white/60 dark:hover:bg-muted/50"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 opacity-90 transition-all duration-300", isActive ? "text-pink-500 drop-shadow-[0_0_4px_rgba(236,72,153,0.5)] opacity-100" : "text-night-500 dark:text-muted-foreground group-hover:text-night-900 dark:group-hover:text-foreground")} />
                                <span className="text-sm font-body tracking-tight">{item.label}</span>
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Shared Thread Summary */}
            <div className="mt-auto pt-6 border-t border-night-100 dark:border-border">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-3">
                        <div className="flex -space-x-1.5">
                            <div className={cn(
                                "w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-blue-100 flex items-center justify-center text-xs shadow-sm transition-all",
                                currentPerson === 'shubham' ? "z-10 ring-2 ring-blue-200 scale-110" : "opacity-40 grayscale"
                            )}>
                                <Image src="/shubham.jpg" alt="S" width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                            <div className={cn(
                                "w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-pink-100 flex items-center justify-center text-xs shadow-sm transition-all",
                                currentPerson === 'khushi' ? "z-10 ring-2 ring-pink-200 scale-110" : "opacity-40 grayscale"
                            )}>
                                <Image src="/khushi.jpg" alt="K" width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="flex flex-col ml-1">
                            <span className="text-sm font-display font-bold text-night-950 dark:text-foreground leading-none mb-1">Us</span>
                            <span className="text-[10px] text-night-500 dark:text-muted-foreground font-body font-bold uppercase tracking-widest">{currentPerson} active</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-card px-3 py-1.5 rounded-2xl border border-night-100 dark:border-border flex items-center space-x-1.5 shadow-soft">
                        <span className="text-lg font-black text-orange-500 leading-none">{streak?.currentStreak || 0}</span>
                        <span className="text-base">🔥</span>
                    </div>
                </div>

                <p className="mt-4 px-2 text-sm text-night-500 dark:text-muted-foreground font-body font-medium italic opacity-75">
                    Chal chal chal — together.
                </p>
            </div>
        </aside>
    )
}
