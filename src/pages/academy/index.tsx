'use client'
import React, { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import BackHeader from '@/components/BackHeader'
import AuthPrompt from '@/components/AuthFab'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, Bookmark, Layers, Stars, ArrowLeft } from 'lucide-react'
import SmartImage from '@/components/SmartImage'
import { useTelegram } from '@/context/TelegramContext'
import { useAcademyData } from '@/services/academy'

// =========================================
//  Components (تم تحسينها)
// =========================================

// --- Horizontal Carousel (تبقى كما هي, فهي ممتازة) ---
const HorizontalCarousel: React.FC<React.PropsWithChildren> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const count = React.Children.count(children)
  if (count === 0) return null
  return (
    <div className="relative">
      <div ref={ref} className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {React.Children.map(children, (ch, i) => (
          <div key={i} className="flex-shrink-0 w-[85%] sm:w-[360px] snap-start">
            {ch}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Course Card (تم تحسين التصميم) ---
export const CourseCard: React.FC<{
  id: string; title: string; desc: string; price: string; lessons: number; level: string; img: string; isFree?: boolean;
}> = ({ id, title, desc, price, lessons, level, img, isFree }) => (
  <Link href={`/academy/course/${id}`} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 rounded-2xl">
    <Card className="rounded-2xl h-full overflow-hidden transition-all duration-300 border shadow-sm group-hover:shadow-lg group-hover:-translate-y-1">
      <div className="relative w-full aspect-video">
        <SmartImage src={img || '/image.jpg'} alt={title} fill sizes="(min-width: 1280px) 360px, (min-width: 640px) 60vw, 85vw" className="object-cover" fallbackSrc="/image.jpg" />
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold line-clamp-2 text-gray-900 dark:text-neutral-100">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-2 mt-1 flex-grow">{desc}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="capitalize">{level || 'general'}</Badge>
            <Badge variant="outline">{lessons} دروس</Badge>
          </div>
          {isFree || price.toLowerCase() === 'free' ? (
            <Badge variant="default" className="bg-emerald-600 text-white">مجاني</Badge>
          ) : (
            <div className="text-base font-bold text-primary-600 dark:text-primary-400">${price}</div>
          )}
        </div>
      </CardContent>
    </Card>
  </Link>
)

// --- Bundle Card (تم تحسين التصميم) ---
export const BundleCard: React.FC<{
  id: string; title: string; desc: string; price: string; img: string;
}> = ({ id, title, desc, price, img }) => (
  <Link href={`/academy/bundle/${id}`} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 rounded-2xl">
    <Card className="rounded-2xl h-full overflow-hidden transition-all duration-300 border shadow-sm group-hover:shadow-lg group-hover:-translate-y-1">
      <div className="relative w-full aspect-video">
        <SmartImage src={img || '/image.jpg'} alt={title} fill sizes="(min-width: 1280px) 360px, (min-width: 640px) 60vw, 85vw" className="object-cover" fallbackSrc="/image.jpg" />
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold line-clamp-2 text-gray-900 dark:text-neutral-100">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-2 mt-1 flex-grow">{(desc || '').replace(/\\r\\n/g, ' ')}</p>
        <div className="flex items-center justify-between mt-4">
          <Badge variant="outline" className="border-secondary-400 text-secondary-600 dark:border-secondary-500 dark:text-secondary-400">حزمة</Badge>
          <div className="text-base font-bold text-primary-600 dark:text-primary-400">${price}</div>
        </div>
      </CardContent>
    </Card>
  </Link>
)

// =========================================
//  Page (تمت إعادة هيكلته بالكامل)
// =========================================
export default function AcademyIndex() {
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [q, setQ] = useState('')
  const { telegramId } = useTelegram()

  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

  // --- Hooks for filtering data (تبقى كما هي) ---
  const featured = useMemo(() => {
    if (!data) return { courses: [], bundles: [] }
    const fc = new Set([...data.top_course_ids, ...data.highlight_course_ids])
    const fb = new Set([...data.top_bundle_ids, ...data.highlight_bundle_ids])
    return {
      courses: data.courses.filter(c => fc.has(c.id)),
      bundles: data.bundles.filter(b => fb.has(b.id)),
    }
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return { courses: [], bundles: [] }
    const ql = q.trim().toLowerCase()
    if (!ql) return { courses: data.courses, bundles: data.bundles }
    const filterIt = (text: string) => text.toLowerCase().includes(ql)
    return {
      courses: data.courses.filter(c => filterIt(c.title) || filterIt(c.short_description)),
      bundles: data.bundles.filter(b => filterIt(b.title) || filterIt(b.description)),
    }
  }, [data, q])

  const mine = useMemo(() => {
    if (!data) return { courses: [], bundles: [] }
    const cset = new Set(data.my_enrollments.course_ids)
    const bset = new Set(data.my_enrollments.bundle_ids)
    return {
      courses: data.courses.filter(c => cset.has(c.id)),
      bundles: data.bundles.filter(b => bset.has(b.id)),
    }
  }, [data])

  const isSearching = q.length > 0;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
     <BackHeader />
      <main className="max-w-7xl mx-auto px-4 pb-24">
        
        {/* --- NEW: Hero Section --- */}
        <section className="text-center pt-20 pb-12" aria-labelledby="page-title">
          <motion.h1 id="page-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-neutral-100"
          >
            أكاديمية Exaado
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto"
          >
            طريقك المتكامل لإتقان التداول. تعلم من الخبراء، طبق باستراتيجيات عملية، وحقق أهدافك.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
              <input type="search" placeholder="ابحث عن كورس أو حزمة…" value={q} onChange={(e) => setQ(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 rounded-2xl text-base bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400/40"
              />
            </div>
          </motion.div>
        </section>

        {/* --- UPDATED: Tabs --- */}
        <div className="sticky top-[56px] z-20 bg-gray-50/80 dark:bg-neutral-950/80 backdrop-blur-sm -mx-4 px-4 border-b border-gray-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 py-3">
            <button onClick={() => setTab('all')} className={cn('px-5 py-2.5 rounded-xl text-sm font-semibold transition', tab==='all'?'bg-primary-600 text-white shadow-md':'hover:bg-gray-200 dark:hover:bg-neutral-800')}>
              <Layers className="w-4 h-4 inline-block ml-2" /> جميع المحتوى
            </button>
            <button onClick={() => setTab('mine')} className={cn('px-5 py-2.5 rounded-xl text-sm font-semibold transition', tab==='mine'?'bg-primary-600 text-white shadow-md':'hover:bg-gray-200 dark:hover:bg-neutral-800')}>
              <Bookmark className="w-4 h-4 inline-block ml-2" /> دوراتي
            </button>
          </div>
        </div>

        {/* --- Loading / Error States --- */}
        {isLoading && <div className="py-20 text-center text-gray-500">جاري تحميل محتوى الأكاديمية...</div>}
        {isError && <div className="py-20 text-center text-red-500">حدث خطأ: {(error as Error)?.message}</div>}
        
        {data && !isLoading && !isError && (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* --- My Enrollments View --- */}
              {tab === 'mine' ? (
                <section className="mt-8 space-y-10">
                  {mine.courses.length === 0 && mine.bundles.length === 0 ? (
                    <div className="text-center py-16">
                      <Bookmark className="mx-auto w-12 h-12 mb-3 text-gray-400" />
                      <h3 className="text-xl font-bold">لا توجد دورات في حسابك بعد</h3>
                      <p className="text-gray-500 mt-2">استكشف الكورسات والحِزم وابدأ رحلتك التعليمية معنا.</p>
                      <Button size="lg" className="mt-6 rounded-xl" onClick={()=>setTab('all')}>تصفّح كل المحتوى</Button>
                    </div>
                  ) : (
                    <>
                      {mine.courses.length > 0 && <div>
                        <h2 className="text-3xl font-bold mb-4">أكمل تعلمك</h2>
                        <HorizontalCarousel>{mine.courses.map(c=>(<CourseCard key={c.id} {...c} desc={c.short_description} price={c.discounted_price||c.price} lessons={c.total_number_of_lessons} img={c.thumbnail} isFree={c.is_free_course==='1'||c.price.toLowerCase()==='free'} />))}</HorizontalCarousel>
                      </div>}
                      {mine.bundles.length > 0 && <div>
                        <h2 className="text-3xl font-bold mb-4">الحزم المشترك بها</h2>
                        <HorizontalCarousel>{mine.bundles.map(b=>(<BundleCard key={b.id} {...b} img={b.image||b.cover_image} />))}</HorizontalCarousel>
                      </div>}
                    </>
                  )}
                </section>
              ) : (
                // --- All Content View ---
                isSearching ? (
                  // --- Search View (Grid for both) ---
                  <section className="mt-8">
                     <h2 className="text-2xl font-bold mb-4">نتائج البحث عن "{q}"</h2>
                     {(filtered.courses.length + filtered.bundles.length) === 0 ? (
                        <p className="text-center py-16 text-gray-500">لم نجد أي نتائج تطابق بحثك.</p>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.courses.map(c => <CourseCard key={c.id} {...c} desc={c.short_description} price={c.discounted_price||c.price} lessons={c.total_number_of_lessons} img={c.thumbnail} isFree={c.is_free_course==='1'||c.price.toLowerCase()==='free'} />)}
                            {filtered.bundles.map(b => <BundleCard key={b.id} {...b} img={b.image||b.cover_image} />)}
                        </div>
                     )}
                  </section>
                ) : (
                  // --- Default View (Categorized with Grids) ---
                  <section className="mt-8 space-y-12">
                    {featured.courses.length > 0 && <div>
                      <h2 className="text-3xl font-bold mb-4 flex items-center gap-2"><Stars className="w-6 h-6 text-yellow-500" /> محتوى مميز</h2>
                      <HorizontalCarousel>{featured.courses.map(c=>(<CourseCard key={c.id} {...c} desc={c.short_description} price={c.discounted_price||c.price} lessons={c.total_number_of_lessons} img={c.thumbnail} isFree={c.is_free_course==='1'||c.price.toLowerCase()==='free'} />))}</HorizontalCarousel>
                    </div>}

                    {/* --- NEW: Grid layout for all courses --- */}
                    <div>
                      <h2 className="text-3xl font-bold mb-4">جميع الكورسات</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.courses.map(c => <CourseCard key={c.id} {...c} desc={c.short_description} price={c.discounted_price||c.price} lessons={c.total_number_of_lessons} img={c.thumbnail} isFree={c.is_free_course==='1'||c.price.toLowerCase()==='free'} />)}
                      </div>
                    </div>

                    {/* --- NEW: Grid layout for all bundles --- */}
                    {filtered.bundles.length > 0 && <div>
                      <h2 className="text-3xl font-bold mb-4">جميع الحزم التعليمية</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.bundles.map(b => <BundleCard key={b.id} {...b} img={b.image||b.cover_image} />)}
                      </div>
                    </div>}

                    {data.categories.length>0 && <div>
                      <h2 className="text-3xl font-bold mb-4">التصنيفات</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {data.categories.map(cat=>(
                          <Link key={cat.id} href={`/academy/category/${cat.id}`} className="group relative border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white dark:bg-neutral-900 aspect-[4/3]">
                            <SmartImage src={cat.thumbnail || '/image.jpg'} alt={cat.name} fill sizes="(min-width: 768px) 20vw, 45vw" className="object-cover transition-transform duration-300 group-hover:scale-105" fallbackSrc="/image.jpg" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-0 right-0 p-3 text-white">
                              <h3 className="font-bold">{cat.name}</h3>
                              <p className="text-xs text-white/80">{cat.number_of_courses} كورسات</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>}
                  </section>
                )
              )}

            </motion.div>
          </AnimatePresence>
        )}

        <div className="max-w-7xl mx-auto mt-12">
          <AuthPrompt />
        </div>
      </main>
    </div>
  )
}