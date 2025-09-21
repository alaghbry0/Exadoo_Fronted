// src/components/miniapp/SignalsSection.tsx
'use client'

import { RadioTower, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionCard } from './SectionCard'
import { coerceDescription, coerceTitle, formatDate, formatPrice } from './utils'
import type { MiniAppSignalPack } from '@/hooks/useMiniAppServices'

interface SignalsSectionProps {
  signals?: MiniAppSignalPack[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
}

function getDuration(signals: MiniAppSignalPack) {
  if (typeof signals.duration_days !== 'undefined') {
    const days = Number(signals.duration_days)
    if (!Number.isNaN(days) && days > 0) {
      return `${days} يوم` + (days > 10 ? 'اً' : '')
    }
  }
  if (typeof signals.duration === 'string' && signals.duration.trim()) {
    return signals.duration
  }
  return 'مدة مرنة'
}

export function SignalsSection({ signals, isLoading, error, onRetry }: SignalsSectionProps) {
  if (isLoading) {
    return (
      <SectionCard title="إشارات التداول" description="تابع أحدث باقات الإشارات.">
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
        title="إشارات التداول"
        description="تعذر تحميل باقات الإشارات."
        action={
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCcw className="ml-2 h-4 w-4" />إعادة المحاولة
          </Button>
        }
      >
        <p className="text-sm text-slate-600">تحقق من الشبكة أو حاول مرة أخرى خلال دقائق.</p>
      </SectionCard>
    )
  }

  if (!signals?.length) {
    return (
      <SectionCard
        title="إشارات التداول"
        description="اشترك في إشارات دقيقة لتعزيز قراراتك."
        action={
          <Button variant="secondary" size="sm" className="font-semibold">
            استعرض الباقات
          </Button>
        }
      >
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-100/60 p-5 text-center text-sm text-slate-600">
          لا توجد باقات متاحة في الوقت الحالي.
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="إشارات التداول"
      description="احصل على إشارات مدروسة مع متابعة انتهاء الاشتراك."
      action={
        <Button variant="secondary" size="sm" className="font-semibold">
          إدارة الإشارات
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {signals.map((pack, index) => {
          const title = coerceTitle(pack, `باقة إشارات ${index + 1}`)
          const description =
            coerceDescription(pack.description ?? pack.summary) ?? 'باقات احترافية لمتابعة الأسواق خطوة بخطوة.'
          const price = formatPrice(pack.price ?? pack.amount, pack.currency)
          const duration = getDuration(pack)
          const expiry = formatDate(pack.subscription?.expiry_date ?? pack.subscription?.expires_at ?? null)

          return (
            <div key={`${pack.id ?? pack.pack_id ?? index}-${title}`} className="rounded-xl border border-slate-200/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <RadioTower className="h-4 w-4 text-primary-500" />
                <span>{title}</span>
              </div>
              <p className="text-sm text-slate-600">{description}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                {price ? <span className="font-semibold text-primary-600">{price}</span> : <span>سعر متغير</span>}
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">{duration}</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                تاريخ انتهاء اشتراكك: {expiry ?? 'غير محدد'}
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
