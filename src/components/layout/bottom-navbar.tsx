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
    { icon: FolderHeart, label: "Archive", href: "/archive" },
    { icon: Plus, label: "Create", href: "/upload", isFab: true },
    { icon: MessageSquareHeart, label: "Board", href: "/board" },
    { icon: LineChart, label: "Progress", href: "/progress" },
]

export function BottomNavbar() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-6 h-16 relative">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    if (item.isFab) {
                        return (
                            <div key={item.href} className="relative -top-8">
                                <Link href={item.href}>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        className="w-14 h-14 rounded-full bg-night-950 dark:bg-primary/20 text-white dark:text-primary flex items-center justify-center shadow-xl border-4 border-background animate-scale-pulse"
                                    >
                                        <Icon className="w-6 h-6" />
                                    </motion.div>
                                </Link>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center space-y-0.5 relative py-1"
                        >
                            <div className="relative flex flex-col items-center">
                                <Icon
                                    className={cn(
                                        "w-6 h-6 transition-colors duration-300",
                                        isActive 
                                            ? "text-pink-500 fill-pink-100 dark:fill-pink-900/20 stroke-[2.5px]" 
                                            : "text-night-400 dark:text-muted-foreground"
                                    )}
                                />
                                <span className={cn(
                                    "text-[9px] font-bold mt-0.5 tracking-wider transition-colors duration-300",
                                    isActive ? "text-pink-500" : "text-night-400 dark:text-muted-foreground"
                                )}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-pink-500"
                                    />
                                )}
                            </div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
