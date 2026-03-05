// src/app/vault/gratitude/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { useAppStore } from "@/lib/store/app-store"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sparkles, Heart, Trash2, CalendarDays } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils/cn"
import { format } from "date-fns"
import { nanoid } from "nanoid"

export default function GratitudePage() {
    const { currentPerson } = useAppStore()
    const entries = useLiveQuery(() =>
        db.gratitudeEntries.orderBy('createdAt').reverse().toArray()
    )

    const [content, setContent] = useState("")
    const [author, setAuthor] = useState<'shubham' | 'khushi'>(
        currentPerson === 'both' ? 'shubham' : currentPerson
    )

    useEffect(() => {
        if (currentPerson !== 'both') {
            setAuthor(currentPerson)
        }
    }, [currentPerson])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        await db.gratitudeEntries.add({
            id: nanoid(),
            person: author,
            content: content.trim(),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date()
        })
        setContent("")
    }

    const deleteEntry = async (id: string) => {
        await db.gratitudeEntries.delete(id)
    }

    return (
        <PageWrapper className="max-w-3xl space-y-12">
            <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto shadow-sm">
                    <Heart className="w-8 h-8 text-pink-500 fill-pink-500 animate-pulse" />
                </div>
                <h1 className="text-4xl md:text-5xl font-handwritten font-bold text-pink-700">Gratitude Journal</h1>
                <p className="text-night-500 italic">Writing down one small thing you&apos;re thankful for today.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass p-8 rounded-4xl border-2 border-pink-100 shadow-warm space-y-6">
                {currentPerson === 'both' && (
                    <div className="flex gap-4 justify-center">
                        <button
                            type="button"
                            onClick={() => setAuthor('shubham')}
                            className={`group flex items-center gap-2 p-1 pr-4 rounded-full transition-all font-black text-xs uppercase tracking-widest ${author === 'shubham' ? 'bg-blue-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm transition-all",
                                author !== 'shubham' && "grayscale opacity-40"
                            )}>
                                <Image src="/shubham.jpg" alt="S" width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                            Shubham
                        </button>
                        <button
                            type="button"
                            onClick={() => setAuthor('khushi')}
                            className={`group flex items-center gap-2 p-1 pr-4 rounded-full transition-all font-black text-xs uppercase tracking-widest ${author === 'khushi' ? 'bg-pink-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm transition-all",
                                author !== 'khushi' && "grayscale opacity-40"
                            )}>
                                <Image src="/khushi.jpg" alt="K" width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                            Khushi
                        </button>
                    </div>
                )}
                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-widest text-night-500">I am grateful for...</label>
                    <Input
                        id="gratitude-content"
                        name="gratitude-content"
                        placeholder="e.g. &apos;That extra cup of chai&apos; or &apos;Khushi&apos;s feedback&apos;"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="h-16 text-lg rounded-3xl"
                    />
                </div>
                <Button type="submit" className="w-full h-14 rounded-3xl text-lg shadow-sm">
                    Save this Memory ✨
                </Button>
            </form>

            <div className="space-y-6 pb-20">
                <AnimatePresence mode="popLayout">
                    {entries?.map((entry) => (
                        <motion.div
                            key={entry.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="group"
                        >
                            <Card className="border-pink-50 shadow-soft overflow-hidden hover:border-pink-200 transition-all">
                                <CardContent className="p-6 flex items-start space-x-6">
                                    <div className="flex flex-col items-center shrink-0 space-y-1">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-100 shadow-sm leading-none bg-white">
                                            <Image src={entry.person === 'shubham' ? '/shubham.jpg' : '/khushi.jpg'} alt={entry.person} width={40} height={40} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="text-night-800 text-lg italic leading-relaxed font-handwritten">
                                            &quot;{entry.content}&quot;
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-xs text-night-600 font-bold uppercase tracking-widest">
                                                <CalendarDays className="w-3 h-3 mr-1" />
                                                {format(new Date(entry.createdAt), 'do MMMM, yyyy')}
                                            </div>
                                            <button
                                                onClick={() => deleteEntry(entry.id)}
                                                className="text-night-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {entries && entries.length === 0 && (
                    <div className="text-center py-20 bg-pink-50/50 rounded-4xl border-dashed border-2 border-pink-100">
                        <p className="text-night-500 italic">No entries yet. Start your day with a happy thought.</p>
                    </div>
                )}
            </div>
        </PageWrapper>
    )
}
