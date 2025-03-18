'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheckCircle } from 'react-icons/fi'
import { useTelegramPayment } from '../hooks/useTelegramPayment';
import { useTonConnectUI } from '@tonconnect/ui-react'
import dynamic from 'next/dynamic';
import { useUserStore } from '../stores/zustand/userStore'
import { handleTonPayment } from '../utils/tonPayment'
import type { SubscriptionPlan } from '@/typesPlan'
import { useTelegram } from '../context/TelegramContext'
import { PaymentStatus } from '@/types/payment'
import { Spinner } from '../components/Spinner'
import { useQueryClient } from 'react-query'
import Bep20PaymentModal from '../components/Bep20PaymentModal'
import { FaEthereum } from 'react-icons/fa'

import usdtAnimationData from '../animations/usdt.json'
import starsAnimationData from '../animations/stars.json'

interface PaymentDetails {
  deposit_address: string
  network: string
  amount: string
  qr_code: string
  payment_token: string
}

const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
});

const SubscriptionModal = ({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) => {
  const { handleTelegramStarsPayment } = useTelegramPayment()
  const { telegramId } = useTelegram()
  const { telegramUsername, fullName } = useUserStore()
  const [tonConnectUI] = useTonConnectUI()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [loading, setLoading] = useState(false)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  // state لتفاصيل الدفع عبر BEP‑20 (يتضمن payment_token لاستخدامه في SSE)
  const [bep20PaymentDetails, setBep20PaymentDetails] = useState<PaymentDetails | null>(null)
  const [showBep20Payment, setShowBep20Payment] = useState(false)
  const queryClient = useQueryClient()
  const maxRetryCount = 3
  const retryDelay = 3000

  useEffect(() => {
    return () => {
      eventSource?.close()
    }
  }, [eventSource])

  const startSSEConnection = (paymentToken: string, retryCount = 0) => {
    setPaymentStatus('processing')
    const sseUrl = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sse`)
    sseUrl.searchParams.append('payment_token', paymentToken)
    sseUrl.searchParams.append('telegram_id', telegramId ?? 'unknown')

    const es = new EventSource(sseUrl.toString())
    setEventSource(es)

    const timeoutId = setTimeout(() => {
      es.close()
      setPaymentStatus('failed')
      if (retryCount < maxRetryCount) {
        setTimeout(() => startSSEConnection(paymentToken, retryCount + 1), retryDelay)
      }
    }, 300000)

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        switch (data.status) {
          case 'success':
            setPaymentStatus('success')
            queryClient.invalidateQueries(['subscriptions', telegramId])
            window.dispatchEvent(new CustomEvent('subscription_update', {
              detail: { invite_link: data.invite_link, formatted_message: data.message }
            }))
            es.close()
            break
          case 'failed':
            setPaymentStatus('failed')
            es.close()
            break
          default:
            setPaymentStatus('processing')
        }
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('❌ خطأ في معالجة حدث SSE:', error)
      }
    }

    es.onerror = () => {
      clearTimeout(timeoutId)
      es.close()
      setPaymentStatus('failed')
      if (retryCount < maxRetryCount) {
        setTimeout(() => startSSEConnection(paymentToken, retryCount + 1), retryDelay)
      }
    }
  }

  // دالة دفع BEP‑20: تُرسل طلب create‑payment وتخزن البيانات ثم تُبدأ اتصال SSE باستخدام payment_token
  const handleBep20PaymentWrapper = async () => {
    if (!plan) return
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/create-payment`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    planId: plan.selectedOption.id,
    telegramId: telegramId,
    full_name: fullName,
    username: telegramUsername,
    webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET || ''
  })
})
      if (!response.ok) throw new Error('فشل إنشاء الدفع')
      const data: PaymentDetails = await response.json()
      setBep20PaymentDetails(data)
      // بدء اتصال SSE باستخدام payment_token المُستلم
      startSSEConnection(data.payment_token)
      setShowBep20Payment(true)
    } catch (error) {
      console.error('BEP‑20 Payment error:', error)
      setPaymentStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTonPaymentWrapper = async () => {
    if (!plan) return
    try {
      setLoading(true)
      const selectedPlanId = plan.selectedOption.id.toString()
      const { payment_token } = await handleTonPayment(
        tonConnectUI,
        setPaymentStatus,
        selectedPlanId,
        telegramId || 'unknown',
        telegramUsername || 'unknown',
        fullName || 'Unknown'
      )
      if (payment_token) startSSEConnection(payment_token)
    } catch {
      setPaymentStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  const handleStarsPayment = async () => {
    if (!plan) return
    try {
      setLoading(true)
      const { paymentToken } = await handleTelegramStarsPayment(
        plan.selectedOption.id,
        plan.selectedOption.telegramStarsPrice
      )
      if (paymentToken) {
        startSSEConnection(paymentToken)
      } else {
        setPaymentStatus('failed')
      }
    } catch {
      setPaymentStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">الميزات المتضمنة:</h3>
                <ul className="space-y-3">
                  {plan?.features?.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <FiCheckCircle className="text-[#0084FF] mt-1 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Payment Section */}
            <div className="sticky bottom-12 bg-white border-t p-5 sm:p-6 space-y-3">
              {/* زر الدفع عبر BEP‑20 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBep20PaymentWrapper}
                disabled={loading || !telegramId || paymentStatus === 'processing'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
                aria-label="الدفع باستخدام BEP-20"
              >
                <FaEthereum className="w-5 h-5" />
                <span>الدفع عبر BEP-20</span>
              </motion.button>

              {/* أزرار الدفع الأخرى */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTonPaymentWrapper}
                disabled={loading || !telegramId || paymentStatus === 'processing'}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0084FF] to-[#0066CC] text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all ${
                  paymentStatus === 'processing' ? 'cursor-wait' : ''
                }`}
                aria-label="الدفع باستخدام USDT"
              >
                <Lottie animationData={usdtAnimationData} className="w-6 h-6" />
                <span>الدفع عبر USDT</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStarsPayment}
                disabled={loading || !telegramId || paymentStatus === 'processing'}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFC800] text-gray-900 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all ${
                  paymentStatus === 'processing' ? 'cursor-wait' : ''
                }`}
                aria-label="الدفع باستخدام Telegram Stars"
              >
                <Lottie animationData={starsAnimationData} className="w-6 h-6" />
                <span>
                  {paymentStatus === 'processing' ? 'جارٍ المعالجة...' : 'Telegram Stars'}
                  {!telegramId && ' (يتطلب تليجرام)'}
                </span>
              </motion.button>

              {paymentStatus === 'processing' && (
                <div className="mt-3 text-center text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="w-4 h-4" />
                    <p className="text-blue-600 font-medium">جارٍ المعالجة... الرجاء الانتظار</p>
                  </div>
                </div>
              )}
              {paymentStatus !== 'idle' && paymentStatus !== 'processing' && (
                <div className="mt-3 text-center text-sm">
                  {paymentStatus === 'success' && (
                    <p className="text-green-600 font-medium">✅ تمت العملية بنجاح</p>
                  )}
                  {paymentStatus === 'failed' && (
                    <p className="text-red-600 font-medium">❌ فشلت عملية الدفع</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* عرض نافذة BEP-20 Payment Modal مع بيانات الدفع المستلمة */}
      <AnimatePresence>
        {showBep20Payment && bep20PaymentDetails && (
          <Bep20PaymentModal
            plan={{ ...plan, ...bep20PaymentDetails }}
            onClose={() => {
              setShowBep20Payment(false)
              setBep20PaymentDetails(null)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default SubscriptionModal
