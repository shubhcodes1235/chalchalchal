// src/components/upload/upload-zone.tsx
"use client"

import React, { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Image as ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

interface UploadZoneProps {
    file: File | null;
    onFileSelect: (file: File | null) => void;
}

export function UploadZone({ file, onFileSelect }: UploadZoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0])
        }
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.svg']
        },
        multiple: false
    })

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {file ? (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative group rounded-3xl overflow-hidden border-4 border-pink-100 shadow-soft aspect-video bg-white"
                    >
                        <Image
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            fill
                            className="object-contain"
                        />
                        <button
                            onClick={() => onFileSelect(null)}
                            className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full text-pink-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dropzone"
                        {...(getRootProps() as any)}
                        className={cn(
                            "border-4 border-dashed rounded-4xl p-12 flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all duration-300 min-h-[300px]",
                            isDragActive
                                ? "border-pink-500 bg-pink-50/50 scale-[0.98]"
                                : "border-pink-100 hover:border-pink-300 hover:bg-white"
                        )}
                    >
                        <input {...getInputProps()} id="design-upload-input" name="design-file" />
                        <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                            <Upload className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-handwritten font-bold text-night-700">Drop your masterpiece here 🎨</p>
                            <p className="text-sm text-night-600">or click to browse files</p>
                        </div>
                        <div className="flex space-x-2 opacity-50">
                            <span className="px-2 py-1 bg-white border border-pink-100 rounded text-xs font-bold">JPG</span>
                            <span className="px-2 py-1 bg-white border border-pink-100 rounded text-xs font-bold">PNG</span>
                            <span className="px-2 py-1 bg-white border border-pink-100 rounded text-xs font-bold">WEBP</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
