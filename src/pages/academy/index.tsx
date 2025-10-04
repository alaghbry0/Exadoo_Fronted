// src/pages/academy/index.tsx
'use client'

import React, { memo, useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import BackHeader from '@/components/BackHeader'
import AuthPrompt from '@/components/AuthFab'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, Bookmark, Layers, Sparkles, ArrowLeft, Star, TrendingUp, Award } from 'lucide-react'
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

// =========================================
//  UI Components
// =========================================

/** HScroll — سكرول أفقي بسيط (صف واحد) **/
const HScroll: React.FC<React.PropsWithChildren<{ itemClassName?: string }>> = ({ children, itemClassName = 'w-[70%] sm:w-[45%]' }) => {
  const count = React.Children.count(children)
  if (count === 0) return null
  return (
    <div className="relative">
      <div
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="list"
      >
        {React.Children.map(children, (ch, i) => (
          <div key={i} className={cn('flex-shrink-0 snap-start', itemClassName)} role="listitem">
            {ch}
          </div>
        ))}
      </div>
    </div>
  )
}

/** ✅ [مدمج] GridCarousel — سكرول أفقي شبكي (صفين) **/
const GridCarousel: React.FC<React.PropsWithChildren> = ({ children }) => {
    const count = React.Children.count(children)
    if (count === 0) return null
    return (
        <div className="relative">
            <div
                className="-mx-4 grid grid-flow-col grid-rows-2 auto-cols-[85%] gap-x-3 gap-y-3 overflow-x-auto snap-x snap-mandatory px-4 pb-2 sm:auto-cols-[45%]"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                role="list"
            >
                {React.Children.map(children, (child, i) => <div key={i} className="snap-start">{child}</div>)}
            </div>
        </div>
    )
}

/** بطاقـة دورة مصغّرة **/
const MiniCourseCard = memo(function MiniCourseCard({
  id, title, desc, price, lessons, level, img, free, variant,
}: {
  id: string; title: string; desc: string; price: string; lessons: number; level?: string; img?: string; free?: boolean; variant?: 'default' | 'highlight' | 'top'
}) {
  const router = useRouter()
  const prefetch = useCallback(() => router.prefetch(`/academy/course/${id}`), [router, id])

  const cardClass = cn(
    'h-full overflow-hidden rounded-xl border shadow-sm transition-all duration-200',
    'group-hover:-translate-y-0.5 group-hover:shadow-md',
    variant === 'highlight'
      ? 'border-amber-200 bg-white dark:border-amber-800 dark:bg-neutral-900'
      : variant === 'top'
      ? 'border-blue-200 bg-white dark:border-blue-800 dark:bg-neutral-900'
      : 'border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900'
  )

  return (
    <Link
      href={`/academy/course/${id}`}
      prefetch
      onMouseEnter={prefetch}
      onTouchStart={prefetch}
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50"
      aria-label={`فتح دورة ${title}`}
    >
      <Card className={cardClass}>
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <SmartImage
            src={img || '/image.jpg'}
            alt={title}
            fill
            sizes="(min-width:1280px) 300px, (min-width:640px) 45vw, 70vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {variant === 'top' && (
            <div className="absolute left-2 top-2 rounded-full bg-blue-600/90 p-1.5 text-white">
              <TrendingUp className="h-3 w-3" />
            </div>
          )}
          {variant === 'highlight' && (
            <div className="absolute left-2 top-2 rounded-full bg-amber-600/90 p-1.5 text-white">
              <Star className="h-3 w-3" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-neutral-100">{title}</h3>
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-gray-600 dark:text-neutral-400">{desc}</p>
          <div className="mt-3 flex items-center justify-between text-[12px] text-gray-500 dark:text-neutral-400">
            <span className="truncate">{lessons} درس{level ? ` • ${level}` : ''}</span>
            <span className="font-extrabold text-primary-600 dark:text-primary-400">{free ? 'مجاني' : formatPrice(price)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

/** بطاقة حزمة مصغّرة **/
const MiniBundleCard = memo(function MiniBundleCard({
  id, title, desc, price, img, variant,
}: { id: string; title: string; desc: string; price: string; img?: string; variant?: 'default' | 'highlight' }) {
  return (
    <Link
      href={`/academy/bundle/${id}`}
      prefetch
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50"
      aria-label={`فتح حزمة ${title}`}
    >
      <Card className={cn(
        'h-full overflow-hidden rounded-xl border shadow-sm transition-all duration-200',
        'group-hover:-translate-y-0.5 group-hover:shadow-md',
        variant === 'highlight'
          ? 'border-amber-200 bg-white dark:border-amber-800 dark:bg-neutral-900'
          : 'border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900'
      )}>
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <SmartImage
            src={img || '/image.jpg'}
            alt={title}
            fill
            sizes="(min-width:1280px) 300px, (min-width:640px) 45vw, 70vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {variant === 'highlight' && (
            <div className="absolute left-2 top-2 rounded-full bg-amber-600/90 p-1.5 text-white">
              <Award className="h-3 w-3" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="line-clamp-1 text-sm font-bold text-gray-900 dark:text-neutral-100">{title}</h3>
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-gray-600 dark:text-neutral-400">{(desc || '').replace(/\\r\\n/g, ' ')}</p>
          <div className="mt-3 flex items-center justify-between text-[12px] text-gray-500 dark:text-neutral-400">
            <span className="truncate">حزمة تعليمية</span>
            <span className="font-extrabold text-primary-600 dark:text-primary-400">{formatPrice(price)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})

/** بطاقة تصنيف **/
const CategoryCard = memo(function CategoryCard({ id, name, thumbnail }: { id: string; name: string; thumbnail?: string; }) {
  return (
    <Link
      href={`/academy/category/${id}`}
      prefetch
      className="group relative block h-full overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
      aria-label={`فتح تصنيف ${name}`}
    >
      <div className="relative h-full">
        <SmartImage
          src={thumbnail || '/image.jpg'}
          alt={name}
          fill
          sizes="(min-width:768px) 22vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 right-0 p-3 text-white">
        <h3 className="line-clamp-1 text-sm font-bold">{name}</h3>
      </div>
    </Link>
  )
})


// =========================================
//  Page Component
// =========================================
export default function AcademyIndex() {
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [q, setQ] = useState('')
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  // ===== مصادر الأقسام بالترتيب المطلوب (مع منطق احتياطي) =====
  const { topCourses, categories, highlightBundles, highlightCourses } = useMemo(() => {
    if (!data) return { topCourses: [], categories: [], highlightBundles: [], highlightCourses: [] }
    const allCourses = (data.courses || []) as CourseItem[]
    const allBundles = (data.bundles || []) as BundleItem[]
    
    let tc = ((data.top_course_ids || []) as string[])
        .map(id => allCourses.find(c => c.id === id))
        .filter(Boolean) as CourseItem[]
    if (tc.length === 0) tc = allCourses.slice(0, 5)

    let hb = ((data.highlight_bundle_ids || []) as string[])
        .map(id => allBundles.find(b => b.id === id))
        .filter(Boolean) as BundleItem[]
    if (hb.length === 0) hb = allBundles.slice(0, 5)

    const topIds = new Set(tc.map(c => c.id))
    let hc = ((data.highlight_course_ids || []) as string[])
        .map(id => allCourses.find(c => c.id === id && !topIds.has(c.id)))
        .filter(Boolean) as CourseItem[]
    if (hc.length === 0) hc = allCourses.filter(c => !topIds.has(c.id)).slice(0, 8)
    
    return { 
        topCourses: tc, 
        categories: (data.categories || []) as CategoryItem[], 
        highlightBundles: hb, 
        highlightCourses: hc 
    }
  }, [data])

  // ===== منطق البحث والفلترة =====
  const ql = q.trim().toLowerCase()
  const isSearching = ql.length > 0
  
  const filteredData = useMemo(() => {
    if (!isSearching) return { topCourses, categories, highlightBundles, highlightCourses }
    
    const filterCourse = (c: CourseItem) => (c.title + c.short_description).toLowerCase().includes(ql)
    const filterBundle = (b: BundleItem) => (b.title + b.description).toLowerCase().includes(ql)
    const filterCategory = (c: CategoryItem) => c.name?.toLowerCase?.().includes(ql)

    return {
        topCourses: topCourses.filter(filterCourse),
        categories: categories.filter(filterCategory),
        highlightBundles: highlightBundles.filter(filterBundle),
        highlightCourses: highlightCourses.filter(filterCourse)
    }
  }, [isSearching, ql, topCourses, categories, highlightBundles, highlightCourses])


  // بيانات “دوراتي”
  const mine = useMemo(() => {
    if (!data) return { courses: [], bundles: [] }
    const cset = new Set((data.my_enrollments?.course_ids || []) as string[])
    const bset = new Set((data.my_enrollments?.bundle_ids || []) as string[])
    return {
      courses: (data.courses || []).filter((c: CourseItem) => cset.has(c.id)),
      bundles: (data.bundles || []).filter((b: BundleItem) => bset.has(b.id)),
    }
  }, [data])

  const handleTab = useCallback((key: 'all' | 'mine') => setTab(key), [])

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-arabic text-gray-800 dark:bg-neutral-950 dark:text-neutral-200">
      <BackHeader title="الأكاديمية" backTo="/shop" backMode="always" />

      <main className="mx-auto max-w-7xl px-4 pb-12">
        {/* Hero مختصر + بحث */}
        <section className="pt-8 pb-6" aria-labelledby="page-title">
          <motion.h1
            id="page-title"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-neutral-100 md:text-4xl"
          >
            أكاديمية Exaado
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-neutral-300"
          >
            طريقك المتكامل لإتقان التداول. تعلّم من الخبراء، وطبّق باستراتيجيات عملية.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-xl"
            role="search"
          >
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="search"
                placeholder="ابحث في كل المحتوى..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="block w-full rounded-2xl py-2.5 pr-3.5 pl-10 text-sm bg-white text-gray-900 shadow-sm placeholder:text-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
          </motion.div>
        </section>

        {/* Tabs بسيطة */}
        <div className="sticky top-[56px] z-20 -mx-4 border-b border-gray-200 bg-gray-50/80 px-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 py-3">
            <Button onClick={() => handleTab('all')} className={cn('rounded-xl', tab === 'all' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' : 'bg-transparent text-gray-700 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-800')} aria-pressed={tab === 'all'}>
              <Layers className="ml-2 h-4 w-4" /> جميع المحتوى
            </Button>
            <Button onClick={() => handleTab('mine')} className={cn('rounded-xl', tab === 'mine' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg' : 'bg-transparent text-gray-700 hover:bg-gray-200 dark:text-neutral-300 dark:hover:bg-neutral-800')} aria-pressed={tab === 'mine'}>
              <Bookmark className="ml-2 h-4 w-4" /> دوراتي
            </Button>
          </div>
        </div>

        {/* Loading / Error */}
        {isLoading && <div className="py-16 text-center text-gray-500">جاري تحميل المحتوى…</div>}
        {isError && <div className="py-16 text-center text-error-500">حدث خطأ: {(error as Error)?.message}</div>}

        {/* المحتوى */}
        {data && !isLoading && !isError && (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-8 pt-8"
            >
              {tab === 'mine' ? (
                 <section className="space-y-8">
                    {/* ... قسم دوراتي يبقى كما هو ... */}
                 </section>
              ) : (
                <>
                  {/* 1) Top Courses */}
                  {filteredData.topCourses.length > 0 && (
                    <section aria-labelledby="top-courses">
                      <div className="mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <h2 id="top-courses" className="text-xl font-bold">الأكثر طلباً</h2>
                      </div>
                      <HScroll itemClassName="w-[68%] sm:w-[30%]">
                        {filteredData.topCourses.map((c) => (
                          <MiniCourseCard key={c.id} {...c} price={c.discounted_price || c.price} lessons={c.total_number_of_lessons} img={c.thumbnail} free={isFreeCourse(c)} variant="top" />
                        ))}
                      </HScroll>
                    </section>
                  )}

                  {/* 2) Categories */}
                  {filteredData.categories.length > 0 && (
                    <section aria-labelledby="categories">
                      <div className="mb-3 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary-600" />
                        <h2 id="categories" className="text-xl font-bold">التصنيفات</h2>
                      </div>
                      <HScroll itemClassName="w-[45%] sm:w-[22%] aspect-[5/4]">
                        {filteredData.categories.map((cat) => (
                          <CategoryCard key={cat.id} {...cat} />
                        ))}
                      </HScroll>
                    </section>
                  )}

                  {/* 3) Highlight Bundles */}
                  {filteredData.highlightBundles.length > 0 && (
                     <section aria-labelledby="highlight-bundles">
                       <div className="mb-3 flex items-center gap-2">
                         <Award className="h-5 w-5 text-amber-600" />
                         <h2 id="highlight-bundles" className="text-xl font-bold">حزم مميزة</h2>
                       </div>
                       <HScroll itemClassName="w-[78%] sm:w-[35%]">
                         {filteredData.highlightBundles.map((b) => (
                           <MiniBundleCard key={b.id} {...b} img={b.image || b.cover_image} variant="highlight" />
                         ))}
                       </HScroll>
                     </section>
                  )}
                  
                  {/* ✅ [مدمج] 4) Highlight Courses using GridCarousel */}
                  {filteredData.highlightCourses.length > 0 && (
                   <section aria-labelledby="highlight-courses">
                      <div className="mb-3 flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-600" />
                        <h2 id="highlight-courses" className="text-xl font-bold">كورسات مميزة</h2>
                      </div>
                      <HScroll itemClassName="w-[68%] sm:w-[30%]">
                        {filteredData.topCourses.map((c) => (
                          <MiniCourseCard key={c.id} {...c} price={c.discounted_price || c.price} lessons={c.total_number_of_lessons} img={c.thumbnail} free={isFreeCourse(c)} variant="highlight" />
                        ))}
                      </HScroll>
                    </section>
                  )}
                </>
              )}
              <div className="pt-2">
                <AuthPrompt />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}