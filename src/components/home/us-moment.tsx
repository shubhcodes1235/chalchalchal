// src/components/home/us-moment.tsx
"use client"

import React from "react"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { useAppStore } from "@/lib/store/app-store"

export function UsMoment() {
    const { currentPerson } = useAppStore()

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="w-full bg-primary/5 rounded-[3rem] p-12 border border-primary/10 flex flex-col items-center text-center space-y-4"
        >
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-soft animate-pulse-gentle">
                <Heart className="w-8 h-8 text-primary fill-primary" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-handwritten font-bold text-night-900">
                    {currentPerson === 'shubham' ? "Working for the dream, together." : "Building the future, together."}
                </h2>
                <p className="text-night-600 max-w-md mx-auto italic font-medium">
                    "Some days showing up is the win. We're proud of you today."
                </p>
            </div>

            <div className="pt-4 flex -space-x-3">
                <div className="w-12 h-12 rounded-full border-4 border-white bg-blue-100 shadow-sm flex items-center justify-center text-xl">👦</div>
                <div className="w-12 h-12 rounded-full border-4 border-white bg-pink-100 shadow-sm flex items-center justify-center text-xl">👧</div>
            </div>
        </motion.div>
    )
}
