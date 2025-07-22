'use client'

// --- استيرادات (لا تغيير) ---
import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Loader2, CheckCircle, ShieldCheck, ScrollText, Sparkles } from 'lucide-react'
import type { ModalPlanData } from '@/types/modalPlanData'
import { useTelegram } from '../context/TelegramContext'
import { useSubscriptionPayment } from '../components/SubscriptionModal/useSubscriptionPayment'
import { UsdtPaymentMethodModal } from '../components/UsdtPaymentMethodModal'
import { ExchangePaymentModal } from '../components/ExchangePaymentModal'
import { PaymentSuccessModal } from '../components/PaymentSuccessModal'
import { PaymentExchangeSuccess } from '../components/PaymentExchangeSuccess'

// ====================================================================
// المكون الرئيسي للمودال (مع لمسات إبداعية)
// ====================================================================
const SubscriptionModal = ({ plan, onClose }: { plan: ModalPlanData | null; onClose: () => void }) => {
  // --- Hooks والحالات (لا تغيير في المنطق) ---
  const { telegramId } = useTelegram()
  const queryClient = useQueryClient()
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'details' | 'choose_method' | 'show_exchange'>('details');
  const termsSectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (plan) { setPaymentStep('details'); setTermsAgreed(false); } }, [plan]);
  function handlePaymentSuccess() { queryClient.invalidateQueries({ queryKey: ['allSubscriptions', telegramId] }); }
  const { paymentStatus, loading, exchangeDetails, setExchangeDetails, isInitializing, handleUsdtPaymentChoice, handleStarsPayment, resetPaymentStatus } = useSubscriptionPayment(plan, handlePaymentSuccess);
  const resetAllModals = () => { resetPaymentStatus(); setExchangeDetails(null); }
  const handleCloseAll = () => { resetAllModals(); onClose(); };
  const goToChooseMethod = () => setPaymentStep('choose_method');
  const goBackToDetails = () => setPaymentStep('details');
  const selectExchangePayment = async () => { const success = await handleUsdtPaymentChoice('exchange'); if (success) setPaymentStep('show_exchange'); };
  const selectWalletPayment = async () => { await handleUsdtPaymentChoice('wallet'); };
  const handleExchangeModalClose = () => { resetAllModals(); goBackToDetails(); }
  const handleSuccessAndCloseAll = () => { resetAllModals(); onClose(); };
  const scrollToTerms = () => { termsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  const hasTerms = plan && plan.termsAndConditions && plan.termsAndConditions.length > 0;

  if (!plan) return null;

  return (
    <>
      {isInitializing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      <Sheet open={paymentStep === 'details'} onOpenChange={(isOpen) => !isOpen && handleCloseAll()}>
        <SheetContent
          side="bottom"
          className="h-[90vh] md:h-[85vh] rounded-t-3xl border-0 bg-gray-50 p-0 flex flex-col"
          dir="rtl"
        >
          {/* تحسين 1: إضافة مقبض بصري للسحب */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full z-20"></div>

          {/* تحسين 2: فصل الهيدر ليعطي إحساسًا بالعمق */}
          <SheetHeader className="p-4 pt-8 text-center border-b border-gray-200">
            <SheetTitle className="text-xl font-bold text-gray-800 font-arabic">{plan.name}</SheetTitle>
            <button onClick={handleCloseAll} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-8 p-4 pt-6 pb-24">

              {/* تحسين 3: بطاقة سعر أكثر حيوية وتفاعلية */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg text-center relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-8 -left-2 w-32 h-32 bg-white/10 rounded-full"></div>

                <p className="font-medium text-white/80 mb-1 z-10 relative">السعر لخطة {plan.selectedOption.duration}</p>
                <div className="flex items-baseline justify-center gap-2 z-10 relative">
                  {plan.selectedOption.hasDiscount && plan.selectedOption.originalPrice && (
                    <span className="text-2xl font-medium text-white/60 line-through">
                      {Number(plan.selectedOption.originalPrice).toFixed(0)}$
                    </span>
                  )}
                  <span className="text-5xl font-extrabold tracking-tight">
                    {Number(plan.selectedOption.price).toFixed(0)}$
                  </span>
                </div>
                {plan.selectedOption.hasDiscount && (
                  <div className="mt-3 inline-block bg-white text-primary-600 px-3 py-1 rounded-full text-sm font-bold shadow z-10 relative">
                    وفر {plan.selectedOption.discountPercentage}% الآن!
                  </div>
                )}
              </div>

              {/* تحسين 4: هيكل أقسام أكثر وضوحًا */}
              <div className="space-y-6">
                {/* قسم الميزات */}
                <div className="bg-white p-5 rounded-2xl border">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-start font-arabic">
                    <ShieldCheck className="w-5 h-5 ml-2 text-primary-600" />
                    ماذا ستحصل عليه؟
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 leading-relaxed text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* قسم الشروط والأحكام */}
                {hasTerms && (
                  <div ref={termsSectionRef} className="bg-white p-5 rounded-2xl border">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-start font-arabic">
                      <ScrollText className="w-5 h-5 ml-2 text-gray-500" />
                      الشروط والأحكام
                    </h4>
                    <ul className="space-y-2.5 text-sm text-gray-500 list-disc list-inside pr-2">
                      {plan.termsAndConditions.map((term: string, index: number) => (
                        <li key={index} className="leading-relaxed">{term}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* تحسين 5: قسم دفع أكثر تنظيمًا وجاذبية */}
          <div className="bg-white/90 backdrop-blur-sm border-t-2 border-primary-100 p-4 shadow-top-strong z-10">
            {hasTerms && (
              <div className="flex items-start gap-3 mb-4">
                <Checkbox id="termsAgreementModal" checked={termsAgreed} onCheckedChange={(checked) => setTermsAgreed(!!checked)} className="mt-0.5" />
                <label htmlFor="termsAgreementModal" className="text-sm text-gray-600 select-none">
                  أوافق على <span className="font-bold text-primary-600 hover:underline cursor-pointer" onClick={scrollToTerms}>الشروط والأحكام</span> المذكورة أعلاه.
                </label>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={goToChooseMethod}
                size="lg"
                className="w-full h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-base font-bold shadow-lg hover:shadow-primary-500/40 transition-shadow duration-300"
                disabled={!!loading || (hasTerms && !termsAgreed)}
              >
                {loading && paymentStatus === 'processing_usdt' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'الدفع باستخدام USDT'}
              </Button>
              {plan.selectedOption.telegramStarsPrice != null && (
                 <Button
                    onClick={handleStarsPayment}
                    size="lg"
                    className="w-full h-14 bg-sky-500 text-white text-base font-bold shadow-lg hover:shadow-sky-500/40 transition-shadow duration-300"
                    disabled={!!loading || (hasTerms && !termsAgreed)}
                 >
                    {loading && paymentStatus === 'processing_stars' ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <Sparkles className="w-5 h-5 ml-2" />
                        الدفع بـ Telegram Stars
                      </>
                    )}
                 </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* باقي المودالات (لا تغيير) */}
      <AnimatePresence>
        {paymentStep === 'choose_method' && <UsdtPaymentMethodModal loading={!!loading} onClose={goBackToDetails} onWalletSelect={selectWalletPayment} onExchangeSelect={selectExchangePayment} />}
      </AnimatePresence>
      {paymentStep === 'show_exchange' && exchangeDetails && <ExchangePaymentModal details={exchangeDetails} onClose={handleExchangeModalClose} onSuccess={handlePaymentSuccess} />}
      {paymentStatus === 'success' && <PaymentSuccessModal onClose={handleSuccessAndCloseAll} />}
      {paymentStatus === 'exchange_success' && <PaymentExchangeSuccess onClose={handleSuccessAndCloseAll} planName={plan.name} />}
    </>
  )
}

export default SubscriptionModal
