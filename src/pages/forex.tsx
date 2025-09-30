'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import BackHeader from '@/components/BackHeader'
import AuthPrompt from '@/components/AuthFab'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useTelegram } from '@/context/TelegramContext'
import { useForexData } from '@/services/forex'
import type { ForexData, MyForexSubscription, ForexSubscriptionPlan } from '@/pages/api/forex'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ArrowRight, CheckCircle2, Award, Zap, ShieldCheck, Download, BookUser, HelpCircle } from 'lucide-react'

// Helper
const fmtUSD = (n?: string | number | null) => `$${Number(n || 0).toFixed(0)}`

/* ===========================
   Sub-Components (Updated & Polished)
=========================== */

const PlanFeature: React.FC<React.PropsWithChildren> = ({ children }) => (
  <li className="flex items-start gap-3">
    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
    <span>{children}</span>
  </li>
)

const PlanCard: React.FC<{ plan: ForexSubscriptionPlan }> = ({ plan }) => {
  const isLifetime = plan.duration_in_months === '0' || plan.name.toLowerCase().includes('lifetime')
  const isFree = plan.price === '0'
  const hasDiscount = !!plan.discounted_price && plan.discounted_price !== plan.price
  const priceNow = isFree ? null : (hasDiscount ? plan.discounted_price : plan.price)

  return (
    <Card className={cn(
        'rounded-3xl transition-all duration-300 bg-white dark:bg-neutral-900 border dark:border-neutral-800 flex flex-col',
        isLifetime ? 'shadow-2xl ring-2 ring-primary-500' : 'shadow-lg hover:shadow-xl'
    )}>
      <CardContent className="p-6 md:p-8 text-center flex flex-col flex-grow">
        {isLifetime && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2"><Badge className="rounded-full px-4 py-1.5 bg-primary-600 text-white border-2 border-white dark:border-neutral-900 text-sm">أفضل قيمة</Badge></div>
        )}
        <h4 className="text-2xl font-bold">{plan.name}</h4>
        <div className="my-6 min-h-[70px] flex flex-col items-center justify-center gap-1">
          {isFree ? ( <span className="text-5xl font-extrabold text-emerald-600">مجاني</span> ) : (
            <>
              <span className="text-5xl font-extrabold">{fmtUSD(priceNow)}</span>
              {hasDiscount && <span className="text-2xl text-gray-400 line-through">{fmtUSD(plan.price)}</span>}
            </>
          )}
        </div>
        <p className="font-semibold text-primary-600 dark:text-primary-400 mb-6">
          {isFree ? 'ابدأ تجربتك الآن' : (isLifetime ? 'دفعة واحدة لمدى الحياة' : `فاتورة لمرة واحدة`)}
        </p>
        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 text-right mb-8 flex-grow">
          <PlanFeature>{isFree ? 'مزايا أساسية' : 'وصول كامل للوحات التداول'}</PlanFeature>
          <PlanFeature>تنفيذ فوري للصفقات بنقرة واحدة</PlanFeature>
          <PlanFeature>إدارة متقدمة للمخاطر</PlanFeature>
          <PlanFeature>دعم فني عبر تيليجرام</PlanFeature>
        </ul>
        <Button size="lg" className="w-full rounded-xl text-base font-bold">
          {isFree ? 'ابدأ التجربة المجانية' : 'اشترك الآن'}
        </Button>
      </CardContent>
    </Card>
  )
}

/* ===========================
   NEW: Conditional Views
=========================== */

// --- View for SUBSCRIBED Users ---
const SubscribedView: React.FC<{ sub: MyForexSubscription }> = ({ sub }) => {
  const since = useMemo(() => new Date(Number(sub.date_added) * 1000).toLocaleDateString(), [sub.date_added])
  let addresses: string[] = []
  try { addresses = JSON.parse(sub.forex_addresses) } catch {}
  
  return (
    <main className="max-w-4xl mx-auto px-4 pb-24 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center">
          <Award className="mx-auto w-16 h-16 text-emerald-500" />
          <h1 className="text-3xl font-extrabold mt-4">لوحة التحكم الخاصة بك جاهزة!</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-neutral-300">أنت مشترك في خطة "{sub.status}" ويمكنك البدء باستخدام اللوحات الآن.</p>
        </div>
        <Card className="mt-8 rounded-3xl bg-white dark:bg-neutral-900 border dark:border-neutral-800 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">تفاصيل اشتراكك</h3>
            <div className="text-sm space-y-2">
              <p><strong>الخطة:</strong> <Badge className="capitalize">{sub.status}</Badge></p>
              <p><strong>تاريخ الاشتراك:</strong> {since}</p>
              {addresses.length > 0 && <p><strong>الحسابات المفعلة (MT4/5):</strong> <span className="font-mono bg-gray-100 dark:bg-neutral-800 rounded px-2 py-1 text-xs">{addresses.join(', ')}</span></p>}
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6 rounded-3xl bg-white dark:bg-neutral-900 border dark:border-neutral-800">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold">ابدأ الآن</h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400 mt-2">اتبع الخطوات التالية لتثبيت وبدء استخدام لوحات التداول.</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <Button asChild size="lg" className="rounded-xl w-full"><a href={sub.download_link || '#'}><Download className="w-5 h-5 ml-2" /> تحميل اللوحة</a></Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl w-full"><a href={sub.setup_guide_link || '#'}><BookUser className="w-5 h-5 ml-2" /> دليل التثبيت</a></Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}

// --- View for NON-SUBSCRIBED Users ---
const PricingView: React.FC<{ data: ForexData }> = ({ data }) => {
  const plans = data.subscriptions ?? []
  const lifetime = plans.find(p => p.duration_in_months === '0' || p.name.toLowerCase().includes('lifetime'))
  const others = plans.filter(p => p !== lifetime)
  
  return (
    <main className="pb-24">
      {/* Hero Section */}
      <section className="pt-20 pb-12 text-center bg-white dark:bg-neutral-900 border-b dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-2"><ArrowRight className="w-4 h-4" /> العودة للمتجر</Link>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold tracking-tight">تداول أسرع، قرارات أذكى</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
            تحكم كامل في صفقاتك مع لوحات Exaado للتداول. نفّذ أوامرك بنقرة واحدة، أدر مخاطرك بفعالية، وركز على الأهم: تحقيق الأرباح.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8"><Button size="lg" asChild className="rounded-xl"><a href="#plans">عرض الخطط والأسعار</a></Button></motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center"><div className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 p-4 rounded-2xl mb-4"><Zap className="w-8 h-8" /></div><h3 className="text-xl font-bold">تنفيذ فوري</h3><p className="text-gray-600 dark:text-neutral-400 mt-1">فتح وإغلاق الصفقات بنقرة واحدة، أسرع من أي وقت مضى.</p></div>
            <div className="flex flex-col items-center"><div className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 p-4 rounded-2xl mb-4"><ShieldCheck className="w-8 h-8" /></div><h3 className="text-xl font-bold">إدارة المخاطر</h3><p className="text-gray-600 dark:text-neutral-400 mt-1">حساب حجم اللوت تلقائيًا وتحديد وقف الخسارة والربح بسهولة.</p></div>
            <div className="flex flex-col items-center"><div className="bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 p-4 rounded-2xl mb-4"><Award className="w-8 h-8" /></div><h3 className="text-xl font-bold">واجهة احترافية</h3><p className="text-gray-600 dark:text-neutral-400 mt-1">تصميم نظيف وسهل الاستخدام متوافق مع MT4 و MT5.</p></div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="py-16 bg-white dark:bg-neutral-900 border-y dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10"><h2 className="text-3xl font-extrabold">اختر خطة الاشتراك المناسبة لك</h2><p className="mt-2 text-gray-600 dark:text-neutral-300">ابدأ تجربتك المجانية أو احصل على وصول كامل اليوم.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {lifetime && <PlanCard plan={lifetime} />}
            {others.map(p => <PlanCard key={p.id} plan={p} />)}
            {!plans.length && <Card className="rounded-3xl border-dashed sm:col-span-2 lg:col-span-3"><CardContent className="p-8 text-center text-gray-500">لا توجد خطط متاحة حاليًا.</CardContent></Card>}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="text-center mb-10"><HelpCircle className="mx-auto w-10 h-10 text-gray-400 mb-2" /><h2 className="text-3xl font-extrabold">أسئلة شائعة</h2></div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1"><AccordionTrigger className="text-lg font-semibold">ما هي المنصات المدعومة؟</AccordionTrigger><AccordionContent className="text-base">اللوحات متوافقة بشكل كامل مع منصتي MetaTrader 4 (MT4) و MetaTrader 5 (MT5).</AccordionContent></AccordionItem>
          <AccordionItem value="item-2"><AccordionTrigger className="text-lg font-semibold">كيف يتم تفعيل اللوحات بعد الاشتراك؟</AccordionTrigger><AccordionContent className="text-base">بعد الاشتراك، ستحصل على رابط لتحميل ملف اللوحة (Panel). كل ما عليك هو تثبيته على منصة التداول الخاصة بك وإدخال بيانات حسابك (رقم الحساب) التي قمت بتزويدنا بها عند الاشتراك.</AccordionContent></AccordionItem>
          <AccordionItem value="item-3"><AccordionTrigger className="text-lg font-semibold">هل يمكنني استخدام اللوحة على أكثر من حساب؟</AccordionTrigger><AccordionContent className="text-base">كل اشتراك مخصص لعدد معين من حسابات التداول. يمكنك اختيار الخطة التي تناسب عدد الحسابات التي ترغب في استخدام اللوحة عليها. خطة مدى الحياة غالبًا ما توفر مرونة أكبر.</AccordionContent></AccordionItem>
        </Accordion>
      </section>
      <AuthPrompt />
    </main>
  )
}

/* ===========================
   Main Page Component
=========================== */
export default function ForexPage() {
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useForexData(telegramId || undefined)

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
      <BackHeader />
      
      {isLoading && <div className="py-40 text-center text-gray-500">...جاري التحميل</div>}
      {isError && <div className="py-40 text-center text-red-500">تعذر تحميل البيانات: {(error as Error)?.message}</div>}
      
      {!isLoading && !isError && data && (
        data.my_subscription ? <SubscribedView sub={data.my_subscription as MyForexSubscription} /> : <PricingView data={data} />
      )}
    </div>
  )
}