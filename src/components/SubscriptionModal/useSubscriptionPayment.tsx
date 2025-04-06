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
import { useQueryClient } from '@tanstack/react-query'
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



  // نظام إدارة الإشعارات المحلي (لإظهار Toast وغيرها)
  interface NotificationData {
    type?: 'overpayment' | 'subscription_success' | 'warning',
    status?: 'success' | 'failed' | 'pending' | 'warning',
    message?: string,
    invite_link?: string,
    formatted_message?: string
  }

  const notificationQueue = useRef<Array<{
    data: NotificationData
    priority: number
    timestamp: number
  }>>([])
  const isProcessing = useRef(false)

  const processNotificationQueue = useCallback(() => {
    if (isProcessing.current || notificationQueue.current.length === 0) return

    isProcessing.current = true

    notificationQueue.current.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return a.timestamp - b.timestamp
    })

    const nextNotification = notificationQueue.current.shift()!
    const { data } = nextNotification

    try {
      if (data.type === 'overpayment') {
        showToast.warning({
          message: data.message || 'تم اكتشاف دفع زائد',
          action: {
            text: 'اتصل بالدعم',
            onClick: () => window.open('https://t.me/ExaadoSupport', '_blank')
          }
        })
      } else if (data.type === 'subscription_success') {
        showToast.success({
          message: data.message || 'تم تجديد الاشتراك بنجاح',
          action: data.invite_link
            ? {
                text: 'انضم الآن',
                onClick: () => window.open(data.invite_link, '_blank')
              }
            : undefined
        })
      } else if (data.status === 'warning' || data.type === 'warning') {
        showToast.warning({
          message: data.message || 'تنبيه',
          action: data.invite_link
            ? {
                text: 'تفاصيل',
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
    } catch (error) {
      console.error('Error showing notification:', error)
    } finally {
      isProcessing.current = false
      setTimeout(processNotificationQueue, 2000)
    }
  }, [])

  const paymentSessionRef = useRef<{
    paymentToken?: string
    planId?: string
  }>({})

  // التحقق من صلاحية الجلسة عبر paymentToken (يبقى كما هو)
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

  // التحقق من حالة الدفع عبر paymentToken (يبقى كما هو)
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

  // عند نجاح الدفع: نقوم بإزالة بيانات الجلسة وتحديث الحالة
  const handlePaymentSuccess = useCallback(() => {
    localStorage.removeItem('paymentSession')
    localStorage.removeItem('paymentData')
    paymentSessionRef.current = {}
    setExchangeDetails(null)
    setPaymentStatus('idle')
    queryClient.invalidateQueries({
      queryKey: ['subscriptions', telegramId || '']
    })
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

  // إزالة منطق SSE واستعادة الجلسة الخاص به
  // (سيعتمد النظام الآن على WebSocket عبر Notifications في _app.tsx)
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
            // لا نستدعي startSSEConnection بعد الآن؛ سننتظر إشعار WebSocket من الخادم
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
  }, [plan, paymentStatus, verifyPaymentSession, checkPaymentStatus, handlePaymentSuccess])

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
      // بعد الحصول على payment_token، نعتمد على نظام WebSocket لإرسال إشعار الدفع من الخادم
      if (!payment_token) {
        setPaymentStatus('failed')
      }
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
        // لا نستدعي startSSEConnection؛ نعتمد على إشعار WebSocket من الخادم
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
        // نعتمد على إشعار WebSocket لتأكيد الدفع بدلاً من SSE
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
