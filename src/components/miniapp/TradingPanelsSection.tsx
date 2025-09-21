// src/components/miniapp/TradingPanelsSection.tsx
'use client'

import { Cpu, RefreshCcw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionCard } from './SectionCard'
import { coerceDescription, coerceTitle, extractServiceLabels, formatDate, formatPrice } from './utils'
import type { MiniAppTradingPanel } from '@/hooks/useMiniAppServices'

interface TradingPanelsSectionProps {
  panels?: MiniAppTradingPanel[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
}

export function TradingPanelsSection({ panels, isLoading, error, onRetry }: TradingPanelsSectionProps) {
  if (isLoading) {
    return (
      <SectionCard title="منصات التداول الذكية" description="أدوات التداول الآلي وإدارتها.">
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-slate-200/70 p-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-4 h-4 w-1/3" />
            </div>
          ))}
        </div>
      </SectionCard>
    )
  }

  if (error) {
    return (
      <SectionCard
        title="منصات التداول الذكية"
        description="حدث خطأ أثناء تحميل بيانات المنصات."
        action={
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCcw className="ml-2 h-4 w-4" />إعادة المحاولة
          </Button>
        }
      >
        <p className="text-sm text-slate-600">تحقق من الاتصال أو حاول مرة أخرى لاحقًا.</p>
      </SectionCard>
    )
  }

  if (!panels?.length) {
    return (
      <SectionCard
        title="منصات التداول الذكية"
        description="تابع اشتراكاتك في لوحات وإكسبرتات التداول."
        action={
          <Button variant="secondary" size="sm" className="font-semibold">
            استعرض المنصات
          </Button>
        }
      >
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-100/60 p-5 text-center text-sm text-slate-600">
          لا توجد اشتراكات مفعلة حاليًا.
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="منصات التداول الذكية"
      description="تعرف على حال اشتراكاتك الحالية وخطط الأسعار."
      action={
        <Button variant="secondary" size="sm" className="font-semibold">
          إدارة الاشتراكات
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {panels.map((panel, index) => {
          const title = coerceTitle(panel, `منصة ${index + 1}`)
          const description =
            coerceDescription(panel.description ?? panel.summary) ?? 'أتمت تداولك مع أدوات موثوقة وسهلة الاستخدام.'
          const price = formatPrice(panel.price ?? panel.amount, panel.currency)
          const status = panel.subscription?.status ?? panel.status
          const expiry = formatDate(panel.subscription?.expiry_date ?? panel.subscription?.expires_at ?? panel.expiry_date ?? null)
          const labels = extractServiceLabels(panel)

          return (
            <div key={`${panel.id ?? panel.plan_id ?? index}-${title}`} className="rounded-xl border border-slate-200/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Cpu className="h-4 w-4 text-primary-500" />
                <span>{title}</span>
              </div>
              <p className="text-sm text-slate-600">{description}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                {price ? <span className="font-semibold text-primary-600">{price}</span> : <span>سعر مخصص</span>}
                {status ? (
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">{status}</span>
                ) : null}
              </div>
              {labels.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>تاريخ الانتهاء: {expiry ?? 'غير متوفر'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
