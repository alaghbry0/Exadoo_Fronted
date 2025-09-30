'use client'
import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAcademyData } from '@/services/academy'
import { useTelegram } from '@/context/TelegramContext'
import Navbar from '@/components/Navbar'
import AuthPrompt from '@/components/AuthFab'
import SmartImage from '@/components/SmartImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowRight, CheckCircle2, BookOpen, BarChart3, Users, Clock } from 'lucide-react'

// --- UPDATED: Page Layout ---
export default function CourseDetail() {
  const router = useRouter()
  const id = (router.query.id as string) || ''
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  const course = useMemo(()=> data?.courses.find(c=>c.id===id), [data, id])
  const isEnrolled = useMemo(()=> data?.my_enrollments.course_ids.includes(id), [data, id])

  if (isLoading) return <div className="py-40 text-center">جاري تحميل تفاصيل الدورة...</div>
  if (isError) return <div className="py-40 text-center text-red-500">تعذر التحميل: {(error as Error)?.message}</div>
  if (!course && !isLoading) return <div className="py-40 text-center">عذراً، لم يتم العثور على هذه الدورة.</div>
  if (!course) return null // Render nothing while course is being found

  const isFree = course.is_free_course==='1' || course.price.toLowerCase()==='free'

  return (
    <div dir="rtl" className="bg-gray-50 dark:bg-neutral-950 text-gray-800 dark:text-neutral-200 font-arabic">
      <Navbar />
      <main>
        {/* --- NEW: Hero Section --- */}
        <div className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <Link href="/academy" className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-4">
                    <ArrowRight className="w-4 h-4" />
                    العودة إلى الأكاديمية
                </Link>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100">{course.title}</motion.h1>
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-3 text-lg text-gray-600 dark:text-neutral-300">{course.short_description}</motion.p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm">
                            <div className="flex items-center gap-2"><img src={course.instructor_image} alt={course.instructor_name} className="w-6 h-6 rounded-full object-cover" /> <span>{course.instructor_name}</span></div>
                            <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-gray-500" /> <span className="capitalize">{course.level || 'غير محدد'}</span></div>
                            <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-500" /> <span>{course.total_number_of_lessons} دروس</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* --- NEW: Main Content with Sticky Sidebar --- */}
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2">
                    <div className="prose prose-lg dark:prose-invert max-w-none bg-white dark:bg-neutral-900 rounded-2xl p-6 border dark:border-neutral-800">
                        <h2 className="font-bold">عن الدورة</h2>
                        <div dangerouslySetInnerHTML={{ __html: course.description || '<p>لا يوجد وصف متوفر حالياً.</p>' }} />
                    </div>
                    {course.outcomes?.length > 0 && (
                        <div className="mt-8 bg-white dark:bg-neutral-900 rounded-2xl p-6 border dark:border-neutral-800">
                            <h3 className="text-2xl font-bold mb-4">ماذا ستتعلم؟</h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                {course.outcomes.map((o,i)=><li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-primary-500 mt-1 shrink-0" /><span>{o}</span></li>)}
                            </ul>
                        </div>
                    )}
                    {course.requirements?.length > 0 && (
                         <div className="mt-8 bg-white dark:bg-neutral-900 rounded-2xl p-6 border dark:border-neutral-800">
                            <h3 className="text-2xl font-bold mb-4">المتطلبات</h3>
                            <ul className="space-y-3">
                                {course.requirements.map((r,i)=><li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500 mt-1 shrink-0" /><span>{r}</span></li>)}
                            </ul>
                        </div>
                    )}
                </div>

                <aside className="mt-8 lg:mt-0">
                    <div className="sticky top-24">
                         <Card className="rounded-2xl overflow-hidden shadow-lg border dark:border-neutral-800">
                            <div className="relative w-full aspect-video">
                                <SmartImage src={course.thumbnail || course.cover_image || '/image.jpg'} alt={course.title} fill className="object-cover" />
                            </div>
                            <div className="p-5">
                                <div className="flex items-baseline gap-2">
                                    {isFree ? (
                                        <span className="text-3xl font-extrabold text-emerald-600">مجاني</span>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">${course.discounted_price || course.price}</span>
                                            {course.discounted_price && <span className="text-lg text-gray-400 line-through">${course.price}</span>}
                                        </>
                                    )}
                                </div>
                                <Button size="lg" className={cn('w-full mt-4 rounded-xl text-base font-bold', isEnrolled && 'bg-green-600 hover:bg-green-700')}>
                                    {isEnrolled ? 'اذهب إلى الدورة' : (isFree ? 'سجل الآن مجاناً' : 'اشترك في الدورة')}
                                </Button>
                                <ul className="mt-5 text-sm text-gray-600 dark:text-neutral-400 space-y-3">
                                    <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> وصول مدى الحياة للمحتوى</li>
                                    <li className="flex items-center gap-2"><Users className="w-4 h-4" /> {course.total_enrollment} طالب مسجل</li>
                                </ul>
                            </div>
                         </Card>
                    </div>
                </aside>
            </div>
        </div>
      </main>
      <AuthPrompt />
    </div>
  )
}