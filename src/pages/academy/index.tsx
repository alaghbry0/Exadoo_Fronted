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

/* =========================
   Types
========================= */
interface CourseItem {
  id: string
  title: string
  short_description: string
  price: string
  discounted_price?: string
  total_number_of_lessons: number
  thumbnail: string
  is_free_course?: string | null
  level?: 'beginner' | 'intermediate' | 'advanced' | string
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

/* =========================
   Helpers
========================= */
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

/* =========================
   Level Badge
========================= */
const LevelBadge = memo(({ level }: { level?: CourseItem['level'] }) => {
  if (!level) return null

  const levelConfig = {
    beginner: { label: 'مبتدئ', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    intermediate: { label: 'متوسط', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    advanced: { label: 'متقدم', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
  } as const

  const config = (levelConfig as any)[level] || levelConfig.beginner

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium',
      config.color,
    )}>
      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      {config.label}
    </span>
  )
})
LevelBadge.displayName = 'LevelBadge'

/* =========================
   Skeleton
========================= */
function SkeletonCard() {
  return (
    <div className="h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-lg shadow-slate-200/40 dark:border-neutral-800/60 dark:bg-neutral-900">
      <div className="aspect-[4/3] sm:aspect-[16/9] w-full rounded-2xl bg-slate-200 dark:bg-neutral-800 animate-pulse" />
      <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
        <div className="h-4 sm:h-5 w-3/4 rounded-lg bg-slate-200 dark:bg-neutral-800 animate-pulse" />
        <div className="h-3.5 sm:h-4 w-1/2 rounded-lg bg-slate-200 dark:bg-neutral-800 animate-pulse" />
        <div className="h-3 w-full rounded-lg bg-slate-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    </div>
  )
}

/* =========================
   HScroll — snap + إخفاء الشريط + سحب ناعم
========================= */
const HScroll = memo(function HScroll({
  children,
  itemClassName = 'min-w-[220px] w-[68%] xs:w-[58%] sm:w-[45%] lg:w-[30%] xl:w-[23%]',
}: React.PropsWithChildren<{ itemClassName?: string }>) {
  const count = React.Children.count(children)
  if (count === 0) return null

  return (
    <div className="relative mx-0 sm:-mx-4 px-0 sm:px-4">
      <div className="hscroll hscroll-snap">
        {React.Children.map(children, (child, i) => (
          <div key={i} className={cn('hscroll-item', itemClassName)}>
            {child}
          </div>
        ))}
        <div className="hscroll-item w-px sm:w-2 lg:w-4" />
      </div>
    </div>
  )
})

/* =========================
   MiniCourseCard (Link + motion.div)
========================= */
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
  level?: CourseItem['level']
  img?: string
  free?: boolean
  variant?: 'default' | 'highlight' | 'top'
  priority?: boolean
}) {
  const borderVariant =
    variant === 'highlight'
      ? 'border-amber-400/30 hover:border-amber-500/50'
      : variant === 'top'
      ? 'border-blue-400/30 hover:border-blue-500/50'
      : 'hover:border-blue-500/30'

  return (
    <Link
      href={`/academy/course/${id}`}
      prefetch
      className="block h-full group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-3xl"
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className={cn(
          'relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm transition-all duration-300 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50',
          'sm:[&_*]:text-[inherit]',
          borderVariant,
        )}>
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden">
            <SmartImage
              src={img || '/image.jpg'}
              alt={title}
              fill
              sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 60vw"
              priority={!!priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ borderRadius: '0 0 0rem 0rem' }}
              noFade
              disableSkeleton
              eager
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {variant === 'top' && (
              <div className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 flex items-center gap-1.5 rounded-full bg-blue-600/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-white shadow-lg shadow-blue-500/30 backdrop-blur-sm">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] sm:text-xs font-semibold">الأكثر طلباً</span>
              </div>
            )}
            {variant === 'highlight' && (
              <div className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 flex items-center gap-1.5 rounded-full bg-amber-500/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-white shadow-lg shadow-amber-500/30 backdrop-blur-sm">
                <Star className="h-3.5 w-3.5" />
                <span className="text-[10px] sm:text-xs font-semibold">مميّز</span>
              </div>
            )}
            {free && (
              <div className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 rounded-full bg-emerald-500/90 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 backdrop-blur-sm">
                مجاني
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <h3 className="line-clamp-1 text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">
              {title}
            </h3>
            <p className="line-clamp-2 text-[13px] sm:text-sm leading-relaxed text-slate-600 text-balance mb-3 sm:mb-4 flex-grow">
              {desc}
            </p>
            <div className="flex items-center justify-between gap-2.5 sm:gap-3 border-t border-slate-100 pt-2.5 sm:pt-3 mt-auto">
              <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{lessons} درس</span>
                </span>
                <LevelBadge level={level} />
              </div>
              <span className="text-sm sm:text-base font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">
                {free ? 'مجاني' : formatPrice(price)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
})

/* =========================
   MiniBundleCard (Link + motion.div)
========================= */
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
      prefetch
      className="block h-full group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-3xl"
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className={cn(
          'relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm transition-all duration-300 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50',
          variant === 'highlight'
            ? 'border-purple-400/30 hover:border-purple-500/50'
            : 'hover:border-blue-500/30',
        )}>
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden">
            <SmartImage
              src={img || '/image.jpg'}
              alt={title}
              fill
              sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 60vw"
              priority={!!priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ borderRadius: '0 0 0rem 0rem' }}
              noFade
              disableSkeleton
              eager
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {variant === 'highlight' && (
              <div className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 flex items-center gap-1.5 rounded-full bg-purple-600/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-white shadow-lg shadow-purple-500/30 backdrop-blur-sm">
                <Award className="h-3.5 w-3.5" />
                <span className="text-[10px] sm:text-xs font-semibold">حزمة مميزة</span>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <h3 className="line-clamp-1 text-sm sm:text-base font-bold text-slate-900 mb-1.5 sm:mb-2">
              {title}
            </h3>
            <p className="line-clamp-2 text-[13px] sm:text-sm leading-relaxed text-slate-600 text-balance mb-3 sm:mb-4 flex-grow">
              {(desc || '').replace(/\\r\\n/g, ' ')}
            </p>
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 sm:pt-3 mt-auto">
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-600">
                <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>حزمة تعليمية</span>
              </span>
              <span className="text-sm sm:text-base font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to purple-500">
                {formatPrice(price)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
})

/* =========================
   CategoryCard (Link + motion.div)
========================= */
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
      prefetch
      className="block h-full group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-3xl"
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="relative h-full min-h-[130px] sm:min_h-[180px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition-all duration-300 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50">
          <SmartImage
            src={thumbnail || '/image.jpg'}
            alt={`تصنيف: ${name}`}
            fill
            sizes="(min-width:1024px) 22vw, (min-width:640px) 38vw, 50vw"
            priority={!!priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ borderRadius: '0 0 0rem 0rem' }}
            noFade
            disableSkeleton
            eager
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="grid place-items-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 backdrop-blur-sm">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="line-clamp-1 text-sm sm:text-base font-bold text-white tracking-wide">{name}</h3>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
})

/* =========================
   Section Header
========================= */
const SectionHeader = memo(({ icon: Icon, title, id }: {
  icon: React.ElementType
  title: string
  id: string
}) => (
  <div className="mb-6 flex items-center gap-4">
    <div className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h2 id={id} className="text-3xl font-bold text-slate-900 tracking-tight">
      {title}
    </h2>
  </div>
))
SectionHeader.displayName = 'SectionHeader'

/* =========================
   Page
========================= */
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
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  رحلتك التعليمية تبدأ هنا
                </span>
              </div>

              <h1 id="page-title" className="mb-3 text-4xl font-bold text-gray-900">
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
              className="mx-auto max-w-2xl"
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
                  className="block w-full rounded-[1.35rem] border border-transparent bg-white py-3.5 pr-4 pl-12 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-400/10 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-primary-500"
                  aria-label="بحث في محتوى الأكاديمية"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <div className="sticky top-[56px] z-20 mx-0 sm:-mx-4 mb-8 border-y border-gray-200/80 bg-white/80 px-0 sm:px-4 backdrop-blur-xl dark:border-neutral-800/80">
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
                'rounded-xl px-6 py-2.5 text-[15px] font-semibold',
                tab === 'all'
                  ? 'bg-primary-600 text-white hover:bg-primary-600/90'
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
                'rounded-xl px-6 py-2.5 text-[15px] font-semibold',
                tab === 'mine'
                  ? 'bg-primary-600 text-white hover:bg-primary-600/90'
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
              <div className="mb-5 h-7 w-40 rounded-xl bg-slate-200 dark:bg-neutral-800 animate-pulse" />
              <HScroll>
                {Array.from({ length: 4 }).map((_, i) => (
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

        {/* Content */}
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
                  {/* Empty mine */}
                  {( (mine.courses.length === 0) && (mine.bundles.length === 0) ) ? (
                    <div className="mx-auto max-w-lg no-print">
                      <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center dark:border-neutral-700 dark:bg-neutral-900/70">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
                          <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="mb-2 text-lg font-bold text-slate-900 dark:text-neutral-100">
                          لم تشترك في أي محتوى بعد
                        </p>
                        <p className="mb-6 text-sm text-slate-600 dark:text-neutral-400">
                          اكتشف الأكاديمية وابدأ رحلتك التعليمية من خلال تبويب "جميع المحتوى"
                        </p>
                        <Button
                          className="rounded-xl px-6 py-2.5 bg-primary-600 text-white hover:bg-primary-600/90"
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
                      <HScroll itemClassName="min-w-[180px] w-[55%] xs:w-[48%] sm:w-[38%] lg:w-[22%] xl:w-[18%]">
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

                  {/* Empty search state */}
                  {isSearching &&
                    filteredData.topCourses.length === 0 &&
                    filteredData.categories.length === 0 &&
                    filteredData.topBundles.length === 0 &&
                    filteredData.highlightCourses.length === 0 && (
                      <div className="mx-auto max-w-lg">
                        <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center dark:border-neutral-700 dark:bg-neutral-900/70">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
                            <Search className="h-8 w-8 text-gray-400 dark:text-neutral-500" />
                          </div>
                          <p className="mb-2 text-lg font-bold text-slate-900 dark:text-neutral-100">لا توجد نتائج</p>
                          <p className="mb-4 text-sm text-slate-600 dark:text-neutral-400">
                            جرّب كلمات أبسط أو تصنيفات مختلفة
                          </p>
                          <div className="flex flex-wrap justify_center gap-2">
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
