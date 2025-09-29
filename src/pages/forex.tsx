'use client'
import React, { useMemo } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTelegram } from '@/context/TelegramContext'
import { useForexData } from '@/services/forex'
import type { ForexData, MyForexSubscription, ForexSubscriptionPlan } from '@/pages/api/forex'

const fmtUSD = (n?: string | number | null) => {
  if (n == null) return ''
  const v = Number(n)
  if (!Number.isFinite(v)) return String(n)
  return `$${v.toFixed(0)}`
}

const PlanFeature: React.FC<React.PropsWithChildren> = ({ children }) => (
  <li className="flex items-center">
    <svg className="w-5 h-5 mr-2 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
    <span>{children}</span>
  </li>
)

/* ====== My subscription ====== */
const MySubscriptionCard: React.FC<{ sub: MyForexSubscription }> = ({ sub }) => {
  const since = useMemo(() => {
    const ts = Number(sub.date_added)
    return Number.isFinite(ts) ? new Date(ts * 1000).toLocaleDateString() : '—'
  }, [sub.date_added])

  let addresses: string[] = []
  try {
    const parsed = JSON.parse(sub.forex_addresses)
    if (Array.isArray(parsed)) addresses = parsed.map(String)
  } catch {}

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
            {addresses.length > 0 && (
              <p>
                <strong className="font-semibold">Forex Addresses: </strong>
                <span className="font-mono bg-white/20 rounded px-2 py-1 text-xs">{addresses.join(', ')}</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ====== Plan card ====== */
const PlanCard: React.FC<{ plan: ForexSubscriptionPlan }> = ({ plan }) => {
  const isLifetime = plan.duration_in_months === '0' || plan.name.toLowerCase().includes('lifetime')
  const isFree = plan.price === '0'
  const hasDiscount = !!plan.discounted_price && plan.discounted_price !== plan.price
  const priceNow = isFree ? null : (hasDiscount ? plan.discounted_price : plan.price)

  return (
    <Card
      className={[
        'relative rounded-3xl transition-all duration-200 h-full',
        'bg-white dark:bg-neutral-900',
        isLifetime
          ? 'border border-primary-300/80 dark:border-primary-800 ring-2 ring-primary-400/40 shadow-xl'
          : 'border border-gray-200 dark:border-neutral-800 hover:shadow-lg',
      ].join(' ')}
    >
      <CardContent className="p-6 md:p-8 text-center flex flex-col">
        {isLifetime && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="rounded-full px-3 py-1 bg-primary-600 text-white border-0">أفضل قيمة</Badge>
          </div>
        )}

        <h4 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-neutral-50">{plan.name}</h4>

        <div className="my-5 md:my-6 min-h-[70px] flex flex-col items-center justify-center gap-1">
          {isFree ? (
            <span className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white">Free</span>
          ) : (
            <>
              {hasDiscount && <span className="text-lg md:text-xl text-red-500/90 line-through">{fmtUSD(plan.price)}</span>}
              <span className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                {fmtUSD(priceNow)}
              </span>
            </>
          )}
        </div>

        <p className="font-semibold text-primary-600 dark:text-primary-400 mb-6 h-10 flex items-center justify-center text-center">
          {isFree
            ? 'ابدأ النسخة التجريبية'
            : plan.duration_in_months === '0'
              ? 'دفعة واحدة — وصول مدى الحياة'
              : `دفعة لمرة واحدة لمدة ${plan.duration_in_months} شهر`}
        </p>

        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 text-right mb-8 w-full">
          <PlanFeature>{isFree ? 'مزايا محدودة' : 'وصول لكل اللوحات'}</PlanFeature>
          <PlanFeature>تنفيذ الصفقات بنقرة واحدة</PlanFeature>
          <PlanFeature>دعم مميز 24/7</PlanFeature>
          <PlanFeature>متوافق مع MT4 & MT5</PlanFeature>
        </ul>

        <Button className={`mt-auto w-full rounded-2xl ${isFree ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary-600 hover:bg-primary-700'} text-white`}>
          {isFree ? 'ابدأ التجربة' : 'اشترك الآن'}
        </Button>
      </CardContent>
    </Card>
  )
}

/* ====== Page ====== */
export default function ForexPage() {
  const router = useRouter()
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useForexData(telegramId || undefined)

  const plans = data?.subscriptions ?? []
  // ابراز خطة مدى الحياة أولاً
  const lifetime = plans.find(p => p.duration_in_months === '0' || p.name.toLowerCase().includes('lifetime'))
  const others = plans.filter(p => p !== lifetime)

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Header */}
        <section className="pt-20">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
            aria-label="رجوع"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m11 17l-5-5l5-5M6 12h12"/></svg>
            رجوع
          </button>

          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold">Utility Trading Panels</h1>
          <p className="mt-2 text-gray-600 dark:text-neutral-300">
            لوحة قوية لإدارة صفقاتك بسرعة ومرونة مع تنفيذ بنقرة واحدة.
          </p>
        </section>

        {/* Loading / Error */}
        {isLoading && <div className="mt-10 text-center text-gray-500">...جاري التحميل</div>}
        {isError && <div className="mt-10 text-center text-red-500">تعذر تحميل البيانات: {(error as Error)?.message}</div>}

        {/* Content */}
        {!isLoading && !isError && data && (
          <div className="space-y-10 md:space-y-14 mt-8">
            {data.my_subscription && (
              <section aria-label="اشتراكي الحالي">
                <MySubscriptionCard sub={data.my_subscription as MyForexSubscription} />
              </section>
            )}

            <section aria-label="خطط الاشتراك">
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                {data.my_subscription ? 'طوِّر خطتك' : 'اختر خطتك'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
                {lifetime && <PlanCard plan={lifetime} />}
                {others.map(p => <PlanCard key={p.id} plan={p} />)}
                {!plans.length && (
                  <Card className="rounded-3xl border-dashed">
                    <CardContent className="p-8 text-center text-gray-500">لا توجد خطط متاحة حاليًا.</CardContent>
                  </Card>
                )}
              </div>
            </section>

            <section aria-label="ملاحظات">
              <Card className="rounded-3xl">
                <CardContent className="p-5 text-sm text-gray-600 dark:text-neutral-300 leading-relaxed">
                  بعد الاشتراك ستُفعّل اللوحات لحساباتك (MT4/MT5) تلقائيًا خلال فترة قصيرة. تأكد من تحديث معرفاتك عند الحاجة.
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
