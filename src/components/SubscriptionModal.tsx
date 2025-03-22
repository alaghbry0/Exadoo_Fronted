'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheckCircle } from 'react-icons/fi'
import { useTelegramPayment } from '../hooks/useTelegramPayment'
import { useTonConnectUI } from '@tonconnect/ui-react'
import dynamic from 'next/dynamic'
import { useUserStore } from '../stores/zustand/userStore'
import { handleTonPayment } from '../utils/tonPayment'
import type { SubscriptionPlan } from '@/typesPlan'
import { useTelegram } from '../context/TelegramContext'
import { PaymentStatus } from '@/types/payment'
import { Spinner } from '../components/Spinner'
import { useQueryClient } from 'react-query'
import { v4 as uuidv4 } from 'uuid'
import { UsdtPaymentMethodModal } from '../components/UsdtPaymentMethodModal'
import { ExchangePaymentModal } from '../components/ExchangePaymentModal'
import { useTariffStore } from '../stores/zustand'
import { showToast } from '../components/ui/Toast'
import usdtAnimationData from '../animations/usdt.json'
import starsAnimationData from '../animations/stars.json'

const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
})

const SubscriptionModal = ({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) => {
  const { handleTelegramStarsPayment } = useTelegramPayment()
  const { telegramId } = useTelegram()
  const { telegramUsername, fullName } = useUserStore()
  const [tonConnectUI] = useTonConnectUI()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [loading, setLoading] = useState(false)
  const [usdtPaymentMethod, setUsdtPaymentMethod] = useState<'wallet' | 'exchange' | 'choose' | null>(null)
  const [exchangeDetails, setExchangeDetails] = useState<{
    orderId: string
    depositAddress: string
    amount: string
    network: string
    paymentToken: string
    planName?: string
  } | null>(null)

  const queryClient = useQueryClient()
  const maxRetryCount = 5 // زيادة عدد المحاولات
  const retryDelay = 5000 // زيادة زمن إعادة المحاولة

  // مراجع لتخزين بيانات الجلسة
  const paymentSessionRef = useRef<{
    paymentToken?: string
    orderId?: string
    planId?: string
    es?: EventSource
  }>({})

  // تحميل الجلسة المحفوظة من localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('paymentSession')
    if (savedSession) {
      paymentSessionRef.current = JSON.parse(savedSession)
    }
  }, [])

  // حفظ بيانات الدفع في localStorage عند تحديث exchangeDetails
  useEffect(() => {
    if (exchangeDetails && plan) {
      localStorage.setItem(
        'paymentData',
        JSON.stringify({
          paymentToken: exchangeDetails.paymentToken,
          orderId: exchangeDetails.orderId,
          planId: plan.selectedOption.id.toString()
        })
      )
    }
  }, [exchangeDetails, plan])

  // تعديل useEffect الخاص باستعادة الجلسة
  useEffect(() => {
    const restoreSession = async () => {
      if (plan) {
        const savedData = localStorage.getItem('paymentData')
        if (savedData) {
          const { paymentToken, orderId, planId } = JSON.parse(savedData)
          if (planId === plan.selectedOption.id.toString() && paymentToken) {
            const depositAddress = useTariffStore.getState().walletAddress || '0xRecipientAddress'
            setExchangeDetails({
              orderId,
              depositAddress,
              amount: plan.selectedOption.price,
              network: 'TON Network',
              paymentToken,
              planName: plan.name,
            })
            startSSEConnection(paymentToken)
          }
        }
      }
    }

    restoreSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]) // تم إصلاح الإعتماديات هنا

  // تنظيف الجلسة عند النجاح/الفشل
  const handlePaymentSuccess = useCallback(() => {
    localStorage.removeItem('paymentSession')
    localStorage.removeItem('paymentData')
    paymentSessionRef.current = {}
    if (exchangeDetails) {
      setExchangeDetails(null) // إغلاق نافذة الدفع عند النجاح
    }
  }, [exchangeDetails])

  // تعديل تعريف الدالة startSSEConnection مع تضمين الإعتماديات المطلوبة
  const startSSEConnection = useCallback((paymentToken: string, retryCount = 0) => {
    setPaymentStatus('processing')

    if (paymentSessionRef.current.es) {
      paymentSessionRef.current.es.close()
    }

    const sseUrl = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sse`)
    sseUrl.searchParams.append('payment_token', paymentToken)
    sseUrl.searchParams.append('telegram_id', telegramId ?? 'unknown')

    const es = new EventSource(sseUrl.toString())
    paymentSessionRef.current.es = es

    es.onopen = () => {
      console.log('SSE connection established')
      // حفظ الجلسة
      localStorage.setItem(
        'paymentSession',
        JSON.stringify({
          paymentToken,
          orderId: paymentSessionRef.current.orderId,
          planId: plan?.selectedOption.id.toString(),
        })
      )
    }

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        switch (data.status) {
          case 'success':
            setPaymentStatus('success')
            queryClient.invalidateQueries(['subscriptions', telegramId])
            if (data.invite_link) {
              window.dispatchEvent(
                new CustomEvent('subscription_update', {
                  detail: { invite_link: data.invite_link, formatted_message: data.formatted_message }
                })
              )
            }
            es.close()
            handlePaymentSuccess()
            showToast.success(data.message || 'تم تجديد الاشتراك بنجاح!')
            break
          case 'failed':
            setPaymentStatus('failed')
            es.close()
            showToast.error(data.message || 'فشلت عملية الدفع، يرجى المحاولة مرة أخرى')
            break
          default:
            setPaymentStatus('processing')
        }
      } catch (error) {
        console.error('❌ خطأ في معالجة حدث SSE:', error)
      }
    }

    es.addEventListener('message', handleMessage)

    es.onerror = () => {
      if (retryCount < maxRetryCount) {
        setTimeout(() => startSSEConnection(paymentToken, retryCount + 1), retryDelay)
      } else {
        localStorage.removeItem('paymentSession')
        paymentSessionRef.current = {}
        setPaymentStatus('failed')
        showToast.error('تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت')
      }
      es.close()
    }
  }, [
    telegramId,
    queryClient,
    handlePaymentSuccess,
    plan?.selectedOption.id, // استخدام القيمة المباشرة بدلاً من الكائن كامل
    maxRetryCount,
    retryDelay
  ])

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

  // تعديل handleUsdtPaymentChoice مع التحقق من الجلسة السابقة وإصلاح نوع البيانات في paymentToken
  const handleUsdtPaymentChoice = async (method: 'wallet' | 'exchange') => {
    if (!plan) return

    try {
      setLoading(true)
      if (method === 'wallet') {
        await handleTonPaymentWrapper()
      } else {
        // التحقق من وجود جلسة سابقة
        const existingSession = paymentSessionRef.current
        const isSamePlan = existingSession.planId === plan.selectedOption.id.toString()

        let orderId = existingSession.orderId
        let payment_token = existingSession.paymentToken || '' // إضافة قيمة افتراضية

        if (!orderId || !isSamePlan) {
          orderId = uuidv4()
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/confirm_payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Telegram-Id': telegramId || 'unknown',
              'Keep-Alive': 'timeout=3600' // إبقاء الاتصال لمدة ساعة
            },
            body: JSON.stringify({
              webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET,
              planId: plan.selectedOption.id,
              //amount: plan.selectedOption.price,
              amount:0.01,
              telegramId,
              telegramUsername,
              fullName,
              orderId,
            }),
          })

          if (!response.ok) throw new Error('فشل في إنشاء طلب الدفع')

          const data = await response.json()
          payment_token = data.payment_token
        }

        // تحديث المرجع
        paymentSessionRef.current = {
          paymentToken: payment_token,
          orderId,
          planId: plan.selectedOption.id.toString()
        }

        const deposit_address = useTariffStore.getState().walletAddress || '0xRecipientAddress'
        setExchangeDetails({
          orderId,
          depositAddress: deposit_address,
          amount: plan.selectedOption.price,
          network: 'TON Network',
          paymentToken: payment_token!, // استخدام Non-null assertion إذا كنت متأكداً من القيمة
          planName: plan.name
        })

        startSSEConnection(payment_token)
      }
    } catch (error) {
      console.error('خطأ في عملية الدفع:', error)
      setPaymentStatus('failed')
      showToast.error('فشلت عملية الدفع، يرجى المحاولة مرة أخرى')
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

  // إعادة تعيين حالة الدفع عند إغلاق النافذة إذا لم يكن هناك تفاصيل
  useEffect(() => {
    if (!exchangeDetails && paymentStatus === 'processing') {
      setPaymentStatus('idle')
    }
  }, [exchangeDetails, paymentStatus])

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
              {/* زر الدفع عبر USDT */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUsdtPaymentMethod('choose')}
                disabled={loading || paymentStatus === 'processing'}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0084FF] to-[#0066CC] text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all ${
                  loading || paymentStatus === 'processing' ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                aria-label="الدفع باستخدام USDT"
              >
                {loading ? (
                  <Spinner className="w-5 h-5 text-white" />
                ) : (
                  <>
                    <Lottie animationData={usdtAnimationData} className="w-6 h-6" />
                    <span>الدفع عبر USDT</span>
                  </>
                )}
              </motion.button>

              {/* زر الدفع باستخدام Telegram Stars */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStarsPayment}
                disabled={loading || !telegramId || paymentStatus === 'processing'}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFC800] text-gray-900 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all ${
                  paymentStatus === 'processing' ? 'cursor-wait opacity-75' : ''
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

      {/* المكونات الجديدة */}
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
              setPaymentStatus('idle') // إعادة تعيين الحالة عند الإغلاق
            }}
            onSuccess={handlePaymentSuccess} // تمرير دالة النجاح
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default SubscriptionModal
