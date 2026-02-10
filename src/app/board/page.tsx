// src/app/board/page.tsx
"use client"

import React, { useState } from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { notesRepo } from "@/lib/db/repositories/notes.repo"
import { useAppStore } from "@/lib/store/app-store"
import { StickyNote } from "@/lib/db/schemas"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Pin, Trash2, ExternalLink, Lightbulb, Heart, Target, BookOpen, Clock, Sparkles, FolderHeart } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { formatDistanceToNow } from "date-fns"
import { addNoteToFirebase, deleteNoteFromFirebase, togglePinInFirebase } from "@/lib/firebase/services/notes"
import { logActivityToFirebase } from "@/lib/firebase/services/activity"
import { toast } from "react-hot-toast"

const NOTE_COLORS = [
    "bg-pink-100 border-pink-200 text-pink-900",
    "bg-blue-100 border-blue-200 text-blue-900",
    "bg-yellow-100 border-yellow-200 text-yellow-900",
    "bg-green-100 border-green-200 text-green-900",
    "bg-purple-100 border-purple-200 text-purple-900",
]

const NOTE_TYPES = [
    { id: 'thought', icon: Lightbulb, label: 'Thought' },
    { id: 'boost', icon: Heart, label: 'Encouragement' },
    { id: 'goal', icon: Target, label: 'Goal' },
    { id: 'reminder', icon: BookOpen, label: 'Reminder' },
] as const

export default function BoardPage() {
    const { currentPerson } = useAppStore()
    const [filterType, setFilterType] = useState<StickyNote['type'] | 'all'>('all')

    const notes = useLiveQuery(async () => {
        let collection = db.stickyNotes.orderBy('createdAt').reverse()
        let results = await collection.toArray()
        return results
    }, []) || []

    const filteredNotes = notes.filter(n => {
        // Filter by Type
        if (filterType !== 'all' && n.type !== filterType) return false

        // Filter by Person (Shared View logic kept for local simulation)
        if (currentPerson === 'both') return true;
        return n.person === currentPerson;
    })

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        content: "",
        type: "thought" as any,
        color: NOTE_COLORS[0],
        isPinned: false,
        linkedUrl: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.content.trim()) return

        const uploader = currentPerson === 'both' ? 'shubham' : currentPerson

        try {
            await notesRepo.addNote({
                person: uploader,
                content: formData.content,
                type: formData.type,
                color: formData.color,
                isPinned: false,
                linkedUrl: formData.linkedUrl
            })

            // Firebase Sync
            await addNoteToFirebase({
                person: uploader,
                content: formData.content,
                type: formData.type,
                color: formData.color,
                isPinned: false,
                linkedUrl: formData.linkedUrl
            })

            // Activity Log
            await logActivityToFirebase({
                person: uploader,
                type: 'note',
                title: 'New Note',
                message: `${uploader === 'shubham' ? 'Shubham' : 'Khushi'} left a note for you!`
            })

            setIsDialogOpen(false)
            setFormData({ content: "", type: "thought", color: NOTE_COLORS[0], isPinned: false, linkedUrl: "" })
        } catch (error) {
            console.error("Failed to add note:", error)
        }
    }

    const sortedNotes = filteredNotes ? [...filteredNotes].sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1)) : []

    return (
        <PageWrapper className="space-y-6 pt-4 pb-24">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 mb-2">
                        <Sparkles className="w-3 h-3" />
                        <span>We showed up today</span>
                    </div>
                    <h1 className="text-4xl font-black text-night-950 tracking-tightest leading-none">Our Shared Space</h1>
                </div>

                <div className="flex items-center space-x-3">
                    <Link href="/archive">
                        <Button variant="ghost" className="text-xs font-bold text-night-400 hover:text-pink-500">
                            View Gallery
                        </Button>
                    </Link>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="rounded-xl shadow-sm bg-night-950 hover:bg-night-800 text-white font-black h-11 px-6 text-xs uppercase tracking-widest">
                                <Plus className="mr-2 w-4 h-4" />
                                Write Note
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-night-950">Add a sticky note 📝</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-night-400">What's on your mind?</label>
                                    <Textarea
                                        value={formData.content}
                                        onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Write something sweet or inspiring..."
                                        className="min-h-[140px] rounded-2xl border-night-100 focus-visible:ring-night-200 text-night-950 font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-night-400">Note Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {NOTE_TYPES.map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                                                    className={cn(
                                                        "p-3 rounded-xl transition-all border-2",
                                                        formData.type === type.id ? "bg-night-950 border-night-950 text-white shadow-md scale-105" : "bg-white border-night-50 text-night-300 hover:border-night-200"
                                                    )}
                                                    title={type.label}
                                                >
                                                    <type.icon className="w-5 h-5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-night-400">Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {NOTE_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                    className={cn(
                                                        "w-8 h-8 rounded-lg border-2 transition-all shadow-sm",
                                                        color,
                                                        formData.color === color ? "scale-110 border-night-950 shadow-md" : "border-transparent"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black bg-night-950 hover:bg-night-800 tracking-tight">
                                    Post to Board
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Grid Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {sortedNotes.map((note) => (
                        <motion.div
                            key={note.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group h-full"
                        >
                            <Card className={cn(
                                "h-full min-h-[240px] transition-all transform border shadow-sm rounded-3xl overflow-hidden",
                                note.color,
                                note.isPinned ? "border-night-950/20 shadow-md rotate-1" : "border-black/5 -rotate-1 hover:rotate-0"
                            )}>
                                <CardContent className="p-6 h-full flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex -space-x-2">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-sm bg-blue-100",
                                                        note.person === 'shubham' ? "z-10" : "opacity-30 scale-90"
                                                    )}>👦</div>
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-sm bg-pink-100",
                                                        note.person === 'khushi' ? "z-10" : "opacity-30 scale-90"
                                                    )}>👧</div>
                                                </div>
                                                <span className="text-[10px] font-black text-night-950/40 uppercase tracking-widest pl-2">
                                                    {note.type}
                                                </span>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const newPin = !note.isPinned;
                                                    await notesRepo.togglePin(note.id);
                                                    await togglePinInFirebase(note.id, newPin);
                                                }}
                                                className={cn(
                                                    "p-1.5 rounded-lg transition-all",
                                                    note.isPinned ? "bg-night-950 text-white shadow-lg" : "bg-black/5 text-night-300 hover:text-night-500"
                                                )}
                                            >
                                                <Pin className={cn("w-3.5 h-3.5", note.isPinned && "fill-current")} />
                                            </button>
                                        </div>

                                        <p className="font-handwritten text-2xl leading-snug text-night-950">
                                            {note.content}
                                        </p>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-4">
                                        <span className="text-[10px] font-bold text-night-950/40 italic">
                                            {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                                        </span>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={async () => {
                                                    await notesRepo.deleteNote(note.id);
                                                    await deleteNoteFromFirebase(note.id);
                                                }}
                                                className="p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State Section */}
            {sortedNotes.length === 0 && (
                <div className="relative py-20 px-8 rounded-[4rem] border border-dashed border-night-200 bg-night-50/50 backdrop-blur-sm flex flex-col items-center text-center space-y-8 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, #000 2px, transparent 0)', backgroundSize: '24px 24px' }} />

                    <div className="space-y-3 relative z-10">
                        <div className="text-5xl mb-6">🏡</div>
                        <h3 className="text-3xl font-black text-night-950 tracking-tightest">Our shared space is waiting.</h3>
                        <p className="text-night-500 font-bold max-w-sm mx-auto text-sm">
                            Leave a note for each other. It can be a dream, a reminder, or just a little boost for the day.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl relative z-10">
                        {[
                            { title: "Dream together", prompt: "What are we dreaming about this week?", icon: "💭" },
                            { title: "Personal note", prompt: "Write something you want them to remember.", icon: "💗" },
                            { title: "Daily reminder", prompt: "A reminder for the tough days ahead.", icon: "🎯" }
                        ].map((p, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-night-100 text-left space-y-2 hover:border-pink-200 transition-all group cursor-pointer" onClick={() => {
                                setFormData(prev => ({ ...prev, content: p.prompt }));
                                setIsDialogOpen(true);
                            }}>
                                <div className="text-2xl">{p.icon}</div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-night-900">{p.title}</h4>
                                <p className="text-xs text-night-400 font-bold leading-relaxed group-hover:text-night-900 transition-colors">{p.prompt}</p>
                            </div>
                        ))}
                    </div>

                    <Button
                        size="lg"
                        onClick={() => setIsDialogOpen(true)}
                        className="rounded-2xl bg-night-950 hover:bg-night-800 text-white font-black h-16 px-12 relative z-10 shadow-xl text-lg tracking-tight"
                    >
                        Chal chal chal — Write something
                    </Button>
                </div>
            )}
        </PageWrapper>
    )
}
