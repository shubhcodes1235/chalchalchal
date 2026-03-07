// src/components/home/manifestation-quote.tsx
"use client"

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { motion, AnimatePresence } from "framer-motion";

export function ManifestationQuote() {
    const settings = useLiveQuery(() => db.appSettings.get('main'));
    const isReady = settings !== undefined;

    return (
        <AnimatePresence>
            {isReady && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1 }}
                    className="w-full text-center"
                >
                    <p className="text-xs font-body font-medium text-night-400 dark:text-muted-foreground/60 tracking-[0.1em] max-w-xl mx-auto italic">
                        {settings?.manifestationQuote || "Chote chote kadam bhi kadam hain. ✨"}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
