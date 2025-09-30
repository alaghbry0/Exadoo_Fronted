// src/pages/shop/index.tsx
'use client'

import React, { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/Navbar'
import AuthPrompt from '@/components/AuthFab'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  GraduationCap,
  TrendingUp,
  Waves,
  BarChart3,
  CalendarCheck2,
  Search,
  ArrowLeft,
} from 'lucide-react'
import AcademyHeroCard from '@/components/AcademyHeroCard'

// --- بيانات API (تبقى كما هي) ---
import { useTelegram } from '@/context/TelegramContext'
import { useIndicatorsData } from '@/services/indicators'

// =========================================
//  Data & Types (تبقى كما هي)
// =========================================
type Variant = 'half' | 'wide'
type Accent = 'primary' | 'secondary' | 'success'

type TileMeta = {
  key: string
  title: string
  description: string
  href: string
  icon: React.ElementType
  variant: Variant
  accent: Accent
  live?: boolean
  eyebrow?: string
}

// --- NEW: تم إعادة هيكلة البيانات إلى فئات ---
const TRADING_TOOLS: TileMeta[] = [
  {
    key: 'indicators',
    title: 'مؤشرات Exaado للبيع والشراء',
    description: 'حزمة مؤشرات متقدمة (Gann-based) بأداء مُثبت وتجربة سلسة.',
    href: '/indicators',
    icon: BarChart3,
    variant: 'wide',
    accent: 'primary',
  },
  {
    key: 'forex',
    title: 'Exaado Forex',
    description: 'تداول العملات/الكريبتو برؤى دقيقة واستراتيجيات موثوقة.',
    href: '/forex',
    icon: TrendingUp,
    variant: 'half',
    accent: 'primary',
  },
  {
    key: 'signals',
    title: 'Exaado Signals',
    description: 'إشارات لحظية مدروسة تعزز قراراتك وتقلل الضوضاء.',
    href: '/shop/signals',
    icon: Waves,
    variant: 'half',
    accent: 'secondary',
    live: true,
  },
]

const PERSONAL_SERVICES: TileMeta[] = [
  {
    key: 'consultations',
    title: 'استشارات Exaado',
    description: 'احجز جلسة مباشرة 1:1 مع الخبراء مع اختيار الوقت المناسب.',
    href: '/consultancy',
    icon: CalendarCheck2,
    variant: 'wide',
    accent: 'success',
    eyebrow: '1:1 مباشر',
  },
]

// دمج كل الخدمات في مصفوفة واحدة لاستخدامها في البحث
const ALL_SERVICES = [...TRADING_TOOLS, ...PERSONAL_SERVICES]

// =========================================
//  Helpers (تبقى كما هي)
// =========================================
const iconWrap = (accent: Accent) =>
  ({
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
    secondary: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-500/10 dark:text-secondary-400',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  }[accent])

const ringFocus = (accent: Accent) =>
  ({
    primary: 'focus-visible:ring-primary-400/50',
    secondary: 'focus-visible:ring-secondary-400/50',
    success: 'focus-visible:ring-emerald-400/50',
  }[accent])

// =========================================
//  Tile Variants (تم تحديثها)
// =========================================

// --- UPDATED: HalfCard مع CTA أوضح ---
const HalfCard: React.FC<{ meta: TileMeta }> = ({ meta }) => {
  return (
    <Link
      href={meta.href}
      className={cn('group block h-full rounded-3xl outline-none focus-visible:ring-2', ringFocus(meta.accent))}
      aria-label={meta.title}
      prefetch
    >
      <Card className="flex flex-col h-full rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-5 flex flex-col flex-grow">
          <div className="flex items-start gap-4">
            <div className={cn('h-12 w-12 rounded-2xl grid place-items-center shrink-0', iconWrap(meta.accent))}>
              <meta.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">{meta.title}</h3>
                {meta.live && (
                  <span className="relative inline-flex h-3 w-3" aria-label="حي">
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-red-400" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                )}
              </div>
              <p className="mt-1 text-gray-600 dark:text-neutral-300 leading-relaxed">{meta.description}</p>
            </div>
          </div>
          <div className="mt-4 flex-grow flex items-end">
            <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 transition-transform duration-200 group-hover:gap-2">
              عرض التفاصيل <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[-4px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// --- UPDATED: WideIndicators بتصميم CTA وسعر أفضل ---
const WideIndicators: React.FC<{ meta: TileMeta }> = ({ meta }) => {
  const { telegramId } = useTelegram()
  const { data, isLoading } = useIndicatorsData(telegramId || undefined)

  const lifetime = data?.subscriptions?.find((p: any) => p?.duration_in_months === '0')
  const priceNow = lifetime?.discounted_price ?? lifetime?.price
  const priceOld = lifetime?.discounted_price && lifetime.discounted_price !== lifetime.price ? lifetime.price : undefined
  const discount = priceOld && priceNow ? Math.round(((Number(priceOld) - Number(priceNow)) / Number(priceOld)) * 100) : null

  return (
    <Link
      href={meta.href}
      className={cn('group block rounded-3xl outline-none focus-visible:ring-2', ringFocus(meta.accent))}
      aria-label={meta.title}
      prefetch
    >
      <Card className="rounded-3xl bg-white border border-gray-100 shadow-sm transition group-hover:shadow-lg group-hover:-translate-y-0.5 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className={cn('h-12 w-12 rounded-2xl grid place-items-center shrink-0', iconWrap(meta.accent))}>
              <meta.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{meta.title}</h3>
                {discount !== null && (
                  <Badge variant="destructive">خصم {discount}%</Badge>
                )}
              </div>
              <p className="mt-1 text-gray-600 dark:text-neutral-300 leading-relaxed">{meta.description}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
                <p className="text-sm text-gray-500 dark:text-neutral-400">خطة مدى الحياة تبدأ من</p>
                {isLoading ? <div className="h-8 w-24 mt-1 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" /> : 
                <div className="flex items-baseline gap-2">
                    {priceNow && <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">${Number(priceNow).toFixed(0)}</span>}
                    {priceOld && <span className="text-lg text-gray-400 line-through">${Number(priceOld).toFixed(0)}</span>}
                </div>}
            </div>
            <Button size="lg" className="rounded-xl w-full sm:w-auto font-bold group-hover:bg-primary-700">
              تفاصيل المؤشرات
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-[-4px]" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// --- UPDATED: WideConsultations مع CTA أوضح ---
const WideConsultations: React.FC<{ meta: TileMeta }> = ({ meta }) => {
  return (
    <Link
      href={meta.href}
      className={cn('group block rounded-3xl outline-none focus-visible:ring-2', ringFocus(meta.accent))}
      aria-label={meta.title}
      prefetch
    >
      <Card className="rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-5 md:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
                <div className={cn('h-12 w-12 rounded-2xl grid place-items-center shrink-0', iconWrap(meta.accent))}>
                    <meta.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">{meta.title}</h3>
                    {meta.eyebrow && <Badge className="bg-emerald-100 text-emerald-700 border-none dark:bg-emerald-900/50 dark:text-emerald-300">{meta.eyebrow}</Badge>}
                </div>
                <p className="mt-1 text-gray-600 dark:text-neutral-300 leading-relaxed max-w-lg">{meta.description}</p>
                </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:mr-6 shrink-0">
                <Button variant="outline" className="rounded-xl w-full sm:w-auto border-gray-300 dark:border-neutral-700">
                    احجز الآن <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// =========================================
//  Page Component (تمت إعادة هيكلته بالكامل)
// =========================================
export default function ShopHome() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return ALL_SERVICES.filter(
      (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    )
  }, [query])

  const isSearching = query.length > 0

  const renderService = (meta: TileMeta) => {
    if (meta.variant === 'half') {
      return <div className="col-span-12 sm:col-span-6"><HalfCard meta={meta} /></div>
    }
    if (meta.key === 'indicators') {
      return <div className="col-span-12"><WideIndicators meta={meta} /></div>
    }
    if (meta.key === 'consultations') {
      return <div className="col-span-12"><WideConsultations meta={meta} /></div>
    }
    return null;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* --- NEW: Hero Section --- */}
        <section className="text-center pt-20 pb-12" aria-labelledby="page-title">
         <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                         
                                          متجر Exaado
                                     </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto"
          >
            أدواتك وخدماتك للوصول إلى مستوى جديد في عالم التداول. استكشف، تعلم، ونفّذ.
          </motion.p>
        </section>

        {/* --- UPDATED: Search Bar --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mb-12 max-w-2xl mx-auto"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="search"
              placeholder="ابحث عن خدمة... (مثال: Signals)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                'block w-full pl-12 pr-4 py-3 rounded-2xl text-base',
                'bg-white border border-gray-200 shadow-sm',
                'text-gray-900 placeholder:text-gray-400 focus:outline-none',
                'focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400',
                'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100'
              )}
              aria-label="ابحث في خدمات إكسادو"
            />
          </div>
        </motion.div>

        {/* --- NEW: Conditional Rendering Logic --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isSearching ? 'search-results' : 'categories'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isSearching ? (
              // --- Search Results View ---
              <section id="search-results" aria-label="نتائج البحث">
                <div className="grid grid-cols-12 gap-4 sm:gap-5">
                  {filteredServices.length > 0 ? (
                    filteredServices.map(meta => <React.Fragment key={meta.key}>{renderService(meta)}</React.Fragment>)
                  ) : (
                    <div className="col-span-12 text-center py-16">
                      <p className="text-gray-600 dark:text-neutral-400">لا توجد نتائج مطابقة لكلمة البحث "{query}".</p>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              // --- Categorized View ---
              <div className="space-y-12">
                <section id="education" aria-labelledby="education-title">
                  <h2 id="education-title" className="text-2xl font-bold mb-5 text-gray-900 dark:text-neutral-100">التعليم والتطوير</h2>
                  <AcademyHeroCard courses={26} tracks={7} freeCount={4} />
                </section>
                
                <section id="trading-tools" aria-labelledby="trading-tools-title">
                  <h2 id="trading-tools-title" className="text-2xl font-bold mb-5 text-gray-900 dark:text-neutral-100">أدوات التداول</h2>
                  <div className="grid grid-cols-12 gap-4 sm:gap-5">
                    {TRADING_TOOLS.map(meta => <React.Fragment key={meta.key}>{renderService(meta)}</React.Fragment>)}
                  </div>
                </section>

                <section id="personal-services" aria-labelledby="personal-services-title">
                  <h2 id="personal-services-title" className="text-2xl font-bold mb-5 text-gray-900 dark:text-neutral-100">خدمات مخصصة</h2>
                  <div className="grid grid-cols-12 gap-4 sm:gap-5">
                    {PERSONAL_SERVICES.map(meta => <React.Fragment key={meta.key}>{renderService(meta)}</React.Fragment>)}
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        <div className="max-w-7xl mx-auto mt-12">
          <AuthPrompt />
        </div>
      </main>
    </div>
  )
}