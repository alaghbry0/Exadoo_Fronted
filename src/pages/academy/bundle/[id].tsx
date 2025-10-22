// src/pages/academy/bundle/[id].tsx
'use client'

import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAcademyData } from '@/services/academy'
import { useTelegram } from '@/context/TelegramContext'
import AuthPrompt from '@/components/AuthFab'
import SmartImage from '@/components/SmartImage'
import { Card, CardContent } from '@/components/ui/card'
import AcademyPurchaseModal from '@/components/AcademyPurchaseModal'
import {
  ArrowLeft,
  Layers,
  Gift,
  MessageSquare,
  BookOpen,
  Award,
  Sparkles,
  Package,
  ShoppingCart
} from 'lucide-react'
import SubscribeFab from '@/components/SubscribeFab'
import { cn } from '@/lib/utils'

/* ==============================
   Types
============================== */
interface Course {
  id: string
  title: string
  instructor_name?: string
  total_number_of_lessons: number
  thumbnail?: string
  level?: string
  price?: string
  is_free_course?: string | null
  short_description?: string
}
interface Bundle {
  id: string
  title: string
  description?: string
  cover_image?: string
  image?: string
  price: string
  course_ids: string
  free_sessions_count?: string
  telegram_url?: string
}

/* ==============================
   Helpers
============================== */
const formatPrice = (value?: string) => {
  if (!value) return ''
  if (value.toLowerCase?.() === 'free') return 'مجاني'
  const n = Number(value)
  return isNaN(n) ? value : `$${n.toFixed(0)}`
}
const isFreeCourse = (c: Pick<Course, 'price' | 'is_free_course'>) =>
  (c.is_free_course ?? '') === '1' || c.price?.toLowerCase?.() === 'free'

/* ==============================
   HScroll (أعرض قليلاً مع min-w للجوال)
============================== */
const HScroll: React.FC<React.PropsWithChildren<{ itemClassName?: string }>> = ({
  children,
  itemClassName = 'min-w-[220px] w-[68%] xs:w-[58%] sm:w-[45%] lg:w-[30%] xl:w-[23%]'
}) => {
  const count = React.Children.count(children)
  if (count === 0) return null
  return (
    <div className="relative -mx-4 px-4">
      <div className="hscroll hscroll-snap" role="list" aria-label="قائمة أفقية قابلة للتمرير">
        {React.Children.map(children, (ch, i) => (
          <div key={i} className={cn('hscroll-item', itemClassName)} role="listitem">
            {ch}
          </div>
        ))}
        <div className="hscroll-item w-px sm:w-2 lg:w-4" />
      </div>
    </div>
  )
}

/* ==============================
   MiniCourseCard — أصغر على الجوال + 4:3
============================== */
function MiniCourseCard({
  id,
  title,
  desc,
  lessons,
  level,
  img,
  free,
  price,
  priority,
}: {
  id: string
  title: string
  desc?: string
  lessons: number
  level?: string
  img?: string
  free?: boolean
  price?: string
  priority?: boolean
}) {
  const router = useRouter()
  const prefetch = useCallback(() => router.prefetch(`/academy/course/${id}`), [router, id])

  const levelConfig = {
    beginner: { label: 'مبتدئ', color: 'text-emerald-600 dark:text-emerald-400' },
    intermediate: { label: 'متوسط', color: 'text-amber-600 dark:text-amber-400' },
    advanced: { label: 'متقدم', color: 'text-rose-600 dark:text-rose-400' },
  }
  const levelInfo = level ? levelConfig[level as keyof typeof levelConfig] : null

  return (
    <Link
      href={`/academy/course/${id}`}
      prefetch={false}
      onMouseEnter={prefetch}
      onTouchStart={prefetch}
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2"
      aria-label={`فتح دورة ${title}`}
    >
      <Card className="group relative h-full overflow-hidden rounded-3xl border border-gray-100/50 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-neutral-800/50 dark:bg-neutral-900">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden">
          <SmartImage
            src={img || '/image.jpg'}
            alt={`${title} — ${lessons} درس${level ? ` • ${level}` : ''}`}
            fill
            sizes="(min-width:1280px) 28vw, (min-width:640px) 45vw, 60vw"
            className="object-cover md:group-hover:scale-105 transition-transform duration-300"
            priority={!!priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {free && (
            <div className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 rounded-full bg-emerald-500/95 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm">
              مجاني
            </div>
          )}
        </div>

        <CardContent className="p-3 sm:p-4">
          <h3 className="mb-1.5 sm:mb-2 line-clamp-1 text-sm sm:text-[15px] font-bold text-gray-900 dark:text-neutral-100">
            {title}
          </h3>

          {desc && (
            <p className="mb-3 line-clamp-2 text-[13px] sm:text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
              {desc}
            </p>
          )}

          <div className="flex items-center justify-between gap-2.5 sm:gap-3 border-t border-gray-100 pt-2.5 sm:pt-3 dark:border-neutral-800">
            <div className="flex items-center gap-2.5 sm:gap-2 text-[11px] sm:text-[12px]">
              <BookOpen className="h-3.5 w-3.5 text-gray-500 dark:text-neutral-400" />
              <span className="font-medium text-gray-600 dark:text-neutral-400">{lessons} درس</span>
              {levelInfo && (
                <>
                  <span className="text-gray-300 dark:text-neutral-700">•</span>
                  <span className={cn('font-medium', levelInfo.color)}>{levelInfo.label}</span>
                </>
              )}
            </div>

            <span className="text-sm sm:text-[15px] font-extrabold text-primary-600 dark:text-primary-400">
              {free ? 'مجاني' : formatPrice(price)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

/* ==============================
   TitleMetaBundle (زجاجية تحت الصورة + CTA)
============================== */
const TitleMetaBundle = ({
  bundle,
  coursesCount,
  onCTA,
}: {
  bundle: Bundle
  coursesCount: number
  onCTA: () => void
}) => {
  const isFree = bundle.price?.toLowerCase?.() === 'free' || Number(bundle.price) === 0
  const hasPrice = !!bundle.price
  const buttonText = isFree ? 'ابدأ الآن' : `اشترك - ${formatPrice(bundle.price)}`

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
        {/* Badges */}
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/90 px-3 py-1.5 text-[11px] font-semibold text-white">
            <Award className="h-4 w-4" />
            حزمة تعليمية متكاملة
          </span>
          {parseInt(bundle.free_sessions_count || '0') > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-3 py-1.5 text-[11px] font-semibold text-white">
              <Gift className="h-4 w-4" />
              جلسات خاصة: {bundle.free_sessions_count}
            </span>
          )}
          {bundle.telegram_url?.trim() && (
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/90 px-3 py-1.5 text-[11px] font-semibold text-white">
              <MessageSquare className="h-4 w-4" />
              مجموعة تيليجرام
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          {bundle.title}
        </h1>

        {/* Meta chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1 font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-200">
            <Layers className="h-4 w-4" />
            {coursesCount} دورات تدريبية
          </span>
        </div>

        {/* CTA Row */}
        {hasPrice && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={onCTA}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-600/90 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{buttonText}</span>
            </button>
          </div>
        )}
      </div>
    </motion.section>
  )
}

/* ==============================
   StickyHeader
============================== */
const StickyHeader = ({
  title,
  price,
  visible,
  onCTA,
}: {
  title: string
  price?: string
  visible: boolean
  onCTA: () => void
}) => {
  const buttonText = price?.toLowerCase?.() === 'free' || Number(price) === 0
    ? 'ابدأ الآن'
    : `اشترك - ${formatPrice(price)}`

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: visible ? 0 : -100 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-md dark:bg-neutral-900/90"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h2 className="min-w-0 font-bold text-sm sm:text-base text-gray-800 dark:text-neutral-100 truncate">
          {title}
        </h2>
        <button
          onClick={onCTA}
          className="hidden sm:flex items-center justify-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-600 transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{buttonText}</span>
        </button>
      </div>
    </motion.div>
  )
}

/* ==============================
   Page
============================== */
export default function BundleDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  const [showSticky, setShowSticky] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 500)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, 60])
  const scale = useTransform(scrollY, [0, 300], [1, 1.05])

  const bundle: Bundle | undefined = useMemo(
    () => data?.bundles.find((b: Bundle) => b.id === id),
    [data, id]
  )

  const coursesInBundle: Course[] = useMemo(() => {
    if (!data || !bundle) return []
    try {
      const ids = new Set<string>(JSON.parse(bundle.course_ids))
      return data.courses.filter((c: Course) => ids.has(c.id))
    } catch {
      return []
    }
  }, [data, bundle])

  const isEnrolled = Boolean((data as any)?.my_enrollments?.bundle_ids?.includes?.(id)) || false
  const isFree = bundle?.price?.toLowerCase?.() === 'free' || Number(bundle?.price) === 0

  const onCTA = () => {
    if (isEnrolled) {
      router.push(`/academy/bundle/${id}`)
      return
    }
    window.dispatchEvent(
      new CustomEvent('open-subscribe', {
        detail: {
          productType: 'bundle',
          productId: id,
          title: bundle?.title,
          price: bundle?.price,
          telegramUrl: bundle?.telegram_url?.trim() || null,
        },
      })
    )
  }

  if (isLoading)
    return (
      <div className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-600 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-neutral-300 flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-neutral-800 dark:border-t-primary-500" />
          <p className="text-lg font-medium">جاري تحميل تفاصيل الحزمة...</p>
        </div>
      </div>
    )

  if (isError)
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

  if (!bundle && !isLoading)
    return (
      <div className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-12">
        <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-neutral-100">لم يتم العثور على الحزمة</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">عذرًا، الحزمة المطلوبة غير متوفرة</p>
        </div>
      </div>
    )

  if (!bundle) return null

  return (
    <div
      dir="rtl"
      className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-neutral-200"
    >
      {/* Sticky header */}
      <StickyHeader title={bundle.title} price={bundle.price} visible={showSticky} onCTA={onCTA} />

      <main className="pb-28">
        {/* ===== HERO (صورة فقط + بارالاكس خفيف) ===== */}
        <header ref={heroRef} className="relative w-full overflow-hidden text-white pt-20 md:pt-24 pb-16">
          <motion.div style={{ y, scale }} className="absolute inset-0 will-change-transform">
            <SmartImage
              src={bundle.cover_image || bundle.image || '/image.jpg'}
              alt={bundle.title}
              fill
              className="object-cover"
              sizes="100vw"
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

          {/* تدرجات خفيفة لتحسين القراءة */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />

          {/* Floaty stat chip */}
          <div className="relative z-10 mx-auto mt-24 sm:mt-32 max-w-6xl px-4">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                <Layers className="h-4 w-4 opacity-90" />
                {coursesInBundle.length} دورات تدريبية
              </span>
            </div>
          </div>
        </header>

        {/* ===== Title & CTA (زجاجية) ===== */}
        <TitleMetaBundle bundle={bundle} coursesCount={coursesInBundle.length} onCTA={onCTA} />

        {/* ===== المحتوى ===== */}
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* الوصف */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-3xl border border-neutral-200/80 bg-white/70 backdrop-blur-xl shadow-lg dark:border-neutral-800/50 dark:bg-neutral-900/70 p-6 md:p-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">عن الحزمة</h2>
                </div>
                <p className="whitespace-pre-line text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {(bundle.description || '').replace(/\\r\\n/g, '\n')}
                </p>
              </motion.div>
            </div>

            {/* مميزات الحزمة (Sidebar) */}
            <aside className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="overflow-hidden rounded-3xl border-0 shadow-lg">
                  <div className="bg-gradient-to-br from-amber-50 via-amber-50/50 to-white p-6 dark:from-amber-900/10 dark:via-amber-900/5 dark:to-neutral-900">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600">
                        <Gift className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold">مميزات الحزمة</h3>
                    </div>

                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
                          <Layers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-neutral-100">
                            {coursesInBundle.length} دورات تدريبية
                          </p>
                          <p className="text-sm text-gray-600 dark:text-neutral-400">محتوى شامل ومتكامل</p>
                        </div>
                      </li>

                      {parseInt(bundle.free_sessions_count || '0') > 0 && (
                        <li className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-neutral-100">
                              {bundle.free_sessions_count} جلسات خاصة
                            </p>
                            <p className="text-sm text-gray-600 dark:text-neutral-400">مع المدرب مباشرة</p>
                          </div>
                        </li>
                      )}

                      {bundle.telegram_url?.trim() && (
                        <li className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-neutral-100">مجموعة تيليجرام</p>
                            <p className="text-sm text-gray-600 dark:text-neutral-400">دعم مستمر ومتابعة</p>
                          </div>
                        </li>
                      )}

                      <li className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                          <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-neutral-100">شهادة إتمام</p>
                          <p className="text-sm text-gray-600 dark:text-neutral-400">بعد إكمال الحزمة</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </Card>
              </motion.div>
            </aside>
          </div>

          {/* الدورات المتضمنة */}
          {coursesInBundle.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-sm">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold md:text-3xl">الدورات المتضمنة</h2>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    {coursesInBundle.length} دورات تدريبية متكاملة
                  </p>
                </div>
              </div>

              <HScroll>
                {coursesInBundle.map((course, i) => (
                  <MiniCourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    desc={course.short_description}
                    lessons={course.total_number_of_lessons}
                    level={course.level}
                    img={course.thumbnail}
                    free={isFreeCourse(course)}
                    price={course.price}
                    priority={i === 0}
                  />
                ))}
              </HScroll>
            </motion.div>
          )}
        </div>
      </main>

      {/* FAB للموبايل */}
      <div className="lg:hidden">
        <SubscribeFab
          isEnrolled={isEnrolled}
          isFree={isFree}
          price={bundle.price}
          formatPrice={formatPrice}
          onClick={onCTA}
        />
      </div>

      <AcademyPurchaseModal />
      <AuthPrompt />
    </div>
  )
}
