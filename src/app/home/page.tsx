"use client"

import React, { useState, useEffect } from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { DreamProgressBar } from "@/components/home/dream-progress-bar"
import { VisualizationGarden } from "@/components/home/visualization-garden"
import { WinOfTheDay } from "@/components/home/win-of-the-day"
import { PartnerFeed } from "@/components/home/partner-feed"
import { VisionSnippet } from "@/components/home/vision-snippet"
import { FocusCard } from "@/components/home/focus-card"
import { UsMoment } from "@/components/home/us-moment"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Coins, MapPin, TrendingUp, Flame, Radio } from "lucide-react"
import { useAppStore } from "@/lib/store/app-store"
import { subscribeToPartnerPresence } from "@/lib/firebase/services/presence"
import { cn } from "@/lib/utils/cn"

export default function HomePage() {
    const { currentPerson } = useAppStore()
    const [showContent, setShowContent] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 150);
        return () => clearTimeout(timer);
    }, []);

    const isKhushi = currentPerson === 'khushi'
    const isBoth = currentPerson === 'both'
    const isShubham = currentPerson === 'shubham'

    return (
        <PageWrapper className={cn(
            "flex flex-col items-center max-w-5xl mx-auto space-y-8 md:space-y-12 pt-4 md:pt-8 pb-24 md:pb-32 px-4 transition-colors duration-1000"
        )}>


            {/* 1. HERO SECTION: EARNING & EXPLORING */}
            <motion.section 
                variants={containerVariants}
                initial="hidden"
                animate={showContent ? "show" : "hidden"}
                className="w-full flex flex-col items-center text-center space-y-8 mt-4"
            >
                
                {/* Connectivity Badge */}
                <motion.div variants={itemVariants} className="flex items-center space-x-3 bg-white/60 dark:bg-card/60 backdrop-blur-md border border-pink-100/50 dark:border-night-800 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex -space-x-2">
                        <div className={cn("w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-card flex items-center justify-center shadow-sm bg-blue-100 dark:bg-blue-900 transition-transform relative", isShubham || isBoth ? "scale-110 z-10" : "opacity-50 grayscale")}>
                            <Image src="/shubham.jpg" alt="Shubham" width={32} height={32} className="w-full h-full object-cover" />
                            {(isShubham || isBoth) && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-night-950 animate-pulse" />}
                        </div>
                        <div className={cn("w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-card flex items-center justify-center shadow-sm bg-pink-100 dark:bg-pink-900 transition-transform relative", isKhushi || isBoth ? "scale-110 z-10" : "opacity-50 grayscale")}>
                            <Image src="/khushi.jpg" alt="Khushi" width={32} height={32} className="w-full h-full object-cover" />
                            {(isKhushi || isBoth) && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-night-950 animate-pulse" />}
                        </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-night-600 dark:text-night-300">
                        {isBoth ? "Building Together" : isShubham ? "Shubham is active" : "Khushi is active"}
                    </span>
                </motion.div>

                {/* Main Headline */}
                <motion.div variants={itemVariants} className="relative max-w-4xl mx-auto w-full px-2">
                    <div className="absolute -inset-10 bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-blue-500/10 blur-2xl rounded-[100%] opacity-70 pointer-events-none" />
                    <h1 className="relative text-5xl leading-[1.1] md:text-6xl md:leading-[1.1] lg:text-8xl font-display font-black tracking-tighter text-night-950 dark:text-white">
                        Built for us.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 block mt-1">
                            Made with love.
                        </span>
                    </h1>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-6 max-w-xl mx-auto">
                    <p className="text-lg md:text-xl font-bold text-night-600/80 dark:text-night-400 leading-relaxed px-4">
                        Financial freedom, endless opportunities, and a life designed entirely by us. Every design, every small step is building our dream.
                    </p>
                </motion.div>

                {/* Primary Action */}
                <motion.div variants={itemVariants} className="pt-2 w-full flex flex-col sm:flex-row items-center justify-center gap-4 px-2">
                    <Link href="/upload" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto h-14 sm:h-16 px-10 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white border-none text-lg font-black tracking-tight shadow-xl hover:shadow-glow hover:scale-105 transition-all duration-300">
                            Share Your Work
                            <ArrowRight className="ml-3 w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/board" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto h-14 sm:h-16 px-10 rounded-full bg-white/50 dark:bg-card/50 border-2 border-night-200 dark:border-night-800 hover:border-pink-300 dark:hover:border-pink-500 hover:bg-white dark:hover:bg-card text-night-900 dark:text-white text-lg font-black tracking-tight transition-all duration-300">
                            Leave a Note 📝
                        </Button>
                    </Link>
                </motion.div>
            </motion.section>

            {/* 2. MANIFESTATION JOURNEY BAR */}
            {showContent && (
                <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="w-full bg-white/40 dark:bg-card/40 backdrop-blur-md rounded-[3rem] p-8 md:p-12 border border-pink-100/50 dark:border-night-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-night-950 dark:text-white tracking-tight flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-pink-500" />
                                Manifestation Journey
                            </h2>
                            <p className="text-sm font-bold text-night-500 dark:text-night-400 mt-1">Tracking our path from where we are to financial freedom.</p>
                        </div>
                    </div>
                    <DreamProgressBar />
                </motion.section>
            )}

            {/* 3. CORE ACTION GRID: Money & Vision */}
            {showContent && (
                <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    {/* The Hustle (Focus) */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 pl-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                                <Flame className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest text-night-600 dark:text-night-400">The Hustle</span>
                        </div>
                        <FocusCard />
                    </div>

                    {/* The Destination (Vision) */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 pl-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <MapPin className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest text-night-600 dark:text-night-400">The Destination</span>
                        </div>
                        <VisionSnippet />
                    </div>
                </motion.section>
            )}

            {/* 4. MOMENTUM & WINS */}
            {showContent && (
                <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pl-2">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-pink-500 dark:text-pink-400">Consistency Tracker</span>
                        </div>
                        <VisualizationGarden />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between pl-2">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-rose-500 dark:text-rose-400">Daily Triumphs</span>
                        </div>
                        <WinOfTheDay />
                    </div>
                </motion.section>
            )}

            {/* 5. LIVE CONNECTIVITY FEED */}
            {showContent && (
                <motion.section 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-4xl mx-auto pt-8 md:pt-12 relative"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-50"></div>
                    <div className="text-center mb-8 md:mb-10 mt-4 md:mt-0">
                        <div className="flex items-center justify-center gap-2 mb-2">
                             <Radio className="w-4 h-4 text-pink-500 animate-pulse" />
                             <h3 className="text-xl font-black text-night-900 dark:text-white tracking-tight">Our Live Thread</h3>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-night-500 dark:text-night-400">See what's happening right now</p>
                    </div>
                    <div className="bg-white/50 dark:bg-card/50 backdrop-blur-sm rounded-[3rem] p-4 md:p-6 border border-night-100/30 dark:border-night-800">
                        <PartnerFeed />
                    </div>
                </motion.section>
            )}

            {/* 6. US MOMENT ZEN SECTION */}
            {showContent && (
                <motion.section 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full pt-16"
                >
                    <UsMoment />
                </motion.section>
            )}

            {/* 7. FOOTER REMINDER */}
            {showContent && (
                <motion.section 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5 }}
                    className="w-full pt-12 pb-10"
                >
                    <div className="text-center space-y-6">
                        <p className="font-display text-2xl md:text-3xl font-black text-night-400 dark:text-night-500 tracking-tight">
                            "Chal chal chal — the world is ours to explore."
                        </p>
                        <div className="flex items-center justify-center space-x-4 opacity-40">
                            <div className="h-px w-8 bg-night-400 dark:bg-night-600" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-night-600 dark:text-night-500">
                                Never stop pushing
                            </span>
                            <div className="h-px w-8 bg-night-400 dark:bg-night-600" />
                        </div>
                    </div>
                </motion.section>
            )}

        </PageWrapper>
    )
}
