'use client'
import React, { useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import { useTelegram } from '@/context/TelegramContext'
import { useConsultancyData } from '@/services/consultancy'
import type { ConsultancyData, Slot } from '@/pages/api/consultancy'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const fmtUSD = (v?: string | null) => {
  if (!v) return ''
  const n = Number(v)
  return Number.isFinite(n) ? `$${n.toFixed(0)}` : String(v)
}

function DateButton({
  label,
  selected,
  disabled,
  onClick,
}: { label: string; selected?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'px-3 py-2 rounded-xl border text-sm transition-colors',
        selected
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-primary-400',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

export default function ConsultancyPage() {
  const { telegramId } = useTelegram()
  const { data, isLoading, isError, error } = useConsultancyData(telegramId || undefined)

  // اختيار التاريخ/الوقت
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  const details = data?.details
  const sessionDates = useMemo(() => Object.keys(data?.sessionTimings || {}).sort((a, b) => {
    const [da, ma, ya] = a.split('-').map(Number)
    const [db, mb, yb] = b.split('-').map(Number)
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime()
  }), [data?.sessionTimings])

  const slots = (selectedDate && data?.sessionTimings?.[selectedDate]) || []

  const priceNow = details?.discounted_price ?? details?.price
  const hasDiscount = !!details?.discounted_price && details.discounted_price !== details.price

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 dark:bg-neutral-950 dark:text-neutral-200 font-arabic">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Header */}
        <section className="pt-20">
          <h1 className="text-2xl md:text-3xl font-extrabold">{details?.title ?? 'استشارات مباشرة'}</h1>
          {details?.subtitle && <p className="mt-2 text-gray-600 dark:text-neutral-300">{details.subtitle}</p>}
        </section>

        {/* Loading / Error */}
        {isLoading && <div className="mt-10 text-center text-gray-500">...جاري التحميل</div>}
        {isError && <div className="mt-10 text-center text-red-500">تعذر تحميل البيانات: {(error as Error)?.message}</div>}

        {!isLoading && !isError && data && (
          <div className="space-y-10 md:space-y-14 mt-8">
            {/* Instructor / Summary */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-3xl md:col-span-2">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">{details?.instructor}</h3>
                  {details?.about_instructor && (
                    <p className="mt-2 text-gray-600 dark:text-neutral-300 whitespace-pre-line">{details.about_instructor}</p>
                  )}

                  {details?.description && (
                    <p className="mt-4 text-sm leading-7 text-gray-700 dark:text-neutral-300">{details.description}</p>
                  )}

                  {!!details?.options?.length && (
                    <div className="mt-5">
                      <h4 className="font-semibold mb-2">يمكننا مساعدتك في:</h4>
                      <ul className="list-disc pr-6 space-y-1 text-sm text-gray-700 dark:text-neutral-300">
                        {details.options.map((o, i) => <li key={i}>{o}</li>)}
                      </ul>
                    </div>
                  )}

                  {!!details?.terms?.length && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">الشروط:</h4>
                      <ul className="list-disc pr-6 space-y-1 text-sm text-gray-600 dark:text-neutral-400">
                        {details.terms.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 dark:text-neutral-400">مدة الجلسة</p>
                  <div className="text-xl font-bold">{details?.session_minutes ?? '30'} دقيقة</div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-neutral-400">السعر</p>
                    <div className="flex items-end gap-2">
                      <div className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
                        {fmtUSD(priceNow)}
                      </div>
                      {hasDiscount && (
                        <div className="text-sm text-gray-400 dark:text-neutral-500 line-through">
                          {fmtUSD(details?.price)}
                        </div>
                      )}
                    </div>
                  </div>

                  {!!details?.limit_per_week && details.limit_per_week !== '0' && (
                    <Badge className="mt-4 bg-secondary-100 text-secondary-700 border-0">
                      الحد الأسبوعي: {details.limit_per_week} حجوزات
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Date & time picker */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold mb-4">احجز موعدك</h2>

              {/* Dates row */}
              <div className="flex flex-wrap gap-2">
                {sessionDates.map(d => {
                  const disabled = details?.excluded_days?.includes(d)
                  return (
                    <DateButton
                      key={d}
                      label={d}
                      selected={selectedDate === d}
                      disabled={disabled}
                      onClick={() => { setSelectedDate(d); setSelectedSlot(null) }}
                    />
                  )
                })}
                {!sessionDates.length && (
                  <span className="text-gray-500">لا توجد تواريخ متاحة حاليًا.</span>
                )}
              </div>

              {/* Slots */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {slots.map((s, i) => {
                  const isSelected = selectedSlot?.from === s.from && selectedSlot?.to === s.to
                  const isDisabled = s.status !== 'available' && !s.is_mine
                  return (
                    <button
                      key={`${s.from}-${s.to}-${i}`}
                      disabled={isDisabled}
                      onClick={() => setSelectedSlot(s)}
                      className={[
                        'px-3 py-2 rounded-xl border text-sm transition-colors',
                        isSelected
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:border-primary-400',
                        isDisabled ? 'opacity-50 cursor-not-allowed' : '',
                      ].join(' ')}
                    >
                      {s.from}–{s.to} {s.is_mine ? '• حجزك' : ''}
                    </button>
                  )
                })}
                {selectedDate && !slots.length && (
                  <div className="col-span-full text-gray-500">لا توجد أوقات متاحة لهذا اليوم.</div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-5">
                <Button
                  className="rounded-2xl bg-primary-600 hover:bg-primary-700 text-white"
                  disabled={!selectedDate || !selectedSlot}
                  onClick={() => {
                    // TODO: اربط بتدفّق الحجز/الدفع لديك
                    console.log('Reserve:', { date: selectedDate, slot: selectedSlot })
                    alert(`سيتم الحجز لـ ${selectedDate} من ${selectedSlot?.from} إلى ${selectedSlot?.to}`)
                  }}
                >
                  تأكيد الحجز
                </Button>
              </div>
            </section>

            {/* My previous consultations */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold mb-3">حجوزاتي السابقة</h2>
              {data.my_consultations.length ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.my_consultations.map(m => (
                    <Card key={m.id} className="rounded-3xl">
                      <CardContent className="p-4">
                        <div className="font-semibold">{m.date}</div>
                        <div className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                          {m.time_from} – {m.time_to}
                        </div>
                        <div className="mt-2">
                          <Badge className="border-0">
                            {m.status === 'expired' ? 'منتهٍ' : m.status}
                          </Badge>
                        </div>
                        {m.meeting_link && (
                          <a href={m.meeting_link} target="_blank" rel="noreferrer" className="text-primary-600 text-sm mt-2 inline-block">
                            رابط الاجتماع
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="rounded-3xl">
                  <CardContent className="p-6 text-gray-500">لا توجد حجوزات سابقة.</CardContent>
                </Card>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
