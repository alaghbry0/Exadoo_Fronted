// src/pages/academy/course/[id].tsx
'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Play,
  Star,
  Award,
  Users,
  Target,
  FileText,
  Lock,
  PlayCircle,
  Clock,
  ShoppingCart,
  Share2,
  Home,
} from 'lucide-react'

import AuthPrompt from '@/components/AuthFab'
import SmartImage from '@/components/SmartImage'
import AcademyPurchaseModal from '@/components/AcademyPurchaseModal'
import SubscribeFab from '@/components/SubscribeFab'
import { useAcademyData } from '@/services/academy'
import { useTelegram } from '@/context/TelegramContext'
import { cn } from '@/lib/utils'

/* =========================
   Types
========================= */
interface Course {
  id: string
  title: string
  short_description: string
  description?: string
  instructor_name?: string
  instructor_photo?: string
  level?: 'beginner' | 'intermediate' | 'advanced' | string
  total_number_of_lessons: number
  total_enrollment?: number
  thumbnail?: string
  cover_image?: string
  price: string
  discounted_price?: string
  is_free_course?: string | null
  outcomes?: string[]
  requirements?: string[]
  rating?: number
  duration?: string
}

/* =========================
   Helpers
========================= */
const formatPrice = (value?: string | number) => {
  if (value === undefined || value === null) return ''
  const str = String(value)
  if (str.toLowerCase?.() === 'free') return 'مجاني'
  const n = Number(str)
  return isNaN(n) ? str : `$${n.toFixed(0)}`
}

const normalizeDescription = (description?: string) => {
  if (!description) return { generalInfo: '', lessons: [] as string[] }

  const normalizedText = description
    .replace(/<br\s*\/?>(?=\s|$)/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li>/gi, '\n• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const lessonPattern = /(?:C\d+)?\s*\|\s*الدرس\s*\d+\s*\|\s*([^<\n]+)/g
  const lessons: string[] = []
  let m: RegExpExecArray | null
  while ((m = lessonPattern.exec(description)) !== null) {
    const title = (m[1] || '').replace(/<[^>]+>/g, ' ').trim()
    if (title) lessons.push(title)
  }

  const generalInfo = normalizedText.split('C3 |')[0]?.trim() || normalizedText
  return { generalInfo, lessons }
}

/* =========================
   Small UI Bits
========================= */
const LevelBadge = ({ level }: { level?: Course['level'] }) => {
  if (!level) return null
  const cfg = {
    beginner: { label: 'مبتدئ', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30', icon: '🌱' },
    intermediate: { label: 'متوسط', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30', icon: '⚡' },
    advanced: { label: 'متقدم', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30', icon: '🚀' },
  } as const
  const c =
    cfg[(level as keyof typeof cfg) ?? 'beginner'] ??
    ({ label: String(level), cls: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900/20 dark:text-neutral-300 dark:border-neutral-800/30', icon: '🎯' } as const)
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold', c.cls)}>
      <span>{c.icon}</span>
      {c.label}
    </span>
  )
}

const StatChip = ({ icon: Icon, label }: { icon: any; label: string | number }) => (
  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
    <Icon className="h-4 w-4 opacity-90" />
    <span>{label}</span>
  </span>
)

/* =========================
   Tabs
========================= */
type TabId = 'curriculum' | 'overview' | 'outcomes'
const tabsDef: { id: TabId; label: string; icon: any }[] = [
  { id: 'curriculum', label: 'المنهج الدراسي', icon: BookOpen },
  { id: 'overview', label: 'الوصف', icon: FileText },
  { id: 'outcomes', label: 'النتائج', icon: Target },
]

const TabsBlock = ({ activeTab, setActiveTab }: { activeTab: TabId; setActiveTab: (t: TabId) => void }) => {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 mb-6">
      <nav className="-mb-px flex space-x-6 rtl:space-x-reverse" aria-label="Tabs">
        {tabsDef.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none',
                active
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:hover:text-neutral-200 dark:hover:border-neutral-600'
              )}
            >
              <span className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

/* =========================
   Curriculum List
========================= */
const CurriculumList = ({
  isEnrolled,
  lessonsTitles,
  totalLessons,
  duration,
}: {
  isEnrolled: boolean
  lessonsTitles: string[]
  totalLessons: number
  duration?: string
}) => {
  const list = lessonsTitles.length
    ? lessonsTitles.map((t, i) => ({ title: t, duration: '—', idx: i }))
    : Array.from({ length: totalLessons || 0 }).map((_, i) => ({
        title: `الدرس ${i + 1}`,
        duration: '—',
        idx: i,
      }))

  return (
    <div className="space-y-2">
      <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 flex justify-between">
        <span>{totalLessons} درس</span>
        <span>{duration || ''}</span>
      </div>

      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        {list.map((lesson, index) => {
          const isLocked = !isEnrolled && index > 1
          const isCompleted = isEnrolled && index < 3
          const isCurrent = isEnrolled && index === 3

          let Ico = PlayCircle as any
          if (isLocked) Ico = Lock
          if (isCompleted) Ico = CheckCircle2

          return (
            <div key={lesson.idx} className="border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
              <button
                className={cn(
                  'w-full p-4 flex items-center justify-between text-right transition-colors',
                  isLocked ? 'cursor-not-allowed bg-neutral-50 dark:bg-neutral-900/50' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                )}
                onClick={() => {
                  if (isLocked) return
                }}
              >
                <div className="flex items-center gap-4">
                  <Ico
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      isLocked ? 'text-neutral-400' : isCompleted ? 'text-green-500' : 'text-primary-500'
                    )}
                  />
                  <span className={cn('font-medium', isLocked ? 'text-neutral-500' : 'text-neutral-800 dark:text-neutral-200')}>
                    {lesson.title}
                  </span>
                  {isCurrent && (
                    <span className="text-xs font-semibold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-md dark:bg-primary-900/30 dark:text-primary-300">
                      الحالي
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-neutral-500">{lesson.duration}</span>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* =========================
   Sidebar (lg+)
========================= */
const CourseSidebar = ({
  course,
  isEnrolled,
  progress,
  onEnrollClick,
}: {
  course: Course
  isEnrolled: boolean
  progress: number
  onEnrollClick: () => void
}) => {
  return (
    <aside className="sticky top-8 space-y-6 hidden lg:block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden"
      >
        <div className="relative aspect-video">
           <SmartImage
              src={course.cover_image || course.thumbnail || '/image.jpg'}
              alt={course.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
              className="object-cover"
              style={{ borderRadius: '0 0 0rem 0rem' }}
              noFade
              disableSkeleton
              eager
              priority
            />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <Play className="h-8 w-8 fill-current" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isEnrolled ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">تقدمك</p>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="font-bold text-primary-600 dark:text-primary-400">{progress}%</span>
                </div>
              </div>
              <button
                onClick={onEnrollClick}
                className="w-full text-center rounded-lg py-3 font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                استمر في التعلم
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold">
                  {formatPrice(course.discounted_price || course.price)}
                </span>
                {course.discounted_price && (
                  <span className="text-xl text-neutral-400 line-through">{formatPrice(course.price)}</span>
                )}
              </div>
              <button
                onClick={onEnrollClick}
                className="w-full text-center rounded-lg py-3 font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                اشترك الآن
              </button>
              <p className="text-xs text-center text-neutral-500">ضمان استرداد الأموال لمدة 30 يومًا</p>
            </div>
          )}
        </div>

        {course.outcomes?.length ? (
          <div className="border-t border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">هذه الدورة تشمل:</h3>
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              {course.outcomes.slice(0, 6).map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-neutral-500" />
                  <span className="line-clamp-2">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </motion.div>
    </aside>
  )
}

/* =========================
   Sticky Header
========================= */
const StickyHeader = ({
  course,
  isEnrolled,
  visible,
  onCTA,
}: {
  course: Course
  isEnrolled: boolean
  visible: boolean
  onCTA: () => void
}) => {
  const buttonText = isEnrolled ? 'ادخل إلى الدورة' : `اشترك - ${formatPrice(course.discounted_price || course.price)}`
  const Icon = isEnrolled ? ArrowLeft : ShoppingCart

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: visible ? 0 : -100 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-md dark:bg-neutral-900/90"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="min-w-0">
          <h2 className="font-bold text-sm sm:text-base text-gray-800 dark:text-neutral-100 truncate">{course.title}</h2>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600 dark:text-neutral-400">
            {typeof course.rating === 'number' && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                {course.rating}
              </span>
            )}
            {course.instructor_name && <span>بواسطة {course.instructor_name}</span>}
          </div>
        </div>

        <button
          onClick={onCTA}
          className="hidden sm:flex items-center justify-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600 transition-colors"
        >
          <Icon className="h-5 w-5" />
          <span>{buttonText}</span>
        </button>
      </div>
    </motion.div>
  )
}


/* =========================
   TitleMeta (تحت الصورة) + CTA Row
========================= */
const TitleMeta = ({
  course,
  isEnrolled,
  onEnrollClick,
}: {
  course: Course
  isEnrolled: boolean
  onEnrollClick: () => void
}) => {
  const hasPrice = !!(course.discounted_price || course.price)

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto -mt-10 md:-mt-12 max-w-6xl px-4"
    >
      <div
        className={cn(
          'rounded-2xl md:rounded-3xl',
          'bg-white/80 dark:bg-neutral-900/80',
          'backdrop-blur-xl',
          'border border-neutral-200/70 dark:border-neutral-800/60',
          'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)]',
          'p-4 sm:p-6 md:p-8'
        )}
      >
        {/* Badge + Title */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {isEnrolled && (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/90 px-3 py-1 text-[11px] font-semibold text-white">
              <CheckCircle2 className="h-4 w-4" />
              أنت مسجل
            </span>
          )}
          {course.level && <LevelBadge level={course.level} />}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          {course.title}
        </h1>

        {course.short_description ? (
          <p className="mt-3 text-sm sm:text-base md:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300 line-clamp-3 md:line-clamp-3">
            {course.short_description}
          </p>
        ) : null}

        {/* Meta row */}
        {/* Meta row */}
<div className="mt-4 flex flex-wrap items-center justify-start gap-3 text-xs sm:text-sm">
  {course.instructor_name && (
    <div className="flex items-center gap-3 flex-row-reverse">
      {course.instructor_photo && (
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
          <SmartImage
            src={course.instructor_photo}
            alt={course.instructor_name}
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>
      )}
      <span className="text-neutral-700 dark:text-neutral-300">
        بواسطة {course.instructor_name}
      </span>
    </div>
  )}
</div>


        {/* CTA Row — يبقى أسفل البطاقة، بدون تغطية للصورة */}
      
           
         
      </div>
    </motion.section>
  )
}

/* =========================
   Page
========================= */
export default function CourseDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  const [activeTab, setActiveTab] = useState<TabId>('curriculum')
  const [showSticky, setShowSticky] = useState(false)

  // Sticky logic
  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 500)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Parallax refs
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, 60]) // نزول بسيط للصورة
  const scale = useTransform(scrollY, [0, 300], [1, 1.05]) // تكبير طفيف

  const course: Course | undefined = useMemo(
    () => data?.courses.find((c: Course) => c.id === id),
    [data, id]
  )

  const isEnrolled = useMemo(
    () => Boolean(data?.my_enrollments?.course_ids?.includes?.(id)),
    [data, id]
  )

  const { generalInfo, lessons } = useMemo(
    () => normalizeDescription(course?.description),
    [course?.description]
  )

  const progress = useMemo(() => {
    if (!course || !isEnrolled) return 0
    let hash = 0
    for (let i = 0; i < course.id.length; i++) hash = (hash * 31 + course.id.charCodeAt(i)) % 997
    const normalized = 35 + (hash % 60)
    return Math.min(100, normalized)
  }, [course, isEnrolled])

  if (isLoading) {
    return (
      <div className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-600 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-neutral-300 flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-neutral-800 dark:border-t-primary-500" />
          <p className="text-lg font-medium">جاري تحميل تفاصيل الدورة...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-12">
        <div className="max-w-md rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-900/10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">تعذّر التحميل</p>
          <p className="mt-2 text-sm text-red-500 dark:text-red-300">{(error as Error)?.message}</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-12">
        <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-neutral-100">لم يتم العثور على الدورة</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">عذرًا، الدورة المطلوبة غير متوفرة</p>
        </div>
      </div>
    )
  }

  const isFree = (course.is_free_course ?? '') === '1' || course.price?.toLowerCase?.() === 'free'

  const onEnrollClick = () => {
    if (isEnrolled) {
      router.push(`/academy/course/${course.id}`)
    } else {
      window.dispatchEvent(
        new CustomEvent('open-subscribe', {
          detail: {
            productType: 'course',
            productId: course.id,
            title: course.title,
            price: course.price,
          },
        })
      )
    }
  }

  const onShare = () => {
    try {
      if (navigator.share) {
        navigator.share({
          title: course.title,
          text: course.short_description,
          url: typeof window !== 'undefined' ? window.location.href : '',
        })
      } else {
        navigator.clipboard?.writeText(typeof window !== 'undefined' ? window.location.href : '')
        // ممكن تضيف Toastك الخاص هنا
      }
    } catch {
      /* no-op */
    }
  }

  /* =========================
     Render
  ========================= */
  return (
    <div dir="rtl" className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-neutral-200">
      {/* Sticky header */}
      <StickyHeader course={course} isEnrolled={isEnrolled} visible={showSticky} onCTA={onEnrollClick} />

      <main className="pb-28">
        {/* ===== HERO (صورة فقط + بارالاكس خفيف) ===== */}
        <header ref={heroRef} className="relative w-full overflow-hidden text-white pt-20 md:pt-24 pb-16">
          <motion.div style={{ y, scale }} className="absolute inset-0 will-change-transform">
            <SmartImage
              src={course.cover_image || course.thumbnail || '/image.jpg'}
              alt={course.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
              className="object-cover"
              style={{ borderRadius: '0 0 0rem 0rem' }}
              noFade
              disableSkeleton
              eager
              priority
            />
          </motion.div>

          <div className="absolute top-6 left-6 z-10">
            <Link
              href="/academy"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="العودة إلى الأكاديمية"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>العودة</span>
            </Link>
          </div>

          {/* تدرجات خفيفة لتحسين القراءة دون تغطية مؤذية */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />

          {/* Top bar: breadcrumb/share */}
          

          {/* Floaty stats أسفل الصورة - لا تغطي المحتوى الرئيسي */}
          <div className="relative z-10 mx-auto mt-24 sm:mt-32 max-w-6xl px-4">
            <div className="flex flex-wrap gap-2">
              {typeof course.rating === 'number' && (
                <StatChip icon={Star} label={`${course.rating}/5 تقييم`} />
              )}
              <StatChip icon={BookOpen} label={`${course.total_number_of_lessons} درس`} />
              {course.duration && <StatChip icon={Clock} label={course.duration} />}
              
              
            </div>
          </div>
        </header>

        {/* ===== Title & Short Description — أسفل الصورة مباشرة (زجاجية) ===== */}
        <TitleMeta course={course} isEnrolled={isEnrolled} onEnrollClick={onEnrollClick} />

        {/* ===== المحتوى ===== */}
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-12">
            {/* Tabs (col-span-2) */}
            <section className="lg:col-span-2">
              <TabsBlock activeTab={activeTab} setActiveTab={setActiveTab} />

              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-3xl border border-neutral-200/80 bg-white/70 backdrop-blur-xl shadow-lg dark:border-neutral-800/50 dark:bg-neutral-900/70 p-6 md:p-8"
                  >
                    <header className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">الوصف</h2>
                    </header>
                    <p className="whitespace-pre-line text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
                      {generalInfo || 'لا يوجد وصف متوفر حاليًا.'}
                    </p>
                  </motion.div>
                )}

                {activeTab === 'curriculum' && (
                  <motion.div
                    key="curriculum"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-3xl border border-neutral-200/80 bg-white/70 backdrop-blur-xl shadow-lg dark:border-neutral-800/50 dark:bg-neutral-900/70 p-6 md:p-8"
                  >
                    <header className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">المنهج الدراسي</h2>
                    </header>

                    <CurriculumList
                      isEnrolled={isEnrolled}
                      lessonsTitles={lessons}
                      totalLessons={course.total_number_of_lessons}
                      duration={course.duration}
                    />
                  </motion.div>
                )}

                {activeTab === 'outcomes' && (
                  <motion.div
                    key="outcomes"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-3xl border border-neutral-200/80 bg-white/70 backdrop-blur-xl shadow-lg dark:border-neutral-800/50 dark:bg-neutral-900/70 p-6 md:p-8"
                  >
                    <header className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold">النتائج</h2>
                    </header>

                    {course.outcomes?.length ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {course.outcomes.map((o, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-base text-neutral-700 dark:text-neutral-300">{o}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-neutral-600 dark:text-neutral-300">لا توجد نتائج محددة متاحة حاليًا</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Sidebar */}
            <CourseSidebar
              course={course}
              isEnrolled={isEnrolled}
              progress={progress}
              onEnrollClick={onEnrollClick}
            />
          </div>
        </div>
      </main>

      {/* FAB للموبايل فقط */}
      <div className="lg:hidden">
        <SubscribeFab
          isEnrolled={isEnrolled}
          isFree={isFree}
          price={course.price}
          discountedPrice={course.discounted_price}
          formatPrice={formatPrice}
          onClick={onEnrollClick}
        />
      </div>

      <AcademyPurchaseModal />
      <AuthPrompt />
    </div>
  )
}
