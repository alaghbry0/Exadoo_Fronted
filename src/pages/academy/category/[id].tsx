// src/pages/academy/category/[id].tsx
'use client'

import React, { useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTelegram } from '@/context/TelegramContext'
import { useAcademyData } from '@/services/academy'
import AuthPrompt from '@/components/AuthFab'
import SmartImage from '@/components/SmartImage'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import BackHeader from '@/components/BackHeader'

// --- Types ---
interface Category { id: string; name: string }
interface Course {
  id: string; sub_category_id: string; title: string; short_description: string;
  discounted_price?: string; price: string; total_number_of_lessons: number;
  level?: string; thumbnail?: string; is_free_course?: string | null;
}
interface Bundle {
  id: string; sub_category_id: string; title: string; description?: string;
  price: string; image?: string; cover_image?: string;
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

// --- UI: Horizontal Scroll ---
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

// --- UI: Mini Cards بلا شارات ---
function MiniCourseCard({ id, title, desc, price, lessons, level, img, free }: {
  id: string; title: string; desc: string; price: string; lessons: number; level?: string; img?: string; free?: boolean
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
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-gray-600 dark:text-neutral-400">{desc}</p>
          <div className="mt-3 flex items-center justify-between text-[12px] text-gray-500 dark:text-neutral-400">
            <span className="truncate">{lessons} درس{level ? ` • ${level}` : ''}</span>
            <span className="font-extrabold text-primary-600 dark:text-primary-400">{free ? 'مجاني' : formatPrice(price)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function MiniBundleCard({ id, title, desc, price, img }: {
  id: string; title: string; desc: string; price: string; img?: string
}) {
  return (
    <Link
      href={`/academy/bundle/${id}`}
      prefetch
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50"
      aria-label={`فتح حزمة ${title}`}
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
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-gray-600 dark:text-neutral-400">{(desc || '').replace(/\\r\\n/g, ' ')}</p>
          <div className="mt-3 flex items-center justify-between text-[12px] text-gray-500 dark:text-neutral-400">
            <span className="truncate">حزمة تعليمية</span>
            <span className="font-extrabold text-primary-600 dark:text-primary-400">{formatPrice(price)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// --- Main ---
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
    <div className="font-arabic min-h-screen bg-gray-50 p-12 text-center text-gray-500 dark:bg-neutral-950">
      جاري تحميل التصنيف…
    </div>
  )
  if (isError) return (
    <div className="font-arabic min-h-screen bg-gray-50 p-12 text-center text-error-500 dark:bg-neutral-950">
      تعذّر التحميل: {(error as Error)?.message}
    </div>
  )
  if (!category) return (
    <div className="font-arabic min-h-screen bg-gray-50 p-12 text-center text-gray-600 dark:bg-neutral-950 dark:text-neutral-300">
      عذرًا، لم يتم العثور على هذا التصنيف.
    </div>
  )

  return (
    <div dir="rtl" className="bg-gray-50 dark:bg-neutral-950 text-gray-800 dark:text-neutral-200 font-arabic">
       <BackHeader  backTo="/academy" backMode="always" />
      <main className="mx-auto max-w-7xl px-4 pb-12">
        {/* Header خفيف */}
        <section className="pt-4 pb-5">
         
          
          <h1 className="text-center  mt-4 text-3xl font-bold tracking-tight">{category.name}</h1>
          
        </section>

        {/* Courses */}
        {courses.length > 0 && (
          <section aria-labelledby="cat-courses" className="mt-4">
            <h2 id="cat-courses" className="mb-2 text-base font-extrabold">الدورات</h2>
            <HScroll itemWidth="68%">
              {courses.map((c) => (
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
                />
              ))}
            </HScroll>
          </section>
        )}

        {/* Bundles */}
        {bundles.length > 0 && (
          <section aria-labelledby="cat-bundles" className="mt-6">
            <h2 id="cat-bundles" className="mb-2 text-base font-extrabold">الحزم التعليمية</h2>
            <HScroll itemWidth="78%">
              {bundles.map((b) => (
                <MiniBundleCard
                  key={b.id}
                  id={b.id}
                  title={b.title}
                  desc={b.description || ''}
                  price={b.price}
                  img={b.image || b.cover_image}
                />
              ))}
            </HScroll>
          </section>
        )}

        {/* Empty state */}
        {courses.length === 0 && bundles.length === 0 && (
          <div className="mt-10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-neutral-800 py-16 text-center">
            <h3 className="text-lg font-bold">لا يوجد محتوى بعد</h3>
            <p className="mt-2 text-gray-500 dark:text-neutral-400">لم يتم إضافة أي كورسات أو حزم في هذا التصنيف حالياً.</p>
          </div>
        )}
      </main>
      <AuthPrompt />
    </div>
  )
}
