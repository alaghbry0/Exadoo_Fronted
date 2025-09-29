"use client"

import Image, { ImageProps } from "next/image"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbGw9J2xpbmVhci1ncmFkaWVudCgwLCAxMDAlLCAxMDAlKScvPGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdnbCcgeDE9JzAlJyB5MT0nMCUnIHgyPScwJScgeTI9JzEwMCUnPjxzdG9wIHByb2dyZXNzaW9uPScwJScgZmlsbD0nI2Y1ZjhmZicgLz48c3RvcCBwcm9ncmVzc2lvbj0nMTAwJScgZmlsbD0nI2UyZTVmNCcgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4="

type SmartImageProps = ImageProps & {
  fallbackSrc?: ImageProps["src"]
}

export default function SmartImage({
  className,
  fallbackSrc,
  loading = "lazy",
  onError,
  src: initialSrc,
  alt,
  ...props
}: SmartImageProps) {
  const [src, setSrc] = useState(initialSrc)

  useEffect(() => {
    setSrc(initialSrc)
  }, [initialSrc])

  return (
    <Image
      {...props}
      alt={alt}
      className={cn("bg-gray-100 object-cover dark:bg-neutral-900", className)}
      src={src}
      loading={loading}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={(event) => {
        if (fallbackSrc && src !== fallbackSrc) {
          setSrc(fallbackSrc)
          return
        }
        onError?.(event)
      }}
    />
  )
}
