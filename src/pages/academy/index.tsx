
'use client'
import React, { useMemo, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import AuthPrompt from '@/components/AuthFab'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, Bookmark, Layers, Stars } from 'lucide-react'
import AcademyHeroCard from '@/components/AcademyHeroCard'
import SmartImage from '@/components/SmartImage'
import { useTelegram } from '@/context/TelegramContext'
import { useAcademyData } from '@/services/academy'

// === Carousel ===
const HorizontalCarousel: React.FC<React.PropsWithChildren> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const count = React.Children.count(children)
  const scroll = (dir: 'l' | 'r') => {
    const el = ref.current
    if (!el) return
    const step = el.clientWidth * 0.85
    el.scrollBy({ left: dir === 'l' ? -step : step, behavior: 'smooth' })
  }
  if (count === 0) return null
  return (
    <div className="relative group">
      <div ref={ref} className="flex overflow-x-auto gap-4 pb-2 -mx-4 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {React.Children.map(children, (ch, i) => (
          <div key={i} className="flex-shrink-0 w-[85%] sm:w-[360px] snap-start">
            {ch}
          </div>
        ))}
      </div>
      {count > 1 && (
        <>
          <button onClick={() => scroll('l')} className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-2 z-10 bg-white/80 dark:bg-neutral-900/80 border rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition">
            <svg width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="m15 19l-7-7l7-7"/></svg>
          </button>
          <button onClick={() => scroll('r')} className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-2 z-10 bg-white/80 dark:bg-neutral-900/80 border rounded-full p-2 shadow opacity-0 group-hover:opacity-100 transition">
            <svg width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="m9 5l7 7l-7 7"/></svg>
          </button>
        </>
      )}
    </div>
  )
}

// === Cards صغيرة داخل الصفحة (متوافقة مع shadcn/ui) ===
const CourseCard: React.FC<{
  id: string; title: string; desc: string; price: string; lessons: number; level: string; img: string; isFree?: boolean;
}> = ({ id, title, desc, price, lessons, level, img, isFree }) => (
  <Link href={`/academy/course/${id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 rounded-2xl">
    <Card className="rounded-2xl overflow-hidden hover:shadow-lg transition border">

      <div className="relative w-full aspect-video">
        <SmartImage
          src={img || '/image.jpg'}
          alt={title}
          fill
          sizes="(min-width: 1280px) 360px, (min-width: 640px) 60vw, 85vw"
          className="object-cover"
          fallbackSrc="/image.jpg"
        />
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-2 mt-1">{desc}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2 text-xs">
            <Badge variant="secondary" className="capitalize">{level || 'general'}</Badge>
            <Badge variant="outline">{lessons} دروس</Badge>
          </div>
          <div className="text-sm font-semibold">{isFree || price.toLowerCase() === 'free' ? 'Free' : `$${price}`}</div>
        </div>
      </CardContent>
    </Card>
  </Link>
)

const BundleCard: React.FC<{
  id: string; title: string; desc: string; price: string; img: string;
}> = ({ id, title, desc, price, img }) => (
  <Link href={`/academy/bundle/${id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 rounded-2xl">
    <Card className="rounded-2xl overflow-hidden hover:shadow-lg transition border">

      <div className="relative w-full aspect-[4/3]">
        <SmartImage
          src={img || '/image.jpg'}
          alt={title}
          fill
          sizes="(min-width: 1280px) 360px, (min-width: 640px) 60vw, 85vw"
          className="object-cover"
          fallbackSrc="/image.jpg"
        />
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-2 mt-1">{(desc || '').replace(/\\r\\n/g, ' ')}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm font-semibold">${price}</div>
          <Badge variant="outline">Bundle</Badge>
        </div>
      </CardContent>
    </Card>
  </Link>
)

export default function AcademyIndex() {
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [subTab, setSubTab] = useState<'courses' | 'bundles'>('courses')
  const [q, setQ] = useState('')
  const { telegramId } = useTelegram()

  const { data, isLoading, isError, error } = useAcademyData(telegramId || undefined)

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
    const filterIt = (text: string) => text.toLowerCase().includes(ql)
    const courses = !ql ? data.courses : data.courses.filter(c => filterIt(c.title) || filterIt(c.short_description))
    const bundles = !ql ? data.bundles : data.bundles.filter(b => filterIt(b.title) || filterIt(b.description))
    return { courses, bundles }
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

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Search */}
        <section className="pt-20 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="ابحث عن كورس أو حزمة…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={cn('block w-full pl-10 pr-4 py-3 rounded-2xl','bg-white border border-gray-200 shadow-sm','text-gray-900 placeholder:text-gray-400 focus:outline-none','focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400','dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-100')}
              aria-label="بحث الأكاديمية"
            />
          </div>
        </section>

        {/* Hero */}
        <section className="mb-4">
          <AcademyHeroCard
            courses={data?.courses.length ?? 0}
            tracks={data?.categories.length ?? 0}
            freeCount={(data?.courses ?? []).filter(c => c.is_free_course === '1' || c.price.toLowerCase() === 'free').length}
          />
        </section>

        {/* Tabs */}
        <div className="sticky top-[56px] z-20 bg-gray-50/80 dark:bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-opacity-70 -mx-4 px-4">
          <div className="flex items-center gap-2 pt-3">
            <button onClick={() => setTab('all')} className={cn('px-4 py-2.5 rounded-xl text-sm font-semibold transition', tab==='all'?'bg-primary-600 text-white':'bg-white dark:bg-neutral-900 border')}>
              <Layers className="w-4 h-4 inline-block ml-2" /> جميع المحتوى
            </button>
            <button onClick={() => setTab('mine')} className={cn('px-4 py-2.5 rounded-xl text-sm font-semibold transition', tab==='mine'?'bg-primary-600 text-white':'bg-white dark:bg-neutral-900 border')}>
              <Bookmark className="w-4 h-4 inline-block ml-2" /> اشتراكاتي
            </button>

            {tab==='all' && (
              <div className="ml-auto flex gap-2">
                <button onClick={()=>setSubTab('courses')} className={cn('px-3 py-2 rounded-lg text-xs font-semibold', subTab==='courses'?'bg-secondary-600 text-white':'bg-white dark:bg-neutral-900 border')}>الكورسات</button>
                <button onClick={()=>setSubTab('bundles')} className={cn('px-3 py-2 rounded-lg text-xs font-semibold', subTab==='bundles'?'bg-secondary-600 text-white':'bg-white dark:bg-neutral-900 border')}>الحِزم</button>
              </div>
            )}
          </div>
        </div>

        {/* States */}
        {isLoading && <div className="py-20 text-center">جاري التحميل…</div>}
        {isError && <div className="py-20 text-center text-red-500">تعذر جلب البيانات: {(error as Error)?.message}</div>}

        {/* Content */}
        {data && !isLoading && !isError && (
          <>
            {tab === 'mine' ? (
              <section className="mt-6 space-y-8">
                {mine.courses.length === 0 && mine.bundles.length === 0 ? (
                  <div className="text-center py-16">
                    <Bookmark className="mx-auto w-10 h-10 mb-2" />
                    <h3 className="text-xl font-bold">لا اشتراكات بعد</h3>
                    <p className="text-gray-500">استكشف الكورسات والحِزم وابدأ رحلتك.</p>
                    <Button className="mt-4" onClick={()=>setTab('all')}>تصفّح الآن</Button>
                  </div>
                ) : (
                  <>
                    {mine.courses.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-3">أكمل تعلّمك</h2>
                        <HorizontalCarousel>
                          {mine.courses.map(c=>(
                            <CourseCard key={c.id} id={c.id} title={c.title} desc={c.short_description} price={c.discounted_price||c.price} lessons={c.total_number_of_lessons} level={c.level} img={c.thumbnail} isFree={c.is_free_course==='1'||c.price.toLowerCase()==='free'} />
                          ))}
                        </HorizontalCarousel>
                      </div>
                    )}
                    {mine.bundles.length > 0 && (
                      <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-3">حِزمك</h2>
                        <HorizontalCarousel>
                          {mine.bundles.map(b=>(
                            <BundleCard key={b.id} id={b.id} title={b.title} desc={b.description} price={b.price} img={b.image||b.cover_image} />
                          ))}
                        </HorizontalCarousel>
                      </div>
                    )}
                  </>
                )}
              </section>
            ) : (
              <section className="mt-6 space-y-12">
                {/* Featured */}
                <div>
                  <h2 className="text-2xl font-bold mb-3"><Stars className="inline w-5 h-5 ml-2 text-yellow-500" /> مميزة</h2>
                  {subTab==='courses' ? (
                    <HorizontalCarousel>
                      {featured.courses.map(c=>(
                        <CourseCard key={c.id} id={c.id} title={c.title} desc={c.short_description} price={c.discounted_price||c.price} lessons={c.total_number_of_lessons} level={c.level} img={c.thumbnail} isFree={c.is_free_course==='1'||c.price.toLowerCase()==='free'} />
                      ))}
                    </HorizontalCarousel>
                  ) : (
                    <HorizontalCarousel>
                      {featured.bundles.map(b=>(
                        <BundleCard key={b.id} id={b.id} title={b.title} desc={b.description} price={b.price} img={b.image||b.cover_image} />
                      ))}
                    </HorizontalCarousel>
                  )}
                </div>

                {/* All */}
                <div>
                  <h2 className="text-2xl font-bold mb-3">{subTab==='courses'?'جميع الكورسات':'جميع الحِزم'}</h2>
                  <HorizontalCarousel>
                    {(subTab==='courses'?filtered.courses:filtered.bundles).map(x => subTab==='courses' ? (
                      <CourseCard key={(x as any).id} id={(x as any).id} title={(x as any).title} desc={(x as any).short_description} price={(x as any).discounted_price||(x as any).price} lessons={(x as any).total_number_of_lessons} level={(x as any).level} img={(x as any).thumbnail} isFree={(x as any).is_free_course==='1'||(x as any).price?.toLowerCase?.()==='free'} />
                    ) : (
                      <BundleCard key={(x as any).id} id={(x as any).id} title={(x as any).title} desc={(x as any).description} price={(x as any).price} img={(x as any).image||(x as any).cover_image} />
                    ))}
                  </HorizontalCarousel>
                </div>

                {/* Categories */}
                {data.categories.length>0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-3">التصنيفات</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {data.categories.map(cat=>(
                        <Link key={cat.id} href={`/academy/category/${cat.id}`} className="border rounded-2xl overflow-hidden hover:shadow-md transition bg-white dark:bg-neutral-900">
                          <div className="relative w-full aspect-[16/9]">
                            <SmartImage
                              src={cat.thumbnail || '/image.jpg'}
                              alt={cat.name}
                              fill
                              sizes="(min-width: 768px) 20vw, 60vw"
                              className="object-cover"
                              fallbackSrc="/image.jpg"
                            />
                          </div>
                          <div className="p-3">
                            <div className="font-semibold">{cat.name}</div>
                            <div className="text-xs text-gray-500">{cat.number_of_courses} كورسات</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            <div className="max-w-7xl mx-auto mt-10">
              <AuthPrompt />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

