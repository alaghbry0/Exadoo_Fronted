'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTelegram } from '@/context/TelegramContext'
import { useAcademyData } from '@/services/academy'
import AuthPrompt from '@/components/AuthFab'
import { ArrowLeft } from 'lucide-react'
import { CourseCard, BundleCard } from '@/pages/academy/index' // يفترض أنها مصدّرة

// --- Interfaces ---
interface Category {
  id: string;
  name: string;
}

interface Course {
  id: string;
  sub_category_id: string;
  title: string;
  short_description: string;
  discounted_price?: string;
  price: string;
  total_number_of_lessons: number;
  level?: string;
  thumbnail?: string;
  is_free_course: string;
}

interface Bundle {
  id: string;
  sub_category_id: string;
  title: string;
  description?: string;
  price: string;
  image?: string;
  cover_image?: string;
}

// --- Main Component (Updated) ---
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

  if (isLoading)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 p-12 text-center text-gray-500 dark:bg-neutral-950">
        جاري تحميل التصنيف...
      </div>
    )
  if (isError)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 p-12 text-center text-error-500 dark:bg-neutral-950">
        تعذر التحميل: {(error as Error)?.message}
      </div>
    )
  if (!category && !isLoading)
    return (
      <div className="font-arabic min-h-screen bg-gray-50 p-12 text-center text-gray-600 dark:bg-neutral-950 dark:text-neutral-300">
        عذراً، لم يتم العثور على هذا التصنيف.
      </div>
    )
  if (!category) return null

  return (
    <div dir="rtl" className="bg-gray-50 dark:bg-neutral-950 text-gray-800 dark:text-neutral-200 font-arabic">
      <main className="mx-auto max-w-7xl px-4 pb-24">
        {/* Hero Header */}
        <section className="border-b border-gray-200 dark:border-neutral-800 py-16 text-center">
          <Link
            href="/academy"
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1 text-sm text-primary-600 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:text-primary-400 dark:hover:bg-neutral-700"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة إلى الأكاديمية
          </Link>
          <h1 className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-sm text-white transition-all hover:bg-white/30">
            {category.name}
          </h1>
        </section>

        <div className="py-12">
          {courses.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6">الكورسات</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    onMouseEnter={() => router.prefetch(`/academy/course/${c.id}`)} // ✅ Prefetch عند hover
                    onTouchStart={() => router.prefetch(`/academy/course/${c.id}`)} // ✅ للموبايل
                  >
                    <CourseCard
                      id={c.id}
                      title={c.title}
                      desc={c.short_description}
                      price={c.discounted_price || c.price}
                      lessons={c.total_number_of_lessons}
                      level={c.level}
                      img={c.thumbnail} // ✅ نفس منطق الأكاديمية للحفاظ على الكاش
                      isFree={c.is_free_course === '1' || c.price.toLowerCase() === 'free'}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {bundles.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-6">الحزم التعليمية</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {bundles.map((b) => (
                  <div
                    key={b.id}
                    onMouseEnter={() => router.prefetch(`/academy/bundle/${b.id}`)} // ✅ Prefetch عند hover
                    onTouchStart={() => router.prefetch(`/academy/bundle/${b.id}`)} // ✅ للموبايل
                  >
                    <BundleCard
                      id={b.id}
                      title={b.title}
                      desc={b.description}
                      price={b.price}
                      img={b.image || b.cover_image} // ✅ اتساق الصورة
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {courses.length === 0 && bundles.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-neutral-800 py-20 text-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-neutral-200">لا يوجد محتوى بعد</h3>
              <p className="mt-2 text-gray-500 dark:text-neutral-400">
                لم يتم إضافة أي كورسات أو حزم في هذا التصنيف حالياً.
              </p>
            </div>
          )}
        </div>
      </main>
      <AuthPrompt />
    </div>
  )
}
