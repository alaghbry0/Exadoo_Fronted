'use client'
import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAcademyData } from '@/services/academy'
import { useTelegram } from '@/context/TelegramContext'
import { Button } from '@/components/ui/button'

export default function BundleDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  const bundle = useMemo(()=> data?.bundles.find(b=>b.id===id), [data, id])
  const coursesInBundle = useMemo(()=>{
    if (!data || !bundle) return []
    try {
      const ids = new Set<string>(JSON.parse(bundle.course_ids))
      return data.courses.filter(c=>ids.has(c.id))
    } catch { return [] }
  }, [data, bundle])

  if (isLoading) return <div className="py-20 text-center">جاري التحميل…</div>
  if (isError) return <div className="py-20 text-center text-red-500">تعذر التحميل: {(error as Error)?.message}</div>
  if (!bundle) return <div className="py-20 text-center">الحزمة غير موجودة</div>

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/academy" className="inline-flex items-center gap-2 text-primary-600 mb-4">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m11 17l-5-5l5-5M6 12h12"/></svg>
        رجوع
      </Link>

      <h1 className="text-2xl font-bold">{bundle.title}</h1>
      <img src={bundle.cover_image || bundle.image} alt={bundle.title} className="w-full aspect-video object-cover rounded-2xl mt-4" />

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2">
          <div className="prose dark:prose-invert max-w-none bg-white dark:bg-neutral-900 rounded-2xl p-4 border">
            <h2>الوصف</h2>
            <p>{(bundle.description || '').replace(/\\r\\n/g,'\n')}</p>
          </div>

          {bundle.outcomes?.length>0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">ستتعلّم</h3>
              <ul className="list-disc pr-5 space-y-1 text-gray-700 dark:text-neutral-300">
                {bundle.outcomes.map((o,i)=><li key={i}>{o}</li>)}
              </ul>
            </div>
          )}

          {bundle.requirements?.length>0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">المتطلبات</h3>
              <ul className="list-disc pr-5 space-y-1 text-gray-700 dark:text-neutral-300">
                {bundle.requirements.map((r,i)=><li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          <section className="mt-10">
            <h2 className="text-xl font-bold mb-3">الكورسات داخل الحزمة ({coursesInBundle.length})</h2>
            <div className="space-y-3">
              {coursesInBundle.map(c=>(
                <div key={c.id} className="flex items-center gap-3 p-3 border rounded-xl bg-white dark:bg-neutral-900">
                  <img src={c.thumbnail} className="w-24 h-16 rounded object-cover" alt={c.title}/>
                  <div className="flex-1">
                    <div className="font-semibold line-clamp-1">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.instructor_name} • {c.total_number_of_lessons} دروس</div>
                  </div>
                  <Link href={`/academy/course/${c.id}`} className="text-primary-600 text-sm">التفاصيل</Link>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border">
           
            <div className="text-3xl font-extrabold">${bundle.price}</div>
            <p className="text-sm text-gray-500 mt-1">دفعة واحدة — وصول مدى الحياة</p>
            <Button className="w-full mt-4">اشترك في الحزمة</Button>
            <ul className="mt-4 text-sm text-gray-600 dark:text-neutral-400 space-y-1">
              {parseInt(bundle.free_sessions_count || '0')>0 && <li>جلسات خاصة مجانية: {bundle.free_sessions_count}</li>}
              {bundle.telegram_url?.trim() && <li>مجموعة تيليجرام خاصّة</li>}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
