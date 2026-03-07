
"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Target, Focus, Sparkles, Heart, Zap } from "lucide-react"
import { useAppStore } from "@/lib/store/app-store"
import { subscribeToPartnerPresence, updatePresenceFocus, sendFocusReaction } from "@/lib/firebase/services/presence"
import { useCelebration } from "@/providers/celebration-provider"
import { toast } from "react-hot-toast"

export function FocusCard() {
    const { currentPerson } = useAppStore()
    const { triggerCelebration } = useCelebration()
    const [focus, setFocus] = useState("")
    const [loading, setLoading] = useState(true)
    const [partnerData, setPartnerData] = useState<{ name: string; focus: string | null; reaction: any } | null>(null)

    const key = `daily_focus_${currentPerson}_${new Date().toISOString().split('T')[0]}`

    useEffect(() => {
        const saved = localStorage.getItem(key)
        if (saved) setFocus(saved)
        setLoading(false)

        if (currentPerson && currentPerson !== 'both') {
            const partnerId = currentPerson === 'shubham' ? 'khushi' : 'shubham'
            const partnerName = currentPerson === 'shubham' ? 'Khushi' : 'Shubham'
            
            return subscribeToPartnerPresence(partnerId, (data) => {
                setPartnerData({
                    name: partnerName,
                    focus: data.dailyFocus,
                    reaction: data.focusReaction
                })
            })
        }
    }, [key, currentPerson])

    const handleSetFocus = (val: string) => {
        setFocus(val)
        localStorage.setItem(key, val)
        if (currentPerson && currentPerson !== 'both') {
            updatePresenceFocus(currentPerson as string, val || null)
        }
    }

    const handleComplete = () => {
        triggerCelebration('milestone')
        toast.success("Focus achieved! You're crushing it! 🔥")
        handleSetFocus("")
    }

    const handleReact = (type: 'heart' | 'zap') => {
        if (!currentPerson || currentPerson === 'both') return
        const partnerId = currentPerson === 'shubham' ? 'khushi' : 'shubham'
        sendFocusReaction(partnerId, type)
        toast.success(`Sent a ${type} to ${partnerData?.name}!`, { icon: type === 'heart' ? '❤️' : '⚡' })
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[60px] rounded-full pointer-events-none" />

            {/* Partner Reaction Overlay */}
            <AnimatePresence>
                {partnerData?.reaction && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0, y: -20 }}
                        className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-glow"
                    >
                        {partnerData.reaction.type === 'heart' ? <Heart className="w-5 h-5 text-pink-500 fill-pink-500" /> : <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                    </motion.div>
                )}
            </AnimatePresence>

            <CardContent className="p-8 flex flex-col h-full relative z-10">
                <div className="flex items-center justify-between mb-auto">
                    <div className="flex items-center space-x-2 text-xs uppercase tracking-widest font-black text-pink-400">
                        <Target className="w-4 h-4" />
                        <span>Daily One Thing</span>
                    </div>
                    
                    {partnerData?.focus && (
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                                {partnerData.name}: {partnerData.focus}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => handleReact('heart')} className="hover:scale-125 transition-transform"><Heart className="w-3.5 h-3.5 text-pink-400/60 hover:text-pink-400" /></button>
                                <button onClick={() => handleReact('zap')} className="hover:scale-125 transition-transform"><Zap className="w-3.5 h-3.5 text-yellow-400/60 hover:text-yellow-400" /></button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6 mt-4">
                    {focus ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-4"
                        >
                            <h3 className="text-3xl md:text-5xl font-black font-display leading-none tracking-tight text-white break-words animate-in fade-in slide-in-from-left-4">
                                {focus}
                            </h3>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleComplete}
                                    className="text-xs uppercase font-black text-white px-4 py-2 rounded-full bg-pink-600 hover:bg-pink-500 transition-all flex items-center space-x-2 shadow-lg hover:shadow-pink-500/50"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>I Did It!</span>
                                </button>
                                <button
                                    onClick={() => handleSetFocus("")}
                                    className="text-[10px] uppercase font-bold text-white/30 hover:text-white/60 transition-colors"
                                >
                                    Change
                                </button>
                            </div>
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
                                    className="bg-white/10 border-transparent text-white placeholder:text-white/20 rounded-2xl h-16 text-xl font-medium focus-visible:ring-pink-500 focus-visible:bg-white/5 transition-all shadow-inner"
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
