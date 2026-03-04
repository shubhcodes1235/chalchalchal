// src/components/upload/upload-form.tsx
"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TOOLS } from "@/lib/constants/tools"
import { cn } from "@/lib/utils/cn"
import { X } from "lucide-react"

interface UploadFormProps {
    onSubmit: (data: any) => void;
    isLoading: boolean;
    initialPrompt?: string;
}

export function UploadForm({ onSubmit, isLoading, initialPrompt }: UploadFormProps) {
    const [formData, setFormData] = useState({
        title: initialPrompt || "",
        description: "",
        tool: "photoshop",
        toolDetail: "",
        moodRating: 3 as 1 | 2 | 3 | 4 | 5,
        workType: "practice" as "practice" | "client",
        tags: [] as string[]
    })
    const [currentTag, setCurrentTag] = useState("")

    const moods = [
        { rating: 1, emoji: "😕" },
        { rating: 2, emoji: "😐" },
        { rating: 3, emoji: "🙂" },
        { rating: 4, emoji: "😊" },
        { rating: 5, emoji: "🤩" },
    ]

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(currentTag.trim().toLowerCase())) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, currentTag.trim().toLowerCase()]
                }))
            }
            setCurrentTag("")
        }
    }

    const removeTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }))
    }

    return (
        <form className="space-y-8 pb-12" onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            <div className="space-y-4">
                <label htmlFor="design-title" className="text-sm font-bold text-night-500 uppercase tracking-widest px-1">Design Info</label>
                <Input
                    id="design-title"
                    name="title"
                    placeholder="Title of your masterpiece"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                />
                <Textarea
                    id="design-description"
                    name="description"
                    placeholder="What's the story behind this one? (optional)"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tool Selector */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-night-500 uppercase tracking-widest px-1">Tool Used</label>
                    <div className="grid grid-cols-5 gap-2">
                        {TOOLS.map((tool) => (
                            <button
                                key={tool.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, tool: tool.id }))}
                                className={cn(
                                    "p-3 rounded-2xl flex flex-col items-center justify-center space-y-2 border-2 transition-all",
                                    formData.tool === tool.id
                                        ? "border-pink-500 bg-pink-50 text-pink-700 shadow-sm"
                                        : "border-pink-50 bg-white text-night-500 hover:border-pink-200"
                                )}
                            >
                                <tool.icon className="w-6 h-6" />
                                <span className="text-xs font-bold truncate w-full uppercase">{tool.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mood Selector */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-night-500 uppercase tracking-widest px-1">How do you feel about it?</label>
                    <div className="flex items-center justify-around bg-white border-2 border-pink-50 rounded-3xl p-3">
                        {moods.map((m) => (
                            <motion.button
                                key={m.rating}
                                type="button"
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setFormData(prev => ({ ...prev, moodRating: m.rating as any }))}
                                className={cn(
                                    "text-3xl transition-all",
                                    formData.moodRating === m.rating ? "filter-none scale-125 opacity-100" : "grayscale opacity-40"
                                )}
                            >
                                {m.emoji}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <label htmlFor="design-tags" className="text-sm font-bold text-night-500 uppercase tracking-widest px-1">Tags</label>
                <Input
                    id="design-tags"
                    name="tags"
                    placeholder="Type a tag and press enter"
                    value={currentTag}
                    onChange={e => setCurrentTag(e.target.value)}
                    onKeyDown={handleAddTag}
                />
                <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                        <Badge key={tag} className="pl-3 pr-1 py-1 flex items-center space-x-1">
                            <span>#{tag}</span>
                            <button onClick={() => removeTag(tag)} className="hover:text-red-500 p-0.5">
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                    {formData.tags.length === 0 && <p className="text-xs text-night-500 italic">No tags added yet</p>}
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <label className="text-sm font-bold text-night-500 uppercase tracking-widest px-1">Type:</label>
                <div className="flex bg-white rounded-full p-1 border-2 border-pink-50">
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, workType: "practice" }))}
                        className={cn(
                            "px-6 py-2 rounded-full text-xs font-bold transition-all",
                            formData.workType === "practice" ? "bg-pink-500 text-white shadow-sm" : "text-night-600"
                        )}
                    >
                        Practice
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, workType: "client" }))}
                        className={cn(
                            "px-6 py-2 rounded-full text-xs font-bold transition-all",
                            formData.workType === "client" ? "bg-pink-500 text-white shadow-sm" : "text-night-600"
                        )}
                    >
                        Client Work
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                size="lg"
                className="w-full h-16 rounded-3xl text-xl shadow-glow"
                disabled={isLoading}
            >
                {isLoading ? "Saving Masterpiece..." : "Save Design to Archive 🎉"}
            </Button>
        </form>
    )
}
