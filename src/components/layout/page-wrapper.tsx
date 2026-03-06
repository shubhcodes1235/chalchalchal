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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
                duration: 0.2,
                ease: "easeOut"
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
