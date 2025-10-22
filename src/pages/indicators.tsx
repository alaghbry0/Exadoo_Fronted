// src/pages/indicators.tsx
'use client'
import { useMemo } from 'react'
import BackHeader from '@/components/BackHeader'
import AuthPrompt from '@/components/AuthFab'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import IndicatorsPurchaseModal from '@/components/IndicatorsPurchaseModal';
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
// (تحسين) استيراد أيقونات إضافية واستخدام الأسماء المتسقة
import { ArrowLeft, CheckCircle2, Award, Zap, Settings, HelpCircle, Sparkles, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ===========================
   Helpers
=========================== */
const fmtUSD = (n?: string | number) => `$${Number(n || 0).toFixed(0)}`

/* ===========================
   Sub-Components (Updated with new UI)
=========================== */

// (تحسين) مظهر أكثر أناقة لميزات الخطة
const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-3 text-right">
    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
    <span className="text-gray-700 dark:text-neutral-300">{children}</span>
  </li>
)

type Plan = NonNullable<IndicatorsData['subscriptions']>[number]

// (تحسين) تصميم جديد بالكامل لبطاقة الأسعار لتكون أكثر جاذبية
const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => {
  const isLifetime = plan.duration_in_months === '0'
  const isFeatured = plan.is_featured === '1'
  const hasDiscount = plan.discounted_price && plan.discounted_price !== plan.price
  const priceNow = hasDiscount ? plan.discounted_price : plan.price
  const ctaText = isLifetime ? 'احصل على وصول مدى الحياة' : `اشترك لمدة ${plan.duration_in_months} أشهر`

  return (
    <Card className={cn(
      'rounded-3xl transition-all duration-300 border h-full flex flex-col',
      isFeatured 
        ? 'bg-white dark:bg-neutral-900 border-primary-500/50 shadow-2xl shadow-primary-500/10'
        : 'bg-gray-50/50 dark:bg-neutral-900/50 border-gray-200 dark:border-neutral-800 shadow-lg hover:shadow-xl hover:-translate-y-1'
    )}>
      <CardContent className="p-6 md:p-8 flex flex-col h-full relative">
        {isFeatured && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <Badge className="rounded-full px-4 py-1.5 bg-gradient-to-r from-primary-500 to-primary-700 text-white border-4 border-white dark:border-neutral-900 text-sm font-bold shadow-md">
              الأكثر شيوعًا
            </Badge>
          </div>
        )}
        <h4 className="text-2xl font-bold text-gray-900 dark:text-neutral-50 text-center">{plan.name}</h4>
        <div className="my-6 flex items-baseline justify-center gap-2">
          <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">{fmtUSD(priceNow)}</span>
          {hasDiscount && <span className="text-2xl text-gray-400 line-through">{fmtUSD(plan.price)}</span>}
        </div>
        <p className="font-semibold text-primary-600 dark:text-primary-400 text-center mb-8">
          {isLifetime ? 'دفعة واحدة — وصول مدى الحياة' : `فاتورة لمرة واحدة`}
        </p>
        <div className="flex-grow">
          <ul className="space-y-4 text-sm">
            <PlanFeature>وصول كامل لحزمة مؤشرات Exaado</PlanFeature>
            <PlanFeature>تحديثات مستقبلية مجانية ومستمرة</PlanFeature>
            <PlanFeature>تكامل سهل مع حساب TradingView</PlanFeature>
            <PlanFeature>دعم فني مخصص عبر تيليجرام</PlanFeature>
          </ul>
        </div>
        <Button
          size="lg"
          className={cn(
            "mt-8 w-full rounded-xl text-base font-bold shadow-button transition-all duration-300 transform hover:-translate-y-0.5",
            isFeatured ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white' : 'bg-gray-800 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200'
          )}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-service-purchase', {
              detail: {
                productType: 'buy_indicators',
                plan: {
                  id: plan.id,
                  name: plan.name,
                  price: plan.price,
                  discounted_price: plan.discounted_price,
                  duration_in_months: plan.duration_in_months,
                }
              }
            }));
          }}
        >
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  )
}

/* ===========================
   NEW: Conditional Views (Redesigned)
=========================== */

// --- (جديد) واجهة محسنة ومحتفلة للمستخدم المشترك ---
const SubscribedView: React.FC<{ sub: NonNullable<IndicatorsData['my_subscription']> }> = ({ sub }) => {
    const since = useMemo(() => new Date(Number(sub.date_added) * 1000).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }), [sub.date_added])
    const isLifetime = sub.status === 'lifetime'

    return (
        <main className="max-w-4xl mx-auto px-4 pb-24 pt-12 md:pt-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50/50 dark:from-primary-950/30 dark:via-neutral-900 dark:to-secondary-950/30 border-2 border-primary-200 dark:border-primary-800/50 rounded-3xl p-8 shadow-2xl shadow-primary-500/10 overflow-hidden"
            >
                {/* (جديد) إضافة تأثيرات خلفية ضبابية للجاذبية */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg mb-4">
                            <Award className="w-9 h-9" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-neutral-100 font-display">تهانينا، أنت مشترك!</h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-neutral-300">
                            لديك وصول كامل ومفعّل لحزمة مؤشرات Exaado.
                        </p>
                    </div>

                    <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md rounded-2xl border dark:border-neutral-800 p-6 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-neutral-400 mb-1">خطتك الحالية</p>
                                <h3 className="text-2xl font-bold capitalize text-primary-600 dark:text-primary-400">{isLifetime ? 'مدى الحياة' : sub.status}</h3>
                            </div>
                            <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 py-1 px-3 text-sm font-semibold">
                                <CheckCircle2 className="w-4 h-4 ml-1.5" />
                                مفعّل
                            </Badge>
                        </div>
                        <div className="border-t border-gray-200 dark:border-neutral-800 pt-4 text-sm space-y-2">
                            <div className="flex justify-between">
                                <strong className="text-gray-800 dark:text-neutral-200">تاريخ الاشتراك:</strong>
                                <span>{since}</span>
                            </div>
                            <div className="flex justify-between">
                                <strong className="text-gray-800 dark:text-neutral-200">معرّف TradingView:</strong>
                                <span className="font-mono text-gray-600 dark:text-neutral-400">{sub.trading_view_id || 'لم يتم إضافته'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">الخطوات التالية</h3>
                        <p className="text-gray-600 dark:text-neutral-400 mt-2 max-w-lg mx-auto">
                            افتح TradingView، اذهب إلى قسم المؤشرات، وستجد الحزمة في قائمة "Invite-only scripts".
                        </p>
                        <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                            <Button size="lg" asChild className="rounded-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg transition-transform hover:-translate-y-0.5">
                                <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer">
                                    <BarChart3 className="w-5 h-5 ml-2" />
                                    افتح TradingView
                                </a>
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-xl font-semibold border-gray-500 dark:border-neutral-700">تواصل مع الدعم</Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    )
}

// --- (تحسين) واجهة عرض الأسعار بتصميم أكثر حيوية واحترافية ---
const PricingView: React.FC<{ data: IndicatorsData }> = ({ data }) => {
    const lifetimePlan = data.subscriptions?.find(p => p.duration_in_months === '0');
    // (تحسين) التأكد من أن الخطة المميزة تأتي أولاً إذا لم تكن مدى الحياة
    const otherPlans = (data.subscriptions ?? [])
        .filter(p => p.duration_in_months !== '0')
        .sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

    // (تحسين) دمج الخطط للعرض
    const allPlans = [...otherPlans, ...(lifetimePlan ? [lifetimePlan] : [])];

    // (جديد) تعريف الميزات لعرضها بشكل ديناميكي
    const features = [
        { icon: Zap, title: "إشارات دقيقة", description: "إشارات بيع وشراء مبنية على نظريات Gann لتحقيق أقصى دقة." },
        { icon: Award, title: "لا تعيد رسم نفسها", description: "جميع مؤشراتنا Non-Repainting لضمان الموثوقية الكاملة." },
        { icon: Settings, title: "إعدادات قابلة للتخصيص", description: "تحكم كامل في إعدادات المؤشر لتناسب استراتيجيتك الخاصة." }
    ];

    return (
        <main className="pb-12">
            {/* Hero Section (Redesigned) */}
            <section className="relative pt-16 pb-20 text-center overflow-hidden">
                 {/* (جديد) إضافة تأثيرات خلفية ضبابية */}
                <div className="absolute -top-1/4 -right-20 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/4 -left-20 w-96 h-96 bg-secondary-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Badge variant="outline" className="mb-4 text-primary-600 dark:text-primary-400 border-primary-500/30 bg-primary-50/50 dark:bg-primary-500/10 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 ml-2 text-amber-500" />
                            حصريًا لـ TradingView
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display text-gray-900 dark:text-neutral-100">
                            عزز تداولاتك بمؤشرات احترافية
                        </h1>
                        <motion.p transition={{ delay: 0.1 }} className="mt-4 text-lg text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
                            احصل على رؤى دقيقة وإشارات واضحة. تم تصميم حزمة مؤشرات Exaado لمساعدتك على اتخاذ قرارات تداول أكثر ذكاءً وثقة.
                        </motion.p>
                        <motion.div transition={{ delay: 0.2 }} className="mt-8">
                            <Button size="lg" asChild className="rounded-xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg transition-transform hover:-translate-y-1">
                                <a href="#plans">
                                    اختر خطتك الآن
                                    <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                                </a>
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section (Redesigned) */}
            <section className="py-16 max-w-6xl mx-auto px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex flex-col items-center text-center p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 p-4 rounded-2xl mb-4">
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-neutral-400 mt-1 flex-grow">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Pricing Plans Section (Improved) */}
            <section id="plans" className="py-16 bg-gray-50 dark:bg-neutral-950 border-y dark:border-neutral-800/50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-neutral-100">اختر الخطة التي تناسبك</h2>
                        <p className="mt-2 text-gray-600 dark:text-neutral-300">جميع الخطط تمنحك وصولاً كاملاً لجميع الميزات والتحديثات.</p>
                    </div>
                    {allPlans.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                            {allPlans.map(p => <PlanCard key={p.id} plan={p} />)}
                        </div>
                    ) : (
                        <Card className="rounded-3xl border-dashed lg:col-span-3"><CardContent className="p-8 text-center text-gray-500">لا توجد خطط متاحة حاليًا.</CardContent></Card>
                    )}
                </div>
            </section>

            {/* FAQ Section (Improved Styling) */}
            <section className="py-16 max-w-3xl mx-auto px-4">
                <div className="text-center mb-10">
                    <HelpCircle className="mx-auto w-10 h-10 text-gray-400 mb-2" />
                    <h2 className="text-3xl font-extrabold font-display text-gray-900 dark:text-neutral-100">أسئلة شائعة</h2>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-3">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>كيف يتم تفعيل المؤشرات بعد الاشتراك؟</AccordionTrigger>
                        <AccordionContent>يتم التفعيل تلقائيًا. بعد إتمام الاشتراك، سيتم منح حسابك في TradingView (الذي قمت بتزويدنا به) صلاحية الوصول للمؤشرات. ستجدها في قسم "Invite-only scripts".</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>هل تعمل المؤشرات على الخطة المجانية لـ TradingView؟</AccordionTrigger>
                        <AccordionContent>نعم، تعمل المؤشرات على جميع خطط TradingView بما في ذلك الخطة المجانية.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>هل المؤشرات تعيد رسم نفسها (Repaint)؟</AccordionTrigger>
                        <AccordionContent>لا، جميع مؤشراتنا مصممة لتكون Non-Repainting، مما يعني أن الإشارات التي تظهر على الشارت ثابتة ولا تتغير، مما يضمن موثوقية عالية عند اختبار الاستراتيجيات.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
            
            <AuthPrompt />
            <IndicatorsPurchaseModal />
        </main>
    )
}


/* ===========================
   Main Page Component (Unchanged Logic)
=========================== */
export default function IndicatorsPage() {
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useIndicatorsData(telegramId || undefined)

  return (
    <div dir="rtl" className="min-h-screen bg-white text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
      <BackHeader backTo="/shop" backMode="always" />

      {isLoading && <div className="py-40 text-center text-gray-500">...جاري التحميل</div>}
      {isError && <div className="py-40 text-center text-red-500">تعذر تحميل البيانات: {(error as Error)?.message}</div>}

      {!isLoading && !isError && data && (
        data.my_subscription ? <SubscribedView sub={data.my_subscription} /> : <PricingView data={data} />
      )}
    </div>
  )
}


// (تعديل مقترح) لـ ui/accordion.tsx لتحسين التصميم
/*
<AccordionItem value={value} className="border-b-0">
  <AccordionTrigger className="text-lg font-semibold text-right p-4 bg-gray-50 dark:bg-neutral-900 rounded-xl hover:no-underline state-open:bg-primary-50 dark:state-open:bg-primary-500/10 state-open:text-primary-600 dark:state-open:text-primary-400">
    {children}
  </AccordionTrigger>
  <AccordionContent className="text-base p-4 bg-gray-50 dark:bg-neutral-900 rounded-b-xl">
    {...}
  </AccordionContent>
</AccordionItem>
*/