
"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Target, Focus } from "lucide-react"
import { useAppStore } from "@/lib/store/app-store"

export function FocusCard() {
    const { currentPerson } = useAppStore()
    const [focus, setFocus] = useState("")
    const [loading, setLoading] = useState(true)

    // A separate store or local state for "daily focus"? 
    // Let's use local storage per user for simplicity as it's ephemeral
    const key = `daily_focus_${currentPerson}_${new Date().toISOString().split('T')[0]}`

    useEffect(() => {
        const saved = localStorage.getItem(key)
        if (saved) setFocus(saved)
        setLoading(false)
    }, [key])

    const handleSetFocus = (val: string) => {
        setFocus(val)
        localStorage.setItem(key, val)
    }

    if (loading) {
        return (
            <Card className="border-none bg-night-950 dark:bg-[#1a1a1a] shadow-xl rounded-[2.5rem] overflow-hidden group h-80 flex flex-col relative animate-pulse">
                <CardContent className="p-8 flex flex-col h-full space-y-8">
                    <div className="h-4 bg-white/5 rounded-full w-24" />
                    <div className="space-y-4 pt-12">
                        <div className="h-10 bg-white/5 rounded-2xl w-full" />
                        <div className="h-10 bg-white/10 rounded-2xl w-3/4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none bg-night-950 dark:bg-[#1a1a1a] text-white shadow-xl rounded-[2.5rem] overflow-hidden group hover:scale-[1.01] transition-all duration-500 h-80 flex flex-col relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 blur-[60px] rounded-full pointer-events-none" />

            <CardContent className="p-8 flex flex-col h-full relative z-10">
                <div className="flex items-center justify-between mb-auto">
                    <div className="flex items-center space-x-2 text-xs uppercase tracking-widest font-black text-pink-400">
                        <Target className="w-4 h-4" />
                        <span>Daily One Thing</span>
                    </div>
                </div>

                <div className="space-y-6 mt-4">
                    {focus ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <h3 className="text-3xl md:text-5xl font-black font-display leading-none tracking-tight text-white break-words">
                                {focus}
                            </h3>
                            <button
                                onClick={() => handleSetFocus("")}
                                className="text-xs uppercase font-bold text-white/40 hover:text-white transition-colors flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full w-fit hover:bg-white/10"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span>Active Target</span>
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <h3 className="text-2xl md:text-3xl font-bold text-white/80 leading-tight">
                                What is the <span className="text-pink-500 underline decoration-4 underline-offset-4">ONE thing</span> that moves the needle today?
                            </h3>
                            <div className="relative">
                                <Input
                                    id="focus-needle"
                                    name="focus-needle"
                                    placeholder="Design 3 screens..."
                                    className="bg-white/10 border-transparent text-white placeholder:text-white/20 rounded-2xl h-16 text-xl font-medium focus-visible:ring-pink-500 focus-visible:bg-white/5 transition-all"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSetFocus(e.currentTarget.value)
                                        }
                                    }}
                                />
                                <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5 pl-1">
                                    <span className="opacity-60 text-xs text-pink-500">↵</span> Enter to set your focus
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
