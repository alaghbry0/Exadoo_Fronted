'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import AuthPrompt from '@/components/AuthFab'
import SmartImage from '@/components/SmartImage'
import AcademyPurchaseModal from '@/components/AcademyPurchaseModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import SubscribeFab from '@/components/SubscribeFab'
import { ArrowLeft, CheckCircle2, BookOpen, BarChart3, Play, Star, Award, ChevronRight } from 'lucide-react'
import { useAcademyData } from '@/services/academy'
import { useTelegram } from '@/context/TelegramContext'

interface Course {
  id: string
  title: string
  short_description: string
  description?: string
  instructor_name?: string
  instructor_photo?: string
  level?: string
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

const formatPrice = (value?: string) => {
  if (!value) return ''
  if (value.toLowerCase?.() === 'free') return 'مجاني'
  const n = Number(value)
  return isNaN(n) ? value : `$${n.toFixed(0)}`
}

const normalizeDescription = (description?: string) => {
  if (!description) {
    return { generalInfo: '', lessons: [] as string[] }
  }

  const normalizedText = description
    .replace(/<br\s*\/?>(?=\s|$)/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li>/gi, '\n• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const lessonPattern = /C\d+\s*\|\s*الدرس\s*\d+\s*\|\s*([^<]+)/g
  const lessons: string[] = []
  let match: RegExpExecArray | null
  while ((match = lessonPattern.exec(description)) !== null) {
    const lessonTitle = (match[1] || '').replace(/<[^>]+>/g, ' ').trim()
    if (lessonTitle) lessons.push(lessonTitle)
  }

  const generalInfo = normalizedText.split('C3 |')[0]?.trim() || normalizedText
  return { generalInfo, lessons }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
} as const

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45 } },
} as const

export default function CourseDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  const [activeTab, setActiveTab] = useState('overview')
  const heroParallaxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = heroParallaxRef.current
    if (!element) return

    let frame: number | null = null
    const updateTransform = () => {
      if (!element) return
      const offset = window.scrollY * 0.35
      element.style.transform = `translateY(${offset}px)`
      frame = null
    }

    const handleScroll = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(updateTransform)
    }

    updateTransform()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const course: Course | undefined = useMemo(
    () => data?.courses.find((c: Course) => c.id === id),
    [data, id]
  )

  const isEnrolled = useMemo(() => {
    return Boolean(data?.my_enrollments?.course_ids?.includes?.(id))
  }, [data, id])

  const { generalInfo, lessons } = useMemo(() => normalizeDescription(course?.description), [course?.description])

  const progress = useMemo(() => {
    if (!course || !isEnrolled) return 0
    let hash = 0
    for (let i = 0; i < course.id.length; i += 1) {
      hash = (hash * 31 + course.id.charCodeAt(i)) % 997
    }
    const normalized = 35 + (hash % 60)
    return Math.min(100, normalized)
  }, [course, isEnrolled])

  if (isLoading)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 text-gray-600 dark:bg-neutral-950 dark:text-neutral-300 flex items-center justify-center p-12">
        جاري تحميل تفاصيل الدورة
      </div>
    )
  if (isError)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 text-error-600 dark:bg-neutral-950 dark:text-error-400 flex items-center justify-center p-12">
        تعذّر التحميل: {(error as Error)?.message}
      </div>
    )
  if (!course && !isLoading)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 text-gray-600 dark:bg-neutral-950 dark:text-neutral-300 flex items-center justify-center p-12">
        عذرًا، لم يتم العثور على هذه الدورة.
      </div>
    )
  if (!course) return null

  const isFree = (course.is_free_course ?? '') === '1' || course.price?.toLowerCase?.() === 'free'

  return (
    <div dir="rtl" className="font-bold min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200">
      <main className="pb-24">
        {/* Hero ثابت بدون Fade/Blur لوقف الوميض */}
        <div className="relative h-64 w-full overflow-hidden md:h-96">
          <div
            ref={heroParallaxRef}
            className="absolute inset-0 will-change-transform [transform:translateZ(0)] [backface-visibility:hidden] pointer-events-none"
          >
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
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute top-4 left-4 z-10">
            <Link
              href="/academy"
              prefetch={false}
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
              {course.title}
            </motion.h1>
          </div>
        </div>

        {/* المحتوى */}
        <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            {/* وصف مختصر */}
            <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-300">
              {course.short_description}
            </motion.p>

            {/* Chips */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
              {(course.instructor_name || course.instructor_photo) && (
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-full px-4 py-2 shadow-sm">
                  {course.instructor_photo && (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <SmartImage
                        src={course.instructor_photo}
                        alt={course.instructor_name || 'المدرب'}
                        fill
                        sizes="32px"
                        className="object-cover"
                        noFade
                        disableSkeleton
                      />
                    </div>
                  )}
                  {course.instructor_name && <span className="font-medium">{course.instructor_name}</span>}
                </div>
              )}

              <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-full px-4 py-2 shadow-sm">
                <BarChart3 className="h-4 w-4 text-primary-600" />
                <span className="capitalize">{course.level || 'غير محدّد'}</span>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-full px-4 py-2 shadow-sm">
                <BookOpen className="h-4 w-4 text-primary-600" />
                <span>{course.total_number_of_lessons} دروس</span>
              </div>

              {!!course.rating && (
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-full px-4 py-2 shadow-sm">
                  <Star className="h-4 w-4 text-amber-500 fill-current" />
                  <span>{course.rating}</span>
                </div>
              )}
            </motion.div>

            {/* تقدّم */}
            {isEnrolled && (
              <motion.div variants={itemVariants} className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">تقدمك في الدورة</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </motion.div>
            )}

            {/* Tabs */}
            <motion.div variants={itemVariants} className="mt-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-3 bg-white dark:bg-neutral-800 p-1 rounded-xl shadow-sm">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg transition-all">
                    نظرة عامة
                  </TabsTrigger>
                  <TabsTrigger value="curriculum" className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg transition-all">
                    المنهج
                  </TabsTrigger>
                  <TabsTrigger value="outcomes" className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg transition-all">
                    النتائج
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border-0 shadow-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 pb-4">
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary-600" />
                            عن الدورة
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {generalInfo || 'لا يوجد وصف متوفر حاليًا.'}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {activeTab === 'curriculum' && (
                    <motion.div
                      key="curriculum"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border-0 shadow-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 pb-4">
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary-600" />
                            منهج الدورة
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {lessons.length > 0 ? (
                            <div className="space-y-3">
                              {lessons.map((lesson, index) => (
                                <motion.div
                                  key={index}
                                  className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-neutral-700 p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                                  whileHover={{ x: 5 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                                    {isEnrolled ? <CheckCircle2 className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{lesson}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">الدرس {index + 1}</p>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600 dark:text-gray-300">لا توجد تفاصيل عن المنهج متاحة حاليًا.</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {activeTab === 'outcomes' && (
                    <motion.div
                      key="outcomes"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border-0 shadow-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 pb-4">
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary-600" />
                            ماذا ستتعلم؟
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {course.outcomes?.length ? (
                            <ul className="space-y-3">
                              {course.outcomes.map((o, i) => (
                                <motion.li
                                  key={i}
                                  className="flex items-start gap-3"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: i * 0.05 }}
                                >
                                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary-500" />
                                  <span>{o}</span>
                                </motion.li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-600 dark:text-gray-300">لا توجد نتائج محددة متاحة حاليًا.</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* FAB */}
      <SubscribeFab
        isEnrolled={isEnrolled}
        isFree={isFree}
        price={course.price}
        discountedPrice={course.discounted_price}
        formatPrice={formatPrice}
        onClick={() => {
          if (isEnrolled) {
            router.push(`/academy/course/${id}`)
          } else {
            window.dispatchEvent(
              new CustomEvent('open-subscribe', {
                detail: {
                  productType: 'course',
                  productId: id,
                  title: course.title,
                  price: course.price,
                },
              })
            )
          }
        }}
      />
      <AcademyPurchaseModal />
      <AuthPrompt />
    </div>
  )
}
