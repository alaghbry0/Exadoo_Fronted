// src/components/miniapp/ConsultationsSection.tsx
'use client'

import { CalendarRange, Clock, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { SectionCard } from './SectionCard'
import { coerceDescription, coerceTitle, formatPrice, formatTimeRange } from './utils'
import type { MiniAppConsultation } from '@/hooks/useMiniAppServices'

interface ConsultationsSectionProps {
  consultations?: MiniAppConsultation[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
}

function renderSlots(consultation: MiniAppConsultation) {
  const slots = (consultation.next_slots ?? consultation.slots ?? []).slice(0, 3)
  if (!slots.length) {
    return <p className="text-sm text-slate-600">لا توجد مواعيد متاحة حاليًا. يرجى عرض جميع المواعيد.</p>
  }

  return (
    <ul className="space-y-2 text-sm text-slate-700">
      {slots.map((slot, index) => {
        const timeRange = formatTimeRange(slot.start ?? slot.start_time ?? null, slot.end ?? slot.end_time ?? null)
        return (
          <li key={`${slot.id ?? index}-${slot.start ?? slot.start_time ?? index}`} className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary-500" />
            <span>{timeRange ?? slot.label ?? 'موعد متاح'}</span>
            {slot.status ? (
              <Badge variant="outline" className="text-xs capitalize">
                {slot.status}
              </Badge>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function ConsultationsSection({ consultations, isLoading, error, onRetry }: ConsultationsSectionProps) {
  if (isLoading) {
    return (
      <SectionCard title="جلسات الاستشارة" description="تعرف على المواعيد المتاحة للخبراء.">
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-slate-200/70 p-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    )
  }

  if (error) {
    return (
      <SectionCard
        title="جلسات الاستشارة"
        description="حدث خطأ أثناء تحميل المواعيد."
        action={
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCcw className="ml-2 h-4 w-4" />إعادة المحاولة
          </Button>
        }
      >
        <p className="text-sm text-slate-600">يرجى المحاولة مرة أخرى أو التواصل مع الدعم.</p>
      </SectionCard>
    )
  }

  if (!consultations?.length) {
    return (
      <SectionCard
        title="جلسات الاستشارة"
        description="انطلق مع نخبة الخبراء لدينا."
        action={
          <Button variant="secondary" size="sm" className="font-semibold">
            عرض جميع المواعيد
          </Button>
        }
      >
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-100/60 p-6 text-center text-sm text-slate-600">
          <CalendarRange className="mx-auto mb-2 h-6 w-6 text-primary-500" />
          <p>سنقوم بإضافة مواعيد جديدة قريبًا.</p>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="جلسات الاستشارة"
      description="احجز جلسة مع أحد مستشارينا وحدد الموعد الأنسب لك."
      action={
        <Button variant="secondary" size="sm" className="font-semibold">
          عرض جميع المواعيد
        </Button>
      }
    >
      <div className="space-y-4">
        {consultations.map((consultation, index) => {
          const title = coerceTitle(consultation, `جلسة استشارية ${index + 1}`)
          const description =
            coerceDescription(consultation.description ?? consultation.summary) ?? 'استكشف خبرات مستشارينا في جلسة مخصصة لك.'
          const price = formatPrice(consultation.price ?? consultation.amount, consultation.currency)

          return (
            <div key={`${consultation.id ?? index}-${title}`} className="rounded-xl border border-slate-200/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-600">{description}</p>
                </div>
                {price ? <span className="text-base font-semibold text-primary-600">{price}</span> : null}
              </div>
              <Separator className="my-3" />
              {renderSlots(consultation)}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
