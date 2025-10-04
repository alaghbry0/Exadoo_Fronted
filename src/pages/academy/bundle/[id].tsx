// src/pages/academy/bundle/[id].tsx
'use client'

import React, { useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAcademyData } from '@/services/academy'
import { useTelegram } from '@/context/TelegramContext'
import AuthPrompt from '@/components/AuthFab'
import SmartImage from '@/components/SmartImage'
import { Card, CardContent } from '@/components/ui/card'
import AcademyPurchaseModal from '@/components/AcademyPurchaseModal'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Layers, Gift, MessageSquare, BookOpen } from 'lucide-react'
import SubscribeFab from '@/components/SubscribeFab'
import { cn } from '@/lib/utils'

interface Course {
  id: string
  title: string
  instructor_name?: string
  total_number_of_lessons: number
  thumbnail?: string
  level?: string
  price?: string
  is_free_course?: string | null
}
interface Bundle {
  id: string
  title: string
  description?: string
  cover_image?: string
  image?: string
  price: string
  course_ids: string // JSON string of course IDs
  free_sessions_count?: string
  telegram_url?: string
}

const formatPrice = (value?: string) => {
  if (!value) return ''
  if (value.toLowerCase?.() === 'free') return 'مجاني'
  const n = Number(value)
  return isNaN(n) ? value : `$${n.toFixed(0)}`
}
const isFreeCourse = (c: Pick<Course, 'price' | 'is_free_course'>) =>
  (c.is_free_course ?? '') === '1' || c.price?.toLowerCase?.() === 'free'

// HScroll
const HScroll: React.FC<React.PropsWithChildren<{ itemWidth?: number | string }>> = ({ children, itemWidth = '70%' }) => {
  const count = React.Children.count(children)
  if (count === 0) return null
  return (
    <div className="relative">
      <div
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="list"
        aria-label="قائمة أفقية قابلة للتمرير"
      >
        {React.Children.map(children, (ch, i) => (
          <div key={i} className="flex-shrink-0 snap-start" style={{ width: itemWidth }} role="listitem">
            {ch}
          </div>
        ))}
      </div>
    </div>
  )
}

// MiniCourseCard بلا شارات
function MiniCourseCard({ id, title, lessons, level, img, free, price }: {
  id: string; title: string; lessons: number; level?: string; img?: string; free?: boolean; price?: string
}) {
  const router = useRouter()
  const prefetch = useCallback(() => router.prefetch(`/academy/course/${id}`), [router, id])

  return (
    <Link
      href={`/academy/course/${id}`}
      prefetch
      onMouseEnter={prefetch}
      onTouchStart={prefetch}
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50"
      aria-label={`فتح دورة ${title}`}
    >
      <Card className={cn(
        'h-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm',
        'transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md',
        'dark:border-neutral-800 dark:bg-neutral-900'
      )}>
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <SmartImage
            src={img || '/image.jpg'}
            alt={title}
            fill
            sizes="(min-width:1280px) 300px, (min-width:640px) 45vw, 70vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-3">
          <h3 className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-neutral-100">{title}</h3>
          <div className="mt-2 flex items-center justify-between text-[12px] text-gray-500 dark:text-neutral-400">
            <span className="truncate">{lessons} درس{level ? ` • ${level}` : ''}</span>
            <span className="font-extrabold text-primary-600 dark:text-primary-400">{free ? 'مجاني' : formatPrice(price)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function BundleDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

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

  if (isLoading)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 text-gray-600 dark:bg-neutral-950 dark:text-neutral-300 flex items-center justify-center p-12">
        جاري تحميل تفاصيل الحزمة…
      </div>
    )
  if (isError)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 text-error-600 dark:bg-neutral-950 dark:text-error-400 flex items-center justify-center p-12">
        تعذّر التحميل: {(error as Error)?.message}
      </div>
    )
  if (!bundle && !isLoading)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 text-gray-600 dark:bg-neutral-950 dark:text-neutral-300 flex items-center justify-center p-12">
        عذرًا، لم يتم العثور على هذه الحزمة.
      </div>
    )
  if (!bundle) return null

  return (
    <div dir="rtl" className="font-arabic bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 min-h-screen">
      <main className="pb-24">
        {/* Hero */}
        <div className="relative h-64 w-full md:h-96 overflow-hidden">
          <SmartImage
            src={bundle.cover_image || bundle.image || '/image.jpg'}
            alt={bundle.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
            className="object-cover"
            style={{ borderRadius: '0 0 2rem 2rem' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <Link
              href="/academy"
              prefetch
              className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-sm text-white transition-all hover:bg-white/30"
              aria-label="العودة إلى الأكاديمية"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>العودة</span>
            </Link>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-2xl md:text-4xl font-bold tracking-tight text-white"
            >
              {bundle.title}
            </motion.h1>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* الوصف */}
            <div className="lg:col-span-2">
              <Badge variant="secondary" className="mb-3">حزمة تعليمية</Badge>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="prose dark:prose-invert max-w-none mt-4 leading-relaxed"
              >
                {(bundle.description || '').replace(/\\r\\n/g, '\n')}
              </motion.p>
            </div>

            {/* معلومات الحزمة */}
            <aside className="mt-8 lg:mt-0 lg:col-span-1">
              <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-xl font-bold">هذه الحزمة تشمل:</h3>
                  <ul className="space-y-3 text-gray-700 dark:text-neutral-300">
                    <li className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-primary-500" />
                      <span>{coursesInBundle.length} دورات تدريبية</span>
                    </li>
                    {parseInt(bundle.free_sessions_count || '0') > 0 && (
                      <li className="flex items-center gap-3">
                        <Gift className="h-5 w-5 text-primary-500" />
                        <span>{bundle.free_sessions_count} جلسات خاصة مجانية</span>
                      </li>
                    )}
                    {bundle.telegram_url?.trim() && (
                      <li className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-primary-500" />
                        <span>مجموعة تيليجرام خاصة</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>

          {/* الكورسات ضمن الحزمة — الآن أفقي */}
          {coursesInBundle.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-3 text-2xl font-bold md:text-3xl">الكورسات المتضمنة</h2>
              <HScroll itemWidth="68%">
                {coursesInBundle.map((course) => (
                  <MiniCourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    lessons={course.total_number_of_lessons}
                    level={course.level}
                    img={course.thumbnail}
                    free={isFreeCourse(course)}
                    price={course.price}
                  />
                ))}
              </HScroll>
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <SubscribeFab
        isEnrolled={isEnrolled}
        isFree={isFree}
        price={bundle.price}
        formatPrice={formatPrice}
        onClick={() => {
          if (isEnrolled) {
            router.push(`/academy/bundle/${id}`)
            return
          }
          window.dispatchEvent(
            new CustomEvent('open-subscribe', {
              detail: {
                productType: 'bundle',
                productId: id,
                title: bundle.title,
                price: bundle.price,
                telegramUrl: bundle.telegram_url?.trim() || null,
              },
            })
          )
        }}
      />
      <AcademyPurchaseModal />
      <AuthPrompt />
    </div>
  )
}
