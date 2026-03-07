// src/components/layout/page-wrapper.tsx
"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"

interface PageWrapperProps {
    children: React.ReactNode
    className?: string
}

export function PageWrapper({ children, className }: PageWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }}
            className={cn(
                "container mx-auto px-4 pb-40 md:pb-24 pt-4 md:pt-8 max-w-7xl",
                className
            )}
        >
            {children}
        </motion.div>
    )
}
