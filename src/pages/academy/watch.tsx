'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useStartWatching, useCourseDetails } from '@/services/courseDetails'
import { useTelegram } from '@/context/TelegramContext'
import { ArrowLeft, Lock, PlayCircle, Menu, X, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

function toBase64Url(str: string) {
  const b64 = typeof window !== 'undefined' ? btoa(str) : Buffer.from(str).toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

type Section = { id: string; title: string; lessons: Array<{ id: string; title: string; user_validity?: boolean }> }

function CoursePlaylist({
  courseId, currentLessonId, sections,
}: {
  courseId: string
  currentLessonId: string
  sections: Section[]
}) {
  const router = useRouter()
  const handleLessonClick = (lessonId: string) => {
    router.push({ pathname: '/academy/watch', query: { courseId, lessonId } })
  }

  if (!sections?.length) return null

  return (
    <div className="bg-white dark:bg-neutral-900 border-t lg:border-t-0 lg:border-r border-neutral-200 dark:border-neutral-800 h-full">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-inherit z-10">
        <h2 className="font-bold text-lg text-neutral-900 dark:text-neutral-100">محتوى الدورة</h2>
      </div>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-800 overflow-y-auto h-full pb-20">
        {sections.map((section) => (
          <div key={section.id} className="animate-fade-in">
            <h3 className="font-semibold p-4 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300">
              {section.title}
            </h3>
            <ul>
              {section.lessons.map((lesson, index) => {
                const isCurrent = lesson.id === currentLessonId
                const isLocked = lesson.user_validity === false
                return (
                  <li key={lesson.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <button
                      onClick={() => !isLocked && handleLessonClick(lesson.id)}
                      disabled={isLocked}
                      className={cn(
                        'w-full text-right p-4 flex items-center gap-3 transition-all duration-200 group',
                        isCurrent && 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500',
                        !isLocked && 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:pr-5',
                        isLocked && 'cursor-not-allowed opacity-60'
                      )}
                    >
                      <div
                        className={cn(
                          'flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110',
                          isCurrent ? 'text-primary-500' : 'text-neutral-400',
                          isLocked && 'text-neutral-500'
                        )}
                      >
                        {isLocked ? <Lock size={16} /> : <PlayCircle size={20} />}
                      </div>
                      <span
                        className={cn(
                          'font-medium text-sm transition-colors',
                          isCurrent ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-700 dark:text-neutral-300'
                        )}
                      >
                        {lesson.title}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WatchLessonPage() {
  const router = useRouter()
  const { telegramId } = useTelegram()
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false)
  const [isVideoEnded, setIsVideoEnded] = useState(false)

  const courseId = (router.query.courseId as string) || ''
  const lessonId = (router.query.lessonId as string) || ''
  const lessonTitleFromQuery = (router.query.lessonTitle as string) || ''

  const { mutateAsync, isPending, isError, error, data: watchData } = useStartWatching()
  const { data: courseDetails } = useCourseDetails(telegramId, courseId)

  useEffect(() => {
    if (telegramId && lessonId) {
      setIsVideoEnded(false)
      mutateAsync({ telegramId, lessonId, playbackType: 'inline' }).catch(() => {})
    }
  }, [telegramId, lessonId, mutateAsync])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // في الإنتاج: تحقّق من event.origin
      if (event?.data?.action === 'videoEnded') setIsVideoEnded(true)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const getInternalEmbed = () => {
    if (!watchData?.m3u8_url) return ''
    const needsHeaders = !!(watchData.headers && Object.keys(watchData.headers).length > 0)
    const u = encodeURIComponent(toBase64Url(watchData.m3u8_url))
    const h = needsHeaders ? `&h=${encodeURIComponent(toBase64Url(JSON.stringify(watchData.headers)))}` : ''
    const t = watchData?.thumbnails_vtt_url
      ? `&t=${encodeURIComponent(toBase64Url(String(watchData.thumbnails_vtt_url)))}` : ''
    return `/players/hls.html?u=${u}${h}${t}`
  }

  const findNextLesson = () => {
    if (!courseDetails?.sections?.length) return null
    const all = (courseDetails.sections as Section[]).flatMap((s) => s.lessons || [])
    const idx = all.findIndex((l) => l.id === lessonId)
    return idx > -1 && idx < all.length - 1 ? all[idx + 1] : null
  }
  const nextLesson = findNextLesson()

  const handleNextLesson = () => {
    if (nextLesson && nextLesson.user_validity !== false) {
      router.push(`/academy/watch?courseId=${courseId}&lessonId=${nextLesson.id}`)
    }
  }

  const renderPlayer = () => {
    if (isPending) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white flex-col gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-400">جاري تجهيز المشاهدة…</p>
        </div>
      )
    }
    if (isError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black p-4 text-red-300 flex-col gap-3">
          <div className="text-4xl">⚠️</div>
          <p className="text-center">تعذّر بدء المشاهدة: {(error as any)?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )
    }

    const internal = getInternalEmbed()
    const src = internal || (watchData as any)?.iframe_url

    if (!src) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-white flex-col gap-3">
          <div className="text-4xl">📺</div>
          <p>لم يتم العثور على الفيديو.</p>
        </div>
      )
    }

    return (
      <div className="relative w-full h-full">
        <iframe
          key={src}
          src={src}
          className="w-full h-full border-0"
          loading="eager"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          title="مشغل الفيديو"
        />
        {isVideoEnded && nextLesson && nextLesson.user_validity !== false && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center animate-fade-in z-30">
            <h3 className="text-xl font-bold text-white mb-1">انتهى الدرس</h3>
            <p className="text-neutral-300 mb-4">الدرس التالي: {nextLesson.title}</p>
            <button
              onClick={handleNextLesson}
              className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all transform hover:scale-105"
            >
              <SkipForward size={20} />
              <span>الانتقال للدرس التالي</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  const currentLessonTitle =
    lessonTitleFromQuery ||
    (courseDetails?.sections as Section[])?.flatMap((s) => s.lessons).find((l) => l.id === lessonId)?.title ||
    '...'

  return (
    <div dir="rtl" className="h-screen flex flex-col bg-neutral-100 dark:bg-black">
      <header className="w-full bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between flex-shrink-0 z-20 shadow-sm">
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <button
            onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="فتح/إغلاق قائمة الدروس"
          >
            {isPlaylistOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="min-w-0 flex-1">
            <Link
              href={`/academy/course/${courseId}`}
              className="text-sm text-neutral-500 hover:underline hover:text-primary-500 transition-colors block truncate"
            >
              {courseDetails?.title || 'العودة للدورة'}
            </Link>
            <h1 className="font-bold text-neutral-900 dark:text-neutral-100 truncate text-sm sm:text-base">
              {currentLessonTitle}
            </h1>
          </div>
        </div>
        <Link
          href={`/academy/course/${courseId}`}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">صفحة الدورة</span>
        </Link>
      </header>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative">
        <main className="flex-grow w-full lg:w-3/4 bg-black relative">
          <div className="aspect-video w-full h-full">{renderPlayer()}</div>
        </main>

        <aside
          className={cn(
            'w-full lg:w-1/4 h-full overflow-y-auto bg-white dark:bg-neutral-900 transition-transform duration-300 absolute lg:relative inset-0 z-10',
            isPlaylistOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          )}
        >
          <CoursePlaylist
            courseId={courseId}
            currentLessonId={lessonId}
            sections={(courseDetails?.sections as Section[]) || []}
          />
        </aside>

        {isPlaylistOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-0" onClick={() => setIsPlaylistOpen(false)} />
        )}
      </div>
    </div>
  )
}
