'use client'
import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAcademyData } from '@/services/academy'
import { useTelegram } from '@/context/TelegramContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function CourseDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  const course = useMemo(()=> data?.courses.find(c=>c.id===id), [data, id])
  const isEnrolled = useMemo(()=>{
    if (!data || !course) return false
    return data.my_enrollments.course_ids.includes(course.id)
  }, [data, course])

  if (isLoading) return <div className="py-20 text-center">جاري التحميل…</div>
  if (isError) return <div className="py-20 text-center text-red-500">تعذر التحميل: {(error as Error)?.message}</div>
  if (!course) return <div className="py-20 text-center">الكورس غير موجود</div>

  const isFree = course.is_free_course==='1' || course.price.toLowerCase()==='free'
  const priceDisplay = isFree ? 'Free' : `$${course.discounted_price||course.price}`

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/academy" className="inline-flex items-center gap-2 text-primary-600 mb-4">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m11 17l-5-5l5-5M6 12h12"/></svg>
        رجوع
      </Link>

      <h1 className="text-2xl font-bold">{course.title}</h1>
      <p className="text-gray-600 dark:text-neutral-400 mt-1">{course.short_description}</p>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <Badge variant="secondary" className="capitalize">{course.level}</Badge>
        <Badge variant="outline">{course.total_number_of_lessons} دروس</Badge>
        <span className="text-sm text-gray-500">المدرّس: {course.instructor_name}</span>
      </div>

      <img src={course.cover_image} alt={course.title} className="w-full aspect-video object-cover rounded-2xl mt-5" />

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2">
          <div className="prose dark:prose-invert max-w-none bg-white dark:bg-neutral-900 rounded-2xl p-4 border" dangerouslySetInnerHTML={{ __html: course.description || '<p></p>' }} />
          {course.outcomes?.length>0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">ماذا ستتعلم؟</h3>
              <ul className="list-disc pr-5 space-y-1 text-gray-700 dark:text-neutral-300">
                {course.outcomes.map((o,i)=><li key={i}>{o}</li>)}
              </ul>
            </div>
          )}
          {course.requirements?.length>0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">المتطلبات</h3>
              <ul className="list-disc pr-5 space-y-1 text-gray-700 dark:text-neutral-300">
                {course.requirements.map((r,i)=><li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
        <aside>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border">
            <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover rounded-lg mb-3" />
            
            <Button className={cnJoin('w-full mt-4', isEnrolled?'bg-green-600 hover:bg-green-500':'')}>
              {isEnrolled ? 'أكمل التعلّم' : (isFree ? 'ادخل الآن' : 'اشترك الآن')}
            </Button>
            <ul className="mt-4 text-sm text-gray-600 dark:text-neutral-400 space-y-1">
              <li>وصول مدى الحياة</li>
              <li className="capitalize">المستوى: {course.level}</li>
              <li>المسجّلين: {course.total_enrollment}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

function cnJoin(...a: (string|false|undefined)[]) { return a.filter(Boolean).join(' ') }
