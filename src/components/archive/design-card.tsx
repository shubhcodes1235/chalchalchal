// src/components/archive/design-card.tsx
"use client"

import React from "react"
import { Design } from "@/lib/db/schemas"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TOOLS } from "@/lib/constants/tools"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Flame } from "lucide-react"

interface DesignCardProps {
    design: Design;
    onClick: (design: Design) => void;
    priority?: boolean;
}

export const DesignCard = React.forwardRef<HTMLDivElement, DesignCardProps>(
    ({ design, onClick, priority = false }, ref) => {
        const tool = TOOLS.find(t => t.id === design.tool) || TOOLS[TOOLS.length - 1];
        const ToolIcon = tool.icon;

        return (
            <motion.div
                ref={ref}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
            >
                <Card
                    className="overflow-hidden border-none cursor-pointer h-full group relative transition-all duration-200 rounded-xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-night-900/5 bg-white"
                    onClick={() => onClick(design)}
                >
                    <div className="aspect-square relative bg-night-100 overflow-hidden">
                        {(design.thumbnailBlob || design.thumbnailUrl || design.imageUrl) ? (
                            <Image
                                src={design.thumbnailBlob ? URL.createObjectURL(design.thumbnailBlob) : (design.thumbnailUrl || design.imageUrl || '')}
                                alt={design.title}
                                fill
                                priority={priority}
                                className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl grayscale opacity-10">🎨</div>
                        )}

                        {/* Minimal Tool Label */}
                        <div className="absolute top-2 left-2 z-10">
                            <div className="bg-night-950 text-white px-2 py-1 rounded shadow-lg flex items-center space-x-1">
                                <ToolIcon className="w-2.5 h-2.5" />
                                <span className="text-[7px] font-black uppercase tracking-widest">{tool.name}</span>
                            </div>
                        </div>

                        {/* Minimal Person Indicator */}
                        <div className="absolute top-2 right-2 z-10">
                            <div className="w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center text-xs border border-night-100 font-bold">
                                {design.person === 'shubham' ? '👦' : '👧'}
                            </div>
                        </div>
                    </div>

                    <CardContent className="p-2.5 space-y-0.5">
                        <h4 className="text-[13px] font-black text-night-950 truncate tracking-tight">
                            {design.title}
                        </h4>
                        <p className="text-sm text-night-600 font-bold uppercase tracking-tighter">
                            {formatDistanceToNow(design.createdAt, { addSuffix: true })}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }
)

DesignCard.displayName = "DesignCard"
