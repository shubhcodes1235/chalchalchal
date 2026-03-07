import React, { useState, useEffect, useRef } from "react"
import { useAppStore } from "@/lib/store/app-store"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trophy, CheckCircle2, PartyPopper, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useSound } from "@/providers/sound-provider"
import { subscribeToTodayWin, addWinToFirebase, DailyWin } from "@/lib/firebase/services/wins"
import { logActivityToFirebase } from "@/lib/firebase/services/activity"
import { useCelebration } from "@/providers/celebration-provider"
import { toast } from "react-hot-toast"

export function WinOfTheDay({ minimal = false }: { minimal?: boolean }) {
    const { currentPerson } = useAppStore()
    const { triggerCelebration } = useCelebration()
    const today = new Date().toISOString().split('T')[0]

    const [content, setContent] = useState("")
    const [myWin, setMyWin] = useState<DailyWin | null>(null)
    const [partnerWin, setPartnerWin] = useState<DailyWin | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    
    const prevPartnerWinRef = useRef<DailyWin | null>(null)

    useEffect(() => {
        if (!currentPerson || currentPerson === 'both') return;

        const myPersona = currentPerson as 'shubham' | 'khushi'
        const partnerPersona = myPersona === 'shubham' ? 'khushi' : 'shubham'
        const partnerName = myPersona === 'shubham' ? 'Khushi' : 'Shubham'

        // Subscribe to my win
        const unsubMe = subscribeToTodayWin(today, myPersona, (win) => {
            setMyWin(win)
            if (win) {
                setContent(win.content)
                setIsEditing(false)
            }
            setLoading(false)
        })

        // Subscribe to partner's win
        const unsubPartner = subscribeToTodayWin(today, partnerPersona, (win) => {
            if (win && !prevPartnerWinRef.current && prevPartnerWinRef.current !== undefined) {
                toast.success(`${partnerName} just logged a win! 🏆`, {
                    duration: 5000,
                    icon: '🌟'
                });
                triggerCelebration('milestone');
            }
            setPartnerWin(win)
            prevPartnerWinRef.current = win
        })

        return () => {
            unsubMe()
            unsubPartner()
        }
    }, [today, currentPerson, triggerCelebration])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || !currentPerson || currentPerson === 'both') return

        const persona = currentPerson as 'shubham' | 'khushi'
        await addWinToFirebase(persona, content.trim(), today)

        await logActivityToFirebase({
            person: persona,
            type: 'win',
            title: 'Daily Win',
            message: `${persona === 'shubham' ? 'Shubham' : 'Khushi'} ${isEditing ? 'updated' : 'just logged'} a win: "${content.trim()}" 🏆`
        })

        triggerCelebration('streak')
        toast.success("Win logged! Stay Goated 👑")
        setIsEditing(false)
    }

    if (loading) {
        return (
            <Card className="border-none bg-card shadow-soft rounded-[2.5rem] p-8 animate-pulse">
                <div className="h-20 w-full bg-muted/40 rounded-2xl" />
            </Card>
        )
    }

    if (minimal) {
        return (
            <div className="w-full max-w-sm mx-auto space-y-3">
                <AnimatePresence mode="wait">
                    {myWin && !isEditing ? (
                        <motion.div
                            key="win-saved-min"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setIsEditing(true)}
                            className="bg-white/40 dark:bg-card/40 p-4 rounded-2xl flex items-center justify-center space-x-2 text-pink-600 dark:text-pink-400 border border-pink-100/50 dark:border-night-800 cursor-pointer hover:bg-white/60 transition-all shadow-sm"
                        >
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm font-bold italic truncate">"{myWin.content}"</span>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="win-form-min"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2"
                        >
                            <Input
                                id="daily-win"
                                name="daily-win"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Daily win?"
                                className="rounded-xl h-10 bg-white/30 dark:bg-black/30 border-none text-sm"
                                autoFocus={isEditing}
                            />
                            <Button type="submit" size="sm" className="bg-pink-500 rounded-xl h-10 px-4">
                                <CheckCircle2 className="w-4 h-4" />
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    const partnerName = currentPerson === 'shubham' ? 'Khushi' : 'Shubham'
    const partnerImage = currentPerson === 'shubham' ? '/khushi.jpg' : '/shubham.jpg'

    return (
        <Card className="border-none bg-card shadow-soft rounded-[2.5rem] overflow-hidden group hover:shadow-glow transition-all duration-500 h-full flex flex-col">
            <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 shadow-sm transition-transform group-hover:rotate-12">
                            <Trophy className="w-5 h-5" />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-night-500 dark:text-night-400 font-black">Daily Win</span>
                    </div>
                </div>

                <div className="flex-grow">
                    <AnimatePresence mode="wait">
                        {isEditing || !myWin ? (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="What was your win today?"
                                    className="w-full bg-night-50 dark:bg-night-950/50 border-none rounded-2xl p-4 text-night-900 dark:text-white placeholder:text-night-400 font-medium focus:ring-2 focus:ring-pink-500/20 transition-all min-h-[100px] resize-none text-lg font-handwritten"
                                    maxLength={160}
                                />
                                <div className="flex justify-end gap-2">
                                    {myWin && (
                                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="rounded-full">Cancel</Button>
                                    )}
                                    <Button type="submit" className="rounded-full bg-pink-500 hover:bg-pink-600 text-white px-8 font-black shadow-lg">Save Win ✨</Button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="display"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full"
                            >
                                <div className="bg-rose-500/5 dark:bg-rose-500/10 p-5 rounded-3xl border border-rose-500/10 relative group/mine h-full">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">My Win</span>
                                        <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover/mine:opacity-100 transition-opacity text-[10px] font-black uppercase text-night-400 hover:text-rose-500">Edit</button>
                                    </div>
                                    <p className="text-xl font-handwritten text-night-900 dark:text-white leading-tight">"{myWin.content}"</p>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-night-900 rounded-full flex items-center justify-center shadow-sm border border-rose-500/20">
                                        <PartyPopper className="w-5 h-5 text-rose-500" />
                                    </div>
                                </div>

                                <div className="bg-blue-500/5 dark:bg-blue-500/10 p-5 rounded-3xl border border-blue-500/10 relative h-full flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-5 h-5 rounded-full overflow-hidden border border-blue-500/20">
                                            <Image src={partnerImage} alt={partnerName} width={20} height={20} className="object-cover" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{partnerName}&apos;s Win</span>
                                    </div>
                                    {partnerWin ? (
                                        <p className="text-xl font-handwritten text-night-900 dark:text-white leading-tight italic opacity-90">"{partnerWin.content}"</p>
                                    ) : (
                                        <div className="flex-grow flex items-center justify-center text-center">
                                            <p className="text-xs font-bold text-night-400 italic">Still grinding... ⚡️</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    )
}
