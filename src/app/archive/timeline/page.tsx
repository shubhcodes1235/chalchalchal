"use client"

import React, { useState } from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { format } from "date-fns"
import Image from "next/image"
import { motion } from "framer-motion"
import { Sparkles, ArrowDown, History, Users } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { TOOLS } from "@/lib/constants/tools"
import { Design } from "@/lib/db/schemas"

export default function TimelinePage() {
    const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null)
    const designs = useLiveQuery(() =>
        db.designs.orderBy('createdAt').toArray()
    )

    if (!designs) return null;

    // Group designs by month
    const groupedDesigns = designs.reduce((acc: Record<string, Design[]>, design) => {
        const month = format(new Date(design.createdAt), 'MMMM yyyy')
        if (!acc[month]) acc[month] = []
        acc[month].push(design)
        return acc
    }, {})

    return (
        <PageWrapper className="max-w-5xl py-12 space-y-24">
            {/* Header: Emotional Intro */}
            <div className="text-center space-y-6 pt-10">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-pink-100 rounded-full text-pink-700 text-xs font-black uppercase tracking-widest shadow-sm">
                    <History className="w-3 h-3" />
                    <span>Reflection Mode</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-night-950 tracking-tight leading-tight">
                    Our Story of <br />
                    <span className="text-pink-600">Becoming.</span>
                </h1>
                <p className="max-w-xl mx-auto text-xl font-medium text-night-600 leading-relaxed italic opacity-80">
                    &quot;This isn&apos;t just an archive. It&apos;s the evidence that we didn&apos;t give up. Every pixel carries the weight of who we were, and who we&apos;re becoming.&quot;
                </p>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="pt-12 text-night-500"
                >
                    <ArrowDown className="mx-auto w-10 h-10" />
                </motion.div>
            </div>

            {/* Timeline Feed */}
            <div className="relative border-l-4 border-night-100 ml-6 md:ml-20 space-y-32">
                {Object.entries(groupedDesigns).map(([month, items]) => {
                    // Check for shared activity in this month
                    const hasShubham = items.some(d => d.person === 'shubham')
                    const hasKhushi = items.some(d => d.person === 'khushi')
                    const isSharedMonth = hasShubham && hasKhushi

                    return (
                        <div key={month} className="relative">
                            {/* Month Marker */}
                            <div className="absolute -left-[44px] top-0 w-9 h-9 rounded-full bg-white border-4 border-night-100 shadow-md flex items-center justify-center z-10">
                                <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-glow shadow-pink-500/50" />
                            </div>

                            <div className="ml-12 md:ml-16">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                                    <h2 className="text-4xl font-black text-night-950 tracking-tighter">
                                        {month}
                                    </h2>
                                    {isSharedMonth && (
                                        <div className="flex items-center space-x-2 text-pink-600 bg-pink-50 px-4 py-2 rounded-2xl border border-pink-100">
                                            <Users className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-widest">Shared History</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {items.map((design) => {
                                        const tool = TOOLS.find(t => t.id === design.tool);
                                        const ageInDays = Math.floor((Date.now() - design.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                                        // Nostalgia tint moved here (older = warmer)
                                        const filterIntensity = Math.min(ageInDays / 60, 1) * 0.1;

                                        return (
                                            <motion.div
                                                key={design.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                className="group"
                                            >
                                                <div
                                                    className="bg-white rounded-3xl p-4 shadow-soft hover:shadow-glow transition-all duration-500 border border-night-100 hover:border-pink-200 cursor-pointer"
                                                    onClick={() => setSelectedDesignId(design.id || null)}
                                                    style={{ backgroundColor: `rgba(255, 245, 230, ${filterIntensity})` }}
                                                >
                                                    <div className="aspect-square relative rounded-2xl overflow-hidden mb-6 shadow-inner bg-night-50">
                                                        {(design.thumbnailBlob || design.imageUrl) ? (
                                                            <Image
                                                                src={design.thumbnailBlob ? URL.createObjectURL(design.thumbnailBlob) : (design.imageUrl || '')}
                                                                alt={design.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-4xl grayscale opacity-20">🎨</div>
                                                        )}

                                                        {design.isFirstDesign && (
                                                            <div className="absolute top-4 left-4 z-20">
                                                                <div className="bg-pink-600 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg flex items-center space-x-2 border-2 border-white/30">
                                                                    <Sparkles className="w-3 h-3" />
                                                                    <span>Foundation Day</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-xl border border-night-100">
                                                            {design.person === 'shubham' ? '👦' : '👧'}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="text-2xl font-black text-night-950 tracking-tight leading-tight">
                                                                    {design.title}
                                                                </h3>
                                                                <p className="text-xs text-night-600 font-bold uppercase tracking-widest mt-1">
                                                                    {format(design.createdAt, 'do MMMM')} • {tool?.name}
                                                                </p>
                                                            </div>
                                                            <div className="text-3xl filter saturate-150">
                                                                {design.moodRating === 1 ? '🌧️' :
                                                                    design.moodRating === 2 ? '☁️' :
                                                                        design.moodRating === 3 ? '⛅' :
                                                                            design.moodRating === 4 ? '☀️' : '🌈'}
                                                            </div>
                                                        </div>

                                                        {/* The Story / Note */}
                                                        <div className="bg-night-50/50 rounded-2xl p-5 border border-night-100/50 relative">
                                                            <p className="text-sm text-night-700 leading-relaxed font-medium italic opacity-90">
                                                                &quot;{design.description || "In this moment, we were just being brave enough to create."}&quot;
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-32 text-center pb-32">
                <Sparkles className="w-16 h-16 text-pink-400 mx-auto mb-6 animate-pulse" />
                <h3 className="text-4xl font-black text-night-950 tracking-tighter">The journey continues...</h3>
                <p className="text-night-500 font-medium mt-4 max-w-md mx-auto italic">
                    &quot;Because every great designer was once a beginner who didn&apos;t stop.&quot;
                </p>
            </div>

            {/* Lightbox - Shared with Archive for consistency */}
            <Dialog open={!!selectedDesignId} onOpenChange={() => setSelectedDesignId(null)}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/95 overflow-hidden flex items-center justify-center">
                    {selectedDesignId && designs?.find(d => d.id === selectedDesignId) && (() => {
                        const d = designs.find(d => d.id === selectedDesignId)!;
                        return (
                            <div className="relative w-full h-full flex items-center justify-center p-4">
                                <div className="absolute top-6 left-8 z-50 text-white space-y-1">
                                    <h2 className="text-2xl font-black tracking-tight">{d.title}</h2>
                                    <p className="text-sm opacity-80 font-bold uppercase tracking-widest">{format(d.createdAt, 'PPP')}</p>
                                </div>

                                <div className="relative w-full h-[85vh]">
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
                            </div>
                        )
                    })()}
                </DialogContent>
            </Dialog>
        </PageWrapper>
    )
}
