// src/components/home/win-of-the-day.tsx
"use client"

import React, { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store/app-store"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trophy, CheckCircle2, PartyPopper } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useSound } from "@/providers/sound-provider"
import { subscribeToTodayWin, addWinToFirebase, DailyWin } from "@/lib/firebase/services/wins"
import { logActivityToFirebase } from "@/lib/firebase/services/activity"

export function WinOfTheDay({ minimal = false }: { minimal?: boolean }) {
    const { currentPerson } = useAppStore()
    const { playSound } = useSound()
    const today = new Date().toISOString().split('T')[0]

    const [content, setContent] = useState("")
    const [author, setAuthor] = useState<'shubham' | 'khushi'>(
        currentPerson === 'both' ? 'shubham' : currentPerson
    )
    const [todayWin, setTodayWin] = useState<DailyWin | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (currentPerson !== 'both') {
            setAuthor(currentPerson)
        }
    }, [currentPerson])

    useEffect(() => {
        const unsubscribe = subscribeToTodayWin(today, author, (win) => {
            setTodayWin(win)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [today, author])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        await addWinToFirebase(author, content.trim(), today)

        // Activity Log
        await logActivityToFirebase({
            person: author,
            type: 'win',
            title: 'Daily Win',
            message: `${author === 'shubham' ? 'Shubham' : 'Khushi'} just logged a win: "${content.trim()}" 🏆`
        })

        playSound('pop')
        setContent("")
    }

    if (minimal) {
        return (
            <div className="w-full max-w-sm mx-auto space-y-3">
                <AnimatePresence mode="wait">
                    {todayWin ? (
                        <motion.div
                            key="win-saved-min"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/40 dark:bg-card/40 p-4 rounded-2xl flex items-center justify-center space-x-2 text-pink-600 dark:text-pink-400 border border-pink-100/50 dark:border-night-800"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-sm font-bold italic">"{todayWin.content}"</span>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="win-form-min"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col space-y-3"
                        >
                            <Input
                                id="win-minimal"
                                name="win-minimal"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What was a small win today?"
                                className="text-center rounded-xl h-10 bg-white/30 dark:bg-black/30 text-night-900 dark:text-white border-none focus-visible:ring-pink-200 dark:focus-visible:ring-pink-800 placeholder:text-night-500/60 dark:placeholder:text-night-400/60 text-sm"
                            />
                            {content.trim() && (
                                <Button type="submit" size="sm" variant="ghost" className="text-pink-400 hover:text-pink-600 hover:bg-transparent h-auto py-1 px-4 text-xs font-black uppercase tracking-widest">
                                    Save
                                </Button>
                            )}
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <Card className="border-none bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:shadow-glow transition-all duration-500">
            <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shadow-sm transition-transform group-hover:rotate-12">
                        <Trophy className="w-5 h-5 shrink-0" />
                    </div>
                    <div className="relative">
                        <span className="text-xs uppercase tracking-widest text-night-500 dark:text-night-400 font-body font-semibold opacity-90">Reflection</span>
                        <div className="absolute -bottom-1 left-0 w-6 h-0.5 bg-primary/30 rounded-full" />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="h-12 w-full animate-pulse bg-muted rounded-xl" />
                    ) : todayWin ? (
                        <motion.div
                            key="win-saved"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start space-x-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center shrink-0 border border-pink-100 dark:border-pink-800/50 shadow-sm transition-transform group-hover:rotate-12">
                                <PartyPopper className="w-6 h-6 text-pink-500" />
                            </div>
                                <div className="space-y-1 pt-1">
                                    <p className="text-night-800 dark:text-white font-display font-semibold text-lg leading-snug tracking-tight italic">"{todayWin?.content}"</p>
                                    <div className="flex items-center text-xs text-pink-500 font-body font-semibold uppercase tracking-widest">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Moment Logged
                                    </div>
                                </div>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="win-form"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-5"
                        >
                            <h3 className="text-xl font-display font-semibold text-night-800 dark:text-white leading-snug tracking-tight">What was a small win today?</h3>
                            <div className="flex space-x-2">
                                <Input
                                    id="win-full"
                                    name="win-full"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Even opening this site counts..."
                                    className="rounded-2xl h-14 bg-muted/30 dark:bg-muted/20 border-border focus-visible:ring-primary/30 dark:focus-visible:ring-primary/40 placeholder:text-muted-foreground"
                                />
                                <Button type="submit" className="rounded-2xl h-14 px-8 shadow-glow bg-pink-500 hover:bg-pink-600 border-none transition-all">
                                    Log
                                </Button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
                {currentPerson === 'both' && !todayWin && (
                    <div className="flex gap-4 justify-center mt-6">
                        <button
                            type="button"
                            onClick={() => setAuthor('shubham')}
                            className={`group flex items-center gap-2 p-1 pr-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${author === 'shubham' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500' : 'bg-gray-50 dark:bg-night-900 text-gray-400 dark:text-night-400 opacity-60 hover:opacity-100'}`}
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                <Image src="/shubham.jpg" alt="Shubham" width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                            Shubham
                        </button>
                        <button
                            type="button"
                            onClick={() => setAuthor('khushi')}
                            className={`group flex items-center gap-2 p-1 pr-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${author === 'khushi' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 ring-2 ring-pink-500' : 'bg-gray-50 dark:bg-night-900 text-gray-400 dark:text-night-400 opacity-60 hover:opacity-100'}`}
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                <Image src="/khushi.jpg" alt="Khushi" width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                            Khushi
                        </button>
                    </div>
                )}
            </CardContent>
        </Card >
    )
}
