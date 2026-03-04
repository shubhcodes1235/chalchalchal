// src/app/vault/page.tsx
"use client"

import React from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Mail, Timer, Sparkles, ShieldAlert, BookHeart } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const VAULT_SECTIONS = [
    {
        id: 'emergency',
        title: 'Emergency Kit',
        desc: 'Deep reassurance for hard days.',
        icon: ShieldAlert,
        color: 'bg-red-50 text-red-500 border-red-100',
        href: '/vault/emergency'
    },
    {
        id: 'letters',
        title: 'Future Letters',
        desc: 'Read what we wrote for ourselves.',
        icon: Mail,
        color: 'bg-blue-50 text-blue-500 border-blue-100',
        href: '/vault/letters'
    },
    {
        id: 'capsule',
        title: 'Time Capsule',
        desc: 'Unlocking in 2025.',
        icon: Timer,
        color: 'bg-purple-50 text-purple-500 border-purple-100',
        href: '/vault/capsule'
    },
    {
        id: 'gratitude',
        title: 'Gratitude Journal',
        desc: 'Little things that made us happy.',
        icon: BookHeart,
        color: 'bg-green-50 text-green-500 border-green-100',
        href: '/vault/gratitude'
    }
]

export default function VaultPage() {
    return (
        <PageWrapper className="space-y-12">
            <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-4xl bg-gradient-to-tr from-pink-100 to-coral-100 flex items-center justify-center shadow-soft mb-2">
                    <ShieldAlert className="w-10 h-10 text-pink-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-handwritten font-bold text-pink-700">The Vault</h1>
                <p className="text-night-500 max-w-xl">
                    Where our most sacred memories, hopes, and promises are protected from the outside world.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {VAULT_SECTIONS.map((section, i) => (
                    <Link key={section.id} href={section.href}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card hover className="h-full cursor-pointer group border-2 border-transparent hover:border-pink-200">
                                <CardContent className="p-8 flex items-center space-x-6">
                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 border-2 ${section.color} group-hover:scale-110 transition-transform`}>
                                        <section.icon className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-night-900">{section.title}</h3>
                                        <p className="text-sm text-night-600">{section.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Link>
                ))}
            </div>

            <div className="pt-12 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-pink-300">End-to-End Encrypted in our Hearts</p>
            </div>
        </PageWrapper>
    )
}
