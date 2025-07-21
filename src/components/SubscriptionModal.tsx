// src/components/SubscriptionModal.tsx
'use client'

// --- استيرادات أساسية ---
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiClock, FiCheckCircle, FiFileText, FiChevronDown } from 'react-icons/fi'
import { FaPercent } from 'react-icons/fa'
import { useQueryClient } from '@tanstack/react-query'

// --- استيراد الأنواع والـ Hooks المعدلة ---
import type { ModalPlanData } from '@/types/modalPlanData';
import { useTelegram } from '../context/TelegramContext'
import { useSubscriptionPayment } from '../components/SubscriptionModal/useSubscriptionPayment'

// --- استيراد المكونات الفرعية ---
import { Spinner } from '../components/Spinner'
import { UsdtPaymentMethodModal } from '../components/UsdtPaymentMethodModal'
import { ExchangePaymentModal } from '../components/ExchangePaymentModal'
import { PaymentSuccessModal } from '../components/PaymentSuccessModal'
import { PaymentExchangeSuccess } from '../components/PaymentExchangeSuccess'
import { PaymentButtons } from '../components/SubscriptionModal/PaymentButtons'

type TabType = 'features' | 'terms';

const SubscriptionModal = ({ plan, onClose }: { plan: ModalPlanData | null; onClose: () => void }) => {
  const { telegramId } = useTelegram()
  const queryClient = useQueryClient()
  const contentRef = useRef<HTMLDivElement>(null)

  // اعتماد "آلة الحالات" الجديدة
  const [activeTab, setActiveTab] = useState<TabType>('features');
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'choose_method' | 'show_exchange'>('details');

  // useEffect لإعادة تعيين الحالة عند تغيير الخطة
  useEffect(() => {
    if (plan) {
      setPaymentStep('details');
      setActiveTab('features');
      setTermsAgreed(false);
    }
  }, [plan]);

  // دالة تُستدعى عند نجاح الدفع
  function handlePaymentSuccess() {
    queryClient.invalidateQueries({ queryKey: ['subscriptions', telegramId || ''] });
    queryClient.invalidateQueries({ queryKey: ['subscriptionPlans', telegramId] });
  }

  // تهيئة `useSubscriptionPayment` بالهيكل الجديد
  const {
    paymentStatus,
    loading,
    exchangeDetails,
    setExchangeDetails,
    isInitializing,
    handleUsdtPaymentChoice,
    handleStarsPayment,
    resetPaymentStatus,
  } = useSubscriptionPayment(plan, handlePaymentSuccess);

  // دوال التحكم في خطوات الدفع
  const resetAllModals = () => {
      resetPaymentStatus();
      setExchangeDetails(null);
  }

  const handleCloseAll = () => {
    resetAllModals();
    onClose();
  };

  const goToChooseMethod = () => setPaymentStep('choose_method');
  const goBackToDetails = () => setPaymentStep('details');

  const selectExchangePayment = async () => {
    const success = await handleUsdtPaymentChoice('exchange');
    if (success) setPaymentStep('show_exchange');
  };

  const selectWalletPayment = async () => {
    await handleUsdtPaymentChoice('wallet');
  };

  const handleExchangeModalClose = () => {
    resetAllModals();
    goBackToDetails();
  }

  const handleSuccessAndCloseAll = () => {
    resetAllModals();
    onClose();
  };

  const viewTermsAndConditions = () => {
    setActiveTab('terms');
    setTimeout(() => {
        contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }

  const hasTerms = plan && plan.termsAndConditions && plan.termsAndConditions.length > 0;
  const isButtonsDisabled = loading || (hasTerms && !termsAgreed);

  if (!plan) return null;

  return (
    <>
      {isInitializing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
          <Spinner className="w-12 h-12 text-white" />
        </div>
      )}

      {/* عرض المودال الرئيسي فقط عندما تكون الخطوة `details` */}
      <AnimatePresence>
        {paymentStep === 'details' && (
          <motion.div
            dir="rtl"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-end md:items-center p-2 sm:p-4 z-[920]"
            onClick={handleCloseAll}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-neutral-300"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col max-h-[90vh] sm:max-h-[85vh]">
                {/* --- الهيدر --- */}
                <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-3 flex justify-between items-center z-10 shadow-sm">
                  <h2 className="text-lg font-semibold text-white truncate font-arabic">{plan.name}</h2>
                  <button onClick={handleCloseAll} className="text-white/90 hover:text-white p-1 rounded-full transition-colors">
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* --- بطاقة السعر --- */}
                <div className="px-4 py-3 sm:px-6 sm:py-4">
                  <div className="flex items-center justify-between bg-primary-50 rounded-xl p-4 border border-primary-100 relative">
                    {plan.selectedOption.hasDiscount && (
                       <div className="absolute -top-3 left-3.5 bg-error-500 text-white px-3 py-0.5 rounded-full text-sm flex items-center shadow-md">
                         <FaPercent className="mr-1" />
                         {plan.selectedOption.discountPercentage}% خصم
                       </div>
                    )}
                     <span className="font-bold text-2xl text-primary-700">{Number(plan.selectedOption.price).toFixed(0)}$</span>
                     <div className="flex items-center gap-2 text-primary-600">
                       <FiClock className="w-5 h-5" />
                       <span className="font-semibold">{plan.selectedOption.duration}</span>
                     </div>
                  </div>
                </div>

                {/* --- التبويبات --- */}
                <div className="px-4 sm:px-6 flex border-b border-neutral-200 items-center">
                   <button onClick={() => setActiveTab('features')} className={`py-2 px-4 font-medium text-sm transition-colors relative ${ activeTab === 'features' ? 'text-primary-600 font-semibold' : 'text-neutral-500 hover:text-neutral-800' }`}>
                     الميزات
                     {activeTab === 'features' && (<motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" layoutId="activeTabIndicator" />)}
                   </button>
                   <div className="h-4 w-px bg-neutral-300 mx-1"></div>
                   <button onClick={() => setActiveTab('terms')} className={`py-2 px-4 font-medium text-sm transition-colors relative ${ activeTab === 'terms' ? 'text-primary-600 font-semibold' : 'text-neutral-500 hover:text-neutral-800' }`}>
                     الشروط والأحكام
                     {activeTab === 'terms' && (<motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" layoutId="activeTabIndicator" />)}
                   </button>
                </div>

                {/* --- المحتوى --- */}
                <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 relative">
                  <AnimatePresence mode="wait">
                    {activeTab === 'features' && (
                      <motion.div key="features" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <h3 className="text-md font-semibold text-neutral-700 mb-3 flex items-center gap-2 font-arabic"><FiCheckCircle className="text-primary-500"/> ميزات الاشتراك:</h3>
                        <ul className="space-y-3 text-sm text-neutral-600 list-disc list-inside pr-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="leading-relaxed">{feature}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                    {activeTab === 'terms' && (
                      <motion.div key="terms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <h3 className="text-md font-semibold text-neutral-700 mb-3 flex items-center gap-2 font-arabic"><FiFileText className="text-neutral-500"/> الشروط والأحكام:</h3>
                        {!hasTerms ? (
                           <p className="text-sm text-neutral-500 text-center py-6">لا توجد شروط وأحكام متاحة حاليًا.</p>
                        ) : (
                          <ul className="space-y-3 text-sm text-neutral-600 list-disc list-inside pr-1">
                            {plan.termsAndConditions.map((term, index) => (
                              <li key={index} className="leading-relaxed">{term}</li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* --- قسم الدفع --- */}
                <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4 sm:p-5 space-y-3">
                  {hasTerms && (
                    <div className="flex items-start gap-2 mb-3" dir="rtl">
                      <input
                        type="checkbox" id="termsAgreement" checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-0.5 shrink-0"
                      />
                      <label htmlFor="termsAgreement" className="text-sm text-neutral-700 select-none">
                        أوافق على <button onClick={viewTermsAndConditions} className="text-primary-600 hover:underline font-medium">الشروط والأحكام</button> الخاصة بالخدمة.
                      </label>
                    </div>
                  )}

                  <PaymentButtons
                    loading={loading}
                    paymentStatus={paymentStatus}
                    onUsdtSelect={goToChooseMethod}
                    onStarsSelect={handleStarsPayment}
                    plan={plan}
                    disabled={isButtonsDisabled}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* عرض مودالات الدفع بناءً على `paymentStep` */}
      <AnimatePresence>
        {paymentStep === 'choose_method' && (
            <UsdtPaymentMethodModal
              loading={loading}
              onClose={goBackToDetails} // العودة للخطوة السابقة
              onWalletSelect={selectWalletPayment}
              onExchangeSelect={selectExchangePayment}
            />
        )}
      </AnimatePresence>

      {paymentStep === 'show_exchange' && exchangeDetails && (
        <ExchangePaymentModal
          details={exchangeDetails}
          onClose={handleExchangeModalClose} // دالة إغلاق مخصصة
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* مودالات النجاح */}
      <AnimatePresence>
        {paymentStatus === 'success' && <PaymentSuccessModal onClose={handleSuccessAndCloseAll} />}
      </AnimatePresence>
      <AnimatePresence>
        {paymentStatus === 'exchange_success' && <PaymentExchangeSuccess onClose={handleSuccessAndCloseAll} planName={plan.name} />}
      </AnimatePresence>
    </>
  )
}

export default SubscriptionModal