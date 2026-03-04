// src/app/home/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { DreamProgressBar } from "@/components/home/dream-progress-bar"
import { TeamStreakCounter } from "@/components/home/team-streak-counter"
import { WinOfTheDay } from "@/components/home/win-of-the-day"
import { PartnerFeed } from "@/components/home/partner-feed"
import { VisionSnippet } from "@/components/home/vision-snippet"
import { FocusCard } from "@/components/home/focus-card"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Coins, Compass } from "lucide-react"
import { useAppStore } from "@/lib/store/app-store"
import { cn } from "@/lib/utils/cn"

export default function HomePage() {
    const { currentPerson } = useAppStore()
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 150);
        return () => clearTimeout(timer);
    }, []);

    const isKhushi = currentPerson === 'khushi'
    const isBoth = currentPerson === 'both'
    const isShubham = currentPerson === 'shubham'

    return (
        <PageWrapper className="flex flex-col items-center max-w-5xl mx-auto space-y-16 pt-8 pb-32 px-4">

            {/* 1. HERO SECTION: EARNING & EXPLORING */}
            <section className="w-full flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-4">
                
                {/* Connectivity Badge */}
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-md border border-pink-100/50 px-4 py-2 rounded-full shadow-sm">
                    <div className="flex -space-x-2">
                        <div className={cn("w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-sm bg-blue-100 transition-transform", isShubham || isBoth ? "scale-110 z-10" : "opacity-50 grayscale")}>👦</div>
                        <div className={cn("w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs shadow-sm bg-pink-100 transition-transform", isKhushi || isBoth ? "scale-110 z-10" : "opacity-50 grayscale")}>👧</div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-night-600">
                        {isBoth ? "Building Together" : isShubham ? "Shubham is active" : "Khushi is active"}
                    </span>
                </div>

                {/* Main Headline */}
                <div className="relative max-w-4xl mx-auto">
                    <div className="absolute -inset-10 bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-blue-500/10 blur-2xl rounded-[100%] opacity-70 pointer-events-none" />
                    <h1 className="relative text-5xl md:text-7xl lg:text-8xl font-poppins font-black tracking-tighter leading-[1.1] text-night-950">
                        Earn together.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500">
                            Explore everything.
                        </span>
                    </h1>
                </div>

                <div className="space-y-6 max-w-2xl mx-auto">
                    <p className="text-lg md:text-xl font-bold text-night-600/80 leading-relaxed px-4">
                        Financial freedom, endless opportunities, and a life designed entirely by us. Every design, every small step is building the dream.
                    </p>
                </div>

                {/* Primary Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                    <Link href="/upload">
                        <Button className="h-16 px-10 rounded-full bg-night-950 hover:bg-night-800 text-white text-lg font-black tracking-tight shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                            Push Today&apos;s Work
                            <ArrowRight className="ml-3 w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/board">
                        <Button variant="outline" className="h-16 px-10 rounded-full bg-white/50 border-2 border-night-100 hover:border-pink-300 hover:bg-white text-night-900 text-lg font-black tracking-tight transition-all duration-300">
                            Leave a Note 📝
                        </Button>
                    </Link>
                </div>
            </section>

            {/* 2. MANIFESTATION JOURNEY BAR */}
            {showContent && (
                <section className="w-full bg-white/40 backdrop-blur-md rounded-[3rem] p-8 md:p-12 border border-pink-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-night-950 tracking-tight flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-pink-500" />
                                Manifestation Journey
                            </h2>
                            <p className="text-sm font-bold text-night-500 mt-1">Tracking our path from where we are to financial freedom.</p>
                        </div>
                    </div>
                    <DreamProgressBar />
                </section>
            )}

            {/* 3. CORE ACTION GRID: Money & Vision */}
            {showContent && (
                <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-700 delay-150">
                    {/* The Hustle (Focus) */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 pl-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600">
                                <Coins className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest text-night-600">The Hustle</span>
                        </div>
                        <FocusCard />
                    </div>

                    {/* The Destination (Vision) */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 pl-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                                <Compass className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest text-night-600">The Destination</span>
                        </div>
                        <VisionSnippet />
                    </div>
                </section>
            )}

            {/* 4. MOMENTUM & WINS */}
            {showContent && (
                <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-700 delay-300">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pl-2">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-pink-500">Consistency Tracker</span>
                        </div>
                        <TeamStreakCounter />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between pl-2">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Daily Triumphs</span>
                        </div>
                        <WinOfTheDay />
                    </div>
                </section>
            )}

            {/* 5. LIVE CONNECTIVITY FEED */}
            {showContent && (
                <section className="w-full max-w-4xl mx-auto pt-16 border-t border-night-100/50 animate-in fade-in duration-700 delay-500">
                    <div className="text-center mb-10">
                        <h3 className="text-xl font-black text-night-900 tracking-tight">Our Live Thread</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-night-500 mt-2">See what's happening right now</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] p-6 border border-night-100/30">
                        <PartnerFeed />
                    </div>
                </section>
            )}

            {/* 6. FOOTER REMINDER */}
            <section className="w-full pt-20 pb-10 animate-in fade-in duration-1000 delay-700">
                <div className="text-center space-y-6">
                    <p className="font-poppins text-2xl md:text-3xl font-black text-night-400 tracking-tight">
                        "Chal chal chal — the world is ours to explore."
                    </p>
                    <div className="flex items-center justify-center space-x-4 opacity-40">
                        <div className="h-px w-8 bg-night-400" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-black text-night-600">
                            Never stop pushing
                        </span>
                        <div className="h-px w-8 bg-night-400" />
                    </div>
                </div>
            </section>

        </PageWrapper>
    )
}
