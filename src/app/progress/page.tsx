// src/app/progress/page.tsx
"use client"

import React from "react"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { Progress } from "@/components/ui/progress-bar"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { TOOLS } from "@/lib/constants/tools"
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import { Sparkles, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils/cn"

export default function ProgressPage() {
    const designs = useLiveQuery(() => db.designs.toArray())
    const streak = useLiveQuery(() => db.streakData.get('main-streak'))
    const income = useLiveQuery(() => db.income.toArray())
    const milestones = useLiveQuery(() => db.milestones.toArray())

    if (!designs || !milestones) return null

    // Process data for charts
    const usedToolsCount = designs.reduce((acc: Record<string, number>, d) => {
        acc[d.tool] = (acc[d.tool] || 0) + 1
        return acc
    }, {})

    const designsByTool = TOOLS.map(tool => ({
        name: tool.name,
        count: usedToolsCount[tool.id] || 0,
        color: tool.color,
        isUsed: !!usedToolsCount[tool.id]
    })).sort((a, b) => (b.count - a.count))

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(new Date(), 6 - i)
        const dateStr = format(d, 'yyyy-MM-dd')
        const count = designs.filter(design => format(new Date(design.createdAt), 'yyyy-MM-dd') === dateStr).length
        return { name: format(d, 'EEE'), count }
    })

    const totalIncome = income?.reduce((sum, item) => sum + item.amount, 0) || 0
    const stage = Math.max(1, ...milestones.filter(m => m.isCompleted).map(m => m.stage))

    // Interpretation for charts
    const hasActivityRecently = last7Days.some(d => d.count > 0)
    const interpretationMessage = hasActivityRecently
        ? "Your rhythm is forming. Every mark on this graph is a promise kept."
        : "The board is resting. When you're ready, we'll start a new rhythm."

    return (
        <PageWrapper className="space-y-8 pb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-night-950 tracking-tight leading-none">Our Progress</h1>
                </div>

                <div className="flex items-center space-x-3">
                    <Link href="/board">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-night-100 hover:bg-night-200 rounded-xl text-night-700 text-xs font-black uppercase tracking-widest transition-all border border-night-200 shadow-sm h-11">
                            <Heart className="w-4 h-4" />
                            <span>Share Gratitude</span>
                        </button>
                    </Link>
                    <div className="hidden md:flex items-center space-x-3 bg-white px-5 py-3 rounded-2xl border border-night-100 shadow-sm h-11">
                        <div className="flex flex-col justify-center">
                            <span className="text-sm font-black tracking-widest uppercase text-night-600 leading-none mb-0.5">Today's Focus</span>
                            <span className="text-xs font-bold text-night-900 leading-none">
                                {designs.some(d => format(d.createdAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
                                    ? "✔ Creation Complete"
                                    : "✖ Time to Create"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Metrics - Contextualized */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Artworks", value: designs.length, emoji: "🎨", sub: designs.length === 1 ? "The first of many" : "Building a library" },
                    {
                        label: "Longest Streak",
                        value: streak?.longestStreak || 0,
                        emoji: "🔥",
                        customValue: (streak?.longestStreak || 0) === 0 ? "Building" : undefined,
                        sub: (streak?.longestStreak || 0) < 3 ? "Momentum starts here" : "Found your pace"
                    },
                    {
                        label: "Journey Stage",
                        value: stage,
                        emoji: "🚀",
                        customValue: stage === 1 ? "Beginning" : `Stage ${stage}`,
                        sub: "You're growing into this"
                    },
                    {
                        label: "Total Revenue",
                        value: totalIncome,
                        emoji: "💰",
                        customValue: totalIncome === 0 ? "Focus phase" : `₹${totalIncome}`,
                        sub: totalIncome === 0 ? "Revenue will come later" : "The harvest begins"
                    },
                ].map((stat, i) => (
                    <Card key={i} className="border-night-100 shadow-sm rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <span className="text-3xl mb-3">{stat.emoji}</span>
                            <span className="text-2xl font-black text-night-950 tracking-tighter">
                                {stat.customValue || <AnimatedCounter end={stat.value as number} />}
                            </span>
                            <span className="text-sm uppercase tracking-widest font-black text-night-600 mt-1">{stat.label}</span>
                            <p className="text-xs text-pink-500 font-bold mt-2 opacity-80">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Effort > Outcome Indicator */}
                <Card className="lg:col-span-1 border-night-100 shadow-sm rounded-[2rem] bg-night-50 p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-night-950 tracking-tight">Persistence</h3>
                        <p className="text-xs text-night-600 font-medium leading-relaxed italic">
                            "Success is the sum of small efforts, repeated day in and day out."
                        </p>
                    </div>

                    <div className="space-y-4 mt-8">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-night-600">
                            <span>Days Shown Up</span>
                            <span className="text-night-950">{streak?.currentStreak || 0}</span>
                        </div>
                        <Progress value={Math.min(((streak?.currentStreak || 0) / 30) * 100, 100)} className="h-3 bg-white border border-night-100" />
                        <p className="text-xs text-night-500 font-bold text-center">
                            Aiming for {Math.min((streak?.currentStreak || 0) + 1, 30)} days. Just keep breathing.
                        </p>
                    </div>
                </Card>

                {/* Activity Chart */}
                <Card className="lg:col-span-2 border-night-100 shadow-sm rounded-[2rem] p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-night-950 tracking-tight">Creation Rhythm</h3>
                            <p className="text-xs text-night-600 font-medium ">{interpretationMessage}</p>
                        </div>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={last7Days}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A193', fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A193' }} width={25} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#FF3388"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#FF3388', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tool Distribution */}
                <Card className="border-night-100 shadow-sm rounded-[2rem] p-6">
                    <div className="space-y-1 mb-6">
                        <h3 className="text-xl font-black text-night-950 tracking-tight">Tools Arsenal</h3>
                        <p className="text-xs text-night-600 font-medium ">You explore when you are ready.</p>
                    </div>
                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={designsByTool}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#A1A193', fontWeight: 'black' }} />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: '#F5F5F3' }} contentStyle={{ borderRadius: '1rem', border: 'none', fontSize: '10px' }} />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                                    {designsByTool.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.count > 0 ? entry.color : '#F5F5F3'}
                                            opacity={entry.count > 0 ? 1 : 0.5}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {designsByTool.some(t => t.count === 0) && (
                        <div className="mt-4 pt-4 border-t border-night-50">
                            <p className="text-xs text-night-600 font-black tracking-widest uppercase">
                                Invitation: {designsByTool.find(t => t.count === 0)?.name} is waiting for its first mark.
                            </p>
                        </div>
                    )}
                </Card>

                {/* Milestone Progress */}
                <Card className="border-night-100 shadow-sm rounded-[2rem] p-6">
                    <div className="space-y-1 mb-6">
                        <h3 className="text-xl font-black text-night-950 tracking-tight">Journey Milestones</h3>
                        <p className="text-xs text-night-600 font-medium ">Every stage is a new way of seeing.</p>
                    </div>
                    <div className="space-y-5">
                        {milestones.sort((a, b) => a.stage - b.stage).map((m) => {
                            const isCurrent = m.stage === stage + 1 || (stage === 5 && m.stage === 5);
                            return (
                                <div key={m.id} className={cn("space-y-2 group transition-opacity", !m.isCompleted && !isCurrent && "opacity-40")}>
                                    <div className="flex justify-between items-end">
                                        <span className="text-[13px] font-black text-night-950 flex items-center gap-2">
                                            <span className="text-base">{m.emoji}</span>
                                            <span>{m.title}</span>
                                        </span>
                                        <span className={cn(
                                            "text-sm font-black uppercase tracking-widest",
                                            m.isCompleted ? "text-pink-500" : isCurrent ? "text-night-500 font-black" : "text-night-500"
                                        )}>
                                            {m.isCompleted ? "Completed" : isCurrent ? "Active Path" : "Future Path"}
                                        </span>
                                    </div>
                                    <Progress value={m.isCompleted ? 100 : isCurrent ? 15 : 0} className={cn("h-1.5", m.isCompleted ? "bg-pink-100" : "bg-night-50")} />
                                    {isCurrent && !m.isCompleted && (
                                        <p className="text-sm text-night-600 font-bold italic">You are growing into this...</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            {/* Dynamic Motivation Card */}
            <Card className="bg-gradient-to-br from-pink-500 to-rose-400 text-white border-none shadow-glow rounded-[3rem] p-10 text-center space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Sparkles className="w-32 h-32" />
                </div>

                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-4xl mx-auto shadow-inner">
                    👑
                </div>

                <div className="space-y-2">
                    <h3 className="text-4xl font-black tracking-tight">You are doing incredible.</h3>
                    <p className="opacity-90 max-w-lg mx-auto leading-relaxed font-medium italic">
                        {designs.length === 0
                            ? "Every great designer started with a blank canvas. Today is a beautiful day to make your first mark."
                            : designs.length === 1
                                ? "The first artwork is the hardest. You've already done the impossible part."
                                : `Look at how much you've grown. You've already created ${designs.length} memories on this journey. The you of yesterday would be so proud.`}
                    </p>
                </div>

                <div className="flex items-center justify-center -space-x-3 pt-4">
                    <div className="w-12 h-12 rounded-full border-4 border-white/20 overflow-hidden bg-blue-100 flex items-center justify-center shadow-lg">
                        <Image src="/shubham.jpg" alt="S" width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-white/20 overflow-hidden bg-pink-100 flex items-center justify-center shadow-lg">
                        <Image src="/khushi.jpg" alt="K" width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                </div>
            </Card>
        </PageWrapper>
    )
}
