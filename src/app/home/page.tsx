// src/app/home/page.tsx
"use client"

import React from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { ManifestationQuote } from "@/components/home/manifestation-quote"
import { TeamStreakCounter } from "@/components/home/team-streak-counter"
import { DreamProgressBar } from "@/components/home/dream-progress-bar"
import { QuickStats } from "@/components/home/quick-stats"
import { TodayPrompt } from "@/components/home/today-prompt"
import { WinOfTheDay } from "@/components/home/win-of-the-day"
import { UsMoment } from "@/components/home/us-moment"
import { PartnerFeed } from "@/components/home/partner-feed"
import { VisionSnippet } from "@/components/home/vision-snippet"
import { FocusCard } from "@/components/home/focus-card"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store/app-store"
import { cn } from "@/lib/utils/cn"

export default function HomePage() {
    const { currentPerson } = useAppStore()
    const [showSecondary, setShowSecondary] = useState(false);
    const [showDeep, setShowDeep] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setShowSecondary(true), 300);
        const timer2 = setTimeout(() => setShowDeep(true), 800);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    // Configuration for Content
    const isKhushi = currentPerson === 'khushi'
    const isBoth = currentPerson === 'both'
    const isShubham = currentPerson === 'shubham'

    const heroHeadline = isKhushi ? "You've got this." : isBoth ? "Two tired people.\nOne big dream." : "Make it count."
    const heroSubtext = isKhushi ? "Even on busy days, you're moving forward." : isBoth ? "Still figuring it out. Still showing up." : "Your journey starts today."

    // For Hero CTA
    const ctaText = isKhushi ? "Capture this moment 💗" : isBoth ? "Chal chal chal — Let's Go" : "Start Today's Design"

    // For Footer
    const footerQuote = isKhushi ? "\"You are enough, even on slow days.\"" : "\"Build together. Grow together. Never settle.\""

    // Grid Card Configuration
    // Slot 1: Growth/Streak (Shubham/Both) vs Us Moment/Support (Khushi)
    const showStreak = isShubham || isBoth;

    // Slot 2: Reflection/Win (Everyone)
    // Label
    const reflectionLabel = isKhushi ? "Reflection" : "Self-Love"
    // Label for Slot 1
    const slot1Label = isKhushi ? "My People" : isBoth ? "Our Streak" : "Growth"


    return (
        <PageWrapper className="flex flex-col items-center max-w-6xl mx-auto space-y-16 pt-12 pb-32">

            {/* 1. HERO SECTION: BOLD & MANIFESTING */}
            <section className="w-full flex flex-col items-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-blue-500/20 blur-xl rounded-full opacity-50" />
                    <h1 className="relative text-7xl md:text-9xl font-poppins font-black tracking-tighter leading-none text-night-950">
                        {isKhushi ? (
                            <>
                                You've got<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">this.</span>
                            </>
                        ) : (
                            <>
                                Make it<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">count.</span>
                            </>
                        )}
                    </h1>
                </div>

                <div className="space-y-6 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center space-x-3">
                        <div className="h-px w-12 bg-night-200" />
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-night-400">
                            {isKhushi ? "Even on busy days, you're growing" : "Your Journey Starts Today"}
                        </p>
                        <div className="h-px w-12 bg-night-200" />
                    </div>
                </div>

                <div className="pt-4">
                    <Link href="/upload">
                        <Button className="h-24 px-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-2xl font-black tracking-tight shadow-[0_10px_40px_-10px_rgba(236,72,153,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(236,72,153,0.6)] hover:scale-105 transition-all duration-300 border-4 border-pink-200/20">
                            {isKhushi ? "Capture the Moment 💗" : "Start Today's Design"}
                            <ArrowRight className="ml-4 w-8 h-8" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* 2. VISION & FOCUS: The Brain & The Heart */}
            {showSecondary && (
                <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 w-full animate-in fade-in duration-700 delay-150 px-4">
                    {/* Vision Board Snippet */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-night-400">The Dream</span>
                        </div>
                        <VisionSnippet />
                    </div>

                    {/* Focus Card */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-night-900" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-night-400">The Action</span>
                        </div>
                        <FocusCard />
                    </div>
                </section>
            )}

            {/* 3. MOMENTUM TRACKER */}
            {showSecondary && (
                <div className="w-full relative py-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-night-100"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-background px-4 text-[10px] font-black uppercase tracking-[0.2em] text-night-300">Step by Step. Every mark counts.</span>
                    </div>
                </div>
            )}

            {/* 4. CORE WORKSPACE GRID */}
            {showSecondary && (
                <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in duration-500 px-4">
                    {/* Perspective 1: Connection/Streak */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white bg-pink-500 px-3 py-1 rounded-full w-fit shadow-md shadow-pink-200">
                            {isKhushi ? "Our Journey" : "Growth"}
                        </span>
                        <TeamStreakCounter />
                    </div>

                    {/* Perspective 2: Reflection */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white bg-rose-500 px-3 py-1 rounded-full w-fit shadow-md shadow-rose-200">
                            {reflectionLabel}
                        </span>
                        <WinOfTheDay />
                    </div>
                </section>
            )}

            {/* 3. PARTNER FEED (Real-time updates) */}
            {showSecondary && (
                <section className="w-full max-w-5xl mx-auto animate-in fade-in duration-700 delay-300 pt-12 border-t border-night-100">
                    <PartnerFeed />
                </section>
            )}

            {/* 6. OPTIONAL NUDGE */}
            {showDeep && !isKhushi && (
                <section className="max-w-xl mx-auto animate-in fade-in duration-700">
                    <TodayPrompt />
                </section>
            )}

            {/* 7. FOOTER */}
            <section className="w-full pt-24 pb-12 animate-in fade-in duration-1000">
                <div className="text-center space-y-8">
                    <p className="font-poppins text-3xl md:text-4xl font-black text-night-950/90 tracking-tight italic">
                        {footerQuote}
                    </p>
                    <div className="flex items-center justify-center space-x-4 opacity-50">
                        <div className="h-px w-12 bg-night-300" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-night-400">
                            Chal chal chal — Two tired humans, one big dream.
                        </span>
                        <div className="h-px w-12 bg-night-300" />
                    </div>
                </div>
            </section>

        </PageWrapper>
    )
}

