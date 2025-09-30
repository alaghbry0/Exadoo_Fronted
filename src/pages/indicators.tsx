'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import BackHeader from '@/components/BackHeader'
import AuthPrompt from '@/components/AuthFab'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useTelegram } from '@/context/TelegramContext'
import { useIndicatorsData } from '@/services/indicators'
import type { IndicatorsData } from '@/pages/api/indicators'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Award, Zap, Settings, HelpCircle } from 'lucide-react'

/* ===========================
   Helpers
=========================== */
const fmtUSD = (n?: string | number) => `$${Number(n || 0).toFixed(0)}`

/* ===========================
   Sub-Components (Updated)
=========================== */

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-3">
    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
    <span>{children}</span>
  </li>
)

type Plan = NonNullable<IndicatorsData['subscriptions']>[number]

const PlanCard: React.FC<{ plan: Plan; highlight?: boolean }> = ({ plan }) => {
  const isLifetime = plan.duration_in_months === '0'
  const hasDiscount = plan.discounted_price && plan.discounted_price !== plan.price
  const priceNow = hasDiscount ? plan.discounted_price : plan.price
  const ctaText = isLifetime ? 'احصل على وصول مدى الحياة' : `اشترك لمدة ${plan.duration_in_months} أشهر`

  return (
    <Card className={cn(
      'rounded-3xl transition-all duration-300 bg-white dark:bg-neutral-900 border dark:border-neutral-800',
      plan.is_featured === '1' ? 'shadow-2xl ring-2 ring-primary-500' : 'shadow-lg hover:shadow-xl'
    )}>
      <CardContent className="p-6 md:p-8 text-center flex flex-col h-full">
        {plan.is_featured === '1' && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <Badge className="rounded-full px-4 py-1.5 bg-primary-600 text-white border-2 border-white dark:border-neutral-900 text-sm">
              الأكثر شيوعًا
            </Badge>
          </div>
        )}
        <h4 className="text-2xl font-bold text-gray-900 dark:text-neutral-50">{plan.name}</h4>
        <div className="my-6 flex items-baseline justify-center gap-2">
          <span className="text-5xl font-extrabold text-gray-900 dark:text-white">{fmtUSD(priceNow)}</span>
          {hasDiscount && <span className="text-2xl text-gray-400 line-through">{fmtUSD(plan.price)}</span>}
        </div>
        <p className="font-semibold text-primary-600 dark:text-primary-400 mb-6">
          {isLifetime ? 'دفعة واحدة — وصول مدى الحياة' : `فاتورة لمرة واحدة`}
        </p>
        <div className="flex-grow">
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 text-right">
            <PlanFeature>وصول كامل لحزمة مؤشرات Exaado</PlanFeature>
            <PlanFeature>تحديثات مستقبلية مجانية ومستمرة</PlanFeature>
            <PlanFeature>تكامل سهل مع حساب TradingView</PlanFeature>
            <PlanFeature>دعم فني مخصص عبر تيليجرام</PlanFeature>
          </ul>
        </div>
        <Button size="lg" className="mt-8 w-full rounded-xl text-base font-bold">{ctaText}</Button>
      </CardContent>
    </Card>
  )
}

/* ===========================
   NEW: Conditional Views
=========================== */

// --- View for SUBSCRIBED Users ---
const SubscribedView: React.FC<{ sub: NonNullable<IndicatorsData['my_subscription']> }> = ({ sub }) => {
  const since = useMemo(() => new Date(Number(sub.date_added) * 1000).toLocaleDateString(), [sub.date_added])
  const statusLabel = sub.status === 'lifetime' ? 'مدى الحياة' : sub.status

  return (
    <main className="max-w-4xl mx-auto px-4 pb-24 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center">
          <Award className="mx-auto w-16 h-16 text-emerald-500" />
          <h1 className="text-3xl font-extrabold mt-4">أنت مشترك بالفعل!</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-neutral-300">
            لديك وصول كامل ومفعّل لجميع مؤشراتنا الاحترافية.
          </p>
        </div>
        <Card className="mt-8 rounded-3xl bg-white dark:bg-neutral-900 border dark:border-neutral-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">خطتك الحالية</p>
                <h3 className="text-2xl font-bold capitalize">{statusLabel}</h3>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">مفعّل</Badge>
            </div>
            <div className="mt-4 border-t dark:border-neutral-800 pt-4 text-sm space-y-2">
              <p><strong>تاريخ الاشتراك:</strong> {since}</p>
              <p><strong>معرّف TradingView:</strong> <span className="font-mono">{sub.trading_view_id || 'لم يتم إضافته'}</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6 rounded-3xl bg-white dark:bg-neutral-900 border dark:border-neutral-800">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold">الخطوات التالية</h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400 mt-2">
              لإضافة المؤشرات، اذهب إلى TradingView، افتح قسم المؤشرات، وابحث عنها في "Invite-only scripts".
            </p>
            <div className="mt-4 flex gap-3">
              <Button asChild className="rounded-xl"><a href="https://www.tradingview.com/chart/" target="_blank" rel="noopener noreferrer">افتح TradingView</a></Button>
              <Button variant="outline" className="rounded-xl">تواصل مع الدعم</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

// --- View for NON-SUBSCRIBED Users ---
const PricingView: React.FC<{ data: IndicatorsData }> = ({ data }) => {
  const lifetimePlan = data.subscriptions?.find(p => p.duration_in_months === '0')
  const otherPlans = (data.subscriptions ?? []).filter(p => p.duration_in_months !== '0')

  return (
    <main className="pb-24">
      {/* Hero Section */}
      <section className="pt-20 pb-12 text-center bg-white dark:bg-neutral-900 border-b dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-2">
            <ArrowRight className="w-4 h-4" /> العودة للمتجر
          </Link>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold tracking-tight">
            عزز تداولاتك بمؤشرات احترافية
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
            احصل على رؤى دقيقة وإشارات واضحة. تم تصميم حزمة مؤشرات Exaado لمساعدتك على اتخاذ قرارات تداول أكثر ذكاءً وثقة.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
            <Button size="lg" asChild className="rounded-xl"><a href="#plans">اختر خطتك الآن</a></Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
                <div className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 p-4 rounded-2xl mb-4"><Zap className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold">إشارات دقيقة</h3>
                <p className="text-gray-600 dark:text-neutral-400 mt-1">إشارات بيع وشراء مبنية على نظريات Gann لتحقيق أقصى دقة.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 p-4 rounded-2xl mb-4"><Award className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold">لا تعيد رسم نفسها</h3>
                <p className="text-gray-600 dark:text-neutral-400 mt-1">جميع مؤشراتنا Non-Repainting لضمان الموثوقية الكاملة.</p>
            </div>
            <div className="flex flex-col items-center">
                <div className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 p-4 rounded-2xl mb-4"><Settings className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold">إعدادات قابلة للتخصيص</h3>
                <p className="text-gray-600 dark:text-neutral-400 mt-1">تحكم كامل في إعدادات المؤشر لتناسب استراتيجيتك الخاصة.</p>
            </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="py-16 bg-white dark:bg-neutral-900 border-y dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold">اختر الخطة التي تناسبك</h2>
            <p className="mt-2 text-gray-600 dark:text-neutral-300">جميع الخطط تمنحك وصولاً كاملاً لجميع الميزات والتحديثات.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-sm mx-auto lg:max-w-none">
            {otherPlans.map(p => <PlanCard key={p.id} plan={p} />)}
            {lifetimePlan && <div className="lg:col-span-1"><PlanCard plan={lifetimePlan} /></div>}
            {!lifetimePlan && otherPlans.length === 0 && (
                <Card className="rounded-3xl border-dashed lg:col-span-3"><CardContent className="p-8 text-center text-gray-500">لا توجد خطط متاحة حاليًا.</CardContent></Card>
            )}
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <HelpCircle className="mx-auto w-10 h-10 text-gray-400 mb-2" />
          <h2 className="text-3xl font-extrabold">أسئلة شائعة</h2>
          <p className="mt-2 text-gray-600 dark:text-neutral-300">أجوبة للأسئلة الأكثر تكرارًا حول مؤشراتنا.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold">كيف يتم تفعيل المؤشرات بعد الاشتراك؟</AccordionTrigger>
            <AccordionContent className="text-base">يتم التفعيل تلقائيًا. بعد إتمام الاشتراك، سيتم منح حسابك في TradingView (الذي قمت بتزويدنا به) صلاحية الوصول للمؤشرات. ستجدها في قسم "Invite-only scripts".</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-semibold">هل تعمل المؤشرات على الخطة المجانية لـ TradingView؟</AccordionTrigger>
            <AccordionContent className="text-base">نعم، تعمل المؤشرات على جميع خطط TradingView بما في ذلك الخطة المجانية.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-semibold">هل المؤشرات تعيد رسم نفسها (Repaint)؟</AccordionTrigger>
            <AccordionContent className="text-base">لا، جميع مؤشراتنا مصممة لتكون Non-Repainting، مما يعني أن الإشارات التي تظهر على الشارت ثابتة ولا تتغير، مما يضمن موثوقية عالية عند اختبار الاستراتيجيات.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      <AuthPrompt />
    </main>
  )
}

/* ===========================
   Main Page Component
=========================== */
export default function IndicatorsPage() {
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useIndicatorsData(telegramId || undefined)

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
      <BackHeader />
      
      {isLoading && <div className="py-40 text-center text-gray-500">...جاري التحميل</div>}
      {isError && <div className="py-40 text-center text-red-500">تعذر تحميل البيانات: {(error as Error)?.message}</div>}
      
      {!isLoading && !isError && data && (
        data.my_subscription ? <SubscribedView sub={data.my_subscription} /> : <PricingView data={data} />
      )}
    </div>
  )
}