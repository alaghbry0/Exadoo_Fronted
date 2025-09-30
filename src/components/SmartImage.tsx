"use client"

import Image, { ImageProps } from "next/image"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbGw9J2xpbmVhci1ncmFkaWVudCgwLCAxMDAlLCAxMDAlKScvPGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdnbCcgeDE9JzAlJyB5MT0nMCUnIHgyPScwJScgeTI9JzEwMCUnPjxzdG9wIHByb2dyZXNzaW9uPScwJScgZmlsbD0nI2Y1ZjhmZicgLz48c3RvcCBwcm9ncmVzc2lvbj0nMTAwJScgZmlsbD0nI2UyZTVmNCcgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4="

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value)

const toProxiedSrc = <T extends ImageProps["src"] | undefined>(value: T) => {
  if (typeof value !== "string") {
    return value
  }
  return isHttpUrl(value) ? `/api/image-proxy?url=${encodeURIComponent(value)}` : value
}

type SmartImageProps = ImageProps & {
  fallbackSrc?: ImageProps["src"]
}

export default function SmartImage({
  className,
  fallbackSrc,
  loading = "lazy",
  onError,
  onLoadingComplete,
  src: initialSrc,
  alt,
  style,
  ...props
}: SmartImageProps) {
  const proxiedInitialSrc = useMemo(() => toProxiedSrc(initialSrc), [initialSrc])
  const proxiedFallbackSrc = useMemo(() => toProxiedSrc(fallbackSrc), [fallbackSrc])

  const [src, setSrc] = useState(proxiedInitialSrc)
  const [blurDataUrl, setBlurDataUrl] = useState<string>(BLUR_DATA_URL)
  const [isLoaded, setIsLoaded] = useState(false)

  const normalizedInitialSrc = useMemo(() => {
    if (typeof initialSrc === "string") return initialSrc
    if (typeof initialSrc === "object" && initialSrc && "src" in initialSrc) {
      return initialSrc.src as string
    }
    return undefined
  }, [initialSrc])

  useEffect(() => {
    setSrc(proxiedInitialSrc)
    setIsLoaded(false)
  }, [proxiedInitialSrc])

  useEffect(() => {
    let isActive = true
    if (!normalizedInitialSrc) {
      setBlurDataUrl(BLUR_DATA_URL)
      return () => {
        isActive = false
      }
    }

    const hydrateBlur = async () => {
      try {
        const { getImageMetadata } = await import("@/lib/cache/academyCache")
        const metadata = await getImageMetadata(normalizedInitialSrc)
        if (!isActive) return
        if (metadata?.inlineBase64) {
          setBlurDataUrl(metadata.inlineBase64)
        } else {
          setBlurDataUrl(BLUR_DATA_URL)
        }
      } catch (error) {
        if (isActive) {
          console.warn("[SmartImage] Failed to resolve blur placeholder", error)
          setBlurDataUrl(BLUR_DATA_URL)
        }
      }
    }

    hydrateBlur()

    return () => {
      isActive = false
    }
  }, [normalizedInitialSrc])

  const baseClassName = cn(
    "bg-gray-100 object-cover dark:bg-neutral-900 transition-opacity duration-500",
    isLoaded ? "opacity-100" : "opacity-0",
    className
  )

  return (
    <span className="relative block h-full w-full overflow-hidden">
      {!isLoaded && (
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 via-gray-200/80 to-gray-100 dark:from-neutral-900 dark:via-neutral-800/80 dark:to-neutral-900"
        />
      )}
      <Image
        {...props}
        alt={alt}
        className={baseClassName}
        src={src}
        loading={loading}
        placeholder="blur"
        blurDataURL={blurDataUrl}
        style={{
          transition: "opacity 300ms ease",
          ...style,
        }}
        onLoadingComplete={(result) => {
          setIsLoaded(true)
          onLoadingComplete?.(result)
        }}
        onError={(event) => {
          setIsLoaded(false)
          if (proxiedFallbackSrc && src !== proxiedFallbackSrc) {
            setSrc(proxiedFallbackSrc)
            return
          }
          onError?.(event)
        }}
      />
    </span>
  )
}
