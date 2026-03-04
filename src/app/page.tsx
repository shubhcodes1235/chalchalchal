
"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppStore } from "@/lib/store/app-store"
import { useMoodStore } from "@/lib/store/mood-store"
import { useRouter } from "next/navigation"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTimeOfDay } from "@/lib/hooks/use-time-of-day"
import { db } from "@/lib/db/database"
import { cn } from "@/lib/utils/cn"

export default function EntryPage() {
  const router = useRouter()
  const { setCurrentPerson } = useAppStore()
  const { setMood } = useMoodStore()
  const { greeting } = useTimeOfDay()

  const [step, setStep] = useState<'person' | 'mood'>('person')

  const handlePersonSelect = async (person: 'shubham' | 'khushi') => {
    setCurrentPerson(person)
    await db.appSettings.update('main', { currentPerson: person })
    setStep('mood')
  }

  const handleMoodSelect = (mood: 'design' | 'vibe' | 'lost') => {
    setMood(mood)
    if (mood === 'lost') {
      router.push('/reassurance')
    } else {
      router.push('/home')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-700">
      {/* Background Atmosphere - Dreamy Blobs */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-raspberry/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blush-100/40 rounded-full blur-[120px] animate-float" />
      </div>

      <div className="z-10 w-full max-w-2xl text-center space-y-12">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-raspberry font-bold text-xs md:text-xs tracking-[0.15em] uppercase opacity-80 mb-2"
        >
          {greeting}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-4xl md:text-6xl text-deep-plum font-poppins font-black tracking-tight transition-colors duration-300 drop-shadow-sm uppercase">
            <TypingAnimation
              sequence={["Kaun hai aaj?", 2000, "Ready to dream?", 1500, "Chal chal chal!", 2000]}
              repeat={Infinity}
              className="font-poppins"
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'person' ? (
            <motion.div
              key="person-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="space-y-10"
            >
              <div className="space-y-2">
                <h3 className="text-sm md:text-base font-bold text-deep-plum opacity-80 uppercase tracking-[0.15em]">Who&apos;s here today?</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                {[
                  { id: 'shubham', name: 'Shubham', emoji: '👦', bg: 'bg-blush-50' },
                  { id: 'khushi', name: 'Khushi', emoji: '👧', bg: 'bg-blush-50' }
                ].map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (i + 1), duration: 0.6 }}
                  >
                    <Card
                      hover
                      className="cursor-pointer group relative overflow-hidden bg-white rounded-3xl"
                      onClick={() => handlePersonSelect(p.id as 'shubham' | 'khushi')}
                    >
                      <CardContent className="p-10 flex flex-col items-center space-y-6">
                        <div className={cn("w-28 h-28 rounded-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500 shadow-rose-glow border-4 border-blush-50", p.bg)}>
                          {p.emoji}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <span className="text-2xl font-poppins font-bold tracking-tight text-deep-plum">{p.name}</span>
                          <span className="text-xs uppercase tracking-widest font-bold text-raspberry/60">Let&apos;s do this!</span>
                        </div>

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-xs uppercase tracking-wider bg-blush-50 px-2 py-1 rounded-full text-raspberry font-bold">
                            Partner waiting
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mood-step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-12"
            >
              <div className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-poppins font-bold text-deep-plum transition-colors duration-300 tracking-tight">Welcome back, {useAppStore.getState().currentPerson === 'shubham' ? 'Shubham ✨' : 'Khushi ✨'}</h3>
                <p className="text-xl text-deep-plum opacity-90 font-bold">Aaj kya karna hai?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'design', icon: '🎨', title: "Let's create!", desc: 'Jump into workspace' },
                  { id: 'vibe', icon: '😌', title: "Just exploring", desc: 'Browse and chill' },
                  { id: 'lost', icon: '💡', title: "Need some ideas", desc: 'Get inspired' }
                ].map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 * (i + 1) }}
                    className="h-full"
                  >
                    <Card
                      hover
                      onClick={() => handleMoodSelect(m.id as any)}
                      className="cursor-pointer bg-white group h-full"
                    >
                      <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-blush-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">{m.icon}</div>
                        <h4 className="font-poppins font-bold text-lg text-deep-plum leading-tight">{m.title}</h4>
                        <p className="text-sm text-deep-plum opacity-80 leading-relaxed font-bold">{m.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <Button
                variant="ghost"
                onClick={() => setStep('person')}
                className="text-raspberry hover:text-raspberry/80 font-bold opacity-80 hover:opacity-100"
              >
                Wait, it&apos;s not me!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

