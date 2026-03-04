// src/components/layout/sidebar.tsx
"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderHeart, Plus, MessageSquareHeart, LineChart, Quote, User2, Settings } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"
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
                <div className="w-10 h-10 rounded-2xl bg-night-950 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                    D
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-black text-night-950 leading-tight tracking-tight">Dream & Design</span>
                    <span className="text-xs text-pink-500 font-bold tracking-widest uppercase opacity-90 mt-0.5">Companion</span>
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
                                    isActive ? "bg-white shadow-soft text-night-950 font-black" : "text-night-600 hover:text-night-900"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 opacity-90 group-hover:opacity-100", isActive && "opacity-100 text-pink-500")} />
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Shared Thread Summary */}
            <div className="mt-auto pt-6 border-t border-night-100">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-3">
                        <div className="flex -space-x-1.5">
                            <div className={cn(
                                "w-7 h-7 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs shadow-sm",
                                currentPerson === 'shubham' ? "z-10 ring-2 ring-blue-200" : "opacity-40"
                            )}>👦</div>
                            <div className={cn(
                                "w-7 h-7 rounded-full border-2 border-white bg-pink-100 flex items-center justify-center text-xs shadow-sm",
                                currentPerson === 'khushi' ? "z-10 ring-2 ring-pink-200" : "opacity-40"
                            )}>👧</div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-night-950 leading-none mb-1">Us</span>
                            <span className="text-sm text-night-600 font-bold uppercase tracking-widest">{currentPerson} active</span>
                        </div>
                    </div>
                    <div className="bg-white px-2 py-1 rounded-full border border-night-100 flex items-center space-x-1 shadow-sm">
                        <span className="text-sm font-black text-orange-500">{streak?.currentStreak || 0}</span>
                        <span className="text-xs">🔥</span>
                    </div>
                </div>

                <p className="mt-4 px-2 text-sm text-night-600 font-bold italic opacity-80">
                    Chal chal chal — together.
                </p>
            </div>
        </aside>
    )
}
