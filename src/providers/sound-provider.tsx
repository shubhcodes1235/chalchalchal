// src/providers/sound-provider.tsx
'use client';

import React, { createContext, useContext } from 'react';

interface SoundContextType {
    playSound: (soundName: string) => void;
    toggleSound: () => void;
    soundEnabled: boolean;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
    // Sound is completely disabled as per user request
    const soundEnabled = false;

    const playSound = (soundName: string) => {
        // No-op: Sounds have been removed
        console.log(`Sound effect "${soundName}" requested but sounds are disabled.`);
    };

    const toggleSound = () => {
        // No-op: Sound toggling is disabled
    };

    return (
        <SoundContext.Provider value={{ playSound, toggleSound, soundEnabled }}>
            {children}
        </SoundContext.Provider>
    );
}

export const useSound = () => {
    const context = useContext(SoundContext);
    if (context === undefined) {
        throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
}
