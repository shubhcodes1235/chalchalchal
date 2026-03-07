// src/components/layout/header.tsx
"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Settings, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store/app-store"
import Image from "next/image"
import { EmergencyButton } from "@/components/layout/emergency-button"
import { subscribeToPartnerStatus } from "@/lib/firebase/services/presence"
import { NotificationBell } from "@/components/layout/notification-bell"


const pageTitles: Record<string, string> = {
    "/home": "Workspace",
    "/archive": "Gallery",
    "/upload": "Create",
    "/board": "Board",
    "/progress": "Progress",
    "/vault": "Vault",
    "/settings": "Settings",
}

const SUBTITLES = [
    "start where you are",
    "dream it, design it",
    "making magic together",
    "one pixel at a time",
    "love in every detail",
    "chasing dreams day by day",
]

export function Header() {
    const pathname = usePathname()
    const { currentPerson, setCurrentPerson } = useAppStore()
    const [shubhamOnline, setShubhamOnline] = React.useState(false)
    const [khushiOnline, setKhushiOnline] = React.useState(false)
    const [subtitleIndex, setSubtitleIndex] = React.useState(0)


    React.useEffect(() => {
        const unsubS = subscribeToPartnerStatus('shubham', (online) => setShubhamOnline(online))
        const unsubK = subscribeToPartnerStatus('khushi', (online) => setKhushiOnline(online))
        
        return () => {
            unsubS()
            unsubK()
        }
    }, [currentPerson])

    React.useEffect(() => {
        const interval = setInterval(() => {
            setSubtitleIndex((prev) => (prev + 1) % SUBTITLES.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const title = pageTitles[pathname] || "Dream & Design"

    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

    const handleSwitch = async (person: 'shubham' | 'khushi' | 'both') => {
        if (person === currentPerson) {
            setIsDialogOpen(false)
            return
        }

        try {
            setCurrentPerson(person)
            await db.appSettings.update('main', { currentPerson: person })
            setIsDialogOpen(false)
            
            // Request notification permission if not already granted
            if ('Notification' in window && Notification.permission === 'default') {
                await Notification.requestPermission()
            }
        } catch (e) {
            console.error("Failed to switch user:", e)
        }
    }

    return (
        <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-background/90 backdrop-blur-md border-b border-pink-200/50 sm:border-night-100 dark:border-border px-4 sm:px-6 py-3 sm:py-4 transition-all">
            <div className="flex items-center justify-between mx-auto max-w-7xl">
                <div className="flex flex-col">
                    <h1 className="text-lg sm:text-sm font-display font-black sm:font-bold text-night-900 dark:text-foreground sm:tracking-widest sm:uppercase sm:opacity-80 relative">
                        {title}
                        <div className="h-0.5 w-1/2 bg-gradient-to-r from-pink-500 to-transparent sm:hidden mt-0.5" />
                        <span className="hidden sm:block absolute -bottom-1 left-0 w-4 h-1 bg-pink-500 rounded-full" />
                    </h1>
                    <div className="text-[10px] sm:text-xs text-pink-500 dark:text-pink-400 font-body font-semibold uppercase tracking-widest mt-1 min-h-[1.5em] flex items-center gap-1.5 transition-all">
                        <span>Chal chal chal</span>
                        <span className="w-1 h-1 rounded-full bg-pink-300 dark:bg-pink-600" />
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={subtitleIndex}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 0.7, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="lowercase font-medium hidden sm:inline-block"
                            >
                                {SUBTITLES[subtitleIndex]}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <button 
                                aria-label="Switch browsing person"
                                className="flex items-center space-x-2 bg-night-50 dark:bg-muted hover:bg-white dark:hover:bg-muted/80 pl-1 pr-1 sm:pr-3 py-1 min-h-[44px] sm:min-h-0 rounded-full border border-night-100 dark:border-border transition-all shadow-sm hover:shadow-md group"
                            >
                                <div className="flex -space-x-1.5">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-sm shadow-sm transition-all relative bg-blue-100",
                                        (currentPerson === 'shubham' || currentPerson === 'both') ? "z-10" : "opacity-40 scale-90 grayscale"
                                    )}>
                                        <Image src="/shubham.jpg" alt="S" width={32} height={32} className="w-full h-full object-cover" />
                                        {shubhamOnline && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-white" />}
                                    </div>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-sm shadow-sm transition-all relative bg-pink-100",
                                        (currentPerson === 'khushi' || currentPerson === 'both') ? "z-10" : "opacity-40 scale-90 grayscale"
                                    )}>
                                        <Image src="/khushi.jpg" alt="K" width={32} height={32} className="w-full h-full object-cover" />
                                        {khushiOnline && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-white" />}
                                    </div>
                                </div>
                                <span className="text-xs font-display font-bold uppercase tracking-widest text-night-600 dark:text-muted-foreground group-hover:text-night-900 dark:group-hover:text-foreground">
                                    {currentPerson === 'both' ? 'Together' : currentPerson}
                                </span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2rem] max-w-xs">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-display font-bold text-night-950 dark:text-foreground">Who is here?</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-3 pt-4">
                                <button onClick={() => handleSwitch('shubham')} className={cn("flex items-center p-3 rounded-2xl border-2 transition-all space-x-4", currentPerson === 'shubham' ? "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20" : "border-transparent hover:bg-night-50 dark:hover:bg-night-900/50")}>
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl relative">
                                        <Image src="/shubham.jpg" alt="Shubham" width={40} height={40} className="w-full h-full object-cover" />
                                        {shubhamOnline && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-night-950" />}
                                    </div>
                                     <div className="text-left">
                                          <div className="font-display font-semibold text-night-900 dark:text-foreground text-sm">Shubham</div>
                                          <div className="text-xs font-body font-medium text-night-500 dark:text-night-400 uppercase tracking-wider">{shubhamOnline ? 'Online' : 'Builder Mode'}</div>
                                     </div>
                                     {currentPerson === 'shubham' && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 shadow-glow" />}
                                 </button>

                                 <button onClick={() => handleSwitch('khushi')} className={cn("flex items-center p-3 rounded-2xl border-2 transition-all space-x-4", currentPerson === 'khushi' ? "border-pink-200 bg-pink-50 dark:border-pink-900/50 dark:bg-pink-900/20" : "border-transparent hover:bg-night-50 dark:hover:bg-night-900/50")}>
                                     <div className="w-10 h-10 rounded-full overflow-hidden bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-xl relative">
                                        <Image src="/khushi.jpg" alt="Khushi" width={40} height={40} className="w-full h-full object-cover" />
                                        {khushiOnline && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-night-950" />}
                                    </div>
                                     <div className="text-left">
                                          <div className="font-display font-semibold text-night-900 dark:text-foreground text-sm">Khushi</div>
                                          <div className="text-xs font-body font-medium text-night-500 dark:text-night-400 uppercase tracking-wider">{khushiOnline ? 'Online' : 'Dreamer Mode'}</div>
                                     </div>
                                     {currentPerson === 'khushi' && <div className="ml-auto w-2 h-2 rounded-full bg-pink-500 shadow-glow" />}
                                 </button>

                                <button onClick={() => handleSwitch('both')} className={cn("flex items-center p-3 rounded-2xl border-2 transition-all space-x-4", currentPerson === 'both' ? "border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-900/20" : "border-transparent hover:bg-night-50 dark:hover:bg-night-900/50")}>
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm border-2 border-white dark:border-night-950">
                                            <Image src="/shubham.jpg" alt="S" width={32} height={32} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-sm border-2 border-white dark:border-night-950">
                                            <Image src="/khushi.jpg" alt="K" width={32} height={32} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                     <div className="text-left pl-2">
                                        <div className="font-display font-semibold text-night-900 dark:text-foreground text-sm">Together</div>
                                        <div className="text-xs font-body font-medium text-night-500 dark:text-night-400 uppercase tracking-wider">Our Space</div>
                                     </div>
                                    {currentPerson === 'both' && <div className="ml-auto w-2 h-2 rounded-full bg-purple-500 shadow-glow" />}
                                </button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <div className="flex items-center space-x-1 border-l border-night-100 dark:border-border pl-3 md:pl-4 ml-1 md:ml-2">
                        <NotificationBell />
                        
                        {/* Settings icon */}
                        <Link href="/settings">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl w-9 h-9 text-night-600 dark:text-muted-foreground hover:text-night-900 dark:hover:text-foreground hover:bg-night-50 dark:hover:bg-muted"
                            >
                                <Settings className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
