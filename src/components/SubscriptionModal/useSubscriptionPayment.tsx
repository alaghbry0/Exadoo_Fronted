// useSubscriptionPayment.ts
'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useTelegramPayment } from '@/hooks/useTelegramPayment'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { useUserStore } from '@/stores/zustand/userStore'
import { handleTonPayment } from '@/utils/tonPayment'
import { useTelegram } from '@/context/TelegramContext'
import type { SubscriptionPlan } from '@/typesPlan'
import { PaymentStatus } from '@/types/payment'
import { useQueryClient } from 'react-query'
import { useTariffStore } from '@/stores/zustand'
import { showToast } from '@/components/ui/Toast'

interface ExchangeDetails {
  depositAddress: string
  amount: string
  network: string
  paymentToken: string
  planName?: string
}

export const useSubscriptionPayment = (plan: SubscriptionPlan | null, onSuccess: () => void) => {
  const { handleTelegramStarsPayment } = useTelegramPayment()
  const { telegramId } = useTelegram()
  const { telegramUsername, fullName } = useUserStore()
  const [tonConnectUI] = useTonConnectUI()
  const queryClient = useQueryClient()

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [loading, setLoading] = useState(false)
  const [exchangeDetails, setExchangeDetails] = useState<ExchangeDetails | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const maxRetryCount = 5

  const paymentSessionRef = useRef<{
    paymentToken?: string
    planId?: string
    es?: EventSource
  }>({})

  // التحقق من صلاحية الجلسة عبر paymentToken
  const verifyPaymentSession = useCallback(async (paymentToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-payment/${paymentToken}`)
      if (!response.ok) throw new Error('Invalid session')
      return await response.json()
    } catch (error) {
      localStorage.removeItem('paymentData')
      throw error
    }
  }, [])

  // التحقق من حالة الدفع عبر paymentToken
  const checkPaymentStatus = useCallback(async (paymentToken: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/check-payment/${paymentToken}`)
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

  // عند نجاح الدفع
  const handlePaymentSuccess = useCallback(() => {
    localStorage.removeItem('paymentSession')
    localStorage.removeItem('paymentData')
    paymentSessionRef.current = {}
    setExchangeDetails(null)
    setPaymentStatus('idle')
    queryClient.invalidateQueries(['subscriptions', telegramId])
    onSuccess()
  }, [queryClient, telegramId, onSuccess])

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

  // إدارة اتصال SSE مع إعادة المحاولة
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
    handlePaymentSuccess
  ])

  // استعادة الجلسة من localStorage
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

  // إدارة عملية الدفع عبر TON
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

  // إدارة اختيار الدفع عبر USDT
  const handleUsdtPaymentChoice = async (method: 'wallet' | 'exchange') => {
    if (!plan) return

    try {
      setLoading(true)
      if (method === 'wallet') {
        await handleTonPaymentWrapper()
      } else {
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
        const depositAddress = useTariffStore.getState().walletAddress || '0xRecipientAddress'
        setExchangeDetails({
          depositAddress,
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

  // إدارة دفع Telegram Stars
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

  // إعادة تعيين حالة الدفع إذا لم تتوفر تفاصيل الدفع
  useEffect(() => {
    if (!exchangeDetails && paymentStatus === 'processing') {
      setPaymentStatus('idle')
    }
  }, [exchangeDetails, paymentStatus])

  return {
    paymentStatus,
    loading,
    exchangeDetails,
    setExchangeDetails,
    isInitializing,
    handleTonPaymentWrapper,
    handleUsdtPaymentChoice,
    handleStarsPayment
  }
}
