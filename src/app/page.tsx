// src/app/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useAppStore } from "@/lib/store/app-store"
import { useMoodStore } from "@/lib/store/mood-store"
import { useRouter } from "next/navigation"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTimeOfDay } from "@/lib/hooks/use-time-of-day"
import { db } from "@/lib/db/database"
import { updatePresenceMood, subscribeToPartnerPresence } from "@/lib/firebase/services/presence"
import { cn } from "@/lib/utils/cn"
import { useCelebration } from "@/providers/celebration-provider"

export default function EntryPage() {
  const router = useRouter()
  const { currentPerson, setCurrentPerson } = useAppStore()
  const { setMood } = useMoodStore()
  const { greeting } = useTimeOfDay()
  const { triggerCelebration } = useCelebration()

  const [step, setStep] = useState<'person' | 'mood'>('person')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [partnerStatus, setPartnerStatus] = useState<Record<'shubham' | 'khushi', { isOnline: boolean; sessionMood: string | null }>>({
    shubham: { isOnline: false, sessionMood: null },
    khushi: { isOnline: false, sessionMood: null }
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const unsubShubham = subscribeToPartnerPresence('shubham', (data) => {
      setPartnerStatus(prev => ({ ...prev, shubham: { isOnline: data.isOnline, sessionMood: data.sessionMood } }))
    })
    const unsubKhushi = subscribeToPartnerPresence('khushi', (data) => {
      setPartnerStatus(prev => ({ ...prev, khushi: { isOnline: data.isOnline, sessionMood: data.sessionMood } }))
    })
    return () => {
      unsubShubham()
      unsubKhushi()
    }
  }, [])

  const handlePersonSelect = async (person: 'shubham' | 'khushi') => {
    setCurrentPerson(person)
    triggerCelebration('milestone')
    await db.appSettings.update('main', { currentPerson: person })
    setStep('mood')
  }

  const handleMoodSelect = (mood: 'design' | 'vibe' | 'lost') => {
    setMood(mood)
    // Synchronize mood to Firebase so the partner's screen can react
    if (currentPerson && currentPerson !== 'both') {
      updatePresenceMood(currentPerson, mood);
    }

    if (mood === 'lost') {
      router.push('/reassurance')
    } else {
      router.push('/home')
    }
  }

  const getMoodEmoji = (mood: string | null) => {
    switch (mood) {
      case 'design': return '🎨';
      case 'vibe': return '😌';
      case 'lost': return '💡';
      default: return '✨';
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-700 bg-white dark:bg-night-950">
      {/* Background Atmosphere - Dreamy Blobs */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <motion.div 
          animate={{ x: mousePos.x * 0.1, y: mousePos.y * 0.1 }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-raspberry/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: (mousePos.x - 500) * -0.05, y: (mousePos.y - 500) * -0.05 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blush-100/40 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: mousePos.x - 250, 
            y: mousePos.y - 250,
          }}
          transition={{ type: "spring", damping: 40, stiffness: 40, mass: 0.8 }}
          className="absolute w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[80px]" 
        />
      </div>

      <div className="z-10 w-full max-w-2xl text-center space-y-12">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
            y: 0,
            scale: [0.98, 1, 0.98]
          }}
          transition={{ 
            initial: { duration: 0.6 },
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="text-raspberry font-bold text-xs md:text-xs tracking-[0.25em] uppercase opacity-80 mb-2"
        >
          {greeting}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-4xl md:text-6xl text-deep-plum dark:text-white font-poppins font-black tracking-tight transition-colors duration-300 drop-shadow-sm uppercase">
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
                <h3 className="text-sm md:text-base font-bold text-deep-plum dark:text-night-300 opacity-80 uppercase tracking-[0.2em]">Who&apos;s here today?</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-8 max-w-2xl mx-auto">
                {[
                  { id: 'shubham', name: 'Shubham', image: '/shubham.jpg', bg: 'bg-blue-50' },
                  { id: 'khushi', name: 'Khushi', image: '/khushi.jpg', bg: 'bg-pink-50' }
                ].map((p, i) => {
                  const partnerId = p.id === 'shubham' ? 'khushi' : 'shubham';
                  const partnerName = p.id === 'shubham' ? 'Khushi' : 'Shubham';
                  const partnerData = partnerStatus[partnerId as 'shubham' | 'khushi'];
                  const isPartnerOnline = partnerData.isOnline;
                  const partnerMood = partnerData.sessionMood;

                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (i + 1), duration: 0.6 }}
                      className="h-full"
                    >
                      <Card
                        hover
                        className="cursor-pointer group relative overflow-hidden bg-white/80 dark:bg-night-900/60 backdrop-blur-md rounded-[2.5rem] h-full border-2 border-transparent hover:border-pink-300 dark:hover:border-pink-500/50 ring-0 hover:ring-8 hover:ring-pink-500/5 transition-all duration-500 shadow-sm hover:shadow-2xl"
                        onClick={() => handlePersonSelect(p.id as 'shubham' | 'khushi')}
                      >
                        <CardContent className="p-4 sm:p-8 flex flex-col items-center space-y-4 sm:space-y-6">
                          <div className={cn("w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-rose-glow border-[3px] sm:border-4 border-white dark:border-night-800 relative", p.bg)}>
                            <div className="absolute inset-0 skeleton-shimmer opacity-20 group-hover:opacity-40 transition-opacity" />
                            <Image src={p.image} alt={p.name} width={112} height={112} className="w-full h-full object-cover relative z-10" />
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span className="text-2xl font-poppins font-bold tracking-tight text-deep-plum dark:text-white transition-colors group-hover:text-pink-600">{p.name}</span>
                            {isPartnerOnline ? (
                               <div className="flex items-center justify-center gap-1.5 bg-green-500/10 dark:bg-green-500/20 px-3 py-1 rounded-full border border-green-500/20">
                                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                 <span className="text-[10px] uppercase tracking-widest font-black text-green-600 dark:text-green-400">Online</span>
                               </div>
                            ) : (
                              <span className="text-xs uppercase tracking-widest font-bold text-raspberry/60 dark:text-night-400">Let&apos;s do this!</span>
                            )}
                          </div>

                          {isPartnerOnline && (
                             <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                               <motion.div 
                                 initial={{ scale: 0 }} 
                                 animate={{ scale: 1 }}
                                 className="w-8 h-8 rounded-full bg-white dark:bg-night-800 shadow-lg flex items-center justify-center text-lg border border-pink-100 dark:border-night-700"
                               >
                                 {getMoodEmoji(partnerMood)}
                               </motion.div>
                               <span className="text-[10px] uppercase tracking-wider bg-raspberry/10 dark:bg-raspberry/20 px-2 py-1 rounded-full text-raspberry font-black flex items-center gap-1 shadow-sm border border-raspberry/20">
                                 {partnerName} is here 🌸
                               </span>
                             </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
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
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-poppins font-bold text-deep-plum dark:text-white transition-colors duration-300 tracking-tight">Welcome back, {currentPerson === 'shubham' ? 'Shubham ✨' : 'Khushi ✨'}</h3>
                <p className="text-xl text-deep-plum dark:text-night-300 opacity-90 font-bold">Aaj kya karna hai?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
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
                      onClick={() => handleMoodSelect(m.id as 'design' | 'vibe' | 'lost')}
                      className="cursor-pointer bg-white/90 dark:bg-night-900/60 backdrop-blur-sm group h-full rounded-[2.5rem] border-2 border-transparent hover:border-raspberry/20"
                    >
                      <CardContent className="p-4 md:p-8 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-3xl bg-blush-50 dark:bg-raspberry/10 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-inner">{m.icon}</div>
                        <h4 className="font-poppins font-bold text-lg text-deep-plum dark:text-white leading-tight">{m.title}</h4>
                        <p className="text-sm text-deep-plum/70 dark:text-night-400 leading-relaxed font-bold">{m.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <Button
                variant="ghost"
                onClick={() => setStep('person')}
                className="text-raspberry hover:text-raspberry underline-offset-8 hover:underline font-bold opacity-80 hover:opacity-100 transition-all"
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

