'use client'
import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAcademyData } from '@/services/academy'
import { useTelegram } from '@/context/TelegramContext'
import Navbar from '@/components/Navbar'
import { Badge } from '@/components/ui/badge'
import AuthPrompt from '@/components/AuthFab'
import SmartImage from '@/components/SmartImage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowRight, CheckCircle2, Layers, Gift, MessageSquare, ArrowLeft } from 'lucide-react'

// --- UPDATED: Page Layout (Consistent with Course Detail) ---
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

  if (isLoading) return <div className="py-40 text-center">جاري تحميل تفاصيل الحزمة...</div>
  if (isError) return <div className="py-40 text-center text-red-500">تعذر التحميل: {(error as Error)?.message}</div>
  if (!bundle && !isLoading) return <div className="py-40 text-center">عذراً، لم يتم العثور على هذه الحزمة.</div>
  if (!bundle) return null

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
                         <Badge variant="secondary" className="mb-2">حزمة تعليمية</Badge>
                        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100">{bundle.title}</motion.h1>
                    </div>
                </div>
            </div>
        </div>

        {/* --- NEW: Main Content with Sticky Sidebar --- */}
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
                        <SmartImage src={bundle.cover_image || bundle.image || '/image.jpg'} alt={bundle.title} fill className="object-cover" />
                    </div>
                    <div className="prose prose-lg dark:prose-invert max-w-none mt-8 bg-white dark:bg-neutral-900 rounded-2xl p-6 border dark:border-neutral-800">
                        <h2 className="font-bold">عن الحزمة</h2>
                        <p>{(bundle.description || 'لا يوجد وصف متوفر حالياً.').replace(/\\r\\n/g,'\n')}</p>
                    </div>
                    <div className="mt-8 bg-white dark:bg-neutral-900 rounded-2xl p-6 border dark:border-neutral-800">
                        <h3 className="text-2xl font-bold mb-4">الكورسات المتضمنة ({coursesInBundle.length})</h3>
                        <div className="space-y-3">
                            {coursesInBundle.map(c=>(
                                <Link key={c.id} href={`/academy/course/${c.id}`} className="block p-3 border dark:border-neutral-800 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0"><SmartImage src={c.thumbnail || '/image.jpg'} alt={c.title} fill sizes="96px" className="object-cover" /></div>
                                        <div className="flex-1">
                                            <div className="font-bold line-clamp-2">{c.title}</div>
                                            <div className="text-xs text-gray-500 mt-1">{c.instructor_name} • {c.total_number_of_lessons} دروس</div>
                                        </div>
                                        <ArrowLeft className="w-5 h-5 text-gray-400 shrink-0" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="mt-8 lg:mt-0">
                    <div className="sticky top-24">
                        <Card className="rounded-2xl overflow-hidden shadow-lg border dark:border-neutral-800">
                            <div className="p-5">
                                <span className="text-sm text-gray-500">سعر الحزمة</span>
                                <div className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">${bundle.price}</div>
                                <p className="text-sm text-gray-500 mt-1">دفعة واحدة للوصول مدى الحياة</p>
                                <Button size="lg" className="w-full mt-4 rounded-xl text-base font-bold">
                                    اشترك الآن في الحزمة
                                </Button>
                                <h4 className="font-semibold mt-6 mb-3">هذه الحزمة تشمل:</h4>
                                <ul className="text-sm text-gray-600 dark:text-neutral-400 space-y-3">
                                    <li className="flex items-center gap-2"><Layers className="w-4 h-4 text-primary-500" /> {coursesInBundle.length} دورات تدريبية</li>
                                    {parseInt(bundle.free_sessions_count || '0') > 0 && <li className="flex items-center gap-2"><Gift className="w-4 h-4 text-primary-500" /> {bundle.free_sessions_count} جلسات خاصة مجانية</li>}
                                    {bundle.telegram_url?.trim() && <li className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary-500" /> مجموعة تيليجرام خاصة</li>}
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