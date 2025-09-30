'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTelegram } from '@/context/TelegramContext'
import { useAcademyData } from '@/services/academy'
import Navbar from '@/components/Navbar'
import AuthPrompt from '@/components/AuthFab'
import { ArrowRight } from 'lucide-react'

// --- IMPORTANT: Re-using the same card components from the academy index page ---
import { CourseCard, BundleCard } from '@/pages/academy/index' // Assuming they are exported

// --- UPDATED: Page Layout and Component Re-use ---
export default function CategoryDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  const category = useMemo(()=> data?.categories.find(c=>c.id===id), [data, id])
  const courses = useMemo(()=> data?.courses.filter(c=>c.sub_category_id===id) ?? [], [data, id])
  const bundles = useMemo(()=> data?.bundles.filter(b=>b.sub_category_id===id) ?? [], [data, id])

  if (isLoading) return <div className="py-40 text-center">جاري تحميل التصنيف...</div>
  if (isError) return <div className="py-40 text-center text-red-500">تعذر التحميل: {(error as Error)?.message}</div>
  if (!category && !isLoading) return <div className="py-40 text-center">عذراً، لم يتم العثور على هذا التصنيف.</div>
  if (!category) return null

  return (
    <div dir="rtl" className="bg-gray-50 dark:bg-neutral-950 text-gray-800 dark:text-neutral-200 font-arabic">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pb-24">
        <section className="pt-20 pb-10">
          <Link href="/academy" className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-2">
            <ArrowRight className="w-4 h-4" />
            جميع التصنيفات
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100">{category.name}</h1>
        </section>

        {courses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-5">الكورسات في هذا التصنيف</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map(c=>(
                <CourseCard 
                  key={c.id} 
                  id={c.id} 
                  title={c.title} 
                  desc={c.short_description} 
                  price={c.discounted_price||c.price} 
                  lessons={c.total_number_of_lessons} 
                  level={c.level} 
                  img={c.thumbnail} 
                  isFree={c.is_free_course==='1'||c.price.toLowerCase()==='free'} 
                />
              ))}
            </div>
          </section>
        )}

        {bundles.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-5">الحزم في هذا التصنيف</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bundles.map(b=>(
                <BundleCard 
                  key={b.id} 
                  id={b.id} 
                  title={b.title} 
                  desc={b.description} 
                  price={b.price} 
                  img={b.image||b.cover_image} 
                />
              ))}
            </div>
          </section>
        )}

        {courses.length === 0 && bundles.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed dark:border-neutral-800 rounded-2xl">
            <h3 className="text-xl font-bold">لا يوجد محتوى بعد</h3>
            <p className="text-gray-500 mt-2">لا يوجد أي كورسات أو حزم في هذا التصنيف حالياً.</p>
          </div>
        )}
      </main>
      <AuthPrompt />
    </div>
  )
}