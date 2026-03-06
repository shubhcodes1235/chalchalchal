// src/app/board/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { notesRepo } from "@/lib/db/repositories/notes.repo"
import { useAppStore } from "@/lib/store/app-store"
import { StickyNote } from "@/lib/db/schemas"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pin, Trash2, Lightbulb, Heart, Target, BookOpen, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { formatDistanceToNow } from "date-fns"
import { addNoteToFirebase, deleteNoteFromFirebase, togglePinInFirebase, subscribeToNotes, addNoteReactionToFirebase } from "@/lib/firebase/services/notes"
import { logActivityToFirebase } from "@/lib/firebase/services/activity"
import { addGoalToFirebase, deleteGoalFromFirebase, toggleGoalCompletionInFirebase } from "@/lib/firebase/services/goals"
import { goalsRepo } from "@/lib/db/repositories/goals.repo"
import { nanoid } from "nanoid"

const NOTE_COLORS = [
    "bg-pink-100 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/50 text-pink-900 dark:text-pink-100",
    "bg-blue-100 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-100",
    "bg-yellow-100 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900/50 text-yellow-900 dark:text-yellow-100",
    "bg-green-100 dark:bg-green-950/40 border-green-200 dark:border-green-900/50 text-green-900 dark:text-green-100",
    "bg-purple-100 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50 text-purple-900 dark:text-purple-100",
]

const NOTE_TYPES = [
    { id: 'thought', icon: Lightbulb, label: 'Thought' },
    { id: 'boost', icon: Heart, label: 'Encouragement' },
    { id: 'goal', icon: Target, label: 'Goal' },
    { id: 'reminder', icon: BookOpen, label: 'Reminder' },
] as const

const NOTE_REACTIONS = [
    { emoji: "❤️", label: "Love" },
    { emoji: "🔥", label: "Fire" },
    { emoji: "💯", label: "Perfect" },
]

export default function BoardPage() {
    const { currentPerson } = useAppStore()
    const [viewMode, setViewMode] = useState<'notes' | 'tasks'>('notes')
    const [filterType, setFilterType] = useState<StickyNote['type'] | 'all'>('all')
    const [activePerson, setActivePerson] = useState<string>("all")

    const handleNoteReaction = async (noteId: string, emoji: string) => {
        const persona = currentPerson === 'both' ? 'shubham' : currentPerson;
        await addNoteReactionToFirebase(noteId, emoji, persona);
    };

    const notes = useLiveQuery(async () => {
        const collection = db.stickyNotes.orderBy('createdAt').reverse()
        let results = await collection.toArray()
        return results
    }, []) || []

    const tasks = useLiveQuery(async () => {
        const results = await db.goals.toArray();
        return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [])

    const isLoading = notes === undefined || tasks === undefined

    const filteredNotes = (notes || []).filter(n => {
        // Filter by Type
        if (filterType !== 'all' && n.type !== filterType) return false

        // Filter by Person (Default to all)
        if (activePerson !== 'all' && n.person !== activePerson) return false

        return true
    })

    const filteredTasks = (tasks || []).filter(t => {
        if (activePerson !== 'all' && t.person !== activePerson) return false
        return true
    })

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
    const [taskFormData, setTaskFormData] = useState({ 
        title: "", 
        description: "", 
        priority: "medium" as 'low'|'medium'|'high',
        deadline: ""
    })
    const [formData, setFormData] = useState({
        content: "",
        type: "thought" as any,
        color: NOTE_COLORS[0],
        isPinned: false,
        linkedUrl: ""
    })

    const handleTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!taskFormData.title.trim()) return

        const uploader = currentPerson === 'both' ? 'shubham' : currentPerson
        const taskId = nanoid()

        try {
            await goalsRepo.addGoal({
                person: uploader,
                title: taskFormData.title,
                description: taskFormData.description,
                priority: taskFormData.priority,
                deadline: taskFormData.deadline ? new Date(taskFormData.deadline) : undefined,
                isCompleted: false
            }, taskId)

            await addGoalToFirebase({
                person: uploader,
                title: taskFormData.title,
                description: taskFormData.description,
                priority: taskFormData.priority,
                deadline: taskFormData.deadline ? new Date(taskFormData.deadline) : undefined,
                isCompleted: false
            }, taskId)

            // Activity Log
            await logActivityToFirebase({
                person: uploader,
                type: 'task',
                title: 'New Task',
                message: `${uploader === 'shubham' ? 'Shubham' : 'Khushi'} assigned a new task: "${taskFormData.title.substring(0, 30)}${taskFormData.title.length > 30 ? '...' : ''}" 🎯`
            })

            setIsTaskDialogOpen(false)
            setTaskFormData({ title: "", description: "", priority: "medium", deadline: "" })
        } catch (error) {
            console.error("Failed to add task:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.content.trim()) return

        const uploader = currentPerson === 'both' ? 'shubham' : currentPerson
        const noteId = nanoid()

        try {
            await notesRepo.addNote({
                person: uploader,
                content: formData.content,
                type: formData.type,
                color: formData.color,
                isPinned: false,
                linkedUrl: formData.linkedUrl
            }, noteId)

            // Firebase Sync
            await addNoteToFirebase({
                person: uploader,
                content: formData.content,
                type: formData.type,
                color: formData.color,
                isPinned: false,
                linkedUrl: formData.linkedUrl
            }, noteId)

            // Activity Log
            await logActivityToFirebase({
                person: uploader,
                type: 'note',
                title: 'New Note',
                message: `Chal chal chal! ${uploader === 'shubham' ? 'Shubham' : 'Khushi'} just left a motivating note for you: "${formData.content.substring(0, 30)}${formData.content.length > 30 ? '...' : ''}" 💖 Go read it!`
            })

            setIsDialogOpen(false)
            setFormData({ content: "", type: "thought", color: NOTE_COLORS[0], isPinned: false, linkedUrl: "" })
        } catch (error) {
            console.error("Failed to add note:", error)
        }
    }

    const sortedNotes = filteredNotes ? [...filteredNotes].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
    }) : []

    return (
        <PageWrapper className="space-y-4 md:space-y-6 pt-1 md:pt-4 pb-24">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-6">
                <div className="space-y-0.5">
                    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-pink-500 mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>We showed up today</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-night-950 tracking-tight leading-none">Our Shared Space</h1>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 w-full md:w-auto">
                    <div className="bg-muted p-1 rounded-2xl flex items-center w-full md:w-auto">
                        <button
                            onClick={() => setViewMode('notes')}
                            className={cn("px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all text-center flex-1 md:flex-initial", viewMode === 'notes' ? "bg-white text-night-950 shadow-sm" : "text-night-500")}
                        >
                            Notes
                        </button>
                        <button
                            onClick={() => setViewMode('tasks')}
                            className={cn("px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all text-center flex-1 md:flex-initial", viewMode === 'tasks' ? "bg-white text-night-950 shadow-sm" : "text-night-500")}
                        >
                            Tasks
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Link href="/archive" className="flex-1 md:flex-initial">
                            <Button variant="ghost" className="w-full text-[10px] md:text-xs font-black text-night-600 hover:text-pink-500 h-11 px-2 md:px-4">
                                Gallery
                            </Button>
                        </Link>
                        
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className={cn("flex-[2] md:flex-initial rounded-xl shadow-sm bg-pink-500 hover:bg-pink-600 text-white font-black h-11 px-4 md:px-6 text-[10px] md:text-xs uppercase tracking-widest", viewMode !== 'notes' && "hidden")}>
                                    <Plus className="mr-1 md:mr-2 w-3.5 h-3.5 md:w-4 md:h-4" />
                                    Write
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[2.5rem]">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-night-950">Add a sticky note 📝</DialogTitle>
                                </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-night-600">What's on your mind?</label>
                                    <Textarea
                                        id="note-content"
                                        name="note-content"
                                        value={formData.content}
                                        onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                        placeholder="Write something sweet or inspiring..."
                                        className="min-h-[140px] rounded-2xl border-night-100 focus-visible:ring-night-200 text-night-950 font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-night-600">Note Type</label>
                                        <div className="flex flex-wrap gap-2">
                                            {NOTE_TYPES.map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                                                    className={cn(
                                                        "p-3 rounded-xl transition-all border-2",
                                                        formData.type === type.id
                                                        ? "bg-night-950 border-night-950 text-white shadow-md scale-105"
                                                        : "bg-muted border-border text-muted-foreground hover:border-muted-foreground"
                                                    )}
                                                    title={type.label}
                                                >
                                                    <type.icon className="w-5 h-5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-night-600">Color</label>
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

                    <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className={cn("flex-[2] md:flex-initial rounded-xl shadow-sm bg-pink-500 hover:bg-pink-600 text-white font-black h-11 px-4 md:px-6 text-[10px] md:text-xs uppercase tracking-widest", viewMode !== 'tasks' && "hidden")}>
                                <Plus className="mr-1 md:mr-2 w-3.5 h-3.5 md:w-4 md:h-4" />
                                Add Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-night-950">Add a new task 🎯</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleTaskSubmit} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-night-600">What needs to be done?</label>
                                    <Textarea
                                        value={taskFormData.title}
                                        onChange={e => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="E.g., Finish the new logo design"
                                        className="min-h-[140px] rounded-2xl border-night-100 focus-visible:ring-night-200 text-night-950 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-night-600">Priority</label>
                                    <div className="flex gap-2">
                                        {(['low', 'medium', 'high'] as const).map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setTaskFormData(prev => ({ ...prev, priority: p }))}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                                    taskFormData.priority === p 
                                                    ? (p === 'high' ? "bg-red-500 text-white" : p === 'medium' ? "bg-yellow-500 text-white" : "bg-green-500 text-white") 
                                                    : "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-night-600">Goal Description (Optional)</label>
                                    <Textarea
                                        value={taskFormData.description}
                                        onChange={e => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Add more details about what needs to be done..."
                                        className="min-h-[80px] rounded-2xl border-night-100 focus-visible:ring-night-200 text-night-950 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-night-600">Deadline (Optional)</label>
                                    <input
                                        type="date"
                                        value={taskFormData.deadline}
                                        onChange={e => setTaskFormData(prev => ({ ...prev, deadline: e.target.value }))}
                                        className="w-full rounded-2xl border border-night-100 h-12 px-4 focus-visible:ring-night-200 text-night-950 font-bold bg-white"
                                    />
                                </div>
                                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black bg-night-950 hover:bg-night-800 tracking-tight">
                                    Add Task
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col space-y-3 py-2 md:py-4 relative">
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pr-8">
                    {/* Person Toggle */}
                    <div className="flex bg-muted border border-border rounded-full p-1 shrink-0">
                        {[
                            { id: 'all', label: 'All', icon: <span className="text-xs">✨</span> },
                            { id: 'shubham', label: 'Shubham', image: '/shubham.jpg' },
                            { id: 'khushi', label: 'Khushi', image: '/khushi.jpg' }
                        ].map(p => (
                            <button
                                key={p.id}
                                onClick={() => setActivePerson(p.id)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[10px] md:text-sm font-black uppercase tracking-tighter transition-all flex items-center gap-1.5 whitespace-nowrap",
                                    activePerson === p.id ? "bg-night-950 text-white" : "text-night-600 hover:text-night-600"
                                )}
                            >
                                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full overflow-hidden flex items-center justify-center bg-night-100">
                                    {p.image ? (
                                        <Image src={p.image} alt={p.label} width={20} height={20} className="w-full h-full object-cover" />
                                    ) : (
                                        p.icon
                                    )}
                                </div>
                                <span>{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {viewMode === 'notes' && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button
                            onClick={() => setFilterType('all')}
                            className={cn(
                                "px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                filterType === 'all' ? "bg-pink-500 text-white"
                                : "bg-muted text-muted-foreground border border-border hover:border-border"
                            )}
                        >
                            All Types
                        </button>
                        {NOTE_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setFilterType(type.id)}
                                className={cn(
                                    "flex items-center space-x-2 px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    filterType === type.id ? "bg-pink-500 text-white" : "bg-white text-night-600 border border-night-100 hover:border-night-200"
                                )}
                            >
                                <type.icon className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                <span>{type.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Grid Section */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-[240px] rounded-[2.5rem] bg-muted animate-pulse border border-border" />
                    ))}
                </div>
            ) : viewMode === 'notes' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
                                note.isPinned ? "border-night-950/20 shadow-md rotate-[0.5deg] sm:rotate-1" : "border-black/5 -rotate-[0.5deg] sm:-rotate-1 hover:rotate-0"
                            )}>
                                <CardContent className="p-4 md:p-6 h-full flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex -space-x-2">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-xs shadow-sm bg-blue-100",
                                                        note.person === 'shubham' ? "z-10" : "opacity-30 scale-90 grayscale"
                                                    )}>
                                                        <Image src="/shubham.jpg" alt="Shubham" width={32} height={32} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-xs shadow-sm bg-pink-100",
                                                        note.person === 'khushi' ? "z-10" : "opacity-30 scale-90 grayscale"
                                                    )}>
                                                        <Image src="/khushi.jpg" alt="Khushi" width={32} height={32} className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-night-950/40 uppercase tracking-widest pl-2">
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
                                                    note.isPinned ? "bg-night-950 text-white shadow-lg" : "bg-black/5 text-night-500 hover:text-night-500"
                                                )}
                                            >
                                                <Pin className={cn("w-3.5 h-3.5", note.isPinned && "fill-current")} />
                                            </button>
                                        </div>

                                        <p className="font-handwritten text-xl md:text-2xl leading-snug text-night-950">
                                            {note.content}
                                        </p>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-4">
                                        <span className="text-xs font-bold text-night-950/40 italic">
                                            {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                                        </span>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm("Are you sure you want to delete this note? This cannot be undone.")) {
                                                        await notesRepo.deleteNote(note.id);
                                                        await deleteNoteFromFirebase(note.id);
                                                    }
                                                }}
                                                className="p-1.5 hover:bg-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Note Reactions */}
                                    <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-black/5">
                                        {NOTE_REACTIONS.map((r) => {
                                            const count = note.reactions?.filter(x => x.emoji === r.emoji).length || 0;
                                            const userReacted = note.reactions?.some(x => x.emoji === r.emoji && x.byPersona === (currentPerson === 'both' ? 'shubham' : currentPerson));

                                            return (
                                                <button
                                                    key={r.emoji}
                                                    onClick={() => handleNoteReaction(note.id, r.emoji)}
                                                    className={cn(
                                                        "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all",
                                                        userReacted 
                                                            ? "bg-white/40 ring-1 ring-black/10" 
                                                            : "bg-black/5 hover:bg-black/10"
                                                    )}
                                                >
                                                    <span>{r.emoji}</span>
                                                    {count > 0 && <span>{count}</span>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            ) : viewMode === 'tasks' ? (
                <div className="space-y-4 max-w-4xl mx-auto">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.map(task => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "flex items-center gap-4 bg-white dark:bg-card p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md",
                                    task.isCompleted ? "opacity-60 grayscale" : "border-night-100"
                                )}
                            >
                                <button
                                    onClick={async () => {
                                        const newState = !task.isCompleted;
                                        await goalsRepo.toggleGoalCompletion(task.id);
                                        await toggleGoalCompletionInFirebase(task.id, newState);
                                        
                                        const uploader = currentPerson === 'both' ? 'shubham' : currentPerson;
                                        await logActivityToFirebase({
                                            person: uploader,
                                            type: 'task',
                                            title: 'Task Updated',
                                            message: `${uploader === 'shubham' ? 'Shubham' : 'Khushi'} just ${newState ? 'completed' : 'uncompleted'} the task: "${task.title.substring(0, 30)}${task.title.length > 30 ? '...' : ''}" ${newState ? '✅' : '🔄'}`
                                        });
                                    }}
                                    className="flex-shrink-0 text-pink-500 hover:scale-110 transition-transform"
                                >
                                    {task.isCompleted ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 text-pink-500"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4" stroke="white" strokeWidth="3"/></svg> : <div className="w-6 h-6 rounded-full border-2 border-night-200"></div>}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={cn("text-lg font-bold truncate", task.isCompleted ? "line-through text-night-400" : "text-night-950")}>
                                        {task.title}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <div className="flex -space-x-1.5 shrink-0">
                                            <div className={cn("w-5 h-5 rounded-full border border-white overflow-hidden flex items-center justify-center text-[10px] bg-muted", task.person === 'shubham' || task.person === 'shared' ? "z-10" : "opacity-30 grayscale")}>
                                                <Image src="/shubham.jpg" alt="Shubham" width={20} height={20} className="w-full h-full object-cover" />
                                            </div>
                                            <div className={cn("w-5 h-5 rounded-full border border-white overflow-hidden flex items-center justify-center text-[10px] bg-muted", task.person === 'khushi' || task.person === 'shared' ? "z-10" : "opacity-30 grayscale")}>
                                                <Image src="/khushi.jpg" alt="Khushi" width={20} height={20} className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-l-2",
                                            task.priority === 'high' ? "bg-red-50 text-red-600 border-red-500" : task.priority === 'medium' ? "bg-yellow-50 text-yellow-600 border-yellow-500" : "bg-green-50 text-green-600 border-green-500"
                                        )}>
                                            {task.priority} priority
                                        </span>
                                        {task.deadline && (
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                                By {new Date(task.deadline).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    {task.description && (
                                        <div className="min-h-[60px] sm:min-h-0">
                                            <p className="text-xs text-night-500 mt-2 font-bold line-clamp-2">
                                                {task.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={async () => {
                                        if (window.confirm("Delete this task?")) {
                                            await goalsRepo.deleteGoal(task.id);
                                            await deleteGoalFromFirebase(task.id);
                                            
                                            const uploader = currentPerson === 'both' ? 'shubham' : currentPerson;
                                            await logActivityToFirebase({
                                                person: uploader,
                                                type: 'task',
                                                title: 'Task Deleted',
                                                message: `${uploader === 'shubham' ? 'Shubham' : 'Khushi'} deleted the task: "${task.title.substring(0, 30)}${task.title.length > 30 ? '...' : ''}" 🗑️`
                                            });
                                        }
                                    }}
                                    className="p-2 hover:bg-red-50 hover:text-red-500 text-night-400 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : null}

            {/* Empty State Section */}
            {viewMode === 'notes' && sortedNotes.length === 0 && (
                <div className="relative py-20 px-8 rounded-[4rem] border border-dashed border-night-200 bg-night-50/50 backdrop-blur-sm flex flex-col items-center text-center space-y-8 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, #000 2px, transparent 0)', backgroundSize: '24px 24px' }} />

                    <div className="space-y-3 relative z-10">
                        <div className="text-5xl mb-6">🏡</div>
                        <h3 className="text-3xl font-black text-night-950 tracking-tight">Our shared space is waiting.</h3>
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
                                <h4 className="text-xs font-black uppercase tracking-widest text-night-900">{p.title}</h4>
                                <p className="text-xs text-night-600 font-bold leading-relaxed group-hover:text-night-900 transition-colors">{p.prompt}</p>
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

            {viewMode === 'tasks' && filteredTasks.length === 0 && (
                <div className="relative py-20 px-8 rounded-[4rem] border border-dashed border-night-200 bg-night-50/50 backdrop-blur-sm flex flex-col items-center text-center space-y-8 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, #000 2px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div className="space-y-3 relative z-10">
                        <div className="text-5xl mb-6">🎯</div>
                        <h3 className="text-3xl font-black text-night-950 tracking-tight">No tasks yet.</h3>
                        <p className="text-night-500 font-bold max-w-sm mx-auto text-sm">
                            Add a to-do item for yourself or your partner.
                        </p>
                    </div>
                    <Button
                        size="lg"
                        onClick={() => setIsTaskDialogOpen(true)}
                        className="rounded-2xl bg-night-950 hover:bg-night-800 text-white font-black h-16 px-12 relative z-10 shadow-xl text-lg tracking-tight"
                    >
                        Add your first task
                    </Button>
                </div>
            )}
        </PageWrapper>
    )
}
