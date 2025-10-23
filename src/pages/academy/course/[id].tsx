// src/pages/academy/course/[id].tsx
'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, BookOpen, Clock, FileText, Star, Award, Loader2 } from 'lucide-react'

import AuthPrompt from '@/features/auth/components/AuthFab'
import SmartImage from '@/components/SmartImage'

// Dynamic import لـ AcademyPurchaseModal
const AcademyPurchaseModal = dynamic(
  () => import('@/features/academy/components/AcademyPurchaseModal'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }
)
import SubscribeFab from '@/components/SubscribeFab'
import { useAcademyData } from '@/services/academy'
import { useCourseDetails } from '@/services/courseDetails'
import { useTelegram } from '@/context/TelegramContext'
import { Breadcrumbs } from '@/shared/components/common/Breadcrumbs'

import { normalizeDescription, formatPrice } from '@/lib/academy'
import type { Course, TabId } from '@/types/academy'
import TabsBlock from '@/pages/academy/course/components/TabsBlock'
import CurriculumList from '@/pages/academy/course/components/CurriculumList'
import RealCurriculum from '@/pages/academy/course/components/RealCurriculum'
import CourseSidebar from '@/pages/academy/course/components/CourseSidebar'
import StickyHeader from '@/pages/academy/course/components/StickyHeader'
import TitleMeta from '@/pages/academy/course/components/TitleMeta'
import StatChip from '@/pages/academy/course/components/StatChip'

export default function CourseDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()

  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)
  const { data: details } = useCourseDetails(telegramId || undefined, id || undefined)

  const [activeTab, setActiveTab] = useState<TabId>('curriculum')
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowSticky(window.scrollY > 500)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, 60])
  const scale = useTransform(scrollY, [0, 300], [1, 1.05])

  const course: Course | undefined = useMemo(
    () => data?.courses.find((c: Course) => c.id === id),
    [data, id]
  )

  const isEnrolled = useMemo(
    () => Boolean(data?.my_enrollments?.course_ids?.includes?.(id)),
    [data, id]
  )

  const { generalInfo } = useMemo(
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
      // تنقل داخلي
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

  return (
    <div dir="rtl" className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-neutral-200">
      <StickyHeader course={course} isEnrolled={isEnrolled} visible={showSticky} onCTA={onEnrollClick} />

      <main className="pb-28">
        {/* HERO */}
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

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/35 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />

          <div className="relative z-10 mx-auto mt-24 sm:mt-32 max-w-6xl px-4">
            <div className="flex flex-wrap gap-2">
              {typeof course.rating === 'number' && <StatChip icon={Star} label={`${course.rating}/5 تقييم`} />}
              <StatChip icon={BookOpen} label={`${course.total_number_of_lessons} درس`} />
              {course.duration && <StatChip icon={Clock} label={course.duration} />}
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Breadcrumbs items={[
            { label: 'الرئيسية', href: '/' },
            { label: 'الأكاديمية', href: '/academy' },
            { label: course.title }
          ]} />
        </div>

        {/* Title + Meta */}
        <TitleMeta course={course} isEnrolled={isEnrolled} />

        {/* المحتوى */}
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-x-12">
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

                    {isEnrolled && details?.sections?.length ? (
                      <RealCurriculum courseId={id} sections={details.sections as any} />
                    ) : (
                      <CurriculumList
                        isEnrolled={isEnrolled}
                        lessonsTitles={normalizeDescription(course?.description).lessons}
                        totalLessons={course.total_number_of_lessons}
                        duration={course.duration}
                      />
                    )}
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
                            {/* نفس أيقونة النتائج في التصميم الأصلي */}
                            <span className="inline-block w-5 h-5 mt-0.5 rounded-full bg-green-500/15 text-green-600 flex items-center justify-center">✓</span>
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

            <CourseSidebar course={course} isEnrolled={isEnrolled} progress={progress} onEnrollClick={onEnrollClick} />
          </div>
        </div>
      </main>

      {/* FAB للموبايل */}
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
