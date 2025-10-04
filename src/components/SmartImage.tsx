// src/components/SmartImage.tsx
'use client'

import Image, { type ImageProps, type StaticImageData } from 'next/image'
import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

// Blur placeholder خفيف جدًا
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4='

// التحقق من الروابط الخارجية
function needsProxy(src: string | undefined): boolean {
  if (!src || typeof src !== 'string') return false
  try {
    const url = new URL(src)
    return url.hostname === 'exaado.plebits.com'
  } catch {
    return false
  }
}

// تحويل الرابط للـ proxy (مع normalization)
// ✅ وفق التعديل: تنظيف الرابط بإزالة الـ query params
function toProxiedUrl(src: string): string {
  if (!needsProxy(src)) return src

  try {
    const url = new URL(src)
    const cleanUrl = `${url.origin}${url.pathname}`
    return `/api/image-proxy?url=${encodeURIComponent(cleanUrl)}`
  } catch {
    return `/api/image-proxy?url=${encodeURIComponent(src)}`
  }
}

type SmartImageProps = Omit<ImageProps, 'placeholder' | 'blurDataURL'> & {
  fallbackSrc?: string
}

export default function SmartImage({
  src,
  alt,
  className,
  fallbackSrc = '/image.jpg',
  onError,
  onLoad,
  ...props
}: SmartImageProps) {
  // ✅ useMemo بدل useState لثبات normalizedSrc
  const normalizedSrc = useMemo(() => {
    if (typeof src === 'string') {
      return toProxiedUrl(src)
    }

    if (src && typeof src === 'object' && 'src' in src) {
      return (src as StaticImageData).src
    }

    return typeof src === 'undefined' ? '' : String(src)
  }, [src])

  const normalizedFallback = useMemo(() => toProxiedUrl(fallbackSrc), [fallbackSrc])

  // ✅ الحالة تعتمد على normalizedSrc المحسوب
  const [imageSrc, setImageSrc] = useState<string>(normalizedSrc)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // تحديث المصدر عند تغيير prop
  useEffect(() => {
    setImageSrc(normalizedSrc)
    setIsLoaded(false)
    setHasError(false)
  }, [normalizedSrc])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && normalizedFallback && imageSrc !== normalizedFallback) {
      setHasError(true)
      setImageSrc(normalizedFallback)
    }
    onError?.(e)
  }

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true)
    onLoad?.(e)
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Skeleton loader */}
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 via-gray-200/80 to-gray-100 dark:from-neutral-900 dark:via-neutral-800/80 dark:to-neutral-900"
          aria-hidden="true"
        />
      )}

      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        className={cn(
          'object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        onLoad={handleLoad}
        onError={handleError}
        quality={85}
        // مهم: استخدم كاش Next.js
        unoptimized={false}
      />
    </div>
  )
}
