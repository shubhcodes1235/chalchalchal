
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToDesigns, Design } from "@/lib/firebase/services/designs"; // Function we just added
import { useAppStore } from "@/lib/store/app-store";
import { Heart, Flame, Star, Zap } from "lucide-react";
import { addReactionToFirebase } from "@/lib/firebase/services/designs";

const REACTIONS = [
    { emoji: "🔥", label: "Fire", icon: Flame, color: "text-orange-400" },
    { emoji: "❤️", label: "Love", icon: Heart, color: "text-red-400" },
    { emoji: "⭐", label: "Star", icon: Star, color: "text-yellow-400" },
    { emoji: "💯", label: "Perfect", icon: Zap, color: "text-blue-400" },
];

export function PartnerFeed() {
    const { currentPerson } = useAppStore();
    const [designs, setDesigns] = useState<Design[]>([]); // Use the Design type from service
    const [loading, setLoading] = useState(true);

    // If I am Shubham, I want to see Khushi's designs.
    // If I am Khushi, I want to see Shubham's designs.
    const targetPersona = currentPerson === 'shubham' ? 'khushi' : currentPerson === 'khushi' ? 'shubham' : undefined;

    useEffect(() => {
        const unsubscribe = subscribeToDesigns((data) => {
            setDesigns(data);
            setLoading(false);
        }, targetPersona as 'shubham' | 'khushi' | undefined);

        return () => unsubscribe();
    }, [targetPersona]);

    const handleReaction = async (designId: string, emoji: string) => {
        try {
            await addReactionToFirebase(designId, emoji, currentPerson);
        } catch (error) {
            console.error("Failed to add reaction:", error);
            // Optionally show a toast here if you have a toast system
        }
    };

    if (loading) return <div className="p-8 text-center text-night-600 dark:text-night-400">Loading updates...</div>;

    return (
        <div className="space-y-8 w-full max-w-2xl mx-auto section-connect">
            <h2 className="text-2xl font-black text-center text-deep-plum dark:text-white mb-6 uppercase tracking-widest">
                {targetPersona ? `${targetPersona.charAt(0).toUpperCase() + targetPersona.slice(1)}'s Latest` : "Latest Updates"}
            </h2>

            {designs.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-card shadow-soft rounded-[2.5rem] border border-pink-100 dark:border-night-800">
                    <p className="text-night-600 dark:text-night-400 font-bold italic">No updates yet! Time to create something? ✨</p>
                </div>
            ) : (
                <div className="grid gap-8">
                    {designs.map((design, i) => (
                        <motion.div
                            key={design.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-card group rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-glow transition-all duration-500 border-none"
                        >
                            <div className="relative aspect-video">
                                <img
                                    src={design.imageUrl}
                                    alt={design.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute top-6 right-6 bg-deep-plum/80 dark:bg-black/80 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                    {design.tool}
                                </div>
                            </div>

                            <div className="p-8 space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-deep-plum dark:text-white leading-tight">{design.title}</h3>
                                    {design.description && <p className="text-night-600 dark:text-night-400 font-medium text-sm">{design.description}</p>}
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {design.tags?.map(tag => (
                                        <span key={tag} className="text-xs font-black uppercase tracking-widest bg-pink-50 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400 px-3 py-1 rounded-full border border-pink-100 dark:border-pink-800/50">#{tag}</span>
                                    ))}
                                </div>

                                {/* Reactions Bar */}
                                <div className="flex items-center gap-3 pt-6 border-t border-pink-50 dark:border-night-800">
                                    {REACTIONS.map((r) => {
                                        const count = design.reactions?.filter(x => x.emoji === r.emoji).length || 0;
                                        const userReacted = design.reactions?.some(x => x.emoji === r.emoji && x.byPersona === currentPerson);

                                        return (
                                            <button
                                                key={r.emoji}
                                                onClick={() => handleReaction(design.id, r.emoji)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${userReacted
                                                    ? 'bg-pink-100 dark:bg-pink-900/40 ring-1 ring-pink-200 dark:ring-pink-800'
                                                    : 'bg-night-50 dark:bg-night-900 hover:bg-white dark:hover:bg-night-800 hover:shadow-md'
                                                    }`}
                                            >
                                                <span className="text-xl">{r.emoji}</span>
                                                {count > 0 && <span className="text-xs font-black text-deep-plum/60 dark:text-white/60">{count}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

