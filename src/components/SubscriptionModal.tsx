// SubscriptionModal.tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

import type { SubscriptionPlan } from '@/typesPlan'
import { useTelegram } from '../context/TelegramContext'

import { Spinner } from '../components/Spinner'
import { useQueryClient } from 'react-query'
import { UsdtPaymentMethodModal } from '../components/UsdtPaymentMethodModal'
import { ExchangePaymentModal } from '../components/ExchangePaymentModal'
import { PaymentButtons } from '../components/SubscriptionModal/PaymentButtons'
import { PlanFeaturesList } from '../components/SubscriptionModal/PlanFeaturesList'
import { useSubscriptionPayment } from '../components/SubscriptionModal/useSubscriptionPayment'

const SubscriptionModal = ({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) => {
  const { telegramId } = useTelegram()
  const queryClient = useQueryClient()

  // دالة عند نجاح الدفع (يمكن تعديلها لإضافة منطق إضافي إذا لزم الأمر)
  function handlePaymentSuccess() {
    queryClient.invalidateQueries(['subscriptions', telegramId])
  }

  // استخدام الخطاف الخاص بعمليات الدفع
  const {
    paymentStatus,
    loading,
    exchangeDetails,
    setExchangeDetails,
    isInitializing,
    handleUsdtPaymentChoice,
    handleStarsPayment
  } = useSubscriptionPayment(plan, handlePaymentSuccess)

  const [usdtPaymentMethod, setUsdtPaymentMethod] = useState<'choose' | null>(null)

  return (
    <>
      {isInitializing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Spinner className="w-12 h-12 text-white" />
        </div>
      )}
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-end md:items-center p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ y: '100%', scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: '100%', scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#0084FF] to-[#0066CC] px-4 py-3 flex justify-between items-center z-10">
              <h2 className="text-lg font-semibold text-white truncate">{plan?.name}</h2>
              <button
                onClick={onClose}
                className="text-white/90 hover:text-white transition-colors p-1"
                aria-label="إغلاق النافذة"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
              <div className="flex items-baseline justify-between bg-blue-50 rounded-lg p-4">
                <div className="space-y-1">
                  <span className="text-sm text-gray-600">{plan?.selectedOption.price} :سعر الخطه</span>
                </div>
                <span className="text-sm text-gray-600">الخطه: {plan?.selectedOption.duration}</span>
              </div>

              <PlanFeaturesList features={plan?.features} />
            </div>

            {/* Payment Section */}
            <div className="sticky bottom-12 bg-white border-t p-5 sm:p-6 space-y-3">
              <PaymentButtons
                loading={loading || paymentStatus === 'processing'}
                paymentStatus={paymentStatus}
                onUsdtSelect={() => setUsdtPaymentMethod('choose')}
                onStarsSelect={handleStarsPayment}
                telegramId={telegramId || undefined}
              />
              {paymentStatus === 'processing' && (
                <div className="mt-3 text-center text-sm" aria-live="polite">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="w-4 h-4 text-blue-600" />
                    <p className="text-blue-600 font-medium">جارٍ المعالجة... الرجاء الانتظار</p>
                  </div>
                </div>
              )}
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
              setExchangeDetails(null)
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default SubscriptionModal
