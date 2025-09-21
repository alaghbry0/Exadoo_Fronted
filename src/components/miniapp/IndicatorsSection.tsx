// src/components/miniapp/IndicatorsSection.tsx
'use client'

import { LineChart, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionCard } from './SectionCard'
import { coerceDescription, coerceTitle, extractServiceLabels, formatDate, formatPrice } from './utils'
import type { MiniAppIndicator } from '@/hooks/useMiniAppServices'

interface IndicatorsSectionProps {
  indicators?: MiniAppIndicator[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
}

function getDuration(indicator: MiniAppIndicator) {
  if (typeof indicator.duration_days !== 'undefined') {
    const days = Number(indicator.duration_days)
    if (!Number.isNaN(days) && days > 0) {
      return `${days} يوم` + (days > 10 ? 'اً' : '')
    }
  }
  if (typeof indicator.duration === 'string' && indicator.duration.trim()) {
    return indicator.duration
  }
  return 'وصول فوري'
}

export function IndicatorsSection({ indicators, isLoading, error, onRetry }: IndicatorsSectionProps) {
  if (isLoading) {
    return (
      <SectionCard title="المؤشرات الذكية" description="أدوات تحليل متقدمة لأسواقك.">
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
        title="المؤشرات الذكية"
        description="حدث خطأ أثناء تحميل المؤشرات."
        action={
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCcw className="ml-2 h-4 w-4" />إعادة المحاولة
          </Button>
        }
      >
        <p className="text-sm text-slate-600">حاول التحديث أو تواصل مع فريق الدعم.</p>
      </SectionCard>
    )
  }

  if (!indicators?.length) {
    return (
      <SectionCard
        title="المؤشرات الذكية"
        description="تابع أحدث مؤشرات التحليل الفني."
        action={
          <Button variant="secondary" size="sm" className="font-semibold">
            عرض المؤشرات
          </Button>
        }
      >
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-100/60 p-5 text-center text-sm text-slate-600">
          لم يتم العثور على مؤشرات حالية.
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="المؤشرات الذكية"
      description="اكتشف أسعار المؤشرات وفترات الوصول المتاحة."
      action={
        <Button variant="secondary" size="sm" className="font-semibold">
          إدارة المؤشرات
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {indicators.map((indicator, index) => {
          const title = coerceTitle(indicator, `مؤشر ${index + 1}`)
          const description =
            coerceDescription(indicator.description ?? indicator.summary) ?? 'تحليل متقدم ومؤشرات دقيقة تدعم قراراتك.'
          const price = formatPrice(indicator.price ?? indicator.amount, indicator.currency)
          const duration = getDuration(indicator)
          const expiry = formatDate(indicator.access_expires_at ?? indicator.expiry_date ?? indicator.end_date ?? null)
          const labels = extractServiceLabels(indicator)
          const status = indicator.status

          return (
            <div key={`${indicator.id ?? indicator.indicator_id ?? index}-${title}`} className="rounded-xl border border-slate-200/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <LineChart className="h-4 w-4 text-primary-500" />
                <span>{title}</span>
              </div>
              <p className="text-sm text-slate-600">{description}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                {price ? <span className="font-semibold text-primary-600">{price}</span> : <span>سعر متغير</span>}
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">{duration}</span>
              </div>
              {(status || labels.length) ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  {status ? (
                    <span className="rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 font-semibold text-primary-700">
                      {status}
                    </span>
                  ) : null}
                  {labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-2 text-xs text-slate-500">تاريخ انتهاء الوصول: {expiry ?? 'غير محدد'}</div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
