
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToDesigns, Design } from "@/lib/firebase/services/designs"; // Function we just added
import { useAppStore } from "@/lib/store/app-store";
import { Heart, Flame, Star, Zap } from "lucide-react";
import { addReactionToFirebase } from "@/lib/firebase/services/designs";

import { toast } from "react-hot-toast";

const REACTIONS = [
    { emoji: "🔥", label: "Fire", icon: Flame, color: "text-orange-400" },
    { emoji: "❤️", label: "Love", icon: Heart, color: "text-red-400" },
    { emoji: "⭐", label: "Star", icon: Star, color: "text-yellow-400" },
    { emoji: "💯", label: "Perfect", icon: Zap, color: "text-blue-400" },
];

export function PartnerFeed() {
    const { currentPerson } = useAppStore();
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
            toast.success(`Reacted with ${emoji}`);
        } catch (error) {
            console.error("Failed to add reaction:", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-night-600 dark:text-night-400">Loading updates...</div>;

    return (
        <div className="space-y-8 w-full max-w-2xl mx-auto section-connect">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-pink-500 dark:text-pink-400 mb-8 text-center opacity-80">
                {targetPersona ? `${targetPersona.charAt(0).toUpperCase() + targetPersona.slice(1)}'s Latest` : "Latest Updates"}
            </h2>

            {designs.length === 0 ? (
                <div className="text-center p-12 bg-card shadow-soft rounded-[2.5rem] border border-border">
                    <p className="text-muted-foreground font-body font-medium italic">No updates yet! Time to create something? ✨</p>
                </div>
            ) : (
                <div className="grid gap-12">
                    {designs.map((design: Design, i) => {
                        const isNew = !!design.createdAt && (new Date().getTime() - (design.createdAt as any).toDate().getTime()) < 86400000;
                        
                        return (
                            <motion.div
                                key={design.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="bg-white dark:bg-card group rounded-[3rem] overflow-hidden shadow-soft hover:shadow-glow transition-all duration-500 border-none relative"
                            >
                                {isNew && (
                                    <div className="absolute top-6 left-6 z-20 flex items-center gap-1.5 bg-pink-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                        NEW UPDATE
                                    </div>
                                )}

                                <div 
                                    className="relative aspect-[4/3] md:aspect-video overflow-hidden cursor-zoom-in"
                                    onClick={() => setSelectedImage(design.imageUrl)}
                                >
                                    <Image
                                        src={design.imageUrl}
                                        alt={design.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-night-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest translate-x-4 group-hover:translate-x-0 transition-transform duration-500">
                                        {design.tool}
                                    </div>
                                </div>

                                <div className="p-8 md:p-10 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl md:text-3xl font-display font-black text-night-950 dark:text-foreground leading-tight tracking-tight">{design.title}</h3>
                                        {design.description && <p className="text-night-500 dark:text-muted-foreground font-body font-medium text-base leading-relaxed">{design.description}</p>}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {design.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-pink-50 dark:bg-pink-900/30 text-pink-500 dark:text-pink-400 px-3 py-1.5 rounded-full border border-pink-100 dark:border-pink-800/50">#{tag}</span>
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
                                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all group/btn ${userReacted
                                                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20'
                                                    : 'bg-night-50 dark:bg-night-900 hover:bg-white dark:hover:bg-card hover:shadow-md'
                                                    }`}
                                                >
                                                    <span className="text-xl group-hover/btn:scale-125 transition-transform">{r.emoji}</span>
                                                    {count > 0 && <span className={`text-[10px] font-black ${userReacted ? 'text-white' : 'text-night-400'}`}>{count}</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-20 backdrop-blur-xl"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full h-full"
                        >
                            <Image
                                src={selectedImage}
                                alt="Lightbox"
                                fill
                                className="object-contain"
                            />
                            <button 
                                className="absolute top-0 right-0 p-4 text-white text-xs font-black uppercase tracking-widest hover:text-pink-400 transition-colors"
                                onClick={() => setSelectedImage(null)}
                            >
                                CLOSE ✕
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

