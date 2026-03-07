// src/components/archive/design-card.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Design } from "@/lib/db/schemas"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TOOLS } from "@/lib/constants/tools"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Flame } from "lucide-react"
import { PERSONS } from "@/lib/constants/persons"

interface DesignCardProps {
    design: Design;
    onClick: (design: Design) => void;
    priority?: boolean;
}

export const DesignCard = React.forwardRef<HTMLDivElement, DesignCardProps>(
    ({ design, onClick, priority = false }, ref) => {
        const tool = TOOLS.find(t => t.id === design.tool) || TOOLS[TOOLS.length - 1];
        const ToolIcon = tool.icon;

        const [imageUrl, setImageUrl] = useState<string>("");

        useEffect(() => {
            if (design.thumbnailBlob) {
                const url = URL.createObjectURL(design.thumbnailBlob);
                setImageUrl(url);
                return () => URL.revokeObjectURL(url);
            } else {
                setImageUrl(design.thumbnailUrl || design.imageUrl || "");
            }
        }, [design.thumbnailBlob, design.thumbnailUrl, design.imageUrl]);

        return (
            <motion.div
                ref={ref}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
            >
                <Card
                    className="overflow-hidden border-none cursor-pointer h-full group relative transition-all duration-500 rounded-[2rem] shadow-sm hover:shadow-2xl bg-white dark:bg-card"
                    onClick={() => onClick(design)}
                >
                    <div className="aspect-[3/4] relative bg-night-50 dark:bg-night-900 overflow-hidden">
                        {(design.thumbnailBlob || design.thumbnailUrl || design.imageUrl) ? (
                            <Image
                                src={imageUrl}
                                alt={design.title}
                                fill
                                priority={priority}
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl grayscale opacity-10">🎨</div>
                        )}

                        {/* Top Labels: always visible on touch, hover-reveal on desktop */}
                        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                            <div 
                                className="px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 backdrop-blur-md border border-white/20"
                                style={{ backgroundColor: `${tool.color}cc`, color: 'white' }}
                            >
                                <ToolIcon className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{tool.name}</span>
                            </div>
                            
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center border border-white/20 transition-transform group-hover:rotate-12">
                                <Image src={PERSONS.find(p => p.id === design.person)?.image || '/shubham.jpg'} alt={design.person} width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                        </div>

                        {/* Bottom overlay: always visible on mobile, hover-reveal on desktop */}
                        <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                            <div className="space-y-2">
                                <h4 className="text-lg font-black text-white leading-tight line-clamp-2">
                                    {design.title}
                                </h4>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-white/70 font-black uppercase tracking-widest">
                                        {formatDistanceToNow(design.createdAt, { addSuffix: true })}
                                    </p>
                                    <div className="flex items-center gap-1 text-orange-400">
                                        <Flame className="w-3.5 h-3.5 fill-current" />
                                        <span className="text-xs font-black">{design.hypeCount || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Minimal badge: desktop only, hidden on mobile where overlay is always shown */}
                        <div className="absolute bottom-4 left-4 hidden sm:block group-hover:opacity-0 transition-opacity duration-300 z-10">
                            <div className="bg-white/90 dark:bg-night-950/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-black/5 dark:border-white/5 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-night-900 dark:text-white truncate max-w-[100px]">{design.title}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        )
    }
)

DesignCard.displayName = "DesignCard"
