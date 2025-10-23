// src/components/shared/ServiceCardV2.tsx
'use client'

import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { ReactNode } from 'react'
import SmartImage from '@/shared/components/common/SmartImage'

type Accent = 'primary' | 'secondary' | 'success'
type Variant = 'minimal' | 'glass' | 'dark' | 'compact' | 'split'

const cardVariants = cva(
  'group block overflow-hidden rounded-3xl transition-all duration-300 focus:outline-none',
  {
    variants: {
      variant: {
        minimal:
          'bg-white border border-gray-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-primary/30 dark:bg-neutral-900 dark:border-neutral-800',
        glass:
          'backdrop-blur-xl bg-white/70 border border-white/40 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)] focus-visible:ring-4 focus-visible:ring-primary/40 dark:bg-neutral-900/50 dark:border-white/10',
        dark:
          'text-white bg-gradient-to-br from-[#0B1220] via-[#0E1A2F] to-[#0B1220] hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-primary/30',
        compact:
          'bg-white border border-gray-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-4 focus-visible:ring-primary/30 rounded-2xl dark:bg-neutral-900 dark:border-neutral-800',
        split:
          'bg-white border border-gray-200 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-4 focus-visible:ring-primary/30 dark:bg-neutral-900 dark:border-neutral-800',
      },
      layout: {
        half: '',
        wide: '',
      },
    },
    defaultVariants: { variant: 'minimal', layout: 'half' },
  }
)

const iconVariants = cva('grid place-items-center shrink-0 rounded-2xl', {
  variants: {
    accent: {
      primary: 'bg-primary/10 text-primary',
      secondary: 'bg-secondary/10 text-secondary-700 dark:text-secondary-400',
      success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
    size: { md: 'h-12 w-12', lg: 'h-14 w-14' },
  },
  defaultVariants: { accent: 'primary', size: 'md' },
})

export interface ServiceCardV2Props
  extends VariantProps<typeof cardVariants>,
    VariantProps<typeof iconVariants> {
  title: string
  description?: string
  icon?: LucideIcon
  href: string
  accent?: Accent
  badge?: string
  ctaLabel?: string
  imageUrl?: string // يُستخدم في variant="split"
  stats?: Array<{ label: string; value: number | string; variant?: 'default' | 'success' }>
  rightSlot?: ReactNode // مساحة يمين للـ CTA أو السعر
  className?: string
  prefetch?: boolean
}

export function ServiceCardV2({
  title,
  description,
  icon: Icon,
  href,
  variant = 'minimal',
  layout = 'half',
  accent = 'primary',
  size = 'md',
  badge,
  ctaLabel = 'عرض التفاصيل',
  imageUrl,
  stats,
  rightSlot,
  className,
  prefetch,
}: ServiceCardV2Props) {
  const titleId = `${slugify(title)}-title`
  const descId = description ? `${slugify(title)}-desc` : undefined

  const Content = (
    <div className={cn(cardVariants({ variant, layout }), className)} aria-labelledby={titleId} aria-describedby={descId}>
      {/* خلفيات خفيفة لبعض الـ variants */}
      {variant === 'glass' && (
        <>
          <div className="pointer-events-none absolute -top-8 -right-8 h-56 w-56 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl dark:bg-fuchsia/20" />
        </>
      )}
      {variant === 'dark' && (
        <>
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
          <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
        </>
      )}

      {/* تخطيطات */}
      {variant === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] items-stretch">
          <div className="p-6 md:p-8">
            <HeaderBlock title={title} desc={description} icon={Icon} accent={accent} size={size ?? undefined} badge={badge} titleId={titleId} descId={descId} />
            {stats && <Chips stats={stats} className="mt-3" />}
            {rightSlot ? (
              <div className="mt-5">{rightSlot}</div>
            ) : (
              <CTA label={ctaLabel} className="mt-5" />
            )}
          </div>
          <div className="relative min-h-[180px] md:min-h-full bg-gradient-to-tr from-primary/10 to-fuchsia-500/10 dark:from-primary/20 dark:to-fuchsia-500/20">
            {imageUrl && (
              <>
                <SmartImage
                  alt=""
                  src={imageUrl}
                  fill
                  blurType="secondary"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  priority
                />
                <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white/80 to-transparent dark:from-neutral-900/80" />
              </>
            )}
          </div>
        </div>
      ) : (
        <div className={cn('relative p-5 md:p-6', variant === 'compact' && 'p-5')}>
          <div className={cn('flex items-start gap-4', layout === 'wide' ? 'sm:items-center sm:justify-between' : '')}>
            <div className="flex items-start gap-4">
              {Icon && (
                <div className={iconVariants({ accent, size })}>
                  <Icon className={cn(size === 'lg' ? 'h-7 w-7' : 'h-6 w-6')} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <TitleBlock title={title} badge={badge} titleId={titleId} />
                {description && (
                  <p id={descId} className={cn('mt-1 leading-relaxed', variant === 'dark' ? 'text-white/80' : 'text-gray-600 dark:text-neutral-300')}>
                    {description}
                  </p>
                )}
                {stats && <Chips stats={stats} className="mt-3" />}
              </div>
            </div>
            {layout === 'wide' && (
              <div className="mt-4 sm:mt-0 sm:mr-6 shrink-0">{rightSlot ? rightSlot : <CTA label={ctaLabel} tone={variant === 'dark' ? 'light' : 'primary'} />}</div>
            )}
          </div>
          {layout === 'half' && !rightSlot && (
            <CTAInline label={ctaLabel} variant={variant ?? 'minimal'} className="mt-4" />
          )}
        </div>
      )}
    </div>
  )

  return (
    <Link href={href} className="relative" prefetch={prefetch} aria-label={title}>
      {Content}
    </Link>
  )
}

function HeaderBlock({
  title,
  desc,
  icon: Icon,
  accent,
  size,
  badge,
  titleId,
  descId,
}: {
  title: string
  desc?: string
  icon?: LucideIcon
  accent?: Accent
  size?: 'md' | 'lg'
  badge?: string
  titleId: string
  descId?: string
}) {
  return (
    <div className="flex items-start gap-4">
      {Icon && (
        <div className={iconVariants({ accent, size })}>
          <Icon className={cn(size === 'lg' ? 'h-7 w-7' : 'h-6 w-6')} />
        </div>
      )}
      <div className="flex-1">
        <TitleBlock title={title} badge={badge} titleId={titleId} />
        {desc && <p id={descId} className="mt-2 text-gray-600 dark:text-gray-300">{desc}</p>}
      </div>
    </div>
  )
}

function TitleBlock({ title, badge, titleId }: { title: string; badge?: string; titleId: string }) {
  return (
    <div className="flex items-center gap-2">
      <h3 id={titleId} className="text-xl md:text-2xl font-bold text-gray-900 dark:text-neutral-100 truncate">
        {title}
      </h3>
      {badge && <span className="px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full whitespace-nowrap">{badge}</span>}
    </div>
  )
}

function CTA({ label, tone = 'primary', className }: { label: string; tone?: 'primary' | 'light'; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 group-hover:gap-3',
        tone === 'light' ? 'bg-white text-gray-900' : 'bg-primary text-white group-hover:bg-primary/90',
        className
      )}
      role="button"
      aria-hidden="true"
    >
      <span>{label}</span>
      <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
    </div>
  )
}

function CTAInline({ label, variant, className }: { label: string; variant: Variant; className?: string }) {
  const text = variant === 'dark' ? 'text-white' : 'text-primary-600 dark:text-primary-400'
  return (
    <div className={cn('text-sm font-semibold flex items-center gap-1 transition-all duration-200 group-hover:gap-2', text, className)}>
      {label}
      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
    </div>
  )
}

function Chips({ stats, className }: { stats: Array<{ label: string; value: number | string; variant?: 'default' | 'success' }>; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 text-xs', className)}>
      {stats.map((s, i) => (
        <span
          key={`${s.label}-${i}`}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium',
            s.variant === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-200'
          )}
        >
          <span className="opacity-80">{s.label}:</span>
          <span className="tabular-nums">{s.value}</span>
        </span>
      ))}
    </div>
  )
}

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}
