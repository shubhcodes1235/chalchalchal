// src/app/page.tsx
"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useAppStore } from "@/lib/store/app-store"
import { useRouter } from "next/navigation"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { Card, CardContent } from "@/components/ui/card"
import { useTimeOfDay } from "@/lib/hooks/use-time-of-day"
import { db } from "@/lib/db/database"
import { updatePresenceMood, subscribeToPartnerPresence } from "@/lib/firebase/services/presence"
import { cn } from "@/lib/utils/cn"
import { useCelebration } from "@/providers/celebration-provider"

export default function EntryPage() {
  const router = useRouter()
  const { setCurrentPerson } = useAppStore()
  const { greeting } = useTimeOfDay()
  const { triggerCelebration } = useCelebration()

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
    await updatePresenceMood(person, 'active'); 
    router.push('/home')
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

        <div className="space-y-10">
          <div className="space-y-2">
            <h3 className="text-sm md:text-base font-bold text-deep-plum dark:text-night-300 opacity-80 uppercase tracking-[0.2em]">Who&apos;s here today?</h3>
          </div>

          {/* Partner Online Banner */}
          {(partnerStatus.shubham.isOnline || partnerStatus.khushi.isOnline) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 items-center"
            >
              {partnerStatus.shubham.isOnline && (
                <div className="flex items-center gap-2 bg-blue-500/10 dark:bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-sm shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="flex items-center gap-1.5">
                    Shubham is already here — come join them!
                  </span>
                </div>
              )}
              {partnerStatus.khushi.isOnline && (
                <div className="flex items-center gap-2 bg-pink-500/10 dark:bg-pink-500/20 px-4 py-2 rounded-full border border-pink-500/20 text-pink-600 dark:text-pink-400 font-bold text-sm shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  <span className="flex items-center gap-1.5">
                    Khushi is already here — come join them!
                  </span>
                </div>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4 sm:gap-8 max-w-2xl mx-auto">
            {[
              { id: 'shubham', name: 'Shubham', image: '/shubham.jpg', bg: 'bg-blue-50' },
              { id: 'khushi', name: 'Khushi', image: '/khushi.jpg', bg: 'bg-pink-50' }
            ].map((p, i) => {
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
                        <span className="text-xs uppercase tracking-widest font-bold text-raspberry/60 dark:text-night-400">Let&apos;s do this!</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
