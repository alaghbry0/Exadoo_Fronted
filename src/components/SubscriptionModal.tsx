// SubscriptionModal.tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiClock } from 'react-icons/fi'

import type { SubscriptionPlan } from '@/typesPlan'
import { useTelegram } from '../context/TelegramContext'

import { Spinner } from '../components/Spinner'
import { useQueryClient } from '@tanstack/react-query'
import { UsdtPaymentMethodModal } from '../components/UsdtPaymentMethodModal'
import { ExchangePaymentModal } from '../components/ExchangePaymentModal'
import { PaymentButtons } from '../components/SubscriptionModal/PaymentButtons'
import { PlanFeaturesList } from '../components/SubscriptionModal/PlanFeaturesList'
import { useSubscriptionPayment } from '../components/SubscriptionModal/useSubscriptionPayment'
import { PaymentSuccessModal } from '../components/PaymentSuccessModal'
import { PaymentExchangeSuccess } from '../components/PaymentExchangeSuccess'

import { useEffect } from 'react'

const SubscriptionModal = ({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) => {
  const { telegramId } = useTelegram()
  const queryClient = useQueryClient()

  function handlePaymentSuccess() {
    queryClient.invalidateQueries({
      queryKey: ['subscriptions', telegramId || '']
    })
  }
    useEffect(() => {
  const handleWidget = () => {
    const widgetContainer = document.querySelector('#chat-widget-container') as HTMLElement | null;
    if (widgetContainer) {
      widgetContainer.style.display = 'none';
    }
  };

  handleWidget();
  return () => {
    const widgetContainer = document.querySelector('#chat-widget-container') as HTMLElement | null;
    if (widgetContainer) {
      widgetContainer.style.display = 'block';
    }
  };
}, []);


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
  resetPaymentStatus();
  onClose();
};



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
    zIndex: 920, // أقل بمقدار 1 من شاشة الانتظار
    position: 'fixed',
    isolation: 'isolate'
  }}
>
        <motion.div
  className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-400"
  initial={{ y: '100%', scale: 0.95 }}
  animate={{ y: 0, scale: 1 }}
  exit={{ y: '100%', scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 260, damping: 25 }}
  onClick={(e) => e.stopPropagation()}
  style={{
    position: 'relative',
    zIndex: 915 // تأكيد قيمة z-index
  }}
>
          <div className="flex flex-col max-h-[100vh]">
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

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
              {/* بطاقة السعر */}
              <div className="flex items-center justify-between bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="font-semibold">{plan?.selectedOption.price} </span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <FiClock className="w-5 h-5" />
                  <span className="font-semibold">{plan?.selectedOption.duration}</span>
                </div>
              </div>

              {/* قائمة الميزات */}
              <div className="max-h-[300px] overflow-y-auto pr-2 pb-9">
                <PlanFeaturesList features={plan?.features} />
              </div>
            </div>

            {/* Payment Section */}
            <div className="sticky bottom-11 bg-white border-t p-7 sm:p-6 space-y-7">
              <PaymentButtons
                loading={loading}
                paymentStatus={paymentStatus}
                onUsdtSelect={() => setUsdtPaymentMethod('choose')}
                onStarsSelect={handleStarsPayment}
                telegramId={telegramId || undefined}
              />
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
        // إعادة تعيين حالة الدفع وتنظيف تفاصيل الدفع عند إغلاق مودال الدفع
        resetPaymentStatus();
        setExchangeDetails(null);
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
