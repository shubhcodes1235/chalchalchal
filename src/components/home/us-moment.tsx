import { motion } from "framer-motion"
import { Heart, Sparkles } from "lucide-react"
import Image from "next/image"
import { useAppStore } from "@/lib/store/app-store"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { cn } from "@/lib/utils/cn"

export function UsMoment() {
    const { currentPerson } = useAppStore()
    const settings = useLiveQuery(() => db.appSettings.get('main'))

    const isKhushi = currentPerson === 'khushi'
    const isShubham = currentPerson === 'shubham'
    const isBoth = currentPerson === 'both'

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full relative overflow-hidden bg-white/40 dark:bg-card/40 backdrop-blur-md rounded-[4rem] p-12 md:p-20 border border-pink-100/50 dark:border-night-800 flex flex-col items-center text-center space-y-8"
        >
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />
            </div>

            <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-full bg-white dark:bg-night-900 flex items-center justify-center shadow-xl shadow-pink-500/10 relative z-10"
            >
                <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
            </motion.div>

            <div className="space-y-4 relative z-10">
                <h2 className="text-4xl md:text-5xl font-handwritten font-black text-night-950 dark:text-white flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6 text-pink-400" />
                    {isShubham ? "Chasing our dream, together." : isKhushi ? "Building our world, together." : "It's always been us."}
                    <Sparkles className="w-6 h-6 text-pink-400" />
                </h2>
                
                <div className="max-w-xl mx-auto space-y-4">
                    <p className="text-xl md:text-2xl font-display font-medium text-night-600 dark:text-night-400 italic leading-relaxed">
                        &ldquo;{settings?.manifestationQuote || "Chote chote kadam bhi kadam hain."}&rdquo;
                    </p>
                    <div className="flex items-center justify-center gap-2 opacity-40">
                        <div className="h-px w-8 bg-night-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-night-500 dark:text-night-400">Our Manifestation</span>
                        <div className="h-px w-8 bg-night-300" />
                    </div>
                </div>
            </div>

            <div className="pt-6 flex items-center justify-center -space-x-4 relative z-10">
                <motion.div 
                    whileHover={{ scale: 1.1, zIndex: 20 }}
                    className={cn(
                        "w-16 h-16 rounded-full border-4 border-white dark:border-card overflow-hidden bg-blue-100 dark:bg-blue-900/30 shadow-lg flex items-center justify-center transition-all",
                        isShubham || isBoth ? "ring-4 ring-pink-500/20" : "grayscale opacity-50"
                    )}
                >
                    <Image src="/shubham.jpg" alt="Shubham" width={64} height={64} className="w-full h-full object-cover" />
                </motion.div>
                <motion.div 
                    whileHover={{ scale: 1.1, zIndex: 20 }}
                    className={cn(
                        "w-16 h-16 rounded-full border-4 border-white dark:border-card overflow-hidden bg-pink-100 dark:bg-pink-900/30 shadow-lg flex items-center justify-center transition-all",
                        isKhushi || isBoth ? "ring-4 ring-pink-500/20" : "grayscale opacity-50"
                    )}
                >
                    <Image src="/khushi.jpg" alt="Khushi" width={64} height={64} className="w-full h-full object-cover" />
                </motion.div>
            </div>
        </motion.div>
    )
}
