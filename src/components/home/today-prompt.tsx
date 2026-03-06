// src/components/home/today-prompt.tsx
"use client"

import { getPromptOfDay } from "@/lib/constants/prompts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function TodayPrompt() {
    const prompt = getPromptOfDay();

    return (
        <Card className="border-none bg-card shadow-soft rounded-[2.5rem] overflow-hidden group transition-all duration-300">
            <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                    <span className="text-sm italic text-night-500 dark:text-muted-foreground font-body font-medium">Stuck? Try this nudge...</span>
                </div>

                <h3 className="text-xl font-handwritten text-night-800 dark:text-foreground mb-6 leading-relaxed italic">
                    &ldquo;{prompt}&rdquo;
                </h3>

                <Link href={`/upload?prompt=${encodeURIComponent(prompt)}`}>
                    <Button variant="ghost" className="w-full group rounded-2xl h-14 text-primary hover:text-white hover:bg-primary transition-all border border-primary/20 bg-primary/5 dark:bg-primary/10 font-bold">
                        Try it!
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
