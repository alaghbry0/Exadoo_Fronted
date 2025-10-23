'use client'

import Image, { type ImageProps, type StaticImageData } from 'next/image'
import { useState, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { blurPlaceholders, getOptimalQuality, generateSizesAttribute } from '@/utils/imageUtils'

// استخدام blur placeholders المحسّنة
const BLUR_DATA_URL = blurPlaceholders.light

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

// تحويل الرابط للـ proxy (مع normalization لإزالة الـ query params)
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

type SmartImageProps = Omit<ImageProps, 'placeholder' | 'blurDataURL' | 'loading'> & {
  fallbackSrc?: string
  /** ألغِ انتقالات الفيد/البلور نهائيًا (مفيد للـ Hero) */
  noFade?: boolean
  /** عطّل سكيليتون الطبقة فوق الصورة */
  disableSkeleton?: boolean
  /** تحميل مُبكّر فعليًا: priority + loading="eager" */
  eager?: boolean
  /** نوع blur placeholder (light, dark, primary, secondary) */
  blurType?: 'light' | 'dark' | 'primary' | 'secondary' | 'neutral'
  /** تحسين تلقائي للجودة بناءً على العرض */
  autoQuality?: boolean
}

export default function SmartImage({
  src,
  alt,
  className,
  fallbackSrc = '/image.jpg',
  onError,
  onLoad,
  noFade = false,
  disableSkeleton = false,
  eager = false,
  priority, // سيُتجاهل إن لم يكن eager
  blurType = 'light',
  autoQuality = true,
  width,
  ...props
}: SmartImageProps) {
  // src النهائي (proxy/normalize)
  const normalizedSrc = useMemo(() => {
    if (typeof src === 'string') return toProxiedUrl(src)
    if (src && typeof src === 'object' && 'src' in src) {
      return (src as StaticImageData).src
    }
    return typeof src === 'undefined' ? '' : String(src)
  }, [src])

  const normalizedFallback = useMemo(() => toProxiedUrl(fallbackSrc), [fallbackSrc])

  // لا نعيد تعيين isLoaded إذا لم يتغير normalizedSrc فعليًا
  const prevSrcRef = useRef<string | null>(null)

  const [imageSrc, setImageSrc] = useState<string>(normalizedSrc)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (prevSrcRef.current !== normalizedSrc) {
      prevSrcRef.current = normalizedSrc
      setImageSrc(normalizedSrc)
      setIsLoaded(false)
      setHasError(false)
    }
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

  // التحميل المبكّر
  const finalPriority = eager ? true : priority
  const loading: ImageProps['loading'] = eager ? 'eager' : undefined
  const placeholder = noFade ? 'empty' : 'blur'
  const wrapperClasses = cn('relative h-full w-full overflow-hidden')
  
  // اختيار blur placeholder المناسب
  const blurDataURL = noFade ? undefined : blurPlaceholders[blurType]
  
  // تحسين الجودة تلقائياً
  const quality = autoQuality && typeof width === 'number' 
    ? getOptimalQuality(width) 
    : (props.quality || 85)

  return (
    <div className={wrapperClasses}>
      {/* Skeleton loader */}
      {!disableSkeleton && !noFade && !isLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 via-gray-200/80 to-gray-100 dark:from-neutral-900 dark:via-neutral-800/80 dark:to-neutral-900"
          aria-hidden="true"
        />
      )}

      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        width={width}
        className={cn(
          // منع وميض GPU أثناء التحريك/التمرير:
          '[transform:translateZ(0)] [backface-visibility:hidden] will-change-transform',
          noFade
            ? 'opacity-100'
            : 'transition-opacity duration-300 ' + (isLoaded ? 'opacity-100' : 'opacity-0'),
          'object-cover',
          className
        )}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        quality={quality}
        unoptimized={false}
        priority={!!finalPriority}
        loading={loading}
        draggable={false}
        decoding={eager ? 'sync' : 'async'}
      />
    </div>
  )
}
