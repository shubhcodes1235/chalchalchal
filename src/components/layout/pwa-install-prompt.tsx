// src/components/layout/pwa-install-prompt.tsx
"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check if already dismissed in this session
        const dismissed = sessionStorage.getItem('pwa-prompt-dismissed')
        if (dismissed) {
            setIsDismissed(true)
            return
        }

        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e)
            // Update UI notify the user they can add to home screen
            setIsVisible(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        // Show the prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null)
        setIsVisible(false)
    }

    const handleDismiss = () => {
        setIsVisible(false)
        setIsDismissed(true)
        sessionStorage.setItem('pwa-prompt-dismissed', 'true')
    }

    if (isDismissed || !isVisible) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-[60] bg-white dark:bg-card border border-pink-100 dark:border-pink-900/30 rounded-3xl shadow-2xl p-5 backdrop-blur-xl"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-500/20">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-black text-night-950 dark:text-foreground uppercase tracking-wider">Install Our App 🐐</h4>
                        <p className="text-xs text-night-500 dark:text-muted-foreground font-bold leading-relaxed">
                            Add "Dream & Design" to your home screen for the best experience and motivation!
                        </p>
                    </div>
                    <button 
                        onClick={handleDismiss}
                        className="p-1 hover:bg-muted rounded-lg transition-colors text-night-400"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-4 flex gap-3">
                    <Button 
                        onClick={handleInstall}
                        className="flex-1 rounded-xl bg-night-950 dark:bg-pink-600 hover:bg-night-800 dark:hover:bg-pink-700 text-white font-black text-xs uppercase tracking-widest h-11"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Install Now
                    </Button>
                    <Button 
                        variant="ghost"
                        onClick={handleDismiss}
                        className="rounded-xl font-black text-xs uppercase tracking-widest h-11 text-night-400"
                    >
                        Maybe Later
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
