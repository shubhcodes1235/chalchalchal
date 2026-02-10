"use client"

import React from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function VisionSnippet() {
    // Rotating dream images (high quality, vibrant)
    const DREAM_IMAGES = [
        {
            url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=2400",
            label: "The Workspace",
            sub: "Where magic happens."
        },
        {
            url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2400",
            label: "Connection",
            sub: "Building with people."
        },
        {
            url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2400",
            label: "Freedom",
            sub: "Work from anywhere."
        }
    ]

    // Pick one based on day of year to keep it consistent for the day
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const dream = DREAM_IMAGES[dayOfYear % DREAM_IMAGES.length]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-80 rounded-[2.5rem] overflow-hidden shadow-xl group cursor-pointer border-4 border-white"
        >
            <img
                src={dream.url}
                alt={dream.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Subtle Gradient from bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

            <div className="absolute bottom-8 left-8 text-white space-y-1">
                <div className="flex items-center space-x-2 text-[11px] font-black uppercase tracking-[0.2em] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span>Manifesting</span>
                </div>
                <h3 className="text-4xl font-black font-poppins leading-none tracking-tight shadow-sm">
                    {dream.label}
                </h3>
                <p className="text-sm font-medium opacity-90 tracking-wide text-white/90">
                    {dream.sub}
                </p>
            </div>
        </motion.div>
    )
}
