// src/components/layout/manifestation-strip.tsx
"use client"

import React from "react"
// import { motion } from "framer-motion"

const MESSAGES = [
    "Mujhe ek din bhot bada designer banna hai, ki sab mujhe dhoondhe. ✨",
    "Ek din kuch aisa hoga — aur tu dekhna, main karungi. 🎥",
    "Inse hi movie poster banana hai. Sab dhoondhenge. 🎞️",
    "Aaj slow ho, par hum saath hain. Har chhota step count hota hai. 🤝",
    "Jo bana rahe ho, wahi tumhe banayega. Trust the process. 🎨",
    "Someone believes in you today. (Keep going) ❤️"
]

export function ManifestationStrip() {
    return (
        <div 
            className="w-full bg-primary/5 dark:bg-primary/10 border-b border-primary/10 overflow-hidden py-3 whitespace-nowrap shadow-sm"
            aria-live="off"
            aria-label="Manifestation affirmations"
        >
            <div className="flex w-max items-center animate-marquee hover:[animation-play-state:paused]">
                <div className="flex shrink-0 items-center">
                    {MESSAGES.map((m, i) => (
                        <span key={i} className="font-handwritten text-sm md:text-lg text-foreground/80 tracking-widest px-8 md:px-12 font-bold italic">
                            {m}
                        </span>
                    ))}
                </div>
                <div className="flex shrink-0 items-center" aria-hidden="true">
                    {MESSAGES.map((m, i) => (
                        <span key={`dup-${i}`} className="font-handwritten text-sm md:text-lg text-foreground/80 tracking-widest px-8 md:px-12 font-bold italic">
                            {m}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
