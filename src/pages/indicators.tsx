'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTelegram } from '@/context/TelegramContext'
import { useIndicatorsData } from '@/services/indicators'
import type { IndicatorsData } from '@/pages/api/indicators'

/* ===========================
   Helpers
=========================== */
const fmtUSD = (n?: string | number) => {
  if (n == null) return ''
  const v = Number(n)
  if (!Number.isFinite(v)) return String(n)
  return `$${v.toFixed(0)}`
}

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center">
    <svg className="w-5 h-5 mr-2 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span>{children}</span>
  </li>
)

/* ===========================
   Cards
=========================== */
const MySubscriptionCard: React.FC<{ sub: NonNullable<IndicatorsData['my_subscription']> }> = ({ sub }) => {
  const since = useMemo(() => {
    const ts = Number(sub.date_added)
    return Number.isFinite(ts) ? new Date(ts * 1000).toLocaleDateString() : '—'
  }, [sub.date_added])

  const statusLabel = sub.status === 'lifetime' ? 'مدى الحياة' : sub.status

  return (
    <Card className="relative rounded-3xl overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
      <CardContent className="p-6 md:p-8">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full opacity-40" />
        <div className="absolute bottom-5 -left-12 w-24 h-24 bg-white/10 rounded-full opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm/6 opacity-80">خُطتك الحالية</p>
              <h3 className="text-2xl md:text-3xl font-bold capitalize">{statusLabel}</h3>
            </div>
          </div>

          <div className="mt-6 text-sm opacity-95 space-y-2 border-t border-white/20 pt-4">
            <p>
              <strong className="font-semibold">الحالة: </strong>
              <span className="font-semibold py-1 px-2.5 bg-white/20 rounded-md text-xs align-middle">مفعّل</span>
            </p>
            <p>
              <strong className="font-semibold">منذ: </strong>
              <span>{since}</span>
            </p>
            {sub.trading_view_id && (
              <p>
                <strong className="font-semibold">TradingView ID: </strong>
                <span className="font-mono">{sub.trading_view_id}</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type Plan = NonNullable<IndicatorsData['subscriptions']>[number]

const PlanCard: React.FC<{ plan: Plan; highlight?: boolean }> = ({ plan, highlight }) => {
  const isLifetime = plan.duration_in_months === '0'
  const hasDiscount =
    plan.discounted_price && plan.discounted_price !== plan.price

  const priceNow = hasDiscount ? plan.discounted_price : plan.price

  return (
    <Card
      className={[
        'relative rounded-3xl transition-all duration-200',
        'bg-white dark:bg-neutral-900',
        highlight
          ? 'border border-primary-300/80 dark:border-primary-800 ring-2 ring-primary-400/40 shadow-xl'
          : 'border border-gray-200 dark:border-neutral-800 hover:shadow-lg',
      ].join(' ')}
    >
      <CardContent className="p-6 md:p-8 text-center">
        {highlight && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="rounded-full px-3 py-1 bg-primary-600 text-white border-0">
              أفضل قيمة
            </Badge>
          </div>
        )}

        <h4 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-neutral-50">{plan.name}</h4>

        <div className="my-5 md:my-6 flex items-end justify-center gap-3">
          {hasDiscount && (
            <span className="text-lg md:text-xl text-red-500/90 line-through">{fmtUSD(plan.price)}</span>
          )}
          <span className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            {fmtUSD(priceNow)}
          </span>
        </div>

        <p className="font-semibold text-primary-600 dark:text-primary-400 mb-6 h-10 flex items-center justify-center">
          {isLifetime ? 'دفعة واحدة — وصول مدى الحياة' : `فاتورة لمرة واحدة لمدة ${plan.duration_in_months} شهر`}
        </p>

        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 text-right max-w-xs mx-auto">
          <PlanFeature>وصول لكل المؤشرات</PlanFeature>
          <PlanFeature>تحديثات مستقبلية مجانًا</PlanFeature>
          <PlanFeature>دعم مميز 24/7</PlanFeature>
          <PlanFeature>تكامل TradingView</PlanFeature>
        </ul>

        <Button className="mt-8 w-full rounded-2xl bg-primary-600 hover:bg-primary-700 text-white">
          اشترك الآن
        </Button>
      </CardContent>
    </Card>
  )
}

/* ===========================
   Page
=========================== */
function IndicatorsPage() {
  const router = useRouter()
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useIndicatorsData(telegramId || undefined)

  const lifetimePlan = data?.subscriptions?.find(p => p.duration_in_months === '0')
  const otherPlans = (data?.subscriptions ?? []).filter(p => p.duration_in_months !== '0')

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pb-24">
        {/* Header */}
        <section className="pt-20">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
              aria-label="رجوع"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m11 17l-5-5l5-5M6 12h12"/></svg>
              رجوع
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold">مؤشرات التداول</h1>
          <p className="mt-2 text-gray-600 dark:text-neutral-300">
            فعّل وصولك لجميع مؤشراتنا الاحترافية باشتراك واحد — تحديثات مستقبلية ودعم دائم.
          </p>
        </section>

        {/* Loading / Error */}
        {isLoading && (
          <div className="mt-10 text-center text-gray-500">...جاري التحميل</div>
        )}
        {isError && (
          <div className="mt-10 text-center text-red-500">
            تعذر تحميل البيانات: {(error as Error)?.message}
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && data && (
          <div className="space-y-10 md:space-y-14 mt-8">
            {data.my_subscription && (
              <section aria-label="اشتراكي الحالي">
                <MySubscriptionCard sub={data.my_subscription} />
              </section>
            )}

            <section aria-label="خطط الاشتراك">
              <h2 className="text-xl md:text-2xl font-bold mb-4">اختر خطتك</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
                {lifetimePlan && <PlanCard plan={lifetimePlan} highlight />}
                {otherPlans.map(p => (
                  <PlanCard key={p.id} plan={p} />
                ))}
                {!lifetimePlan && otherPlans.length === 0 && (
                  <Card className="rounded-3xl border-dashed">
                    <CardContent className="p-8 text-center text-gray-500">
                      لا توجد خطط متاحة حاليًا.
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            <section aria-label="تلميحات">
              <Card className="rounded-3xl">
                <CardContent className="p-5 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
                  بعد الاشتراك سيُفعّل دخولك تلقائيًا إلى المؤشرات عبر TradingView خلال فترة قصيرة.
                  احتفظ بـ TradingView ID الخاص بك محدثًا.
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default IndicatorsPage
