// src/app/reassurance/page.tsx
"use client"

import React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { Quote } from "lucide-react"

export default function ReassurancePage() {
    const router = useRouter()
    const settings = useLiveQuery(() => db.appSettings.get('main'))
    const designsCount = useLiveQuery(() => db.designs.count())

    // Logic to get first and latest design for comparison
    const firstDesign = useLiveQuery(() => db.designs.orderBy('createdAt').first())
    const lastDesign = useLiveQuery(() => db.designs.orderBy('createdAt').last())

    return (
        <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6 texture-paper">
            <div className="max-w-4xl w-full space-y-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                >
                    <Quote className="w-12 h-12 text-pink-300 mx-auto opacity-50" />
                    <h1 className="text-4xl md:text-6xl font-handwritten text-pink-700 leading-tight">
                        {settings?.manifestationQuote || "You didn't come this far to only come this far."}
                    </h1>
                    <p className="text-night-600 text-lg max-w-xl mx-auto">
                        You've already come so far. Quitting now would waste all of this. Stay.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-white/80 backdrop-blur shadow-warm border-pink-100">
                        <CardContent className="p-8 text-center space-y-2">
                            <span className="text-5xl font-bold text-pink-500">{designsCount || 0}</span>
                            <p className="text-night-600 uppercase tracking-widest text-xs font-bold">Designs Created</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur shadow-warm border-pink-100">
                        <CardContent className="p-8 text-center space-y-2">
                            <span className="text-5xl font-bold text-coral-500">
                                {/* Placeholder for days active */}
                                3
                            </span>
                            <p className="text-night-600 uppercase tracking-widest text-xs font-bold">Days on Journey</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
                    <Button
                        size="lg"
                        className="w-full md:w-auto rounded-3xl bg-pink-500 hover:bg-pink-600 shadow-glow"
                        onClick={() => router.push('/home')}
                    >
                        I'm ready now
                    </Button>
                    <Button
                        variant="ghost"
                        size="lg"
                        className="w-full md:w-auto text-pink-500"
                        onClick={() => router.push('/archive')}
                    >
                        I just want to browse old work
                    </Button>
                </div>
            </div>
        </div>
    )
}
