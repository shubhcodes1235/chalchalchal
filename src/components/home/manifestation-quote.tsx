// src/components/home/manifestation-quote.tsx
"use client"

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import { motion } from "framer-motion";

export function ManifestationQuote() {
    const settings = useLiveQuery(() => db.appSettings.get('main'));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="w-full text-center"
        >
            <p className="text-xs font-body font-medium text-night-500 dark:text-muted-foreground tracking-[0.1em] max-w-xl mx-auto">
                {settings?.manifestationQuote || "Small steps are still steps."}
            </p>
        </motion.div>
    );
}
