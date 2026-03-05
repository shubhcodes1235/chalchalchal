// src/components/home/us-moment.tsx
"use client"

import React from "react"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import Image from "next/image"
import { useAppStore } from "@/lib/store/app-store"

export function UsMoment() {
    const { currentPerson } = useAppStore()

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="w-full bg-primary/5 dark:bg-primary/10 rounded-[3rem] p-12 border border-primary/10 dark:border-primary/20 flex flex-col items-center text-center space-y-4"
        >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-card flex items-center justify-center shadow-soft">
                <Heart className="w-8 h-8 text-primary fill-primary" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-handwritten font-bold text-night-900 dark:text-foreground">
                    {currentPerson === 'shubham' ? "Working for the dream, together." : "Building the future, together."}
                </h2>
                <p className="text-night-500 dark:text-muted-foreground font-body font-medium max-w-md mx-auto italic text-sm leading-relaxed">
                    &ldquo;Some days showing up is the win. We&apos;re proud of you today.&rdquo;
                </p>
            </div>

            <div className="pt-4 flex -space-x-3">
                <div className="w-12 h-12 rounded-full border-4 border-white dark:border-card overflow-hidden bg-blue-100 dark:bg-blue-900/30 shadow-sm flex items-center justify-center">
                    <Image src="/shubham.jpg" alt="S" width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-white dark:border-card overflow-hidden bg-pink-100 dark:bg-pink-900/30 shadow-sm flex items-center justify-center">
                    <Image src="/khushi.jpg" alt="K" width={48} height={48} className="w-full h-full object-cover" />
                </div>
            </div>
        </motion.div>
    )
}
