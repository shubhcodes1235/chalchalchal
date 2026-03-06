// src/components/layout/manifestation-strip.tsx
"use client"

import React from "react"
import { motion } from "framer-motion"

export function ManifestationStrip() {
    const messages = [
        "Mujhe ek din bhot bada designer banna hai, ki sab mujhe dhoondhe. ✨",
        "Ek din kuch aisa hoga — aur tu dekhna, main karungi. 🎥",
        "Inse hi movie poster banana hai. Sab dhoondhenge. 🎞️",
        "Aaj slow ho, par hum saath hain. Har chhota step count hota hai. 🤝",
        "Jo bana rahe ho, wahi tumhe banayega. Trust the process. 🎨",
        "Someone believes in you today. (Keep going) ❤️"
    ]

    return (
        <div className="w-full bg-primary/5 dark:bg-primary/10 border-b border-primary/10 overflow-hidden py-3 whitespace-nowrap shadow-sm">
            <div className="flex relative">
                <motion.div
                    animate={{ x: [0, "-100%"] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="flex shrink-0 items-center"
                >
                    {messages.map((m, i) => (
                        <span key={i} className="font-handwritten text-lg text-foreground/80 tracking-widest px-12 font-bold italic">
                            {m}
                        </span>
                    ))}
                </motion.div>
                <motion.div
                    animate={{ x: [0, "-100%"] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="flex shrink-0 items-center"
                >
                    {messages.map((m, i) => (
                        <span key={i} className="font-handwritten text-lg text-foreground/80 tracking-widest px-12 font-bold italic">
                            {m}
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
