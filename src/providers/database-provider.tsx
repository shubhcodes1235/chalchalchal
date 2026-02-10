// src/providers/database-provider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/db/database';
import { seedDatabase } from '@/lib/db/seed-data';
import { runMigrations } from '@/lib/db/migrations';
import { motion, AnimatePresence } from 'framer-motion';
import { startCloudSync } from '@/lib/services/sync.service';

interface DatabaseContextType {
    isInitialized: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        async function initDB() {
            try {
                // Safety timeout to prevent infinite loading
                const timeoutId = setTimeout(() => {
                    console.warn("Database initialization timed out, forcing render");
                    setIsInitialized(true);
                }, 3000);

                await runMigrations();
                await seedDatabase();

                clearTimeout(timeoutId);
                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize database:', error);
                // Still allow the app to load even if seeding fails
                setIsInitialized(true);
            }
        }

        initDB();
    }, []);

    useEffect(() => {
        if (isInitialized) {
            const unsubscribe = startCloudSync();
            return () => unsubscribe();
        }
    }, [isInitialized]);

    return (
        <DatabaseContext.Provider value={{ isInitialized }}>
            <AnimatePresence>
                {!isInitialized ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background h-[100dvh] w-screen overflow-hidden"
                    >
                        <div className="relative flex flex-col items-center">
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 180, 360],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-16 h-16 border-4 border-blush-100 border-t-raspberry rounded-full"
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8 text-deep-plum font-poppins text-lg font-bold animate-pulse tracking-widest uppercase"
                            >
                                Initializing your dreams...
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </DatabaseContext.Provider>
    );
}

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
};
