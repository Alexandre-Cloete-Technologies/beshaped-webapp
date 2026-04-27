'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

// Extend standard Next.js ImageProps so it accepts all default props
interface OptimizedImageProps extends ImageProps {
    containerClassName?: string
}

export default function OptimizedImage({
    src,
    alt,
    containerClassName = "",
    className = "",
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <div className={`relative overflow-hidden ${containerClassName}`}>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                </div>
            )}

            <Image
                src={src}
                alt={alt}
                {...props}
                onLoad={() => setIsLoading(false)}
                className={`
          duration-500 ease-in-out
          ${className}
          ${isLoading ? 'scale-105 blur-lg opacity-0' : 'scale-100 blur-0 opacity-100'}
        `}
            />
        </div>
    )
}
