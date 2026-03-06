// src/app/settings/page.tsx
"use client"

import React from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { settingsRepo } from "@/lib/db/repositories/settings.repo"
import { Sun, Moon, Monitor, Palette, Bell, MousePointer2, Download, Trash2, Heart } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { toast } from "react-hot-toast"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ShieldCheck, RefreshCw, Upload, FileJson, LogOut, Users, User, Wifi, Send } from "lucide-react"
import Image from "next/image"
import { useAppStore } from "@/lib/store/app-store"
import { logActivityToFirebase } from "@/lib/firebase/services/activity"

export default function SettingsPage() {
    const { currentPerson, setCurrentPerson } = useAppStore()
    const settings = useLiveQuery(() => db.appSettings.get('main'))
    const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false)
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false)
    const [resetConfirmation, setResetConfirmation] = React.useState("")
    const [isPurgingCloud, setIsPurgingCloud] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    // Check if Firebase is actually configured
    const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!settings) {
        return (
            <PageWrapper className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <RefreshCw className="w-10 h-10 text-night-400 animate-spin" />
                <p className="text-night-500 font-bold">Waking up your settings...</p>
            </PageWrapper>
        );
    }

    const updateSetting = async (key: string, value: any) => {
        await settingsRepo.updateSettings({ [key]: value })
        if (key === 'currentPerson') {
            setCurrentPerson(value)
        }
        toast.success("Settings updated!")
    }

    const exportData = async () => {
        try {
            const designs = await db.designs.toArray()
            const notes = await db.stickyNotes.toArray()
            const appSettings = await db.appSettings.toArray()
            const data = { designs, notes, settings: appSettings, version: "1.0.0", timestamp: new Date().toISOString() }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `dream-design-backup-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success("Backup created successfully! Keep it safe. 🛡️")
        } catch (error) {
            toast.error("Failed to create backup.")
        }
    }

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target?.result as string)

                // Basic validation
                if (!data.designs || !data.notes) {
                    throw new Error("Invalid backup file")
                }

                if (confirm("This will replace all your current data. Are you absolutely sure?")) {
                    await db.transaction('rw', db.designs, db.stickyNotes, db.appSettings, async () => {
                        await db.designs.clear()
                        await db.stickyNotes.clear()
                        await db.designs.bulkAdd(data.designs)
                        await db.stickyNotes.bulkAdd(data.notes)
                        if (data.settings) {
                            await db.appSettings.clear()
                            await db.appSettings.bulkAdd(data.settings)
                        }
                    })
                    toast.success("Progress restored! Reloading...")
                    setTimeout(() => window.location.reload(), 1500)
                }
            } catch (error) {
                toast.error("Failed to restore. Please check if the file is a valid backup.")
            }
        }
        reader.readAsText(file)
    }

    const handleStartFresh = async () => {
        const confirmation = resetConfirmation.trim().toUpperCase();
        if (confirmation === "START FRESH") {
            try {
                // If cloud purge is requested, we need Firebase tools
                if (isPurgingCloud && isFirebaseConfigured) {
                    const { collection, getDocs, deleteDoc, doc, writeBatch } = await import("firebase/firestore");
                    const { db: fDb } = await import("@/lib/firebase/config");

                    const collectionsToPurge = ['designs', 'notes', 'activities', 'wins', 'partners', 'streaks'];
                    
                    toast.loading("Purging cloud data... ☁️", { id: 'purge-cloud' });
                    
                    for (const collName of collectionsToPurge) {
                        const q = collection(fDb, collName);
                        const snapshot = await getDocs(q);
                        
                        // Delete in batches of 500 (Firestore limit)
                        const docs = snapshot.docs;
                        for (let i = 0; i < docs.length; i += 500) {
                            const batch = writeBatch(fDb);
                            docs.slice(i, i + 500).forEach((d) => batch.delete(d.ref));
                            await batch.commit();
                        }
                    }
                    toast.success("Cloud data purged! ☁️", { id: 'purge-cloud' });
                }

                // Use a transaction for reliability (Local)
                await db.transaction('rw', db.tables, async () => {
                    await Promise.all(db.tables.map(table => table.clear()));
                });
                
                // Clear zustand storage
                localStorage.removeItem('dream-design-app-storage');
                
                toast.success("Progress reset!", { duration: 5000 });
                setTimeout(() => window.location.reload(), 2000)
            } catch (error) {
                console.error("Reset failed:", error);
                toast.error("Database reset failed. Try clearing browser cache.");
            }
        }
    }

    const pingPartner = async () => {
        if (!isFirebaseConfigured) {
            toast.error("Firebase is not connected! Connection impossible. 🛑");
            return;
        }
        const uploader = currentPerson === 'both' ? 'shubham' : currentPerson
        try {
            await logActivityToFirebase({
                person: uploader,
                type: 'hype',
                title: 'Sync Check!',
                message: `${uploader === 'shubham' ? 'Shubham' : 'Khushi'} sent a test ping! 🧪`
            })
            toast.success("Ping sent to cloud!")
        } catch (error) {
            console.error("Ping failed:", error)
            toast.error("Cloud connection failed. Check your internet or Firebase config.")
        }
    }

    return (
        <PageWrapper className="max-w-3xl space-y-8 pb-32 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-night-950 tracking-tight">Settings</h1>
                    <p className="text-night-600 font-medium">Customize your sanctuary exactly how you like it.</p>
                </div>
                
                {/* Connection Status Badge */}
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2",
                    isFirebaseConfigured 
                        ? "bg-green-50 text-green-600 border-green-100" 
                        : "bg-red-50 text-red-600 border-red-100"
                )}>
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", isFirebaseConfigured ? "bg-green-500" : "bg-red-500")} />
                    {isFirebaseConfigured ? "Cloud Connected" : "Cloud Disconnected"}
                </div>
            </div>

            {/* Reassurance Banner */}
            <div className="bg-night-50 border border-night-100 p-4 rounded-2xl flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-xs text-night-600 font-medium leading-relaxed">
                    Your progress is stored safely. Nothing is deleted without your confirmation. This is your safe space.
                </p>
            </div>

            {/* Profile Switcher */}
            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-night-600 flex items-center gap-2 px-1">
                    <User className="w-3.5 h-3.5" /> Profile Selection
                </h3>
                <Card className="border-night-100 shadow-sm rounded-3xl overflow-hidden border-t-4 border-t-purple-400">
                    <CardContent className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            {[
                                { id: 'shubham', label: 'Shubham', image: '/shubham.jpg', color: 'blue' },
                                { id: 'khushi', label: 'Khushi', image: '/khushi.jpg', color: 'pink' },
                                { id: 'both', label: 'Together', icon: <span className="text-2xl">✨</span>, color: 'purple' }
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => updateSetting('currentPerson', p.id as any)}
                                    className={cn(
                                        "flex flex-row sm:flex-col items-center sm:justify-center p-4 sm:p-6 rounded-2xl border-2 transition-all gap-4 sm:gap-0 sm:space-y-3",
                                        currentPerson === p.id
                                            ? (p.id === 'shubham' ? "border-blue-200 bg-blue-50 shadow-inner" :
                                                p.id === 'khushi' ? "border-pink-200 bg-pink-50 shadow-inner" :
                                                     "border-purple-200 bg-purple-50 shadow-inner")
                                            : "border-transparent bg-night-50 hover:bg-night-100"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-sm transition-all shrink-0",
                                        currentPerson !== p.id && "grayscale opacity-40 scale-90"
                                    )}>
                                        {p.image ? (
                                            <Image src={p.image} alt={p.label} width={48} height={48} className="w-full h-full object-cover" />
                                        ) : (
                                            p.icon
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-black uppercase tracking-widest text-left sm:text-center shrink-0",
                                        currentPerson === p.id
                                            ? (p.id === 'shubham' ? "text-blue-600" :
                                                p.id === 'khushi' ? "text-pink-600" :
                                                    "text-purple-600")
                                            : "text-night-600"
                                    )}>
                                        {p.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Cloud Sync Diagnostic */}
            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-night-600 flex items-center gap-2 px-1">
                    <Wifi className="w-3.5 h-3.5" /> Cloud Connection
                </h3>
                <Card className="border-border shadow-sm rounded-3xl overflow-hidden border-t-4 border-t-blue-400">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-1 text-center sm:text-left">
                                <p className="font-bold text-night-900">Sync Diagnostic</p>
                                <p className="text-xs text-night-500 max-w-[300px]">Send a test notification to the other persona to verify the real-time link.</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={pingPartner}
                                className="rounded-xl font-black text-xs h-11 px-6 bg-white border-2 border-night-100 hover:border-night-200"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                PING PARTNER
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <div className="space-y-10">
                {/* 1. Appearance Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-night-600 flex items-center gap-2 px-1">
                        <Palette className="w-3.5 h-3.5" /> Appearance
                    </h3>
                    <Card className="border-night-100 shadow-sm rounded-3xl overflow-hidden border-t-4 border-t-orange-400">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-bold text-night-900">Theme Mode</p>
                                    <p className="text-xs text-night-600">Sunrise is recommended for focus.</p>
                                </div>
                                <div className="flex bg-muted p-1 rounded-xl border border-border">
                                    {[
                                        { id: 'sunrise', icon: Sun },
                                        { id: 'midnight', icon: Moon },
                                        { id: 'auto', icon: Monitor }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => updateSetting('theme', t.id)}
                                            className={cn(
                                                "flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-black transition-all",
                                                settings.theme === t.id ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <t.icon className="w-3.5 h-3.5" />
                                            <span className="capitalize">{t.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-night-50 pt-6">
                                <div className="space-y-1">
                                    <p className="font-bold text-night-900">Hand-drawn Textures</p>
                                    <p className="text-xs text-night-600">Adds paper-like grain and texture.</p>
                                </div>
                                <Button
                                    variant={settings.seasonalThemeEnabled ? "primary" : "outline"}
                                    size="sm"
                                    className="rounded-full w-14 h-8 px-0 font-black text-xs"
                                    onClick={() => updateSetting('seasonalThemeEnabled', !settings.seasonalThemeEnabled)}
                                >
                                    {settings.seasonalThemeEnabled ? "ON" : "OFF"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* 2. Notifications Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-night-600 flex items-center gap-2 px-1">
                        <Bell className="w-3.5 h-3.5" /> Notifications
                    </h3>
                    <Card className="border-night-100 shadow-sm rounded-3xl overflow-hidden border-t-4 border-t-blue-100">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                                <div className="space-y-1">
                                    <p className="font-bold text-night-900">Push Notifications</p>
                                    <p className="text-xs text-night-600">Motivate each other! Get notified when your partner writes a note or uploads a design.</p>
                                </div>
                                <div className="flex items-center space-x-2 self-start sm:self-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            if ('Notification' in window) {
                                                if (Notification.permission === 'granted') {
                                                    try {
                                                        new Notification("Dream & Design", {
                                                            body: "Yay! Notifications are working perfectly! 🎉",
                                                            icon: `/${currentPerson === 'both' ? 'shubham' : currentPerson}.jpg`
                                                        });
                                                    } catch (e) {
                                                        navigator.serviceWorker.ready.then(registration => {
                                                            registration.showNotification("Dream & Design", {
                                                                body: "Yay! Notifications are working perfectly! 🎉",
                                                                icon: `/${currentPerson === 'both' ? 'shubham' : currentPerson}.jpg`
                                                            });
                                                        });
                                                    }
                                                } else {
                                                    toast.error("Please enable permissions first!");
                                                }
                                            }
                                        }}
                                        className="rounded-xl font-bold bg-white text-night-600 border-night-200 hover:bg-night-50"
                                    >
                                        Test
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            if ('Notification' in window) {
                                                const permission = await Notification.requestPermission();
                                                if (permission === 'granted') {
                                                    toast.success("Notifications enabled! 🔔");
                                                } else {
                                                    toast.error("Notification permission denied.");
                                                }
                                            } else {
                                                toast.error("Browser does not support notifications.");
                                            }
                                        }}
                                        className="rounded-xl font-bold bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                    >
                                        <Bell className="w-3.5 h-3.5 mr-2" />
                                        Enable
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-xs font-black uppercase tracking-widest text-night-600 flex items-center gap-2 px-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Backup & Restore
                        </h3>
                        <p className="text-xs text-night-600 font-bold px-1">Your progress is precious. Keep it safe.</p>
                    </div>
                    <Card className="border-night-100 shadow-sm rounded-3xl overflow-hidden border-t-4 border-t-green-100">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="font-bold text-night-900">Create Backup File</p>
                                    <p className="text-xs text-night-600">Saves all your designs, notes, progress, and memories.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={exportData} className="rounded-xl font-bold shrink-0 ml-2">
                                    <Download className="w-3.5 h-3.5 mr-2" />
                                    Backup
                                </Button>
                            </div>

                            <div className="flex items-center justify-between border-t border-night-50 pt-6">
                                <div className="space-y-1">
                                    <p className="font-bold text-night-900">Restore from Backup</p>
                                    <p className="text-xs text-night-600">Recover your progress from a previously saved backup.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-xl font-bold shrink-0 ml-2">
                                    <Upload className="w-3.5 h-3.5 mr-2" />
                                    Restore
                                </Button>
                                <input
                                    type="file"
                                    id="restore-file"
                                    name="restore-file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".json"
                                    onChange={handleRestore}
                                />
                            </div>

                            <div className="flex items-center justify-between border-t border-night-50 pt-6">
                                <div className="space-y-1">
                                    <p className="font-bold text-night-900">Automatic Backup</p>
                                    <p className="text-xs text-night-600">Your progress is backed up automatically on this device.</p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled
                                    className="rounded-full w-14 h-8 px-0 font-black text-xs opacity-100 bg-green-100 text-green-700 border-none shrink-0 ml-2"
                                >
                                    ON
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* 4. Data & Privacy Section */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-night-600 flex items-center gap-2 px-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Data & Privacy
                    </h3>
                    <Card className="border-night-100 shadow-sm rounded-3xl overflow-hidden border-t-4 border-t-red-200">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                                <div className="space-y-1">
                                    <p className="font-bold text-night-900">Start Fresh</p>
                                    <p className="text-xs text-night-600 max-w-[200px]">Clears all data permanently. We strongly recommend creating a backup first.</p>
                                </div>
                                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="danger" size="sm" className="rounded-xl font-bold bg-white text-red-500 border-2 border-red-200 hover:bg-red-50 self-start sm:self-auto">
                                            <Trash2 className="w-3.5 h-3.5 mr-2 text-red-400" />
                                            Start Fresh
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-[2rem]">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black text-night-950">Are you absolutely sure?</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-6 space-y-4">
                                            <div className="p-4 bg-red-50 rounded-2xl text-red-700 text-sm font-medium leading-relaxed">
                                                This will permanently delete all your local designs, notes, streaks, and progress. 
                                            </div>

                                            {isFirebaseConfigured && (
                                                <div className="flex items-center space-x-3 p-4 bg-night-50 rounded-2xl border-2 border-night-100 cursor-pointer" onClick={() => setIsPurgingCloud(!isPurgingCloud)}>
                                                    <div className={cn(
                                                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                                        isPurgingCloud ? "bg-red-500 border-red-500" : "bg-white border-night-200"
                                                    )}>
                                                        {isPurgingCloud && <RefreshCw className="w-3 h-3 text-white animate-spin-slow" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-black text-night-900 uppercase tracking-tight">Also Purge Cloud Data</p>
                                                        <p className="text-[10px] text-night-500 font-bold">This will delete EVERYTHING from Firebase too (for both of you).</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-night-600">Type "START FRESH" to confirm</label>
                                                <input
                                                    type="text"
                                                    id="fresh-start-confirm"
                                                    name="confirm-reset"
                                                    value={resetConfirmation}
                                                    onChange={e => setResetConfirmation(e.target.value)}
                                                    placeholder="START FRESH"
                                                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background dark:bg-muted/30 focus:border-red-400 outline-none text-foreground font-bold placeholder:text-muted-foreground"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter className="gap-2 sm:gap-0">
                                            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} className="rounded-xl font-bold h-12">Cancel</Button>
                                            <Button
                                                variant="danger"
                                                onClick={handleStartFresh}
                                                disabled={resetConfirmation.trim().toUpperCase() !== "START FRESH"}
                                                className="rounded-xl font-bold h-12 bg-red-500 text-white hover:bg-red-600 disabled:opacity-30"
                                            >
                                                Delete Everything
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Credits Section */}
                <div className="pt-12 text-center space-y-6">
                    <div className="flex justify-center items-center gap-4">
                        <div className="w-16 h-16 rounded-full border-[3px] border-white overflow-hidden bg-blue-100 flex items-center justify-center shadow-lg -rotate-6">
                            <Image src="/shubham.jpg" alt="S" width={64} height={64} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-2xl animate-pulse">✨</div>
                        <div className="w-16 h-16 rounded-full border-[3px] border-white overflow-hidden bg-pink-100 flex items-center justify-center shadow-lg rotate-6">
                            <Image src="/khushi.jpg" alt="K" width={64} height={64} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-night-600 text-sm font-black tracking-tight flex items-center justify-center">
                            Handcrafted with <Heart className="inline w-4 h-4 text-pink-500 fill-pink-500 mx-1.5 animate-pulse-soft" /> for Shubham & Khushi.
                        </p>
                        <p className="text-xs text-night-600 font-bold uppercase tracking-widest opacity-80">Version 1.0.0 • Offline First</p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    )
}
