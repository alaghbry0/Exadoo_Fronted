// src/pages/shop/index.tsx
'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
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

// =========================================
//  Subtle Motion Wrapper (reduced‑motion aware)
// =========================================
const Tile: React.FC<React.PropsWithChildren<{ className?: string; delay?: number }>> = ({
  className,
  delay = 0.06,
  children,
}) => {
  const r = useReducedMotion()
  return (
    <motion.div
      initial={r ? false : { opacity: 0, y: 16 }}
      animate={r ? {} : { opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// =========================================
//  Data
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
  price?: number
  oldPrice?: number
  eyebrow?: string
}

const TILES: TileMeta[] = [
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
  {
    key: 'indicators',
    title: 'مؤشرات Exaado للبيع والشراء',
    description: 'حزمة مؤشرات متقدمة (Gann‑based) بأداء مُثبت وتجربة سلسة.',
    href: '/indicators',
    icon: BarChart3,
    variant: 'wide',
    accent: 'primary',
    price: 200,
    oldPrice: 350,
  },
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

// =========================================
//  Helpers
// =========================================

const iconWrap = (accent: Accent) =>
  ({
    primary: 'bg-primary-50 text-primary-600',
    secondary: 'bg-secondary-50 text-secondary-700',
    success: 'bg-emerald-50 text-emerald-700',
  }[accent])

const ringFocus = (accent: Accent) =>
  ({
    primary: 'focus-visible:ring-primary-400/50',
    secondary: 'focus-visible:ring-secondary-400/50',
    success: 'focus-visible:ring-emerald-400/50',
  }[accent])

// =========================================
//  Tile Variants
// =========================================

const HalfCard: React.FC<{ meta: TileMeta }> = ({ meta }) => {
  const Icon = meta.icon
  return (
    <Link
      href={meta.href}
      className={cn('block rounded-3xl outline-none focus-visible:ring-2', ringFocus(meta.accent))}
      aria-label={meta.title}
      prefetch
    >
      <Card className="rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={cn('h-12 w-12 rounded-2xl grid place-items-center shrink-0', iconWrap(meta.accent))}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">{meta.title}</h3>
                {meta.live && (
                  <span className="relative inline-flex h-3 w-3" aria-label="حي"><span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-red-400" /><span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" /></span>
                )}
              </div>
              <p className="mt-1 text-gray-600 dark:text-neutral-300 leading-relaxed">{meta.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

const WideIndicators: React.FC<{ meta: TileMeta }> = ({ meta }) => {
  const Icon = meta.icon
  const discount = meta.oldPrice && meta.price ? Math.round(((meta.oldPrice - meta.price) / meta.oldPrice) * 100) : null
  return (
    <Link
      href={meta.href}
      className={cn('block rounded-3xl outline-none focus-visible:ring-2', ringFocus(meta.accent))}
      aria-label={meta.title}
      prefetch
    >
      <Card className="rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start gap-4">
            <div className={cn('h-12 w-12 rounded-2xl grid place-items-center shrink-0', iconWrap(meta.accent))}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">{meta.title}</h3>
                {discount !== null && (
                  <Badge className="bg-secondary-100 text-secondary-700 border-none">-{discount}%</Badge>
                )}
              </div>
              <p className="mt-1 text-gray-600 dark:text-neutral-300 leading-relaxed">{meta.description}</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 items-end gap-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">اشتراكك الحالي:</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-neutral-100">مدى الحياة</p>
                </div>
                <div className="sm:text-right">
                  {meta.price && (
                    <div className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">${meta.price}</div>
                  )}
                  {meta.oldPrice && (
                    <div className="text-sm text-gray-400 dark:text-neutral-500 line-through">${meta.oldPrice}</div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Button className="rounded-2xl bg-primary-600 hover:bg-primary-700 text-white">
                  تفاصيل المؤشرات
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

const WideConsultations: React.FC<{ meta: TileMeta }> = ({ meta }) => {
  const Icon = meta.icon
  return (
    <Link
      href={meta.href}
      className={cn('block rounded-3xl outline-none focus-visible:ring-2', ringFocus(meta.accent))}
      aria-label={meta.title}
      prefetch
    >
      <Card className="group rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl grid place-items-center shrink-0 bg-emerald-50 text-emerald-700">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">{meta.title}</h3>
                {meta.eyebrow && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-none">{meta.eyebrow}</Badge>
                )}
              </div>
              <p className="mt-1 text-gray-600 dark:text-neutral-300 leading-relaxed">{meta.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


// =========================================
//  Page
// =========================================

export default function ShopHome() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return TILES
    return TILES.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Search */}
        <section className="pt-20 mb-4" aria-label="بحث عن الخدمات">
          <div ref={wrapRef} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="search"
              placeholder="ابحث… (مثال: Signals)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              className={cn(
                'block w-full pl-10 pr-4 py-3 rounded-2xl',
                'bg-white border border-gray-200 shadow-sm',
                'text-gray-900 placeholder:text-gray-400 focus:outline-none',
                'focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400',
                'dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-100'
              )}
              aria-label="ابحث في خدمات إكسادو"
              aria-expanded={open}
            />
          </div>
          
        </section>

        {/* Hero — Academy */}
        <Tile className="col-span-12" delay={0.02}>
          <AcademyHeroCard courses={26} tracks={7} freeCount={4} />
        </Tile>

        {/* Grid */}
        <section id="services-grid" className="grid grid-cols-12 gap-4 sm:gap-5 mt-4" aria-label="قائمة الخدمات">
          {filtered.map((meta, i) => {
            const cols = meta.variant === 'half' ? 'col-span-12 sm:col-span-6' : 'col-span-12'
            return (
              <Tile key={meta.key} className={cols} delay={0.04 + i * 0.02}>
                {meta.variant === 'half' && <HalfCard meta={meta} />}
                {meta.variant === 'wide' && (meta.key === 'indicators' ? <WideIndicators meta={meta} /> : <WideConsultations meta={meta} />)}
              </Tile>
            )
          })}

          {filtered.length === 0 && (
            <div className="col-span-12 text-center py-16">
              <p className="text-gray-600 dark:text-neutral-400">لا توجد نتائج مطابقة. جرّب كلمة أخرى.</p>
            </div>
          )}
        </section>

        {/* Auth Prompt */}

        <div className="max-w-7xl mx-auto mt-8">
          <AuthPrompt />
        </div>
      </main>
    </div>
  )
}
