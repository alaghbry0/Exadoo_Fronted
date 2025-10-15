'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useStartWatching } from '@/services/courseDetails'
import { useTelegram } from '@/context/TelegramContext'
import { ArrowLeft } from 'lucide-react'

export default function WatchLessonPage() {
  const router = useRouter()
  const { telegramId } = useTelegram()

  const courseId = (router.query.courseId as string) || ''
  const lessonId = (router.query.lessonId as string) || ''
  const type = ((router.query.type as string) === 'iframe' ? 'iframe' : 'inline') as 'inline' | 'iframe'

  const { mutateAsync, isPending, isError, error, data } = useStartWatching()

  const videoRef = useRef<HTMLVideoElement>(null)
  const [hlsInstance, setHlsInstance] = useState<any>(null)

  // اطلب رابط التشغيل فورًا
  useEffect(() => {
    if (!telegramId || !lessonId) return
    mutateAsync({ telegramId, lessonId, playbackType: type }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramId, lessonId, type])

  // جهّز hls.js عند توفر m3u8_url
  useEffect(() => {
    return () => {
      // cleanup
      if (hlsInstance) {
        try { hlsInstance.destroy?.() } catch {}
      }
    }
  }, [hlsInstance])

  useEffect(() => {
    if (!data?.m3u8_url || typeof window === 'undefined') return

    async function setupHls() {
      const video = videoRef.current
      if (!video) return
      const canPlayNative = video.canPlayType('application/vnd.apple.mpegurl')
      if (canPlayNative) {
        video.src = data.m3u8_url!
        await video.play().catch(() => {})
        return
      }
      const mod = await import('hls.js') // lazy
      const Hls = mod.default
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(data.m3u8_url!)
        hls.attachMedia(video)
        setHlsInstance(hls)
        video.play?.()
      } else {
        // fallback بسيط: افتح الرابط مباشرة
        window.location.href = data.m3u8_url!
      }
    }

    setupHls().catch(() => {})
  }, [data?.m3u8_url])

  return (
    <div dir="rtl" className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-neutral-900/90 backdrop-blur border-b border-neutral-200/70 dark:border-neutral-800/70">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة
          </button>
          <div className="text-sm opacity-70">مشاهدة الدرس</div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {isPending && (
          <div className="rounded-2xl border p-8 text-center">جاري تجهيز المشاهدة…</div>
        )}
        {isError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            تعذّر بدء المشاهدة: {(error as any)?.message}
          </div>
        )}

        {data?.iframe_url && (
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <iframe
              src={data.iframe_url}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
            />
          </div>
        )}

        {!data?.iframe_url && data?.m3u8_url && (
          <div className="aspect-video w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <video
              ref={videoRef}
              controls
              playsInline
              className="w-full h-full bg-black"
            />
          </div>
        )}

        {data?.note && (
          <p className="mt-3 text-xs opacity-70">{data.note}</p>
        )}
      </main>
    </div>
  )
}
