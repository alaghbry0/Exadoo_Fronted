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
    depositAddress: string
    amount: string
    network: string
    paymentToken: string
    planName?: string
  } | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const queryClient = useQueryClient()
  const maxRetryCount = 5
  const retryDelay = 5000

  // الاحتفاظ بالجلسة يعتمد الآن فقط على paymentToken و planId
  const paymentSessionRef = useRef<{
    paymentToken?: string
    planId?: string
    es?: EventSource
  }>({})

  // التحقق من صلاحية الجلسة مع الخادم عبر paymentToken
  const verifyPaymentSession = useCallback(async (paymentToken: string) => {
    try {
      const response = await fetch(`/api/verify-payment/${paymentToken}`)
      if (!response.ok) throw new Error('Invalid session')
      return await response.json()
    } catch (error) {
      localStorage.removeItem('paymentData')
      throw error
    }
  }, [])

  const checkPaymentStatus = useCallback(async (paymentToken: string) => {
    try {
      const res = await fetch(`/api/check-payment/${paymentToken}`)
      if (!res.ok) {
        localStorage.removeItem('paymentData')
        throw new Error('فشل في التحقق من حالة الدفع')
      }
      return await res.json()
    } catch (error) {
      console.error('Error checking payment status:', error)
      throw error
    }
  }, [])

  const handlePaymentSuccess = useCallback(() => {
    localStorage.removeItem('paymentSession')
    localStorage.removeItem('paymentData')
    paymentSessionRef.current = {}
    setExchangeDetails(null)
    setPaymentStatus('idle')
    queryClient.invalidateQueries(['subscriptions', telegramId])
  }, [queryClient, telegramId])

  // منع إغلاق الصفحة أثناء المعالجة
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (paymentStatus === 'processing') {
        e.preventDefault()
        e.returnValue = 'لديك عملية دفع قيد التقدم، هل أنت متأكد من المغادرة؟'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [paymentStatus])

  // إدارة اتصال SSE مع إعادة المحاولة باستخدام Exponential Backoff
  const startSSEConnection = useCallback((paymentToken: string, retryCount = 0) => {
    const delay = Math.min(1000 * 2 ** retryCount, 30000)

    if (paymentSessionRef.current.es) {
      paymentSessionRef.current.es.close()
    }

    const sseUrl = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sse`)
    sseUrl.searchParams.append('payment_token', paymentToken)
    sseUrl.searchParams.append('telegram_id', telegramId ?? 'unknown')

    const es = new EventSource(sseUrl.toString())
    paymentSessionRef.current.es = es

    const handleError = () => {
      es.close()
      if (retryCount < maxRetryCount) {
        setTimeout(() => startSSEConnection(paymentToken, retryCount + 1), delay)
      } else {
        localStorage.removeItem('paymentSession')
        paymentSessionRef.current = {}
        setPaymentStatus('failed')
        showToast.error('تعذر الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت')
      }
    }

    es.onopen = () => {
      console.log('SSE connection established')
      localStorage.setItem(
        'paymentSession',
        JSON.stringify({
          paymentToken,
          planId: plan?.selectedOption.id.toString(),
        })
      )
    }

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        console.log('📥 Received SSE event:', data)

        if (data.type === 'overpayment') {
          showToast.warning({
            message: data.message,
            action: {
              text: 'اتصل بالدعم',
              onClick: () => window.open('https://t.me/ExaadoSupport', '_blank')
            }
          })
        } else if (data.type === 'subscription_success') {
          showToast.success({
            message: data.message,
            action: data.invite_link
              ? {
                  text: 'انضم الآن',
                  onClick: () => window.open(data.invite_link, '_blank')
                }
              : undefined
          })
        } else {
          switch (data.status) {
            case 'success':
              showToast.success(data.message || 'تم تجديد الاشتراك بنجاح!')
              break
            case 'failed':
              showToast.error(data.message || 'فشلت عملية الدفع')
              break
          }
        }

        setPaymentStatus(data.status)
        queryClient.invalidateQueries(['subscriptions', telegramId])

        if (data.status === 'success') {
          if (data.invite_link) {
            window.dispatchEvent(
              new CustomEvent('subscription_update', {
                detail: {
                  invite_link: data.invite_link,
                  formatted_message: data.formatted_message
                }
              })
            )
          }
          es.close()
          handlePaymentSuccess()
        }
      } catch (error) {
        console.error('❌ Error processing SSE event:', error)
        showToast.error('حدث خطأ أثناء معالجة الدفع')
      }
    }

    es.addEventListener('message', handleMessage)
    es.addEventListener('error', handleError)

    return () => {
      es.removeEventListener('message', handleMessage)
      es.removeEventListener('error', handleError)
      es.close()
    }
  }, [
    telegramId,
    queryClient,
    plan?.selectedOption.id,
    maxRetryCount,
    retryDelay,
    handlePaymentSuccess,
    checkPaymentStatus
  ])

  // استعادة الجلسة من localStorage مع التحقق من صحتها باستخدام paymentToken و planId فقط
  useEffect(() => {
    const restoreSession = async () => {
      if (plan && paymentStatus === 'idle') {
        setIsInitializing(true)
        try {
          const savedData = localStorage.getItem('paymentData')
          if (!savedData) return

          const { paymentToken, planId } = JSON.parse(savedData)

          if (planId !== plan.selectedOption.id.toString()) {
            localStorage.removeItem('paymentData')
            return
          }

          const verification = await verifyPaymentSession(paymentToken)
          if (!verification.valid) {
            localStorage.removeItem('paymentData')
            return
          }

          const paymentStatusResp = await checkPaymentStatus(paymentToken)
          const selectedPlanPrice = plan.selectedOption.price.toString()

          if (paymentStatusResp.status === 'pending') {
            const depositAddress = useTariffStore.getState().walletAddress || '0xRecipientAddress'
            setExchangeDetails({
              depositAddress,
              amount: selectedPlanPrice,
              network: 'TON Network',
              paymentToken,
              planName: plan.name,
            })
            startSSEConnection(paymentToken)
          } else {
            localStorage.removeItem('paymentData')
            if (paymentStatusResp.status === 'success') handlePaymentSuccess()
          }
        } catch (error) {
          console.error('فشل في استعادة الجلسة:', error)
          showToast.error('تعذر استعادة جلسة الدفع، يرجى البدء من جديد')
          localStorage.removeItem('paymentData')
        } finally {
          setIsInitializing(false)
        }
      }
    }
    restoreSession()
  }, [plan, paymentStatus, verifyPaymentSession, checkPaymentStatus, startSSEConnection, handlePaymentSuccess])

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
        fullName || 'Unknown',

      )
      if (payment_token) startSSEConnection(payment_token)
    } catch (error) {
      console.error('فشل الدفع:', error)
      if (error instanceof Error) {
        showToast.error(error.message)
      } else {
        showToast.error('فشلت عملية الدفع')
      }
      setPaymentStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  // تعديل handleUsdtPaymentChoice لإدارة الجلسة باستخدام paymentToken فقط وعدم استخدام orderId
  const handleUsdtPaymentChoice = async (method: 'wallet' | 'exchange') => {
    if (!plan) return

    try {
      setLoading(true)
      if (method === 'wallet') {
        await handleTonPaymentWrapper()
      } else {
        // التحقق من وجود جلسة دفع سابقة باستخدام paymentToken
        let payment_token = paymentSessionRef.current.paymentToken || ''

        if (!payment_token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/confirm_payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Telegram-Id': telegramId || 'unknown',
              'Keep-Alive': 'timeout=3600'
            },
            body: JSON.stringify({
              webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET,
              planId: plan.selectedOption.id,
              telegramId,
              telegramUsername,
              fullName
            }),
          })

          if (!response.ok) throw new Error('فشل في إنشاء طلب الدفع')

          const data = await response.json()
          payment_token = data.payment_token
        }

        paymentSessionRef.current = {
          paymentToken: payment_token,
          planId: plan.selectedOption.id.toString()
        }
        const selectedPlanPrice = plan.selectedOption.price.toString()
        const deposit_address = useTariffStore.getState().walletAddress || '0xRecipientAddress'
        setExchangeDetails({
          depositAddress: deposit_address,
          amount: selectedPlanPrice,
          network: 'TON Network',
          paymentToken: payment_token,
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

  // إعادة تعيين حالة الدفع إذا لم تتوفر تفاصيل الدفع عند الإغلاق
  useEffect(() => {
    if (!exchangeDetails && paymentStatus === 'processing') {
      setPaymentStatus('idle')
    }
  }, [exchangeDetails, paymentStatus])

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

      {/* المودال الخاص بطريقة الدفع */}
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
              setPaymentStatus('idle')
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default SubscriptionModal
