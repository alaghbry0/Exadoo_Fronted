// SubscriptionModal.tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiClock, FiChevronDown } from 'react-icons/fi'
import { FaPercent } from 'react-icons/fa'
import type { SubscriptionPlan } from '@/typesPlan'
import { useTelegram } from '../context/TelegramContext'

import { Spinner } from '../components/Spinner'
import { useQueryClient } from '@tanstack/react-query'
import { UsdtPaymentMethodModal } from '../components/UsdtPaymentMethodModal'
import { ExchangePaymentModal } from '../components/ExchangePaymentModal'
import { PaymentButtons } from '../components/SubscriptionModal/PaymentButtons' // افترض أن هذا الملف موجود
import { PlanFeaturesList } from '../components/SubscriptionModal/PlanFeaturesList'
import { useSubscriptionPayment } from '../components/SubscriptionModal/useSubscriptionPayment'
import { PaymentSuccessModal } from '../components/PaymentSuccessModal'
import { PaymentExchangeSuccess } from '../components/PaymentExchangeSuccess'

// تعريف واجهة لبيانات الشروط والأحكام
interface TermsAndConditionsData {
  terms_array: string[] | string;
  updated_at: string | null;
}

// تعريف نوع لعرض محتوى التبويبات
type TabType = 'features' | 'terms';

const SubscriptionModal = ({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) => {
  const { telegramId } = useTelegram()
  const queryClient = useQueryClient()
  const contentRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('features');
  const [terms, setTerms] = useState<string[]>([])
  const [termsLoading, setTermsLoading] = useState<boolean>(true)
  const [termsError, setTermsError] = useState<string | null>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState<boolean>(false)

  // --- إضافة جديدة: حالة الموافقة على الشروط ---
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  // ----------------------------------------------

  function handlePaymentSuccess() {
    queryClient.invalidateQueries({
      queryKey: ['subscriptions', telegramId || '']
    })
  }

  useEffect(() => {
    const handleWidget = () => {
      const widgetContainer = document.querySelector('#chat-widget-container') as HTMLElement | null
      if (widgetContainer) {
        widgetContainer.style.display = 'none'
      }
    }

    handleWidget()
    return () => {
      const widgetContainer = document.querySelector('#chat-widget-container') as HTMLElement | null
      if (widgetContainer) {
        widgetContainer.style.display = 'block'
      }
    }
  }, [])

  useEffect(() => {
    const fetchTerms = async () => {
      setTermsLoading(true)
      setTermsError(null)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/public/terms-conditions`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: TermsAndConditionsData = await response.json()
        
        let parsedTerms: string[] = [];
        if (data && data.terms_array) {
            if (Array.isArray(data.terms_array)) {
                parsedTerms = data.terms_array;
            } else if (typeof data.terms_array === 'string') {
                try {
                    const parsed = JSON.parse(data.terms_array);
                    if (Array.isArray(parsed)) {
                        parsedTerms = parsed;
                    } else {
                        console.warn("Parsed terms_array is not an array:", parsed);
                        setTermsError("تنسيق الشروط والأحكام غير صالح.");
                    }
                } catch (e) {
                    console.error("Failed to parse terms_array:", e);
                    setTermsError("فشل في تحليل الشروط والأحكام.");
                }
            }
        }
        setTerms(parsedTerms);
      } catch (error: unknown) {
        console.error('Failed to fetch terms and conditions:', error)
        setTermsError(error instanceof Error ? error.message : 'فشل في جلب الشروط والأحكام.')
      } finally {
        setTermsLoading(false)
      }
    }

    fetchTerms()
  }, [])

  useEffect(() => {
    const checkScroll = () => {
      if (contentRef.current) {
        const { scrollHeight, clientHeight } = contentRef.current;
        setShowScrollIndicator(scrollHeight > clientHeight);
        // --- تعديل: إذا كان المستخدم في تبويب الشروط ولم يوافق بعد، ولم يكن هناك خطأ في تحميل الشروط ---
        // --- ولم يكن المحتوى أقصر من النافذة، قم بالتمرير لأسفل تلقائيًا قليلاً لتنبيه المستخدم ---
        // --- هذا اختياري ويمكنك تعديله أو إزالته ---
        if (activeTab === 'terms' && !termsAgreed && !termsError && scrollHeight > clientHeight && contentRef.current.scrollTop === 0) {
            // contentRef.current.scrollTo({ top: 1, behavior: 'smooth' }); // لإظهار أن هناك محتوى للتمرير
        }
      }
    };
  
    if (!termsLoading) {
      const timer = setTimeout(checkScroll, 100); // امنح المحتوى وقتا للرسم
      const currentContentRef = contentRef.current;
      window.addEventListener('resize', checkScroll);
      // استمع لتغييرات التمرير أيضاً
      currentContentRef?.addEventListener('scroll', checkScroll);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkScroll);
        currentContentRef?.removeEventListener('scroll', checkScroll);
      };
    } else {
      setShowScrollIndicator(false);
    }
  }, [terms, termsLoading, activeTab, termsAgreed, termsError]); // أضف termsAgreed و termsError للمراقبة

  const scrollDown = () => {
    if (contentRef.current) {
      contentRef.current.scrollBy({
        top: contentRef.current.clientHeight * 0.7, // تمرير بنسبة من ارتفاع النافذة
        behavior: 'smooth'
      });
    }
  };

  const {
    paymentStatus,
    loading,
    exchangeDetails,
    setExchangeDetails,
    isInitializing,
    handleUsdtPaymentChoice,
    handleStarsPayment,
    resetPaymentStatus
  } = useSubscriptionPayment(plan, handlePaymentSuccess)

  const [usdtPaymentMethod, setUsdtPaymentMethod] = useState<'choose' | null>(null)

  const handleSuccessModalClose = () => {
    resetPaymentStatus()
    onClose()
  }

  // --- إضافة جديدة: دالة لتبديل التبويب وتمرير الشروط لأعلى إذا لم تكن مرئية ---
  const viewTermsAndConditions = () => {
    setActiveTab('terms');
    // تأكد من أن محتوى الشروط مرئي
    setTimeout(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, 50); // تأخير بسيط لضمان تحديث التبويب
  }
  // ------------------------------------------------------------------

  return (
    <>
      {isInitializing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
          <Spinner className="w-12 h-12 text-white" />
        </div>
      )}

      <motion.div
        dir="rtl"
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-end md:items-center p-2 sm:p-4"
        style={{
          zIndex: 920,
          position: 'fixed',
          isolation: 'isolate'
        }}
        // onClick={onClose} // لا تغلق النافذة عند النقر على الخلفية إذا كان هناك تفاعل داخلها
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-400"
          initial={{ y: '100%', scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: '100%', scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          onClick={(e) => e.stopPropagation()} // لمنع إغلاق النافذة عند النقر داخلها
          style={{
            position: 'relative',
            zIndex: 915
          }}
        >
          <div className="flex flex-col max-h-[90vh] sm:max-h-[85vh]">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white truncate">{plan?.name}</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onClose}
                  className="text-white/90 hover:text-white transition-colors p-1"
                  aria-label="إغلاق النافذة"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* بطاقة السعر */}
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between bg-blue-50/50 rounded-xl p-4 border border-blue-100 relative">
                {plan?.selectedOption.hasDiscount && (
                  <div className="absolute -top-3 left-3.5 bg-red-500 text-white px-3 py-0.5 rounded-full text-sm flex items-center">
                    <FaPercent className="mr-1" />
                    {plan.selectedOption.discountPercentage} خصم
                  </div>
                )}
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="font-semibold">{plan?.selectedOption.price} </span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <FiClock className="w-5 h-5" />
                  <span className="font-semibold">{plan?.selectedOption.duration}</span>
                </div>
              </div>
            </div>

            {/* تبويبات المحتوى */}
            <div className="px-4 sm:px-6 border-b flex">
              <button
                onClick={() => setActiveTab('features')}
                className={`py-2 px-4 font-medium text-sm transition-colors relative ${
                  activeTab === 'features' 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                الميزات
                {activeTab === 'features' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    layoutId="activeTabIndicator"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className={`py-2 px-4 font-medium text-sm transition-colors relative ${
                  activeTab === 'terms' 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                الشروط والأحكام
                {activeTab === 'terms' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    layoutId="activeTabIndicator"
                  />
                )}
              </button>
            </div>

            {/* منطقة المحتوى القابلة للتمرير */}
            <div 
              ref={contentRef} 
              className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 relative"
            >
              <AnimatePresence mode="wait">
                {activeTab === 'features' && (
                  <motion.div
                    key="features"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-md font-semibold text-gray-700 mb-3">ميزات الاشتراك:</h3>
                    <PlanFeaturesList features={plan?.features} />
                  </motion.div>
                )}

                {activeTab === 'terms' && (
                  <motion.div
                    key="terms"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-md font-semibold text-gray-700 mb-3">الشروط والأحكام:</h3>
                    {termsLoading && (
                      <div className="flex justify-center items-center py-8">
                        <Spinner className="w-8 h-8 text-blue-500" />
                      </div>
                    )}
                    {termsError && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{termsError}</p>
                    )}
                    {!termsLoading && !termsError && terms.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-6">لا توجد شروط وأحكام متاحة حاليًا.</p>
                    )}
                    {!termsLoading && !termsError && terms.length > 0 && (
                      <ul className="space-y-3 text-sm text-gray-600 list-disc list-inside pr-1">
                        {terms.map((term, index) => (
                          <li key={index} className="leading-relaxed">{term}</li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {showScrollIndicator && activeTab === 'terms' && ( // أظهر مؤشر التمرير فقط لتبويب الشروط إذا كان هناك ما يمكن تمريره
                <div className="sticky bottom-0 left-0 right-0 flex justify-center pb-2 pt-1 bg-gradient-to-t from-white via-white/80 to-transparent">
                  <motion.button
                    onClick={scrollDown}
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="p-1.5 bg-blue-500/20 rounded-full hover:bg-blue-500/30 transition-colors"
                    aria-label="التمرير إلى الأسفل"
                  >
                    <FiChevronDown className="w-5 h-5 text-blue-600" />
                  </motion.button>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="sticky bottom-0 bg-white border-t p-4 sm:p-5 space-y-3">
              {/* --- إضافة جديدة: مربع الموافقة على الشروط --- */}
              <div className="flex items-start space-x-2 mb-3" dir="rtl"> {/* استخدم space-x-2 لإعطاء مسافة لليسار (بسبب dir=rtl) */}
                <input
                  type="checkbox"
                  id="termsAgreement"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 shrink-0"
                />
                <label htmlFor="termsAgreement" className="text-sm text-gray-700 select-none">
                  أوافق على{' '}
                  <button 
                    type="button"
                    onClick={viewTermsAndConditions} 
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium focus:outline-none"
                  >
                    الشروط والأحكام
                  </button>
                  {' '}الخاصة بالخدمة.
                </label>
              </div>
              {/* ------------------------------------------------- */}

              <PaymentButtons
                loading={loading}
                paymentStatus={paymentStatus}
                onUsdtSelect={() => setUsdtPaymentMethod('choose')}
                onStarsSelect={handleStarsPayment}
                telegramId={telegramId || undefined}
                // --- تعديل: تعطيل الأزرار إذا لم يتم الموافقة على الشروط أو إذا كان هناك تحميل ---
                disabled={!termsAgreed || loading || termsLoading || !!termsError}
                // --------------------------------------------------------------------------------
              />
              
               {/* ------------------------------------------------------------------------------------ */}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* مودال اختيار طريقة الدفع عبر USDT */}
      <AnimatePresence>
        {usdtPaymentMethod === 'choose' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="z-[1000]"
          >
            <UsdtPaymentMethodModal
              onClose={() => setUsdtPaymentMethod(null)}
              onWalletSelect={() => handleUsdtPaymentChoice('wallet')}
              onExchangeSelect={() => handleUsdtPaymentChoice('exchange')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {exchangeDetails && (
          <ExchangePaymentModal
            details={exchangeDetails}
            onClose={() => {
              resetPaymentStatus()
              setExchangeDetails(null)
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>

      {/* مودال نجاح الدفع */}
      <AnimatePresence>
        {paymentStatus === 'success' && (
          <PaymentSuccessModal onClose={handleSuccessModalClose} />
        )}
      </AnimatePresence>

      {/* مودال نجاح دفع Exchange */}
      <AnimatePresence>
        {paymentStatus === 'exchange_success' && (
          <PaymentExchangeSuccess onClose={handleSuccessModalClose} planName={plan?.name} />
        )}
      </AnimatePresence>
    </>
  )
}

export default SubscriptionModal
