// src/providers/celebration-provider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { subscribeToPartnerPresence } from '@/lib/firebase/services/presence';
import { useAppStore } from '@/lib/store/app-store';

type CelebrationType = 'upload' | 'streak' | 'income' | 'first-upload' | 'milestone' | 'shared-did-it';

interface CelebrationContextType {
    triggerCelebration: (type: CelebrationType) => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function CelebrationProvider({ children }: { children: React.ReactNode }) {
    const [, setIsActive] = useState(false);
    const { currentPerson } = useAppStore();
    const initialTriggerRef = useRef<any>(null);
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (!currentPerson || currentPerson === 'both') return;

        const targetPartner = currentPerson === 'shubham' ? 'khushi' : 'shubham';
        const unsubscribe = subscribeToPartnerPresence(targetPartner, (data) => {
            if (!hasInitializedRef.current) {
                initialTriggerRef.current = data.confettiTrigger?.toMillis ? data.confettiTrigger.toMillis() : data.confettiTrigger;
                hasInitializedRef.current = true;
                return;
            }

            const currentTrigger = data.confettiTrigger?.toMillis ? data.confettiTrigger.toMillis() : data.confettiTrigger;
            
            if (currentTrigger && currentTrigger !== initialTriggerRef.current) {
                // Partner triggered a confetti event for you!
                initialTriggerRef.current = currentTrigger;
                triggerCelebration('shared-did-it');
            }
        });

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPerson]);

    const fireConfetti = (type: CelebrationType) => {
        const colors = ['#FF69B4', '#FFB6C1', '#FFD700', '#FF1493'];

        if (type === 'first-upload') {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const interval: ReturnType<typeof setInterval> = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 }, colors });
                confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 }, colors });
            }, 250);
        } else if (type === 'streak' || type === 'milestone') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors
            });
        } else if (type === 'shared-did-it') {
            // A crazy confetti explosion from the top showing your partner did something
            confetti({
                particleCount: 300,
                spread: 120,
                origin: { y: 0.2 },
                colors: ['#00FF00', '#FFD700', '#FF69B4', '#1E90FF'],
                startVelocity: 45
            });
        } else {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors
            });
        }
    };

    const triggerCelebration = (type: CelebrationType) => {
        setIsActive(true);
        fireConfetti(type);

        // Potentially show an overlay or play a sound (via sound provider)
        setTimeout(() => setIsActive(false), 5000);
    };

    return (
        <CelebrationContext.Provider value={{ triggerCelebration }}>
            {children}
            {/* Celebration Overlay could be added here */}
        </CelebrationContext.Provider>
    );
}

export const useCelebration = () => {
    const context = useContext(CelebrationContext);
    if (context === undefined) {
        throw new Error('useCelebration must be used within a CelebrationProvider');
    }
    return context;
};
