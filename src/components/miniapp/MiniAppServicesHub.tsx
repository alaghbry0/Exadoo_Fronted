// src/components/miniapp/MiniAppServicesHub.tsx
'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  MiniAppEnvError,
  MiniAppFetchError,
  MiniAppValidationError,
  useMiniAppServices,
} from '@/hooks/useMiniAppServices'
import { DeveloperBanner } from './DeveloperBanner'
import { ConsultationsSection } from './ConsultationsSection'
import { CoursesSection } from './CoursesSection'
import { TradingPanelsSection } from './TradingPanelsSection'
import { SignalsSection } from './SignalsSection'
import { IndicatorsSection } from './IndicatorsSection'

interface MiniAppServicesHubProps {
  telegramId?: string | null
  isLinked: boolean
}

export function MiniAppServicesHub({ telegramId, isLinked }: MiniAppServicesHubProps) {
  const [expanded, setExpanded] = useState(false)
  const services = useMiniAppServices({ telegramId, isLinked, enabled: expanded })

  const {
    aggregator,
    consultancy,
    academy,
    enrollments,
    tradingPanels,
    signals,
    indicators,
    validationIssues,
    resolvedTelegramId,
    isTestMode,
  } = services

  const counts = useMemo(() => {
    const consultationsCount = (consultancy.data ?? aggregator.data?.consultancy ?? []).length
    const coursesCount = (academy.data ?? aggregator.data?.academy ?? []).length
    const signalsCount = (signals.data ?? aggregator.data?.signals ?? []).length
    const indicatorsCount = (indicators.data ?? aggregator.data?.buy_indicators ?? []).length
    return { consultationsCount, coursesCount, signalsCount, indicatorsCount }
  }, [aggregator.data, consultancy.data, academy.data, signals.data, indicators.data])

  if (!services.featureEnabled) {
    return null
  }

  if (!isLinked) {
    return null
  }

  const hasLoadedSomething =
    Boolean(consultancy.data?.length) ||
    Boolean(academy.data?.length) ||
    Boolean(signals.data?.length) ||
    Boolean(indicators.data?.length) ||
    Boolean(tradingPanels.data?.length)

  const aggregatedError = aggregator.error
  const envError = aggregatedError instanceof MiniAppEnvError ? aggregatedError : undefined

  return (
    <section className="mx-auto mb-12 max-w-6xl">
      <div className="rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary-600">
              <Rocket className="h-4 w-4" />
              <span>خدمات جديدة متاحة</span>
              {isTestMode ? (
                <Badge variant="outline" className="border-dashed border-primary-300 text-xs font-semibold text-primary-700">
                  Test Mode
                </Badge>
              ) : null}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">استكشف خدمات الإكسادو المتكاملة</h2>
            <p className="max-w-2xl text-sm text-slate-600">
              يمكن للعملاء المرتبطين استعراض الدورات، الاستشارات، الإشارات، والمؤشرات في مكان واحد. كل البيانات يتم تحميلها
              مباشرة من المنصة الرسمية.
            </p>
            {expanded && resolvedTelegramId ? (
              <p className="text-xs text-slate-500">يتم عرض البيانات لمعرف تيليجرام: {resolvedTelegramId}</p>
            ) : null}
            {!expanded && hasLoadedSomething ? (
              <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-600">
                <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                  استشارات: {counts.consultationsCount}
                </Badge>
                <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                  دورات: {counts.coursesCount}
                </Badge>
                <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                  إشارات: {counts.signalsCount}
                </Badge>
                <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                  مؤشرات: {counts.indicatorsCount}
                </Badge>
              </div>
            ) : null}
          </div>
          <Button
            variant="secondary"
            className="mt-1 flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2 text-white shadow"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'إخفاء الخدمات' : 'استكشف الخدمات'}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {envError ? (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p>
              لا يمكن تحميل الخدمات لعدم ضبط المتغيرات NEXT_PUBLIC_APPLICATION_URL و NEXT_PUBLIC_APPLICATION_SECRET. يرجى إضافتها ثم
              إعادة المحاولة.
            </p>
          </div>
        ) : null}
      </div>

      {expanded ? (
        <div className="mt-6 space-y-6">
          <DeveloperBanner issues={validationIssues} />

          {!resolvedTelegramId ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              لم يتم العثور على معرف تيليجرام صالح. تأكد من تسجيل الدخول أو تفعيل وضع الاختبار.
            </div>
          ) : null}

          {aggregatedError && !envError && !(aggregatedError instanceof MiniAppValidationError) ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {aggregatedError instanceof MiniAppFetchError
                ? 'تعذر الوصول إلى الخادم، يرجى إعادة المحاولة.'
                : 'حدث خطأ غير متوقع عند تحميل الخدمات.'}
            </div>
          ) : null}

          <div className={cn('grid gap-6', resolvedTelegramId ? '' : 'opacity-50 pointer-events-none')}>
            <ConsultationsSection
              consultations={consultancy.data}
              isLoading={consultancy.isLoading || aggregator.isLoading}
              error={consultancy.error}
              onRetry={() => consultancy.refetch()}
            />
            <CoursesSection
              courses={academy.data}
              enrollments={enrollments.data}
              isLoading={academy.isLoading || enrollments.isLoading || aggregator.isLoading}
              error={academy.error || enrollments.error}
              onRetry={() => {
                academy.refetch()
                enrollments.refetch()
              }}
            />
            <TradingPanelsSection
              panels={tradingPanels.data}
              isLoading={tradingPanels.isLoading || aggregator.isLoading}
              error={tradingPanels.error}
              onRetry={() => tradingPanels.refetch()}
            />
            <SignalsSection
              signals={signals.data}
              isLoading={signals.isLoading || aggregator.isLoading}
              error={signals.error}
              onRetry={() => signals.refetch()}
            />
            <IndicatorsSection
              indicators={indicators.data}
              isLoading={indicators.isLoading || aggregator.isLoading}
              error={indicators.error}
              onRetry={() => indicators.refetch()}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
