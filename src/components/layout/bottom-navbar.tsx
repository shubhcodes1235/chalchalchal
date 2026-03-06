// src/components/layout/bottom-navbar.tsx
"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderHeart, Plus, LayoutDashboard, LineChart, MessageSquareHeart, Settings } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { motion } from "framer-motion"

const navItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: MessageSquareHeart, label: "Board", href: "/board" },
    { icon: Plus, label: "Upload", href: "/upload", isFab: true },
    { icon: LineChart, label: "Progress", href: "/progress" },
    { icon: FolderHeart, label: "Gallery", href: "/archive" },
]

export function BottomNavbar() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_-15px_rgba(255,255,255,0.05)] dark:border-t-white/10 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-4 h-16 relative">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    if (item.isFab) {
                        return (
                            <div key={item.href} className="relative -top-6 mx-2">
                                <Link href={item.href}>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 text-white flex items-center justify-center shadow-[0_8px_30px_rgb(233,30,99,0.3)] border-[4px] border-background animate-scale-pulse"
                                    >
                                        <motion.div
                                            whileTap={{ rotate: 90 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                        >
                                            <Icon className="w-7 h-7" />
                                        </motion.div>
                                    </motion.div>
                                </Link>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex-1 flex justify-center py-2"
                        >
                            <motion.div 
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                    "relative flex flex-col items-center justify-center w-full max-w-[64px] rounded-2xl transition-all duration-300",
                                    isActive ? "py-1" : "py-1"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabPill"
                                        className="absolute inset-0 bg-gradient-to-b from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-950/40 rounded-2xl shadow-sm border border-pink-200/50 dark:border-pink-800/30"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <div className="relative flex flex-col items-center z-10">
                                    <Icon
                                        className={cn(
                                            "w-6 h-6 transition-colors duration-300",
                                            isActive 
                                                ? "text-pink-500 fill-pink-100 dark:fill-pink-900/40 stroke-[2.5px]" 
                                                : "text-night-400 dark:text-muted-foreground"
                                        )}
                                    />
                                    <span className={cn(
                                        "text-[11px] font-bold mt-0.5 tracking-tight transition-colors duration-300",
                                        isActive ? "text-pink-600 dark:text-pink-400" : "text-night-400 dark:text-muted-foreground"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>
                            </motion.div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

