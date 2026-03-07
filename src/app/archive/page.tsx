"use client"

import React, { useState } from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { DesignCard } from "@/components/archive/design-card"
import { TOOLS } from "@/lib/constants/tools"
import { cn } from "@/lib/utils/cn"
import {
    Search, History, MessageSquareHeart,
    ChevronLeft, ChevronRight, Trash2, Flame, X
} from "lucide-react"
import { PERSONS } from "@/lib/constants/persons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import Image from "next/image"
import { useAppStore } from "@/lib/store/app-store"
import { Design } from "@/lib/db/schemas"
import { updateDesignHype, deleteDesignFromFirebase } from "@/lib/firebase/services/designs"
import { logActivityToFirebase } from "@/lib/firebase/services/activity"
import { getPersonName } from "@/lib/utils/person"
import { toast } from "react-hot-toast"
import { format, isSameMonth } from "date-fns"

const EMPTY_ARRAY: Design[] = []

export default function ArchivePage() {
    const { currentPerson } = useAppStore()
    const [activeTool, setActiveTool] = useState<string>("all")
    const [activePerson, setActivePerson] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null)
    const [confirmDelete, setConfirmDelete] = useState(false)

    const liveDesigns = useLiveQuery(
        async () => {
            const col = db.designs.orderBy('createdAt').reverse();
            return await col.toArray();
        },
        []
    );
    const designs = liveDesigns || EMPTY_ARRAY;

    // Stats
    const stats = React.useMemo(() => {
        if (!designs.length) return null;
        const now = new Date();
        const thisMonth = designs.filter(d => isSameMonth(d.createdAt, now)).length;
        const toolCounts = designs.reduce((acc, d) => {
            acc[d.tool] = (acc[d.tool] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const entries = Object.entries(toolCounts);
        const topToolId = entries.length ? entries.reduce((a, b) => b[1] > a[1] ? b : a)[0] : '';
        const topTool = TOOLS.find(t => t.id === topToolId);
        return { total: designs.length, thisMonth, topTool: topTool?.name || '–' };
    }, [designs]);

    // Filters
    const filteredDesigns = React.useMemo(() => {
        let r = designs;
        if (activeTool !== "all") r = r.filter(d => d.tool === activeTool);
        if (activePerson !== "all") r = r.filter(d => d.person === activePerson);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            r = r.filter(d =>
                d.title.toLowerCase().includes(q) ||
                d.description?.toLowerCase().includes(q) ||
                d.tags.some(t => t.toLowerCase().includes(q))
            );
        }
        return r;
    }, [designs, activeTool, activePerson, searchQuery]);

    // Timeline grouping
    const groupedDesigns = React.useMemo(() => {
        const groups: Record<string, Design[]> = {};
        filteredDesigns.forEach(d => {
            const key = format(d.createdAt, 'MMMM yyyy');
            if (!groups[key]) groups[key] = [];
            groups[key].push(d);
        });
        return groups;
    }, [filteredDesigns]);

    // Lightbox navigation
    const navigateLightbox = (dir: 'next' | 'prev') => {
        if (!selectedDesignId) return;
        const idx = filteredDesigns.findIndex(d => d.id === selectedDesignId);
        if (idx === -1) return;
        const next = dir === 'next'
            ? (idx + 1) % filteredDesigns.length
            : (idx - 1 + filteredDesigns.length) % filteredDesigns.length;
        setSelectedDesignId(filteredDesigns[next].id!);
    };

    const handleDelete = async (id: string) => {
        try {
            await db.designs.delete(id);
            await deleteDesignFromFirebase(id);
            setSelectedDesignId(null);
            toast.success("Removed from journey 🗑️");
        } catch {
            toast.error("Couldn't delete. Try again.");
        }
    };

    // Reset confirm state whenever the design changes
    const handleNavigate = (dir: 'next' | 'prev') => {
        setConfirmDelete(false);
        navigateLightbox(dir);
    };

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedDesignId) return;
            if (e.key === 'ArrowRight') handleNavigate('next');
            if (e.key === 'ArrowLeft') handleNavigate('prev');
            if (e.key === 'Escape') setSelectedDesignId(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedDesignId, filteredDesigns]);

    const handleHype = async (d: Design) => {
        const newHype = (d.hypeCount || 0) + 1;
        await db.designs.update(d.id, { hypeCount: newHype });
        await updateDesignHype(d.id, newHype);
        await logActivityToFirebase({
            person: currentPerson === 'both' ? 'shubham' : currentPerson,
            type: 'hype',
            title: 'Memory Hyped!',
            message: `${getPersonName(currentPerson === 'both' ? 'shubham' : currentPerson)} hyped up "${d.title}"! 🔥`
        });
        toast.success("Hyped! 🔥");
    };

    return (
        <PageWrapper className="space-y-6 pt-4 pb-32">

            {/* ── PAGE HEADER ── */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-pink-500 shrink-0" />
                        <h1 className="text-3xl font-black text-night-950 tracking-tight leading-none italic truncate">Our Journey</h1>
                    </div>
                    <p className="text-xs text-night-400 font-bold hidden sm:block">
                        Every design, every hustle, every milestone.
                    </p>
                    {stats && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 border border-pink-100 text-[10px] font-black uppercase tracking-wide">
                                {stats.total} total
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-wide">
                                {stats.thisMonth} this month
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100 text-[10px] font-black uppercase tracking-wide hidden xs:inline-flex">
                                {stats.topTool}
                            </span>
                        </div>
                    )}
                </div>
                <Link href="/board" className="shrink-0">
                    <Button variant="outline" size="sm" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-9 px-4">
                        Board
                    </Button>
                </Link>
            </div>

            {/* ── SEARCH ── */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-night-400 group-focus-within:text-pink-500 transition-colors pointer-events-none" />
                <Input
                    id="archive-search"
                    name="search"
                    placeholder="Search memories, tags..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 rounded-2xl border-night-100 focus-visible:ring-pink-200 h-11 bg-white text-night-950 placeholder:text-night-400 font-bold text-sm w-full shadow-sm"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-night-400 hover:text-night-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* ── FILTERS ── */}
            <div className="space-y-2">
                {/* Person pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                        { id: 'all', label: 'Everyone', image: undefined },
                        ...PERSONS
                    ].map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActivePerson(p.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight whitespace-nowrap transition-all shrink-0",
                                activePerson === p.id
                                    ? "bg-night-950 text-white shadow"
                                    : "bg-white text-night-600 border border-night-100"
                            )}
                        >
                            {p.image && (
                                <div className="w-4 h-4 rounded-full overflow-hidden">
                                    <Image src={p.image} alt={p.label} width={16} height={16} className="w-full h-full object-cover" />
                                </div>
                            )}
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Tool pills — scrollable row */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <button
                        onClick={() => setActiveTool("all")}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0",
                            activeTool === "all" ? "bg-pink-500 text-white shadow" : "bg-white text-night-600 border border-night-100"
                        )}
                    >
                        All Tools
                    </button>
                    {TOOLS.map(tool => {
                        const Icon = tool.icon;
                        const isActive = activeTool === tool.id;
                        return (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shrink-0",
                                    isActive ? "text-white shadow" : "bg-white text-night-600 border border-night-100"
                                )}
                                style={isActive ? { backgroundColor: tool.color } : {}}
                            >
                                <Icon className="w-3 h-3" />
                                {tool.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── TIMELINE GRID ── */}
            <div className="space-y-10">
                {Object.entries(groupedDesigns).length === 0 ? (
                    <div className="text-center py-16 space-y-4 bg-night-50/60 rounded-3xl border border-dashed border-night-200">
                        <div className="text-5xl">🔍</div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-night-950">Nothing found</h3>
                            <p className="text-xs text-night-500 font-bold">Adjust filters or search to find a memory.</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setActiveTool("all"); setActivePerson("all"); setSearchQuery(""); }}
                            className="rounded-xl font-black uppercase text-[10px] tracking-widest"
                        >
                            Reset
                        </Button>
                    </div>
                ) : (
                    Object.entries(groupedDesigns).map(([month, monthDesigns]) => (
                        <div key={month} className="space-y-4">
                            {/* Month divider */}
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-night-100" />
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-night-400 whitespace-nowrap">
                                    {month}
                                </span>
                                <div className="h-px flex-1 bg-night-100" />
                            </div>
                            {/* Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                                <AnimatePresence mode="popLayout">
                                    {monthDesigns.map((design, i) => (
                                        <DesignCard
                                            key={design.id}
                                            design={design}
                                            onClick={d => setSelectedDesignId(d.id || null)}
                                            priority={i < 4}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── LIGHTBOX ── */}
            <Dialog open={!!selectedDesignId} onOpenChange={() => setSelectedDesignId(null)}>
                {/* [&>button:last-child]:hidden suppresses the DialogContent auto-close X so it doesn't clash */}
                <DialogContent className="[&>button:last-child]:hidden w-full max-w-[100vw] sm:max-w-[92vw] h-[100dvh] sm:h-[92vh] p-0 border-none bg-black overflow-hidden flex flex-col rounded-none sm:rounded-[2.5rem]">
                    {selectedDesignId && (() => {
                        const d = designs.find(d => d.id === selectedDesignId);
                        if (!d) return null;
                        const tool = TOOLS.find(t => t.id === d.tool);
                        const currentIdx = filteredDesigns.findIndex(x => x.id === d.id);
                        const total = filteredDesigns.length;

                        return (
                            <div className="relative w-full h-full flex flex-col bg-black">

                                {/* ── TOP BAR ── */}
                                <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 z-10 bg-gradient-to-b from-black/80 to-transparent absolute top-0 inset-x-0">
                                    {/* Left: tool + title */}
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        {/* Tool pill */}
                                        {tool && (
                                            <div
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shrink-0"
                                                style={{ backgroundColor: tool.color + 'cc' }}
                                            >
                                                <tool.icon className="w-3 h-3" />
                                                <span className="hidden xs:inline">{tool.name}</span>
                                            </div>
                                        )}
                                        {/* Title */}
                                        <h2 className="text-sm sm:text-base font-black text-white leading-tight line-clamp-1 min-w-0">
                                            {d.title}
                                        </h2>
                                    </div>

                                    {/* Right: creator avatar + hype count + close X */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Counter */}
                                        <span className="text-[10px] text-white/40 font-black">
                                            {currentIdx + 1}/{total}
                                        </span>
                                        {/* Avatar */}
                                        <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 shrink-0">
                                            <Image
                                                src={PERSONS.find(p => p.id === d.person)?.image || '/shubham.jpg'}
                                                alt={d.person} width={28} height={28}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Hype count */}
                                        <div className="flex items-center gap-0.5 text-orange-400">
                                            <Flame className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-[11px] font-black">{d.hypeCount || 0}</span>
                                        </div>
                                        {/* Close — our own button, shadcn's is hidden via [&>button:last-child]:hidden */}
                                        <DialogClose asChild>
                                            <button className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </DialogClose>
                                    </div>
                                </div>

                                {/* ── IMAGE AREA ── */}
                                <div className="flex-1 flex items-center justify-center relative min-h-0">
                                    {/* Prev arrow */}
                                    {total > 1 && (
                                        <button
                                            onClick={e => { e.stopPropagation(); handleNavigate('prev'); }}
                                            className="absolute left-2 sm:left-5 z-20 p-2 sm:p-3 rounded-full bg-white/10 active:bg-white/20 text-white/70 hover:text-white transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
                                        </button>
                                    )}

                                    {/* Image */}
                                    <motion.div 
                                        className="relative w-full h-full cursor-grab active:cursor-grabbing"
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={0.2}
                                        onDragEnd={(_, info) => {
                                            const swipeThreshold = 50;
                                            if (info.offset.x > swipeThreshold) handleNavigate('prev');
                                            else if (info.offset.x < -swipeThreshold) handleNavigate('next');
                                        }}
                                    >
                                        {(d.thumbnailBlob || d.imageUrl) && (
                                            <Image
                                                src={d.thumbnailBlob ? URL.createObjectURL(d.thumbnailBlob) : d.imageUrl!}
                                                alt={d.title}
                                                fill
                                                className="object-contain pointer-events-none"
                                                priority
                                            />
                                        )}
                                    </motion.div>

                                    {/* Next arrow */}
                                    {total > 1 && (
                                        <button
                                            onClick={e => { e.stopPropagation(); handleNavigate('next'); }}
                                            className="absolute right-2 sm:right-5 z-20 p-2 sm:p-3 rounded-full bg-white/10 active:bg-white/20 text-white/70 hover:text-white transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
                                        </button>
                                    )}
                                </div>

                                {/* ── BOTTOM ACTION BAR ── */}
                                <div className="flex items-center justify-center gap-2 sm:gap-4 p-4 sm:p-5 bg-gradient-to-t from-black/90 to-transparent shrink-0">
                                    {/* Hype */}
                                    <button
                                        onClick={() => handleHype(d)}
                                        className="flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all shadow-lg shadow-orange-900/30"
                                    >
                                        <Flame className="w-4 h-4 fill-current" />
                                        <span className="text-xs font-black uppercase tracking-wider">Hype</span>
                                    </button>

                                    <div className="w-px h-8 bg-white/10" />

                                    {/* Thought on Board */}
                                    <Link href="/board">
                                        <button className="flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 text-white transition-all">
                                            <MessageSquareHeart className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Thought</span>
                                        </button>
                                    </Link>

                                    <div className="w-px h-8 bg-white/10" />

                                    {/* Delete with inline confirm */}
                                    {confirmDelete ? (
                                        <>
                                            <button
                                                onClick={() => { setConfirmDelete(false); handleDelete(d.id!); }}
                                                className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white transition-all text-xs font-black uppercase tracking-wider"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Yes, remove
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(false)}
                                                className="px-3 sm:px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/70 hover:text-white transition-all text-xs font-black uppercase tracking-wider"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDelete(true)}
                                            className="flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-full bg-white/5 hover:bg-red-500/20 active:scale-95 text-white/40 hover:text-red-400 transition-all"
                                            title="Remove from journey"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Remove</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </PageWrapper>
    )
}
