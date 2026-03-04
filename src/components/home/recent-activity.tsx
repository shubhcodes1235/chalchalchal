// src/components/home/recent-activity.tsx
"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db/database"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"

export function RecentActivity() {
    const recentDesigns = useLiveQuery(() =>
        db.designs.orderBy('createdAt').reverse().limit(5).toArray()
    )

    if (!recentDesigns || recentDesigns.length === 0) {
        return (
            <div className="text-center py-12 space-y-4">
                <p className="text-night-600 italic">No activity yet. Time to create!</p>
                <Link href="/upload">
                    <span className="text-pink-500 font-bold hover:underline cursor-pointer">Start your first design →</span>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-widest text-night-500 font-bold px-1">Recent Activity</h3>
            <div className="space-y-3">
                {recentDesigns.map((design) => (
                    <Link key={design.id} href={`/archive?id=${design.id}`}>
                        <Card hover className="overflow-hidden border-pink-50 cursor-pointer">
                            <CardContent className="p-3 flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-xl bg-pink-100 overflow-hidden shrink-0 relative">
                                    {design.thumbnailBlob ? (
                                        <Image
                                            src={URL.createObjectURL(design.thumbnailBlob)}
                                            alt={design.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl text-pink-300">🎨</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-night-900 truncate">{design.title}</h4>
                                    <p className="text-xs text-night-600">
                                        {formatDistanceToNow(design.createdAt, { addSuffix: true })}
                                    </p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-xs shadow-inner shrink-0">
                                    {design.person === 'shubham' ? '👦' : '👧'}
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
