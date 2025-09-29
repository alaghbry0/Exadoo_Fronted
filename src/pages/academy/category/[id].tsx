'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTelegram } from '@/context/TelegramContext'
import { useAcademyData } from '@/services/academy'
import SmartImage from '@/components/SmartImage'
import { Card, CardContent } from '@/components/ui/card'

export default function CategoryDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  const category = useMemo(()=> data?.categories.find(c=>c.id===id), [data, id])
  const courses = useMemo(()=> data?.courses.filter(c=>c.sub_category_id===id) ?? [], [data, id])
  const bundles = useMemo(()=> data?.bundles.filter(b=>b.sub_category_id===id) ?? [], [data, id])

  if (isLoading) return <div className="py-20 text-center">جاري التحميل…</div>
  if (isError) return <div className="py-20 text-center text-red-500">تعذر التحميل: {(error as Error)?.message}</div>
  if (!category) return <div className="py-20 text-center">التصنيف غير موجود</div>

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/academy" className="inline-flex items-center gap-2 text-primary-600 mb-4">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m11 17l-5-5l5-5M6 12h12"/></svg>
        رجوع
      </Link>

      <h1 className="text-2xl font-bold">{category.name}</h1>

      {courses.length>0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold mb-3">الكورسات</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(c=>(
              <Link key={c.id} href={`/academy/course/${c.id}`}>
                <Card className="rounded-2xl overflow-hidden hover:shadow-lg transition">
                  <div className="relative w-full aspect-video">
                    <SmartImage
                      src={c.thumbnail || '/image.jpg'}
                      alt={c.title}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="object-cover"
                      fallbackSrc="/image.jpg"
                    />
                  </div>
                  <CardContent className="p-3">
                    <div className="font-semibold line-clamp-2">{c.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{c.total_number_of_lessons} دروس</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {bundles.length>0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-3">الحِزم</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bundles.map(b=>(
              <Link key={b.id} href={`/academy/bundle/${b.id}`}>
                <Card className="rounded-2xl overflow-hidden hover:shadow-lg transition">
                  <div className="relative w-full aspect-[4/3]">
                    <SmartImage
                      src={b.image || b.cover_image || '/image.jpg'}
                      alt={b.title}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="object-cover"
                      fallbackSrc="/image.jpg"
                    />
                  </div>
                  <CardContent className="p-3">
                    <div className="font-semibold line-clamp-2">{b.title}</div>
                    <div className="text-xs text-gray-500 mt-1">${b.price}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {courses.length===0 && bundles.length===0 && (
        <div className="text-center py-16 text-gray-500">لا يوجد محتوى في هذا التصنيف بعد.</div>
      )}
    </div>
  )
}
