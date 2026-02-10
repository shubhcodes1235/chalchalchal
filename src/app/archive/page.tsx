// src/app/archive/page.tsx
"use client"

import React, { useState } from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { DesignCard } from "@/components/archive/design-card"
import { TOOLS } from "@/lib/constants/tools"
import { cn } from "@/lib/utils/cn"
import { Search, History, MessageSquareHeart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"
import { useAppStore } from "@/lib/store/app-store"
import { Design } from "@/lib/db/schemas"

const EMPTY_ARRAY: Design[] = []

export default function ArchivePage() {
    const { currentPerson, setCurrentPerson } = useAppStore()
    const [activeTool, setActiveTool] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null)

    // Local Query Logic
    const liveDesigns = useLiveQuery(
        async () => {
            const collection = db.designs.orderBy('createdAt').reverse();
            const results = await collection.toArray();
            return results;
        },
        []
    );
    const designs = liveDesigns || EMPTY_ARRAY;

    // Filter Logic (Client-side for simplicity and speed)
    const filteredDesigns = React.useMemo(() => {
        let results = designs;

        if (activeTool !== "all") {
            results = results.filter(d => d.tool === activeTool);
        }

        if (currentPerson !== "both") {
            results = results.filter(d => d.person === currentPerson);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            results = results.filter(d =>
                d.title.toLowerCase().includes(q) ||
                d.description?.toLowerCase().includes(q) ||
                d.tags.some(t => t.toLowerCase().includes(q))
            );
        }
        return results;
    }, [designs, activeTool, currentPerson, searchQuery])

    return (
        <PageWrapper className="space-y-6 pt-4 pb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-night-950 tracking-tightest leading-none">Our Journey</h1>
                    <p className="text-[10px] text-pink-500 font-bold uppercase tracking-[0.2em] opacity-60">
                        {designs?.length || 0} memories collected
                    </p>
                </div>

                <div className="flex items-center space-x-2">
                    <Link href="/board">
                        <Button variant="ghost" className="text-xs font-bold text-night-400 hover:text-pink-500">
                            Reflect
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setActiveTool("all")}
                            className={cn(
                                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTool === "all" ? "bg-night-950 text-white" : "bg-white text-night-400 border border-night-100 hover:border-night-300"
                            )}
                        >
                            All
                        </button>
                        {TOOLS.map(tool => {
                            const Icon = tool.icon;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => setActiveTool(tool.id)}
                                    className={cn(
                                        "flex items-center space-x-1.5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTool === tool.id ? "bg-night-950 text-white" : "bg-white text-night-400 border border-night-100 hover:border-night-300"
                                    )}
                                >
                                    <Icon className="w-3 h-3" />
                                    <span>{tool.name}</span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="relative w-full sm:w-auto min-w-[200px] group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night-400 group-focus-within:text-pink-500 transition-colors" />
                        <Input
                            placeholder="Search memories..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 rounded-xl border-night-100 focus-visible:ring-pink-200 h-10 bg-white text-night-950 placeholder:text-night-300 font-bold text-xs w-full shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Gallery Grid - Denser 'Browse' Feel */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredDesigns.map((design) => (
                        <DesignCard
                            key={design.id}
                            design={design}
                            onClick={(d) => setSelectedDesignId(d.id || null)}
                        />
                    ))}

                    {/* Expectant Ghost Card if few items */}
                    {filteredDesigns.length > 0 && filteredDesigns.length < 6 && (
                        <div className="border border-dashed border-night-200 rounded-3xl flex flex-col items-center justify-center p-8 text-night-300 aspect-square group hover:border-pink-300 transition-colors cursor-pointer" onClick={() => window.location.href = '/upload'}>
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">✨</div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Add more</span>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {
                filteredDesigns.length === 0 && (
                    <div className="text-center py-24 space-y-4">
                        <div className="text-6xl grayscale opacity-30">🔍</div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-night-950">No memories found</h3>
                            <p className="text-xs text-night-400 font-bold">Try adjusting your filters or search.</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setActiveTool("all"); setCurrentPerson("both"); setSearchQuery(""); }}
                            className="text-[10px] uppercase font-black tracking-widest rounded-xl"
                        >
                            Clear all filters
                        </Button>
                    </div>
                )
            }

            {/* Lightbox / Full Preview */}
            <Dialog open={!!selectedDesignId} onOpenChange={() => setSelectedDesignId(null)}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-night-950/95 overflow-hidden flex items-center justify-center rounded-[3rem]">
                    {selectedDesignId && designs?.find(d => d.id === selectedDesignId) && (() => {
                        const d = designs.find(d => d.id === selectedDesignId)!;
                        const tool = TOOLS.find(t => t.id === d.tool);
                        return (
                            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                                <div className="absolute top-8 left-8 z-50 text-white space-y-1">
                                    <h2 className="text-2xl font-black tracking-tight">{d.title}</h2>
                                    <div className="flex items-center space-x-3">
                                        <p className="text-[10px] opacity-70 font-black uppercase tracking-widest">{tool?.name}</p>
                                        <span className="w-1 h-1 rounded-full bg-white/30" />
                                        <p className="text-[10px] opacity-70 font-black uppercase tracking-widest capitalize">{d.person}</p>
                                    </div>

                                    {/* CONTEXTUAL LINE FOR KHUSHI */}
                                    {d.person === 'khushi' && (
                                        <p className="text-xs text-pink-200/80 font-medium mt-2 italic">
                                            &quot;Created after a long day — still showed up.&quot;
                                        </p>
                                    )}
                                </div>

                                <div className="relative w-full h-[75vh] mt-12 shadow-2xl rounded-2xl overflow-hidden">
                                    {(d.thumbnailBlob || d.imageUrl) && (
                                        <Image
                                            src={d.thumbnailBlob ? URL.createObjectURL(d.thumbnailBlob) : (d.imageUrl || '')}
                                            alt={d.title}
                                            fill
                                            className="object-contain"
                                            priority
                                        />
                                    )}
                                </div>

                                <div className="mt-8 flex items-center justify-center space-x-6">
                                    <Link href="/board" className="group">
                                        <div className="flex flex-col items-center space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                                <MessageSquareHeart className="w-6 h-6 text-white" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white">Share a thought</span>
                                        </div>
                                    </Link>
                                    <div className="w-px h-10 bg-white/10" />
                                    <Link href="/progress" className="group">
                                        <div className="flex flex-col items-center space-y-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                                <History className="w-6 h-6 text-white" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white">View Growth</span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )
                    })()}
                </DialogContent>
            </Dialog>
        </PageWrapper>
    )
}
