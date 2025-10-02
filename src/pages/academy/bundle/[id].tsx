'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAcademyData } from '@/services/academy'
import { useTelegram } from '@/context/TelegramContext'
import AuthPrompt from '@/components/AuthFab'
import SmartImage from '@/components/SmartImage'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ArrowLeft, Layers, Gift, MessageSquare } from 'lucide-react'

// === NEW: استيراد الـ FAB الموحد ===
import SubscribeFab from '@/components/SubscribeFab'

// --- Interfaces ---
interface Course {
  id: string
  title: string
  instructor_name?: string
  total_number_of_lessons: number
  thumbnail?: string
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

// === NEW: دالّة تهيئة السعر (مطابقة لصفحة الكورس) ===
const formatPrice = (value?: string) => {
  if (!value) return ''
  if (value.toLowerCase?.() === 'free') return 'مجاني'
  const n = Number(value)
  return isNaN(n) ? value : `$${n.toFixed(0)}`
}

// --- Main Component ---
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

  // === NEW: حالة الاشتراك بالحزمة (عدّل المفتاح حسب بنية بياناتك) ===
  const isEnrolled =
    Boolean((data as any)?.my_enrollments?.bundle_ids?.includes?.(id)) ||
    false

  // === NEW: هل الحزمة مجانية؟ ===
  const isFree =
    bundle?.price?.toLowerCase?.() === 'free' ||
    Number(bundle?.price) === 0

  if (isLoading)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 p-12 text-center text-gray-500 dark:bg-neutral-950">
        جاري تحميل تفاصيل الحزمة…
      </div>
    )
  if (isError)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 p-12 text-center text-error-500 dark:bg-neutral-950">
        تعذّر التحميل: {(error as Error)?.message}
      </div>
    )
  if (!bundle && !isLoading)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 p-12 text-center text-gray-600 dark:bg-neutral-950 dark:text-neutral-300">
        عذرًا، لم يتم العثور على هذه الحزمة.
      </div>
    )
  if (!bundle) return null

  return (
    <div dir="rtl" className="font-bold bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200">
      <main className="pb-28">
        {/* --- Hero Image Banner --- */}
        <div className="relative h-64 w-full md:h-80">
          <SmartImage
            src={bundle.cover_image || bundle.image || '/image.jpg'}
            alt={bundle.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <Link
              href="/academy"
              prefetch
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-black/50"
              aria-label="العودة إلى الأكاديمية"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* --- Bundle Content --- */}
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              {/* --- Bundle Header --- */}
              <Badge variant="secondary" className="mb-3">
                حزمة تعليمية
              </Badge>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-neutral-100 md:text-4xl"
              >
                {bundle.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="prose prose-lg dark:prose-invert max-w-none mt-4"
              >
                {(bundle.description || '').replace(/\\r\\n/g, '\n')}
              </motion.p>
            </div>

            {/* --- "What's Included" Sidebar --- */}
            <aside className="mt-8 lg:mt-0 lg:col-span-1">
              <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-xl font-bold">هذه الحزمة تشمل:</h3>
                  <ul className="space-y-3 text-gray-700 dark:text-neutral-300">
                    <li className="flex items-center gap-3">
                      <Layers className="h-5 w-5 text-primary-500" /> <span>{coursesInBundle.length} دورات تدريبية</span>
                    </li>
                    {parseInt(bundle.free_sessions_count || '0') > 0 && (
                      <li className="flex items-center gap-3">
                        <Gift className="h-5 w-5 text-primary-500" />{' '}
                        <span>{bundle.free_sessions_count} جلسات خاصة مجانية</span>
                      </li>
                    )}
                    {bundle.telegram_url?.trim() && (
                      <li className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-primary-500" /> <span>مجموعة تيليجرام خاصة</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>

          {/* --- Included Courses Section --- */}
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">الكورسات المتضمنة في الحزمة</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coursesInBundle.map((course) => (
                <Link
                  key={course.id}
                  href={`/academy/course/${course.id}`}
                  prefetch
                  onMouseEnter={() => router.prefetch(`/academy/course/${course.id}`)}
                  onTouchStart={() => router.prefetch(`/academy/course/${course.id}`)}
                  className="group"
                >
                  <Card className="flex h-full transform flex-col overflow-hidden rounded-2xl border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="relative aspect-video w-full">
                      <SmartImage
                        src={course.thumbnail || '/image.jpg'}
                        alt={course.title}
                        fill
                        sizes="(min-width:1280px) 360px, (min-width:640px) 50vw, 100vw"
                        className="object-cover"
                        fallbackSrc="/image.jpg"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-bold text-lg leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {course.title}
                      </h3>
                      <div className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
                        <span>{course.instructor_name}</span>
                      </div>
                      <div className="mt-auto pt-3 text-xs text-gray-500">
                        {course.total_number_of_lessons} دروس
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* === REMOVED: الشريط السفلي القديم (Floating Action Bar) === */}
      {/* === NEW: استخدام SubscribeFab كزر عائم موحد === */}
      <SubscribeFab
        isEnrolled={isEnrolled}
        isFree={isFree}
        price={bundle.price}
        // لا نملك خصم في بيانات الحزمة الحالية، اترك discountedPrice فارغًا أو أضف إن توفر
        formatPrice={formatPrice}
        onClick={() => {
          if (isEnrolled) {
            // مثال: الانتقال لواجهة الحزمة أو أول كورس بداخلها
            router.push(`/academy/bundle/${id}`)
          } else {
            // مثال: فتح تيليجرام إن كانت الحزمة تتطلب مجموعة خاصة
            if (bundle.telegram_url?.trim()) {
              window.open(bundle.telegram_url, '_blank', 'noopener,noreferrer')
              return
            }
            // بديل: إطلاق حدث لفتح مودال الاشتراك الموحد لديك
            window.dispatchEvent(new CustomEvent('open-subscribe', { detail: { bundleId: id } }))
          }
        }}
      />

      <AuthPrompt />
    </div>
  )
}
