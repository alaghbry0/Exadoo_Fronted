// src/pages/academy/category/[id].tsx
'use client'

import React, { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useTelegram } from '@/context/TelegramContext'
import { useAcademyData } from '@/services/academy'
import SmartImage from '@/components/SmartImage'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import BackHeader from '@/components/BackHeader'
import { 
  BookOpen, 
  Award, 
  Layers, 
  Sparkles,
  FolderOpen
} from 'lucide-react'

// --- Types ---
interface Category { 
  id: string
  name: string
  thumbnail?: string
}
interface Course {
  id: string
  sub_category_id: string
  title: string
  short_description: string
  discounted_price?: string
  price: string
  total_number_of_lessons: number
  level?: string
  thumbnail?: string
  is_free_course?: string | null
}
interface Bundle {
  id: string
  sub_category_id: string
  title: string
  description?: string
  price: string
  image?: string
  cover_image?: string
}

// --- Helpers ---
const formatPrice = (value?: string) => {
  if (!value) return ''
  if (value.toLowerCase?.() === 'free') return 'مجاني'
  const n = Number(value)
  return isNaN(n) ? value : `$${n.toFixed(0)}`
}
const isFreeCourse = (c: Pick<Course, 'price' | 'is_free_course'>) =>
  (c.is_free_course ?? '') === '1' || c.price?.toLowerCase?.() === 'free'

// Level Badge Component (أصغر على الجوال)
const LevelBadge = ({ level }: { level?: string }) => {
  if (!level) return null
  
  const levelConfig = {
    beginner: { 
      label: 'مبتدئ', 
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    },
    intermediate: { 
      label: 'متوسط', 
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    },
    advanced: { 
      label: 'متقدم', 
      color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
    },
  }
  
  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.beginner
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium',
      config.color
    )}>
      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      {config.label}
    </span>
  )
}

// --- UI: Horizontal Scroll (أضيق + min-w للجوال) ---
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

// --- UI: Mini Course Card (أصغر + 4:3 على الجوال) ---
function MiniCourseCard({ 
  id, 
  title, 
  desc, 
  price, 
  lessons, 
  level, 
  img, 
  free,
  priority 
}: {
  id: string
  title: string
  desc: string
  price: string
  lessons: number
  level?: string
  img?: string
  free?: boolean
  priority?: boolean
}) {
  const router = useRouter()
  const prefetch = useCallback(() => router.prefetch(`/academy/course/${id}`), [router, id])

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
            alt={title}
            fill
            sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 60vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
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
          
          <p className="mb-3 line-clamp-2 text-[13px] sm:text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
            {desc}
          </p>
          
          <div className="flex items-center justify-between gap-2.5 sm:gap-3 border-t border-gray-100 pt-2.5 sm:pt-3 dark:border-neutral-800">
            <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-[12px]">
              <span className="flex items-center gap-1 text-gray-600 dark:text-neutral-400">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="font-medium">{lessons}</span>
              </span>
              <LevelBadge level={level} />
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

// --- UI: Mini Bundle Card (أصغر + 4:3) ---
function MiniBundleCard({ 
  id, 
  title, 
  desc, 
  price, 
  img,
  priority 
}: {
  id: string
  title: string
  desc: string
  price: string
  img?: string
  priority?: boolean
}) {
  return (
    <Link
      href={`/academy/bundle/${id}`}
      prefetch={false}
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2"
      aria-label={`فتح حزمة ${title}`}
    >
      <Card className="relative h-full overflow-hidden rounded-3xl border border-amber-200/70 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-amber-800/50 dark:bg-neutral-900">
        <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden">
          <SmartImage
            src={img || '/image.jpg'}
            alt={title}
            fill
            sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 60vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={!!priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          <div className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 flex items-center gap-1.5 rounded-full bg-amber-500/95 px-2.5 sm:px-3 py-0.5 sm:py-1 text-white shadow-lg backdrop-blur-sm">
            <Award className="h-3 w-3" />
            <span className="text-[10px] sm:text-[11px] font-semibold">حزمة مميزة</span>
          </div>
        </div>
        
        <CardContent className="p-3 sm:p-4">
          <h3 className="mb-1.5 sm:mb-2 line-clamp-1 text-sm sm:text-[15px] font-bold text-gray-900 dark:text-neutral-100">
            {title}
          </h3>
          
          <p className="mb-3 line-clamp-2 text-[13px] sm:text-sm leading-relaxed text-gray-600 dark:text-neutral-400">
            {(desc || '').replace(/\\r\\n/g, ' ')}
          </p>
          
          <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 sm:pt-3 dark:border-neutral-800">
            <span className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-gray-600 dark:text-neutral-400">
              <Award className="h-3.5 w-3.5" />
              <span className="font-medium">حزمة تعليمية</span>
            </span>
            <span className="text-sm sm:text-[15px] font-extrabold text-primary-600 dark:text-primary-400">
              {formatPrice(price)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// --- Section Header Component ---
const SectionHeader = ({ 
  icon: Icon, 
  title, 
  count,
  id 
}: { 
  icon: React.ElementType
  title: string
  count: number
  id: string
}) => (
  <div className="mb-5 flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <div className="rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 p-2 shadow-sm dark:from-primary-600 dark:to-primary-700">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h2 id={id} className="text-[22px] font-bold text-gray-900 dark:text-neutral-100">
        {title}
      </h2>
    </div>
    <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-bold text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
      {count}
    </span>
  </div>
)

// --- Main Component ---
export default function CategoryDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  const category: Category | undefined = useMemo(
    () => data?.categories.find((c: Category) => c.id === id),
    [data, id]
  )

  const courses: Course[] = useMemo(
    () => data?.courses.filter((c: Course) => c.sub_category_id === id) ?? [],
    [data, id]
  )
  const bundles: Bundle[] = useMemo(
    () => data?.bundles.filter((b: Bundle) => b.sub_category_id === id) ?? [],
    [data, id]
  )

  if (isLoading) return (
    <div className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-12">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-neutral-800 dark:border-t-primary-500" />
        <p className="text-lg font-medium text-gray-600 dark:text-neutral-300">جاري تحميل التصنيف...</p>
      </div>
    </div>
  )
  
  if (isError) return (
    <div className="font-arabic min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-12">
      <div className="max-w-md rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-900/10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
          <span className="text-3xl">⚠️</span>
        </div>
        <p className="text-lg font-bold text-red-600 dark:text-red-400">تعذّر التحميل</p>
        <p className="mt-2 text-sm text-red-500 dark:text-red-300">{(error as Error)?.message}</p>
      </div>
    </div>
  )
  
  if (!category) return (
    <div className="font-bold min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-12">
      <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
          <Layers className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-neutral-100">لم يتم العثور على التصنيف</p>
        <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">عذرًا، التصنيف المطلوب غير متوفر</p>
      </div>
    </div>
  )

  return (
    <div 
      dir="rtl" 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-800 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 dark:text-neutral-200 font-arabic"
    >
      <BackHeader backTo="/academy" backMode="always" />
      
      <main className="mx-auto max-w-7xl px-4 pb-20">
        {/* Hero Header */}
        <section className="relative overflow-hidden pt-8 pb-10">
          {/* Background decorations */}
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary-500/5 blur-3xl dark:bg-primary-500/10" />
          <div className="pointer-events-none absolute left-0 bottom-0 h-36 w-36 translate-y-1/2 -translate-x-1/2 rounded-full bg-amber-500/5 blur-3xl dark:bg-amber-500/10" />
          
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >

              {/* Category Icon/Image */}
              {category.thumbnail ? (
                <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-3xl border-4 border-white shadow-lg dark:border-neutral-800">
                  <SmartImage
                    src={category.thumbnail}
                    alt={category.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg dark:border-neutral-800">
                  <Layers className="h-12 w-12 text-white" />
                </div>
              )}

              {/* Category Title */}
              <h1 className="mb-3 bg-gradient-to-l from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-4xl font-bold text-transparent dark:from-neutral-100 dark:via-neutral-200 dark:to-neutral-100 md:text-5xl">
                {category.name}
              </h1>

              {/* Stats */}
              <div className="mx-auto flex max-w-md items-center justify-center gap-6 text-sm">
                {courses.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-neutral-400">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">{courses.length} دورات</span>
                  </div>
                )}
                {bundles.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-neutral-400">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">{bundles.length} حزم</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-12"
        >
          {/* Courses Section */}
          {courses.length > 0 && (
            <section aria-labelledby="cat-courses">
              <SectionHeader 
                icon={BookOpen} 
                title="الدورات التدريبية" 
                count={courses.length}
                id="cat-courses"
              />
              <HScroll>
                {courses.map((c, i) => (
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

          {/* Bundles Section */}
          {bundles.length > 0 && (
            <section aria-labelledby="cat-bundles">
              <SectionHeader 
                icon={Award} 
                title="الحزم التعليمية" 
                count={bundles.length}
                id="cat-bundles"
              />
              <HScroll>
                {bundles.map((b, i) => (
                  <MiniBundleCard
                    key={b.id}
                    id={b.id}
                    title={b.title}
                    desc={b.description || ''}
                    price={b.price}
                    img={b.image || b.cover_image}
                    priority={i === 0}
                  />
                ))}
              </HScroll>
            </section>
          )}

          {/* Empty State */}
          {courses.length === 0 && bundles.length === 0 && (
            <div className="mx-auto max-w-lg">
              <div className="rounded-3xl border border-dashed border-gray-300 bg-gradient-to-br from-white to-gray-50/50 p-12 text-center shadow-sm dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-900/50">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-neutral-800">
                  <FolderOpen className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-neutral-100">
                  لا يوجد محتوى بعد
                </h3>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  لم يتم إضافة أي دورات أو حزم في هذا التصنيف حالياً
                </p>
                <Link
                  href="/academy"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:shadow-primary-500/30"
                >
                  <Layers className="h-4 w-4" />
                  تصفح التصنيفات الأخرى
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
