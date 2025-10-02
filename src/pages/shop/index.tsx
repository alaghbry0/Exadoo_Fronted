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
  TrendingUp,
  Waves,
  BarChart3,
  CalendarCheck2,
  Search,
  ArrowLeft,
  Sparkles,
  Zap,
} from 'lucide-react'
import AcademyHeroCard from '@/components/AcademyHeroCard'
import { useTelegram } from '@/context/TelegramContext'
import { useIndicatorsData } from '@/services/indicators'
import { useDebounce } from '@/hooks/useDebounce'
import { useKeyboardSearch } from '@/hooks/useKeyboardSearch'
import { HalfCardSkeleton, WideCardSkeleton } from '@/components/shared/SkeletonLoaders'

// =========================================
// Types
// =========================================
type Variant = 'half' | 'wide'
type Accent = 'primary' | 'secondary' | 'success'

interface TileMeta {
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

// =========================================
// Data
// =========================================
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

const ALL_SERVICES = [...TRADING_TOOLS, ...PERSONAL_SERVICES]

// =========================================
// Helpers
// =========================================
const iconWrap = (accent: Accent): string =>
  ({
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
    secondary: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-500/10 dark:text-secondary-400',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  }[accent])

const ringFocus = (accent: Accent): string =>
  ({
    primary: 'focus-visible:ring-2 focus-visible:ring-primary-400/50',
    secondary: 'focus-visible:ring-2 focus-visible:ring-secondary-400/50',
    success: 'focus-visible:ring-2 focus-visible:ring-emerald-400/50',
  }[accent])

// =========================================
// Card Components
// =========================================
const HalfCard = React.memo<{ meta: TileMeta }>(({ meta }) => {
  return (
    <Link
      href={meta.href}
      className={cn(
        'group block h-full rounded-card-lg outline-none',
        ringFocus(meta.accent)
      )}
      aria-label={meta.title}
      prefetch
    >
      <Card className="flex flex-col h-full rounded-card-lg bg-white border border-gray-100 shadow-card transition-all duration-200 group-hover:shadow-card-hover group-hover:-translate-y-0.5 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-5 flex flex-col flex-grow">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'h-12 w-12 rounded-2xl grid place-items-center shrink-0',
                iconWrap(meta.accent)
              )}
            >
              <meta.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                  {meta.title}
                </h3>
                {meta.live && (
                  <span className="relative inline-flex h-3 w-3" aria-label="خدمة نشطة">
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-red-400" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
                {meta.description}
              </p>
            </div>
          </div>
          <div className="mt-auto pt-4">
            <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 transition-all duration-200 group-hover:gap-2">
              عرض التفاصيل
              <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[-4px]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})
HalfCard.displayName = 'HalfCard'

const WideIndicators = React.memo<{ meta: TileMeta }>(({ meta }) => {
  const { telegramId } = useTelegram()
  const { data, isLoading } = useIndicatorsData(telegramId || undefined)

  const lifetime = data?.subscriptions?.find((p: any) => p?.duration_in_months === '0')
  const priceNow = lifetime?.discounted_price ?? lifetime?.price
  const priceOld =
    lifetime?.discounted_price && lifetime.discounted_price !== lifetime.price
      ? lifetime.price
      : undefined
  const discount =
    priceOld && priceNow
      ? Math.round(((Number(priceOld) - Number(priceNow)) / Number(priceOld)) * 100)
      : null

  return (
    <Link
      href={meta.href}
      className={cn(
        'group block rounded-card-lg outline-none',
        ringFocus(meta.accent)
      )}
      aria-label={meta.title}
      prefetch
    >
      <Card className="rounded-card-lg bg-white border border-gray-100 shadow-card transition-all duration-200 group-hover:shadow-card-hover group-hover:-translate-y-0.5 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div
              className={cn(
                'h-12 w-12 rounded-2xl grid place-items-center shrink-0',
                iconWrap(meta.accent)
              )}
            >
              <meta.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                  {meta.title}
                </h3>
                {discount !== null && (
                  <Badge variant="destructive" className="font-bold">
                    خصم {discount}%
                  </Badge>
                )}
              </div>
              <p className="mt-1.5 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
                {meta.description}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">
                خطة مدى الحياة تبدأ من
              </p>
              {isLoading ? (
                <div className="h-8 w-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
              ) : (
                <div className="flex items-baseline gap-2">
                  {priceNow && (
                    <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                      ${Number(priceNow).toFixed(0)}
                    </span>
                  )}
                  {priceOld && (
                    <span className="text-base text-gray-400 line-through">
                      ${Number(priceOld).toFixed(0)}
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              size="lg"
              className="rounded-xl w-full sm:w-auto font-bold bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-700 shadow-button transition-all duration-300 text-white"
            >
              تفاصيل المؤشرات
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:translate-x-[-4px] " />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})
WideIndicators.displayName = 'WideIndicators'

const WideConsultations = React.memo<{ meta: TileMeta }>(({ meta }) => {
  return (
    <Link
      href={meta.href}
      className={cn(
        'group block rounded-card-lg outline-none',
        ringFocus(meta.accent)
      )}
      aria-label={meta.title}
      prefetch
    >
      <Card className="rounded-card-lg bg-white border border-gray-100 shadow-card transition-all duration-200 group-hover:shadow-card-hover group-hover:-translate-y-0.5 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div
                className={cn(
                  'h-12 w-12 rounded-2xl grid place-items-center shrink-0',
                  iconWrap(meta.accent)
                )}
              >
                <meta.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">
                    {meta.title}
                  </h3>
                  {meta.eyebrow && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-none dark:bg-emerald-900/50 dark:text-emerald-300">
                      {meta.eyebrow}
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed max-w-lg">
                  {meta.description}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <Button
                variant="outline"
                className="rounded-xl w-full sm:w-auto border-gray-500 dark:border-neutral-700 font-semibold"
              >
                احجز الآن
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})
WideConsultations.displayName = 'WideConsultations'

// =========================================
// Main Page Component
// =========================================
export default function ShopHome() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  // استخدام Debouncing للبحث
  const debouncedQuery = useDebounce(query, 300)
  
  // Keyboard shortcuts
  useKeyboardSearch({
    inputRef,
    query,
    onClear: () => setQuery(''),
  })

  const filteredServices = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return []
    return ALL_SERVICES.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    )
  }, [debouncedQuery])

  const isSearching = query.length > 0
  const isDebouncing = query !== debouncedQuery

  const renderService = (meta: TileMeta) => {
    if (meta.variant === 'half') {
      return (
        <div key={meta.key} className="col-span-12 sm:col-span-6">
          <HalfCard meta={meta} />
        </div>
      )
    }
    if (meta.key === 'indicators') {
      return (
        <div key={meta.key} className="col-span-12">
          <WideIndicators meta={meta} />
        </div>
      )
    }
    if (meta.key === 'consultations') {
      return (
        <div key={meta.key} className="col-span-12">
          <WideConsultations meta={meta} />
        </div>
      )
    }
    return null
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic"
    >
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Hero Section */}
        <section className="text-center pt-20 pb-12" aria-labelledby="page-title">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              id="page-title"
              className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-neutral-100 mb-4 leading-tight font-display"
            >
              متجر Exaado
            </h1>
            <p className="text-lg text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              أدواتك وخدماتك للوصول إلى مستوى جديد في عالم التداول. استكشف، تعلم، ونفّذ.
            </p>
          </motion.div>
        </section>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              ref={inputRef}
              type="search"
              placeholder="ابحث عن خدمة... (مثال: Signals)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                'block w-full pl-12 pr-4 py-3.5 rounded-2xl text-base',
                'bg-white border border-gray-200 shadow-sm',
                'text-gray-900 placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400',
                'transition-shadow duration-200',
                'dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder:text-neutral-500'
              )}
              aria-label="ابحث في خدمات إكسادو"
            />
          </div>
          
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isSearching ? 'search-results' : 'categories'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isSearching ? (
              <section id="search-results" aria-label="نتائج البحث">
                {isDebouncing ? (
                  <div className="grid grid-cols-12 gap-4 sm:gap-5">
                    <div className="col-span-12">
                      <WideCardSkeleton />
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                      <HalfCardSkeleton />
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                      <HalfCardSkeleton />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-12 gap-4 sm:gap-5">
                    {filteredServices.length > 0 ? (
                      filteredServices.map((meta) => renderService(meta))
                    ) : (
                      <div className="col-span-12 text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-neutral-800 mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 dark:text-neutral-400">
                          لا توجد نتائج مطابقة لكلمة البحث &quot;{query}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            ) : (
              <div className="space-y-12">
                <section id="education" aria-labelledby="education-title">
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <h2
                      id="education-title"
                      className="text-2xl font-bold text-gray-900 dark:text-neutral-100"
                    >
                      التعليم والتطوير
                    </h2>
                  </div>
                  <AcademyHeroCard courses={26} tracks={7} freeCount={4} />
                </section>

                <section id="trading-tools" aria-labelledby="trading-tools-title">
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    <h2
                      id="trading-tools-title"
                      className="text-2xl font-bold text-gray-900 dark:text-neutral-100"
                    >
                      أدوات التداول
                    </h2>
                  </div>
                  <div className="grid grid-cols-12 gap-4 sm:gap-5">
                    {TRADING_TOOLS.map((meta) => renderService(meta))}
                  </div>
                </section>

                <section
                  id="personal-services"
                  aria-labelledby="personal-services-title"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <CalendarCheck2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <h2
                      id="personal-services-title"
                      className="text-2xl font-bold text-gray-900 dark:text-neutral-100"
                    >
                      خدمات مخصصة
                    </h2>
                  </div>
                  <div className="grid grid-cols-12 gap-4 sm:gap-5">
                    {PERSONAL_SERVICES.map((meta) => renderService(meta))}
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