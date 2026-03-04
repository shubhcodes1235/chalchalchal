// src/app/dream-board/page.tsx
"use client"

import React, { useState } from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { useAppStore } from "@/lib/store/app-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Target, Heart, ExternalLink, Trash2, Rocket } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { nanoid } from "nanoid"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { cn } from "@/lib/utils/cn"

export default function DreamBoardPage() {
    const { currentPerson } = useAppStore()
    const items = useLiveQuery(() =>
        db.dreamBoardItems.orderBy('createdAt').reverse().toArray()
    )

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        imageUrl: "",
        targetDate: "",
        category: "personal" as "shared" | "personal"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title.trim()) return

        await db.dreamBoardItems.add({
            id: nanoid(),
            person: formData.category === 'shared' ? 'both' : currentPerson,
            title: formData.title,
            imageUrl: formData.imageUrl,
            category: formData.category,
            isAchieved: false,
            targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
            createdAt: new Date()
        })

        setIsDialogOpen(false)
        setFormData({ title: "", imageUrl: "", targetDate: "", category: "personal" })
    }

    const deleteItem = async (id: string) => {
        await db.dreamBoardItems.delete(id)
    }

    return (
        <PageWrapper className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-handwritten font-bold text-pink-700">The Dream Board</h1>
                    <p className="text-night-500">Visualizing where we will be very soon. Dream big, design harder.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="rounded-3xl shadow-glow">
                            <Plus className="mr-2 w-5 h-5" />
                            Add to Vision
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>What are we dreaming about? ✨</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="space-y-4">
                                <Input
                                    id="dream-title"
                                    name="dream-title"
                                    placeholder="Title of the dream (e.g. First MacBook Pro)"
                                    value={formData.title}
                                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                />
                                <Input
                                    id="dream-image"
                                    name="dream-image"
                                    placeholder="Image URL (optional)"
                                    value={formData.imageUrl}
                                    onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                />
                                <Input
                                    id="dream-date"
                                    name="dream-date"
                                    type="date"
                                    value={formData.targetDate}
                                    onChange={e => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                                />
                                <div className="flex bg-pink-50 rounded-2xl p-1">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, category: 'personal' }))}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                                            formData.category === 'personal' ? "bg-white text-pink-600 shadow-sm" : "text-night-600"
                                        )}
                                    >
                                        For Me
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, category: 'shared' }))}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                                            formData.category === 'shared' ? "bg-white text-pink-600 shadow-sm" : "text-night-600"
                                        )}
                                    >
                                        For Us
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-3xl">Manifest It</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                <AnimatePresence>
                    {items?.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -10 }}
                        >
                            <Card className={cn(
                                "h-full overflow-hidden border-2 relative group",
                                item.category === 'shared' ? "border-pink-200" : "border-white"
                            )}>
                                {/* Achieved Overlay */}
                                {item.isAchieved && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in">
                                        <div className="p-4 rounded-full bg-green-500 text-white shadow-glow mb-4">
                                            <Rocket className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-black text-green-600">MISSION ACCOMPLISHED!</h3>
                                    </div>
                                )}

                                <div className="aspect-video relative bg-pink-50 overflow-hidden">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-pink-200">✨</div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <Badge className={cn(
                                            "shadow-sm border-2 border-white",
                                            item.category === 'shared' ? "bg-pink-500" : "bg-night-800"
                                        )}>
                                            {item.category === 'shared' ? 'TEAM GOAL' : 'PERSONAL'}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-6 space-y-4">
                                    <h3 className="text-xl font-bold text-night-900 leading-tight">{item.title}</h3>
                                    {item.targetDate && (
                                        <div className="flex items-center text-xs font-bold text-pink-500 uppercase tracking-widest">
                                            <Target className="w-3.5 h-3.5 mr-2" />
                                            Target: {format(new Date(item.targetDate), 'MMM yyyy')}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-2">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            className="rounded-xl px-4"
                                            onClick={async () => {
                                                await db.dreamBoardItems.update(item.id, { isAchieved: !item.isAchieved })
                                            }}
                                        >
                                            {item.isAchieved ? "Not yet" : "Did it! 🎉"}
                                        </Button>
                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="text-night-200 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {items && items.length === 0 && (
                <div className="text-center py-24 glass rounded-4xl border-2 border-dashed border-pink-200 opacity-80">
                    <Heart className="w-12 h-12 text-pink-300 mx-auto mb-4" />
                    <p className="text-night-600 font-handwritten text-xl">What does our future look like?</p>
                </div>
            )}
        </PageWrapper>
    )
}
