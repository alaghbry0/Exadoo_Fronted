// src/pages/academy/index.tsx
'use client'

import React, {
  memo,
  useMemo,
  useState,
  useCallback,
  useDeferredValue,
} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import BackHeader from '@/components/BackHeader'
import AuthPrompt from '@/components/AuthFab'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Search,
  Bookmark,
  Layers,
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Sparkles,
} from 'lucide-react'
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
  is_free_course?: string | null
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

interface CategoryItem {
  id: string
  name: string
  thumbnail?: string
  number_of_courses?: number
}

// =========================================
//  Helpers
// =========================================
const formatPrice = (value?: string) => {
  if (!value) return ''
  if (value.toLowerCase?.() === 'free') return 'مجاني'
  const n = Number(value)
  return isNaN(n) ? value : `$${n.toFixed(0)}`
}

const isFreeCourse = (c: Pick<CourseItem, 'price' | 'is_free_course'>) =>
  c.is_free_course === '1' || c.price?.toLowerCase?.() === 'free'

function normalizeArabic(input: string) {
  return (input || '')
    .toLowerCase()
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim()
}

// =========================================
//  Level Badge
// =========================================
const LevelBadge = memo(({ level }: { level?: string }) => {
  if (!level) return null

  const levelConfig = {
    beginner: { label: 'مبتدئ', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    intermediate: { label: 'متوسط', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    advanced: { label: 'متقدم', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  }

  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.beginner

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium badge-glow',
        config.color
      )}
    >
      <Sparkles className="h-2.5 w-2.5" />
      {config.label}
    </span>
  )
})
LevelBadge.displayName = 'LevelBadge'

// =========================================
//  UI Utilities
// =========================================
function SkeletonCard() {
  return (
    <div className="h-full overflow-hidden rounded-3xl border border-gray-100/50 bg-white p-4 card-shadow dark:border-neutral-800/50 dark:bg-neutral-900">
      <div className="aspect-[16/9] w-full loading-shimmer rounded-2xl" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-3/4 skeleton rounded-lg" />
        <div className="h-3 w-1/2 skeleton rounded-lg" />
      </div>
    </div>
  )
}

// =========================================
//  UI Components
// =========================================

/** HScroll — يستخدم snap + إخفاء سكروول */
const HScroll = memo(function HScroll({
  children,
  itemClassName = 'w-[75%] sm:w-[48%] lg:w-[32%]',
}: React.PropsWithChildren<{ itemClassName?: string }>) {
  const count = React.Children.count(children)
  if (count === 0) return null
  return (
    <div className="relative -mx-4 px-4">
      <div
        className="flex gap-4 overflow-x-auto pb-2 snap-container scrollbar-hide"
        role="list"
        aria-label="اسحب لليمين/اليسار لعرض المزيد"
      >
        {React.Children.map(children, (ch, i) => (
          <div
            key={i}
            className={cn('flex-shrink-0 snap-item', itemClassName)}
            role="listitem"
          >
            {ch}
          </div>
        ))}
      </div>
    </div>
  )
})

/** بطاقة دورة مصغّرة محسّنة */
const MiniCourseCard = memo(function MiniCourseCard({
  id,
  title,
  desc,
  price,
  lessons,
  level,
  img,
  free,
  variant,
  priority,
}: {
  id: string
  title: string
  desc: string
  price: string
  lessons: number
  level?: string
  img?: string
  free?: boolean
  variant?: 'default' | 'highlight' | 'top'
  priority?: boolean
}) {
  const router = useRouter()
  const prefetch = useCallback(() => router.prefetch(`/academy/course/${id}`), [router, id])

  const borderVariant =
    variant === 'highlight'
      ? 'border-amber-200/70 dark:border-amber-800/50'
      : variant === 'top'
      ? 'border-blue-200/70 dark:border-blue-800/50'
      : 'border-gray-100/50 dark:border-neutral-800/50'

  return (
    <Link
      href={`/academy/course/${id}`}
      prefetch={false}
      onMouseEnter={prefetch}
      onTouchStart={prefetch}
      className="block h-full outline-none focus-enhanced ripple-effect"
      aria-label={`فتح دورة ${title}`}
    >
      <Card className={cn(
        'group relative h-full overflow-hidden rounded-3xl border bg-white transition-smooth card-shadow hover:card-shadow-hover dark:bg-neutral-900',
        borderVariant
      )}>
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <SmartImage
            src={img || '/image.jpg'}
            alt={title}
            fill
            sizes="(min-width:1024px) 32vw, (min-width:640px) 48vw, 75vw"
            priority={!!priority}
            className="object-cover image-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-smooth group-hover:opacity-100" />

          {/* Badges */}
          {variant === 'top' && (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-blue-600/95 px-2.5 py-1 text-white shadow-medium backdrop-blur-strong">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[11px] font-semibold">الأكثر طلباً</span>
            </div>
          )}
          {variant === 'highlight' && (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-amber-500/95 px-2.5 py-1 text-white shadow-medium backdrop-blur-strong">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-[11px] font-semibold">مميّز</span>
            </div>
          )}
          {free && (
            <div className="absolute right-3 top-3 rounded-full bg-emerald-500/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-medium backdrop-blur-strong">
              مجاني
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="line-clamp-1 text-[15px] font-bold high-contrast">
              {title}
            </h3>
          </div>

          <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-gray-600 text-balance dark:text-neutral-400">
            {desc}
          </p>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-neutral-800">
            <div className="flex items-center gap-3 text-[12px] text-gray-600 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="font-medium">{lessons}</span>
              </span>
              <LevelBadge level={level} />
            </div>

            <span className="text-[15px] font-extrabold text-gradient-primary">
              {free ? 'مجاني' : formatPrice(price)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

/** بطاقة حزمة محسّنة */
const MiniBundleCard = memo(function MiniBundleCard({
  id,
  title,
  desc,
  price,
  img,
  variant,
  priority,
}: {
  id: string
  title: string
  desc: string
  price: string
  img?: string
  variant?: 'default' | 'highlight'
  priority?: boolean
}) {
  return (
    <Link
      href={`/academy/bundle/${id}`}
      prefetch={false}
      className="group block h-full outline-none focus-enhanced ripple-effect"
      aria-label={`فتح حزمة ${title}`}
    >
      <Card
        className={cn(
          'relative h-full overflow-hidden rounded-3xl border bg-white transition-smooth card-shadow hover:card-shadow-hover dark:bg-neutral-900',
          variant === 'highlight'
            ? 'border-amber-200/70 dark:border-amber-800/50'
            : 'border-gray-100/50 dark:border-neutral-800/50'
        )}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <SmartImage
            src={img || '/image.jpg'}
            alt={title}
            fill
            sizes="(min-width:1024px) 32vw, (min-width:640px) 48vw, 75vw"
            priority={!!priority}
            className="object-cover image-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-smooth group-hover:opacity-100" />

          {variant === 'highlight' && (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-amber-500/95 px-2.5 py-1 text-white shadow-medium backdrop-blur-strong">
              <Award className="h-3 w-3" />
              <span className="text-[11px] font-semibold">حزمة مميزة</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-1 text-[15px] font-bold high-contrast">
            {title}
          </h3>

          <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-gray-600 text-balance dark:text-neutral-400">
            {(desc || '').replace(/\\r\\n/g, ' ')}
          </p>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-neutral-800">
            <span className="flex items-center gap-1.5 text-[12px] text-gray-600 dark:text-neutral-400">
              <Award className="h-3.5 w-3.5" />
              <span className="font-medium">حزمة تعليمية</span>
            </span>
            <span className="text-[15px] font-extrabold text-gradient-primary">
              {formatPrice(price)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

/** بطاقة تصنيف محسّنة */
const CategoryCard = memo(function CategoryCard({
  id,
  name,
  thumbnail,
  priority,
}: {
  id: string
  name: string
  thumbnail?: string
  priority?: boolean
}) {
  return (
    <Link
      href={`/academy/category/${id}`}
      prefetch={false}
      className="group relative block h-full overflow-hidden rounded-3xl border border-gray-100/50 bg-white transition-smooth card-shadow hover:card-shadow-hover dark:border-neutral-800/50 dark:bg-neutral-900"
      aria-label={`فتح تصنيف ${name}`}
    >
      <div className="relative h-full min-h-[140px]">
        <SmartImage
          src={thumbnail || '/image.jpg'}
          alt={`تصنيف: ${name}`}
          fill
          sizes="(min-width:1024px) 23vw, (min-width:640px) 48vw, 75vw"
          priority={!!priority}
          className="object-cover image-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-white/90" />
            <h3 className="line-clamp-1 text-[15px] font-bold text-white">{name}</h3>
          </div>
        </div>
      </div>
    </Link>
  )
})

// =========================================
//  Section Header
// =========================================
const SectionHeader = memo(({ icon: Icon, title, id }: {
  icon: React.ElementType
  title: string
  id: string
}) => (
  <div className="mb-5 flex items-center gap-2.5">
    <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 p-2 shadow-soft dark:from-primary-600 dark:to-primary-700">
      <Icon className="h-5 w-5 text-white" />
    </div>
    <h2 id={id} className="text-[22px] font-bold high-contrast">
      {title}
    </h2>
  </div>
))
SectionHeader.displayName = 'SectionHeader'

// =========================================
//  Page Component
// =========================================
export default function AcademyIndex() {
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [q, setQ] = useState('')
  const deferredQuery = useDeferredValue(q)
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  const { topCourses, categories, topBundles, highlightCourses } = useMemo(() => {
    if (!data) return { topCourses: [], categories: [], topBundles: [], highlightCourses: [] }
    const allCourses = (data.courses || []) as CourseItem[]
    const allBundles = (data.bundles || []) as BundleItem[]

    let tc = ((data.top_course_ids || []) as string[])
      .map((id) => allCourses.find((c) => c.id === id))
      .filter(Boolean) as CourseItem[]
    if (tc.length === 0) tc = allCourses.slice(0, 5)

    let tb = ((data.top_bundle_ids || []) as string[])
      .map((id) => allBundles.find((b) => b.id === id))
      .filter(Boolean) as BundleItem[]
    if (tb.length === 0) tb = allBundles.slice(0, 5)

    const topIds = new Set(tc.map((c) => c.id))
    let hc = ((data.highlight_course_ids || []) as string[])
      .map((id) => allCourses.find((c) => c.id === id))
      .filter(Boolean) as CourseItem[]
    if (hc.length === 0) hc = allCourses.filter((c) => !topIds.has(c.id)).slice(0, 8)

    return {
      topCourses: tc,
      categories: (data.categories || []) as CategoryItem[],
      topBundles: tb,
      highlightCourses: hc,
    }
  }, [data])

  const ql = useMemo(() => normalizeArabic(deferredQuery || ''), [deferredQuery])
  const isSearching = ql.length > 0

  const filteredData = useMemo(() => {
    if (!isSearching) return { topCourses, categories, topBundles, highlightCourses }

    const filterCourse = (c: CourseItem) =>
      normalizeArabic(`${c.title || ''} ${c.short_description || ''}`).includes(ql)
    const filterBundle = (b: BundleItem) =>
      normalizeArabic(`${b.title || ''} ${b.description || ''}`).includes(ql)
    const filterCategory = (c: CategoryItem) => normalizeArabic(c.name || '').includes(ql)

    return {
      topCourses: topCourses.filter(filterCourse),
      categories: categories.filter(filterCategory),
      topBundles: topBundles.filter(filterBundle),
      highlightCourses: highlightCourses.filter(filterCourse),
    }
  }, [isSearching, ql, topCourses, categories, topBundles, highlightCourses])

  const mine = useMemo(() => {
    if (!data) return { courses: [] as CourseItem[], bundles: [] as BundleItem[] }
    const cset = new Set((data.my_enrollments?.course_ids || []) as string[])
    const bset = new Set((data.my_enrollments?.bundle_ids || []) as string[])
    return {
      courses: (data.courses || []).filter((c: CourseItem) => cset.has(c.id)),
      bundles: (data.bundles || []).filter((b: BundleItem) => bset.has(b.id)),
    }
  }, [data])

  const handleTab = useCallback((key: 'all' | 'mine') => setTab(key), [])

  return (
    <div dir="rtl" className="min-h-screen bg-white dark:bg-neutral-950 font-arabic text-gray-800 dark:text-neutral-200">
      <BackHeader title="الأكاديمية" backTo="/shop" backMode="always" />

      <main className="mx-auto max-w-7xl px-4 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden pt-8 pb-8 no-print" aria-labelledby="page-title">

          <div className="relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 dark:bg-primary-900/20">
                <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">رحلتك التعليمية تبدأ هنا </span>
              </div>

              <h1 id="page-title" className="mb-3 text-4xl font-bold text-gray-900 responsive-text-5xl">
                أكاديمية Exaado
              </h1>

              <p className="mx-auto max-w-2xl text-base text-gray-600 text-balance dark:text-neutral-300">
                طريقك المتكامل لإتقان التداول. تعلّم من الخبراء وطبّق باستراتيجيات عملية
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-2xl search-enhanced"
              role="search"
            >
              <div className="relative rounded-[1.5rem] bg-white p-0.5 dark:bg-neutral-900">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="h-5 w-5 text-gray-400 dark:text-neutral-500" />
                </div>
                <input
                  type="search"
                  placeholder="ابحث في الدورات والحزم والتصنيفات..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="block w-full rounded-[1.35rem] border border-transparent bg-white py-3.5 pr-4 pl-12 text-base text-gray-900 shadow-soft placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-400/10 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-primary-500"
                  aria-label="بحث في محتوى الأكاديمية"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <div className="sticky top-[56px] z-20 -mx-4 mb-8 border-y border-gray-200/80 bg-white/80 px-4 backdrop-blur-xl glass-effect dark:border-neutral-800/80">
          <div
            role="tablist"
            aria-label="أقسام الأكاديمية"
            className="mx-auto flex max-w-7xl items-center justify-center gap-3 py-4"
          >
            <Button
              role="tab"
              aria-selected={tab === 'all'}
              onClick={() => handleTab('all')}
              className={cn(
                'rounded-xl px-6 py-2.5 text-[15px] font-semibold transition-smooth ripple-effect',
                tab === 'all'
                  ? 'btn-primary-enhanced'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              )}
            >
              <Layers className="ml-2 h-4 w-4" />
              جميع المحتوى
            </Button>
            <Button
              role="tab"
              aria-selected={tab === 'mine'}
              onClick={() => handleTab('mine')}
              className={cn(
                'rounded-xl px-6 py-2.5 text-[15px] font-semibold transition-smooth ripple-effect',
                tab === 'mine'
                  ? 'btn-primary-enhanced'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              )}
            >
              <Bookmark className="ml-2 h-4 w-4" />
              دوراتي
            </Button>
          </div>
        </div>

        {/* Loading / Error */}
        <div aria-live="polite">
          {isLoading && (
            <section className="space-y-8">
              <div className="mb-5 h-7 w-40 skeleton rounded-xl" />
              <HScroll>
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </HScroll>
            </section>
          )}
          {isError && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
              حدث خطأ: {(error as Error)?.message}
            </div>
          )}
        </div>

        {/* المحتوى */}
        {data && !isLoading && !isError && (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {tab === 'mine' ? (
                <section className="space-y-10">
                  {mine.courses.length === 0 && mine.bundles.length === 0 ? (
                    <div className="mx-auto max-w-lg no-print">
                      <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center card-shadow dark:border-neutral-700 dark:bg-neutral-900/70">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                          <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="mb-2 text-lg font-bold high-contrast">
                          لم تشترك في أي محتوى بعد
                        </p>
                        <p className="mb-6 text-sm text-gray-600 text-balance dark:text-neutral-400">
                          اكتشف الأكاديمية وابدأ رحلتك التعليمية من خلال تبويب "جميع المحتوى"
                        </p>
                        <Button
                          className="btn-primary-enhanced rounded-xl px-6 py-2.5"
                          onClick={() => setTab('all')}
                        >
                          <Layers className="ml-2 h-4 w-4" />
                          استكشف الدورات الآن
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {mine.courses.length > 0 && (
                        <section aria-labelledby="my-courses">
                          <SectionHeader icon={Bookmark} title="دوراتي" id="my-courses" />
                          <HScroll>
                            {mine.courses.map((c, i) => (
                              <MiniCourseCard
                                key={c.id}
                                id={c.id}
                                title={c.title}
                                desc={c.short_description}
                                price={c.discounted_price || c.price}
                                lessons={c.total_number_of_lessons}
                                level={c.level}
                                img={c.thumbnail}
                                free={isFreeCourse(c)}
                                priority={i === 0}
                              />
                            ))}
                          </HScroll>
                        </section>
                      )}

                      {mine.bundles.length > 0 && (
                        <section aria-labelledby="my-bundles">
                          <SectionHeader icon={Award} title="حزمي المسجلة" id="my-bundles" />
                          <HScroll>
                            {mine.bundles.map((b, i) => (
                              <MiniBundleCard
                                key={b.id}
                                id={b.id}
                                title={b.title}
                                desc={b.description}
                                price={b.price}
                                img={b.image || b.cover_image}
                                variant="highlight"
                                priority={i === 0}
                              />
                            ))}
                          </HScroll>
                        </section>
                      )}
                    </>
                  )}
                </section>
              ) : (
                <>
                  {/* Top Courses */}
                  {filteredData.topCourses.length > 0 && (
                    <section aria-labelledby="top-courses">
                      <SectionHeader icon={TrendingUp} title="الأكثر طلباً" id="top-courses" />
                      <HScroll>
                        {filteredData.topCourses.map((c, i) => (
                          <MiniCourseCard
                            key={c.id}
                            id={c.id}
                            title={c.title}
                            desc={c.short_description}
                            price={c.discounted_price || c.price}
                            lessons={c.total_number_of_lessons}
                            level={c.level}
                            img={c.thumbnail}
                            free={isFreeCourse(c)}
                            variant="top"
                            priority={i === 0}
                          />
                        ))}
                      </HScroll>
                    </section>
                  )}

                  {/* Categories */}
                  {filteredData.categories.length > 0 && (
                    <section aria-labelledby="categories">
                      <SectionHeader icon={Layers} title="التصنيفات" id="categories" />
                      <HScroll itemClassName="w-[48%] sm:w-[32%] lg:w-[23%]">
                        {filteredData.categories.map((cat, i) => (
                          <CategoryCard key={cat.id} {...cat} priority={i === 0} />
                        ))}
                      </HScroll>
                    </section>
                  )}

                  {/* Top Bundles */}
                  {filteredData.topBundles.length > 0 && (
                    <section aria-labelledby="top-bundles">
                      <SectionHeader icon={Award} title="حزم مميزة" id="top-bundles" />
                      <HScroll>
                        {filteredData.topBundles.map((b, i) => (
                          <MiniBundleCard
                            key={b.id}
                            id={b.id}
                            title={b.title}
                            desc={b.description}
                            price={b.price}
                            img={b.image || b.cover_image}
                            variant="highlight"
                            priority={i === 0}
                          />
                        ))}
                      </HScroll>
                    </section>
                  )}

                  {/* Highlight Courses */}
                  {filteredData.highlightCourses.length > 0 && (
                    <section aria-labelledby="highlight-courses">
                      <SectionHeader icon={Star} title="دورات مميزة" id="highlight-courses" />
                      <HScroll>
                        {filteredData.highlightCourses.map((c, i) => (
                          <MiniCourseCard
                            key={c.id}
                            id={c.id}
                            title={c.title}
                            desc={c.short_description}
                            price={c.discounted_price || c.price}
                            lessons={c.total_number_of_lessons}
                            level={c.level}
                            img={c.thumbnail}
                            free={isFreeCourse(c)}
                            variant="highlight"
                            priority={i === 0}
                          />
                        ))}
                      </HScroll>
                    </section>
                  )}

                  {/* Empty state (search) */}
                  {isSearching &&
                    filteredData.topCourses.length === 0 &&
                    filteredData.categories.length === 0 &&
                    filteredData.topBundles.length === 0 &&
                    filteredData.highlightCourses.length === 0 && (
                      <div className="mx-auto max-w-lg">
                        <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center card-shadow dark:border-neutral-700 dark:bg-neutral-900/70">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
                            <Search className="h-8 w-8 text-gray-400 dark:text-neutral-500" />
                          </div>
                          <p className="mb-2 text-lg font-bold high-contrast">لا توجد نتائج</p>
                          <p className="mb-4 text-sm text-gray-600 text-balance dark:text-neutral-400">
                            جرّب كلمات أبسط أو تصنيفات مختلفة
                          </p>
                          <div className="flex flex-wrap justify-center gap-2">
                            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">
                              تحليل فني
                            </span>
                            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">
                              مبتدئ
                            </span>
                            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">
                              مجاني
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                </>
              )}

              <div className="pt-4">
                <AuthPrompt />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}
