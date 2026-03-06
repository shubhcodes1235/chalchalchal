// src/components/layout/root-layout-wrapper.tsx
"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { BottomNavbar } from "./bottom-navbar"
import { EmergencyButton } from "./emergency-button"
import { ManifestationStrip } from "./manifestation-strip"
import { PWAInstallPrompt } from "./pwa-install-prompt"
import { AnimatePresence } from "framer-motion"

export function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Don't show layout on certain pages like entry or reassurance
    const isEntryPage = pathname === "/" || pathname === "/reassurance"

    if (isEntryPage) return <>{children}</>

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar for Desktop */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header - Fixed or Sticky */}
                <Header />
                <ManifestationStrip />

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        {children}
                    </AnimatePresence>
                </main>

                {/* Bottom Navbar for Mobile */}
                <BottomNavbar />

                {/* Floating Emergency Button */}
                <EmergencyButton />

                {/* PWA Install Prompt */}
                <PWAInstallPrompt />
            </div>
        </div>
    )
}
