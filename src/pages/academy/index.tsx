'use client'

import React, { memo, useMemo, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router' // ✅ استيراد useRouter للـ prefetch عند hover
import { motion, AnimatePresence } from 'framer-motion'
import BackHeader from '@/components/BackHeader'
import AuthPrompt from '@/components/AuthFab'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, Bookmark, Layers, Sparkles, ArrowLeft } from 'lucide-react'
import SmartImage from '@/components/SmartImage'
import { useTelegram } from '@/context/TelegramContext'
import { useAcademyData } from '@/services/academy'

// =========================================
//  Types
// =========================================
interface CourseItem {
  id: string
  title: string
  short_description: string
  price: string
  discounted_price?: string
  total_number_of_lessons: number
  thumbnail: string
  is_free_course?: string
  level?: string
}

interface BundleItem {
  id: string
  title: string
  description: string
  price: string
  image?: string
  cover_image?: string
}

// =========================================
//  Helpers
// =========================================
const formatPrice = (value?: string) => {
  if (!value) return ''
  if (value.toLowerCase() === 'free') return 'مجاني'
  // يمكن لاحقًا ربط العملة من إعدادات المستخدم
  const n = Number(value)
  return isNaN(n) ? value : `$${n.toFixed(0)}`
}

// =========================================
//  UI Pieces
// =========================================
const HorizontalCarousel: React.FC<React.PropsWithChildren> = ({ children }) => {
  const count = React.Children.count(children)
  if (count === 0) return null
  return (
    <div className="relative">
      <div
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        aria-label="قائمة أفقية قابلة للتمرير"
        role="list"
      >
        {React.Children.map(children, (ch, i) => (
          <div key={i} className="w-[85%] flex-shrink-0 snap-start sm:w-[360px]" role="listitem">
            {ch}
          </div>
        ))}
      </div>
    </div>
  )
}

interface CourseCardProps {
  id: string
  title: string
  desc: string
  price: string
  lessons: number
  level?: string
  img: string
  isFree?: boolean
}

export const CourseCard = memo(function CourseCard({ id, title, desc, price, lessons, level, img, isFree }: CourseCardProps) {
  const router = useRouter() // ✅ إضافة useRouter
  const handleMouseEnter = useCallback(() => {
    router.prefetch(`/academy/course/${id}`) // ✅ Prefetch عند hover/لمس
  }, [router, id])

  const free = isFree || price?.toLowerCase?.() === 'free'
  return (
    <Link
      href={`/academy/course/${id}`}
      prefetch
      onMouseEnter={handleMouseEnter} // ✅
      onTouchStart={handleMouseEnter} // ✅ للموبايل
      className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50"
      aria-label={`فتح دورة ${title}`}
    >
      <Card
        className={cn(
          'h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm',
          'transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg',
          'dark:border-neutral-800 dark:bg-neutral-900'
        )}
      >
        <div className="relative aspect-video w-full">
          <SmartImage
            src={img || '/image.jpg'}
            alt={title}
            fill
            sizes="(min-width:1280px) 360px, (min-width:640px) 60vw, 85vw"
            className="object-cover"
            fallbackSrc="/image.jpg"
          />
        </div>
        <CardContent className="flex flex-grow flex-col p-4">
          <h3 className="line-clamp-2 font-bold text-gray-900 dark:text-neutral-100">{title}</h3>
          <p className="mt-1 line-clamp-2 flex-grow text-sm text-gray-600 dark:text-neutral-400">{desc}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              {level && <Badge variant="secondary" className="capitalize">{level}</Badge>}
              <Badge variant="outline" className="border-gray-300 dark:border-neutral-700">{lessons} دروس</Badge>
            </div>
            {free ? (
              <Badge className="bg-success-700 text-white dark:bg-success-600">مجاني</Badge>
            ) : (
              <div className="text-base font-bold text-primary-600 dark:text-primary-400">{formatPrice(price)}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

interface BundleCardProps {
  id: string
  title: string
  desc: string
  price: string
  img: string
}

export const BundleCard = memo(function BundleCard({ id, title, desc, price, img }: BundleCardProps) {
  return (
    <Link
      href={`/academy/bundle/${id}`}
      prefetch
      className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50"
      aria-label={`فتح حزمة ${title}`}
    >
      <Card
        className={cn(
          'h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm',
          'transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg',
          'dark:border-neutral-800 dark:bg-neutral-900'
        )}
      >
        <div className="relative aspect-video w-full">
          <SmartImage
            src={img || '/image.jpg'}
            alt={title}
            fill
            sizes="(min-width:1280px) 360px, (min-width:640px) 60vw, 85vw"
            className="object-cover"
            fallbackSrc="/image.jpg"
          />
        </div>
        <CardContent className="flex flex-grow flex-col p-4">
          <h3 className="line-clamp-2 font-bold text-gray-900 dark:text-neutral-100">{title}</h3>
          <p className="mt-1 line-clamp-2 flex-grow text-sm text-gray-600 dark:text-neutral-400">{(desc || '').replace(/\\r\\n/g, ' ')}</p>
          <div className="mt-4 flex items-center justify-between">
            <Badge variant="outline" className="border-secondary text-secondary dark:border-secondary dark:text-secondary">حزمة</Badge>
            <div className="text-base font-bold text-primary-600 dark:text-primary-400">{formatPrice(price)}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

// =========================================
//  Page
// =========================================
export default function AcademyIndex() {
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [q, setQ] = useState('')
  const { telegramId } = useTelegram()

  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  // بيانات مميزة + تصفية
  const featured = useMemo(() => {
    if (!data) return { courses: [] as CourseItem[], bundles: [] as BundleItem[] }
    const fc = new Set([...(data.top_course_ids || []), ...(data.highlight_course_ids || [])])
    const fb = new Set([...(data.top_bundle_ids || []), ...(data.highlight_bundle_ids || [])])
    return {
      courses: (data.courses || []).filter((c: CourseItem) => fc.has(c.id)),
      bundles: (data.bundles || []).filter((b: BundleItem) => fb.has(b.id)),
    }
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return { courses: [] as CourseItem[], bundles: [] as BundleItem[] }
    const ql = q.trim().toLowerCase()
    if (!ql) return { courses: data.courses, bundles: data.bundles }
    const match = (text: string) => text?.toLowerCase?.().includes(ql)
    return {
      courses: (data.courses || []).filter((c: CourseItem) => match(c.title) || match(c.short_description)),
      bundles: (data.bundles || []).filter((b: BundleItem) => match(b.title) || match(b.description)),
    }
  }, [data, q])

  const mine = useMemo(() => {
    if (!data) return { courses: [] as CourseItem[], bundles: [] as BundleItem[] }
    const cset = new Set((data.my_enrollments?.course_ids || []) as string[])
    const bset = new Set((data.my_enrollments?.bundle_ids || []) as string[])
    return {
      courses: (data.courses || []).filter((c: CourseItem) => cset.has(c.id)),
      bundles: (data.bundles || []).filter((b: BundleItem) => bset.has(b.id)),
    }
  }, [data])

  const isSearching = q.length > 0

  const handleTab = useCallback((key: 'all' | 'mine') => setTab(key), [])

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-arabic text-gray-800 dark:bg-neutral-950 dark:text-neutral-200">
      <BackHeader />

      <main className="mx-auto max-w-7xl px-4 pb-24">
        {/* Hero */}
        <section className="pt-20 pb-12 text-center" aria-labelledby="page-title">
          <motion.h1
            id="page-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100 md:text-5xl"
          >
            أكاديمية Exaado
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-neutral-300"
          >
            طريقك المتكامل لإتقان التداول. تعلّم من الخبراء، وطبّق باستراتيجيات عملية.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-8 max-w-2xl"
            role="search"
            aria-label="البحث داخل الأكاديمية"
          >
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="search"
                placeholder="ابحث عن كورس أو حزمة…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className={cn(
                  'block w-full rounded-2xl py-3 pr-4 pl-12 text-base',
                  'bg-white text-gray-900 shadow-sm placeholder:text-gray-400',
                  'border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400',
                  'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'
                )}
              />
            </div>
          </motion.div>
        </section>

        {/* Tabs */}
        <div className="sticky top-[56px] z-20 -mx-4 border-b border-gray-200 bg-gray-50/80 px-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 py-3">
            <Button
              onClick={() => handleTab('all')}
              className={cn(
                'rounded-xl',
                tab === 'all'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-primary-500/40'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-800'
              )}
              aria-pressed={tab === 'all'}
            >
              <Layers className="ml-2 h-4 w-4" /> جميع المحتوى
            </Button>
            <Button
              onClick={() => handleTab('mine')}
              className={cn(
                'rounded-xl',
                tab === 'mine'
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-primary-500/40'
                  : 'bg-transparent text-gray-700 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-800'
              )}
              aria-pressed={tab === 'mine'}
            >
              <Bookmark className="ml-2 h-4 w-4" /> دوراتي
            </Button>
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="py-20 text-center text-gray-500">جاري تحميل محتوى الأكاديمية…</div>
        )}
        {isError && (
          <div className="py-20 text-center text-error-500">حدث خطأ: {(error as Error)?.message}</div>
        )}

        {/* Content */}
        {data && !isLoading && !isError && (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab + (isSearching ? '-search' : '-browse')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'mine' ? (
                <section className="mt-8 space-y-10">
                  {(!data.my_enrollments?.course_ids?.length && !data.my_enrollments?.bundle_ids?.length) ? (
                    <div className="py-16 text-center">
                      <Bookmark className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                      <h3 className="text-xl font-bold">لا توجد دورات في حسابك بعد</h3>
                      <p className="mt-2 text-gray-500">استكشف الكورسات والحزم وابدأ رحلتك التعليمية معنا.</p>
                      <Button size="lg" className="mt-6 h-14 w-full rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 font-bold text-white shadow-lg hover:shadow-primary-500/40 sm:w-auto" onClick={() => handleTab('all')}>
                        تصفّح كل المحتوى
                        <ArrowLeft className="mr-2 h-4 w-4 -mr-0.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      {(mine.courses.length > 0) && (
                        <div>
                          <h2 className="mb-4 text-2xl font-bold">أكمل تعلمك</h2>
                          <HorizontalCarousel>
                            {mine.courses.map((c: CourseItem) => (
                              <CourseCard
                                key={c.id}
                                id={c.id}
                                title={c.title}
                                desc={c.short_description}
                                price={c.discounted_price || c.price}
                                lessons={c.total_number_of_lessons}
                                img={c.thumbnail}
                                isFree={c.is_free_course === '1' || c.price?.toLowerCase?.() === 'free'}
                                level={c.level}
                              />
                            ))}
                          </HorizontalCarousel>
                        </div>
                      )}

                      {(mine.bundles.length > 0) && (
                        <div>
                          <h2 className="mb-4 text-2xl font-bold">الحزم المشترك بها</h2>
                          <HorizontalCarousel>
                            {mine.bundles.map((b: BundleItem) => (
                              <BundleCard key={b.id} id={b.id} title={b.title} desc={b.description} price={b.price} img={b.image || b.cover_image || '/image.jpg'} />
                            ))}
                          </HorizontalCarousel>
                        </div>
                      )}
                    </>
                  )}
                </section>
              ) : isSearching ? (
                <section className="mt-8">
                  <h2 className="mb-4 text-2xl font-bold">نتائج البحث عن "{q}"</h2>
                  {((filtered.courses.length + filtered.bundles.length) === 0) ? (
                    <Card className="rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                      <CardContent className="p-10 text-center text-gray-500">لم نجد أي نتائج تطابق بحثك.</CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {filtered.courses.map((c: CourseItem) => (
                        <CourseCard
                          key={c.id}
                          id={c.id}
                          title={c.title}
                          desc={c.short_description}
                          price={c.discounted_price || c.price}
                          lessons={c.total_number_of_lessons}
                          img={c.thumbnail}
                          isFree={c.is_free_course === '1' || c.price?.toLowerCase?.() === 'free'}
                          level={c.level}
                        />
                      ))}
                      {filtered.bundles.map((b: BundleItem) => (
                        <BundleCard key={b.id} id={b.id} title={b.title} desc={b.description} price={b.price} img={b.image || b.cover_image || '/image.jpg'} />
                      ))}
                    </div>
                  )}
                </section>
              ) : (
                <section className="mt-8 space-y-12">
                  {(featured.courses.length > 0) && (
                    <div>
                      <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold"><Sparkles className="h-5 w-5 text-warning" /> محتوى مميز</h2>
                      <HorizontalCarousel>
                        {featured.courses.map((c: CourseItem) => (
                          <CourseCard
                            key={c.id}
                            id={c.id}
                            title={c.title}
                            desc={c.short_description}
                            price={c.discounted_price || c.price}
                            lessons={c.total_number_of_lessons}
                            img={c.thumbnail}
                            isFree={c.is_free_course === '1' || c.price?.toLowerCase?.() === 'free'}
                            level={c.level}
                          />
                        ))}
                      </HorizontalCarousel>
                    </div>
                  )}

                  <div>
                    <h2 className="mb-4 text-2xl font-bold">جميع الكورسات</h2>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {filtered.courses.map((c: CourseItem) => (
                        <CourseCard
                          key={c.id}
                          id={c.id}
                          title={c.title}
                          desc={c.short_description}
                          price={c.discounted_price || c.price}
                          lessons={c.total_number_of_lessons}
                          img={c.thumbnail}
                          isFree={c.is_free_course === '1' || c.price?.toLowerCase?.() === 'free'}
                          level={c.level}
                        />
                      ))}
                    </div>
                  </div>

                  {(filtered.bundles.length > 0) && (
                    <div>
                      <h2 className="mb-4 text-2xl font-bold">جميع الحزم التعليمية</h2>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.bundles.map((b: BundleItem) => (
                          <BundleCard key={b.id} id={b.id} title={b.title} desc={b.description} price={b.price} img={b.image || b.cover_image || '/image.jpg'} />
                        ))}
                      </div>
                    </div>
                  )}

                  {(data.categories?.length > 0) && (
                    <div>
                      <h2 className="mb-4 text-2xl font-bold">التصنيفات</h2>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {data.categories.map((cat: any) => (
                          <Link
                            key={cat.id}
                            href={`/academy/category/${cat.id}`}
                            prefetch
                            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                            aria-label={`فتح تصنيف ${cat.name}`}
                          >
                            <SmartImage
                              src={cat.thumbnail || '/image.jpg'}
                              alt={cat.name}
                              fill
                              sizes="(min-width:768px) 20vw, 45vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              fallbackSrc="/image.jpg"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-0 right-0 p-3 text-white">
                              <h3 className="font-bold">{cat.name}</h3>
                              <p className="text-xs text-white/80">{cat.number_of_courses} كورسات</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        <div className="mx-auto mt-12 max-w-7xl">
          <AuthPrompt />
        </div>
      </main>
    </div>
  )
}
