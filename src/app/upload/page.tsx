// src/app/upload/page.tsx
"use client"

import React, { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { PageWrapper } from "@/components/layout/page-wrapper"
import { UploadZone } from "@/components/upload/upload-zone"
import { UploadForm } from "@/components/upload/upload-form"
import { designsRepo } from "@/lib/db/repositories/designs.repo"
import { streaksRepo } from "@/lib/db/repositories/streaks.repo"
import { useAppStore } from "@/lib/store/app-store"
import { useImageCompression } from "@/lib/hooks/use-image-compression"
import { toast } from "react-hot-toast"
import { useCelebration } from "@/providers/celebration-provider"
import { useSound } from "@/providers/sound-provider"
import { createDesignInFirebase } from "@/lib/firebase/services/designs"
import { logActivityToFirebase } from "@/lib/firebase/services/activity"

function UploadPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialPrompt = searchParams.get('prompt') || ""

    const { currentPerson } = useAppStore()
    const { compressImage, createThumbnail } = useImageCompression()
    const { triggerCelebration } = useCelebration()
    const { playSound } = useSound()

    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (formData: any) => {
        if (!file) {
            toast.error("Please select a design file first!")
            return
        }

        const uploader = currentPerson === 'both' ? 'shubham' : currentPerson

        setIsLoading(true)
        const toastId = toast.loading("Processing your masterpiece...")

        try {
            // 1. Image Compression
            const compressedBlob = await compressImage(file)
            const thumbnailBlob = await createThumbnail(file)

            // 2. Database Save
            const designsCount = await designsRepo.getDesignCount()
            const isFirst = designsCount === 0

            await designsRepo.addDesign({
                person: uploader,
                title: formData.title,
                description: formData.description,
                imageBlob: compressedBlob as Blob,
                thumbnailBlob: thumbnailBlob as Blob,
                tool: formData.tool,
                toolDetail: formData.toolDetail,
                tags: formData.tags,
                moodRating: formData.moodRating,
                workType: formData.workType,
                isFirstDesign: isFirst,
            })

            // 2.5 Firebase Save (Cloud Sync)
            // Fire and forget - don't block the UI if this fails, but log it.
            createDesignInFirebase(file, {
                title: formData.title,
                description: formData.description,
                tool: formData.tool,
                toolDetail: formData.toolDetail,
                moodRating: formData.moodRating,
                tags: formData.tags,
                uploadedByPersona: uploader as 'shubham' | 'khushi',
                workType: formData.workType,
                isFirstDesign: isFirst
            }).catch(err => {
                console.error("Firebase Sync Failed:", err);
                toast.error("Saved locally, but sync failed.", { id: toastId });
            });

            // 2.6 Activity Log
            await logActivityToFirebase({
                person: uploader as any,
                type: 'upload',
                title: 'New Design',
                message: `${uploader === 'shubham' ? 'Shubham' : 'Khushi'} just uploaded a new masterpiece! 🎨`
            })

            // 3. Update Streak
            await streaksRepo.recordActivity(uploader)

            // 4. Success Effects
            // CUSTOM MESSAGING
            let successMsg = "Design saved successfully!"
            if (uploader === 'khushi') {
                successMsg = "You showed up today 💗"
            } else if (currentPerson === 'both') {
                successMsg = "Chal chal chal — saved!"
            }

            toast.success(successMsg, { id: toastId })
            playSound('upload')

            if (isFirst) {
                triggerCelebration('first-upload')
            } else {
                triggerCelebration('upload')
            }

            // 5. Navigate
            setTimeout(() => {
                router.push('/archive')
            }, 1000)

        } catch (error) {
            console.error(error)
            toast.error("Failed to save design. Please try again.", { id: toastId })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <PageWrapper className="max-w-4xl">
            <div className="space-y-12 pt-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-night-950 tracking-tightest leading-none">New Creation</h1>
                </div>

                <div className="space-y-8">
                    <UploadZone file={file} onFileSelect={setFile} />

                    {file && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <UploadForm
                                onSubmit={handleSubmit}
                                isLoading={isLoading}
                                initialPrompt={initialPrompt}
                            />
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}

export default function UploadPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UploadPageContent />
        </Suspense>
    )
}
