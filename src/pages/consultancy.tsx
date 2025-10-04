'use client'
import React, { useMemo, useState } from 'react'
import BackHeader from '@/components/BackHeader'
import AuthPrompt from '@/components/AuthFab'
import { useTelegram } from '@/context/TelegramContext'
import { useConsultancyData } from '@/services/consultancy'
import type { Slot } from '@/pages/api/consultancy'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ArrowRight, Clock, CheckCircle2, Sparkles } from 'lucide-react'

// Helper
const fmtUSD = (v?: string | null) => `$${Number(v || 0).toFixed(0)}`

// =========================================
//  Main Page Component (Completely Restructured)
// =========================================
export default function ConsultancyPage() {
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useConsultancyData(telegramId || undefined)

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  const details = data?.details
  const sessionDates = useMemo(() => Object.keys(data?.sessionTimings || {}).sort((a, b) => {
    const [da, ma, ya] = a.split('-').map(Number); const [db, mb, yb] = b.split('-').map(Number)
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime()
  }), [data?.sessionTimings])

  const slotsForSelectedDate = (selectedDate && data?.sessionTimings?.[selectedDate]) || []
  const priceNow = details?.discounted_price ?? details?.price

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset selected slot when date changes
  }
  
  const handleBooking = () => {
    // TODO: Connect to your booking/payment flow
    if (!selectedDate || !selectedSlot) return;
    alert(`سيتم الحجز لـ ${selectedDate} من ${selectedSlot.from} إلى ${selectedSlot.to} مقابل ${fmtUSD(priceNow)}`)
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
      <BackHeader
      
      backTo="/shop"
      backMode="always"
    />
      <main className="max-w-5xl mx-auto px-4 pb-24">
        {/* Header */}
        <section className="pt-20 pb-10 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {details?.title ?? 'استشارة فردية مباشرة'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 text-lg text-gray-600 dark:text-neutral-300 max-w-2xl mx-auto">
            {details?.subtitle ?? 'احجز جلسة 1:1 خاصة مع خبير لمناقشة استراتيجياتك، تحليل أدائك، والإجابة على جميع أسئلتك.'}
          </motion.p>
        </section>

        {/* Loading / Error States */}
        {isLoading && <div className="py-20 text-center text-gray-500">جاري تحميل المواعيد المتاحة...</div>}
        {isError && <div className="py-20 text-center text-red-500">تعذر تحميل البيانات: {(error as Error)?.message}</div>}

        {!isLoading && !isError && data && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {/* --- NEW: Unified Booking Wizard --- */}
            <Card className="rounded-3xl shadow-xl border dark:border-neutral-800 overflow-hidden">
              <div className="grid md:grid-cols-[1fr,400px]">
                {/* Left Side: Information Panel */}
                <div className="p-6 md:p-8 border-b md:border-b-0 md:border-l dark:border-neutral-800">
                  <div className="flex items-center gap-4">
                    <img
                      src={details?.instructor_image || '/image.jpg'}
                      alt={details?.instructor || 'المستشار'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-neutral-700 shadow-sm"
                    />
                    <div>
                      <p className="text-sm text-gray-500">المستشار</p>
                      <h3 className="text-xl font-bold">{details?.instructor}</h3>
                    </div>
                  </div>
                  <div className="mt-6 border-t dark:border-neutral-800 pt-6 space-y-4">
                    <div className="flex items-center gap-3 text-lg"><Clock className="w-6 h-6 text-primary-500" /> <strong>{details?.session_minutes ?? '30'} دقيقة</strong> من التحليل والنقاش المركز.</div>
                    {details?.options && details.options.length > 0 && (
                      <div>
                          <h4 className="font-bold mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary-500"/> محاور الجلسة:</h4>
                          <ul className="space-y-2 pr-2">
                              {details.options.map((o, i) => <li key={i} className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" /><span>{o}</span></li>)}
                          </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Scheduler Panel */}
                <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-neutral-900/50">
                  {/* Step 1: Select Date */}
                  <div>
                    <h3 className="font-bold flex items-center gap-2"><span className="bg-primary-600 text-white rounded-full w-6 h-6 text-sm grid place-content-center">1</span> اختر اليوم المناسب</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sessionDates.map(d => (
                        <button key={d} onClick={() => handleDateSelect(d)} className={cn('px-3 py-2 rounded-lg border text-sm font-semibold transition-colors', selectedDate === d ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-neutral-800 hover:border-primary-500')}>
                          {d}
                        </button>
                      ))}
                      {!sessionDates.length && <p className="text-sm text-gray-500">لا توجد تواريخ متاحة حاليًا.</p>}
                    </div>
                  </div>

                  {/* Step 2: Select Time */}
                  <AnimatePresence>
                    {selectedDate && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                        <h3 className="font-bold flex items-center gap-2"><span className="bg-primary-600 text-white rounded-full w-6 h-6 text-sm grid place-content-center">2</span> اختر التوقيت</h3>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {slotsForSelectedDate.length > 0 ? slotsForSelectedDate.map((s, i) => {
                            const isSelected = selectedSlot?.from === s.from;
                            const isDisabled = s.status !== 'available';
                            return <button key={i} disabled={isDisabled} onClick={() => setSelectedSlot(s)} className={cn('px-3 py-3 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50', isSelected ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-neutral-800 hover:border-primary-500')}> {s.from} - {s.to} </button>
                          }) : <p className="text-sm text-gray-500 col-span-2">لا توجد أوقات متاحة في هذا اليوم.</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Final CTA */}
                  <div className="mt-6 border-t dark:border-neutral-800 pt-6">
                    <div className="flex items-baseline justify-between mb-4">
                        <span className="text-gray-600 dark:text-neutral-300">السعر الإجمالي:</span>
                        <span className="text-2xl font-bold">{fmtUSD(priceNow)}</span>
                    </div>
                    <Button size="lg" className="w-full rounded-xl text-base font-bold" disabled={!selectedSlot} onClick={handleBooking}>
                      {!selectedSlot ? 'اختر موعدًا للتأكيد' : `تأكيد حجز ${selectedSlot.from}`}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* My Previous Consultations */}
            {data.my_consultations && data.my_consultations.length > 0 && (
              <section className="mt-16">
                <h2 className="text-3xl font-bold mb-5 text-center">حجوزاتي السابقة</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {data.my_consultations.map(m => (
                    <Card key={m.id} className="rounded-2xl bg-white dark:bg-neutral-900 border dark:border-neutral-800 shadow-sm">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-lg">{m.date}</div>
                          <Badge variant={m.status === 'expired' ? 'outline' : 'default'} className="capitalize">{m.status === 'expired' ? 'مكتملة' : 'قادمة'}</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-neutral-400 mt-1">{m.time_from} – {m.time_to}</p>
                        {m.meeting_link && <Button asChild variant="link" className="p-0 h-auto mt-3"><a href={m.meeting_link} target="_blank" rel="noreferrer">رابط الاجتماع <ArrowRight className="w-4 h-4 mr-1" /></a></Button>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
            <AuthPrompt />
          </motion.div>
        )}
      </main>
    </div>
  )
}