"use client";

import Image, { type ImageProps, type StaticImageData } from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import {
  blurPlaceholders,
  getOptimalQuality,
  generateSizesAttribute,
} from "@/utils/imageUtils";
import { Loader2 } from "lucide-react";

// استخدام blur placeholders المحسّنة
const BLUR_DATA_URL = blurPlaceholders.light;

// التحقق من الروابط الخارجية
function needsProxy(src: string | undefined): boolean {
  if (!src || typeof src !== "string") return false;
  try {
    const url = new URL(src);
    return url.hostname === "exaado.plebits.com";
  } catch {
    return false;
  }
}

// تحويل الرابط للـ proxy (مع normalization لإزالة الـ query params)
function toProxiedUrl(src: string): string {
  if (!needsProxy(src)) return src;
  try {
    const url = new URL(src);
    const cleanUrl = `${url.origin}${url.pathname}`;
    return `/api/image-proxy?url=${encodeURIComponent(cleanUrl)}`;
  } catch {
    return `/api/image-proxy?url=${encodeURIComponent(src)}`;
  }
}

type SmartImageProps = Omit<
  ImageProps,
  "placeholder" | "blurDataURL" | "loading"
> & {
  fallbackSrc?: string;
  /** ألغِ انتقالات الفيد/البلور نهائيًا (مفيد للـ Hero) */
  noFade?: boolean;
  /** عطّل سكيليتون الطبقة فوق الصورة */
  disableSkeleton?: boolean;
  /** تحميل مُبكّر فعليًا: priority + loading="eager" */
  eager?: boolean;
  /** نوع blur placeholder (light, dark, primary, secondary) */
  blurType?: "light" | "dark" | "primary" | "secondary" | "neutral";
  /** تحسين تلقائي للجودة بناءً على العرض */
  autoQuality?: boolean;
  /** تفعيل Lazy Loading باستخدام IntersectionObserver */
  lazy?: boolean;
  /** عرض Spinner أثناء التحميل */
  showSpinner?: boolean;
  /** نوع Loader (spinner, skeleton, pulse) */
  loaderType?: "spinner" | "skeleton" | "pulse";
};

export default function SmartImage({
  src,
  alt,
  className,
  fallbackSrc = "/image.jpg",
  onError,
  onLoad,
  noFade = false,
  disableSkeleton = false,
  eager = false,
  priority, // سيُتجاهل إن لم يكن eager
  blurType = "light",
  autoQuality = true,
  lazy = false,
  showSpinner = true,
  loaderType = "skeleton",
  width,
  ...props
}: SmartImageProps) {
  // src النهائي (proxy/normalize)
  const normalizedSrc = useMemo(() => {
    if (typeof src === "string") return toProxiedUrl(src);
    if (src && typeof src === "object" && "src" in src) {
      return (src as StaticImageData).src;
    }
    return typeof src === "undefined" ? "" : String(src);
  }, [src]);

  const normalizedFallback = useMemo(
    () => toProxiedUrl(fallbackSrc),
    [fallbackSrc],
  );

  // لا نعيد تعيين isLoaded إذا لم يتغير normalizedSrc فعليًا
  const prevSrcRef = useRef<string | null>(null);

  const [imageSrc, setImageSrc] = useState<string>(normalizedSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazy);

  // Lazy loading باستخدام IntersectionObserver
  const { ref: lazyRef, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px",
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (prevSrcRef.current !== normalizedSrc) {
      prevSrcRef.current = normalizedSrc;
      setImageSrc(normalizedSrc);
      setIsLoaded(false);
      setHasError(false);
    }
  }, [normalizedSrc]);

  // بدء التحميل عند ظهور الصورة في viewport
  useEffect(() => {
    if (lazy && isVisible && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [lazy, isVisible, shouldLoad]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && normalizedFallback && imageSrc !== normalizedFallback) {
      setHasError(true);
      setImageSrc(normalizedFallback);
    }
    onError?.(e);
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  // التحميل المبكّر
  const finalPriority = eager ? true : priority;
  const loading: ImageProps["loading"] = eager ? "eager" : undefined;
  const placeholder = noFade ? "empty" : "blur";
  const wrapperClasses = cn("relative h-full w-full overflow-hidden");

  // اختيار blur placeholder المناسب
  const blurDataURL = noFade ? undefined : blurPlaceholders[blurType];

  // تحسين الجودة تلقائياً
  const quality =
    autoQuality && typeof width === "number"
      ? getOptimalQuality(width)
      : props.quality || 85;

  // حالة التحميل
  const isLoading = !isLoaded && shouldLoad;

  return (
    <div ref={lazy ? lazyRef : undefined} className={wrapperClasses}>
      {/* Loading States */}
      {!disableSkeleton && !noFade && isLoading && (
        <>
          {/* Skeleton Loader */}
          {loaderType === "skeleton" && (
            <div
              className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-100 via-gray-200/80 to-gray-100 dark:from-neutral-900 dark:via-neutral-800/80 dark:to-neutral-900"
              aria-hidden="true"
            />
          )}

          {/* Pulse Loader */}
          {loaderType === "pulse" && (
            <div
              className="absolute inset-0 bg-gray-200 dark:bg-neutral-800"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer" />
            </div>
          )}

          {/* Spinner Loader */}
          {loaderType === "spinner" && showSpinner && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-neutral-900/50 backdrop-blur-sm"
              aria-hidden="true"
            >
              <Loader2
                className="h-8 w-8 animate-spin text-blue-500"
                aria-label="جاري تحميل الصورة"
              />
            </div>
          )}
        </>
      )}

      {/* الصورة - تحميل فقط إذا shouldLoad = true */}
      {shouldLoad && (
        <Image
          {...props}
          src={imageSrc}
          alt={alt}
          width={width}
          className={cn(
            // منع وميض GPU أثناء التحريك/التمرير:
            "[transform:translateZ(0)] [backface-visibility:hidden] will-change-transform",
            noFade
              ? "opacity-100"
              : "transition-opacity duration-500 ease-in-out " +
                  (isLoaded ? "opacity-100" : "opacity-0"),
            "object-cover",
            className,
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
          decoding={eager ? "sync" : "async"}
        />
      )}
    </div>
  );
}
