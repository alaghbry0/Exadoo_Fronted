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
// استيراد دالتي registerPaymentCallback و unregisterPaymentCallback من _app.tsx
import { registerPaymentCallback, unregisterPaymentCallback } from '@/pages/_app'

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

  const paymentSessionRef = useRef<{
    paymentToken?: string
    planId?: string
  }>({})

  // إعادة تعيين حالة الدفع
  const resetPaymentStatus = useCallback(() => {
    setPaymentStatus('idle')
  }, [])

  // عند نجاح الدفع: نقوم بإزالة بيانات الجلسة وتحديث الحالة
  const handlePaymentSuccess = useCallback(() => {
    localStorage.removeItem('paymentSession')
    localStorage.removeItem('paymentData')
    paymentSessionRef.current = {}
    setExchangeDetails(null)
    setPaymentStatus('success') // تم تغييرها من 'idle' إلى 'success' لعرض نافذة النجاح
    queryClient.invalidateQueries({
      queryKey: ['subscriptions', telegramId || '']
    })
    onSuccess()
  }, [queryClient, telegramId, onSuccess])

  // تنظيف جلسات الدفع السابقة
  const cleanupPreviousPaymentSessions = useCallback(() => {
    // إلغاء تسجيل callback السابق إذا كان موجودًا
    if (paymentSessionRef.current.paymentToken) {
      unregisterPaymentCallback(paymentSessionRef.current.paymentToken)
    }
    // مسح البيانات المخزنة محليًا
    localStorage.removeItem('paymentData')
    localStorage.removeItem('paymentSession')
    // إعادة تعيين المرجع
    paymentSessionRef.current = {}
    // إعادة تعيين الحالة
    setExchangeDetails(null)
    setPaymentStatus('idle')
  }, [])

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

  // إزالة منطق SSE واستعادة الجلسة - تم تبسيطه
  useEffect(() => {
    const restoreSession = async () => {
      if (plan && paymentStatus === 'idle') {
        setIsInitializing(true)
        try {
          const savedData = localStorage.getItem('paymentData')
          if (!savedData) {
            setIsInitializing(false)
            return
          }
          const { paymentToken, planId } = JSON.parse(savedData)
          if (planId !== plan.selectedOption.id.toString()) {
            localStorage.removeItem('paymentData')
            setIsInitializing(false)
            return
          }
          // تسجيل callback للـpaymentToken للتحديث عند استلام إشعار
          registerPaymentCallback(paymentToken, (status) => {
            if (status === 'success') {
              handlePaymentSuccess()
            } else {
              showToast.error('فشلت عملية الدفع')
              setPaymentStatus('failed')
            }
          })
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
  }, [plan, paymentStatus, handlePaymentSuccess])

  // إدارة عملية الدفع عبر TON – تم تعديلها لاستدعاء وظيفة التنظيف قبل بدء عملية جديدة
  const handleTonPaymentWrapper = async () => {
    if (!plan) return

    // تنظيف جلسات الدفع السابقة
    cleanupPreviousPaymentSessions()

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

      if (payment_token) {
        // تسجيل في نظام مراقبة الدفعات ثم انتظار إشعار WebSocket
        registerPaymentCallback(payment_token, (status) => {
          if (status === 'success') {
            handlePaymentSuccess()
          } else {
            setPaymentStatus('failed')
          }
        })

        // تخزين بيانات الجلسة في localStorage للاستعادة لاحقًا إذا لزم الأمر
        localStorage.setItem(
          'paymentData',
          JSON.stringify({
            paymentToken: payment_token,
            planId: selectedPlanId
          })
        )

        // تحديث الحالة إلى "processing" بدلاً من "success" – سننتظر الإشعار
        setPaymentStatus('processing')
      } else {
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

  // إدارة اختيار الدفع عبر USDT – تم تعديلها لاستدعاء وظيفة التنظيف قبل بدء العملية
  const handleUsdtPaymentChoice = async (method: 'wallet' | 'exchange') => {
    if (!plan) return

    // تنظيف جلسات الدفع السابقة
    cleanupPreviousPaymentSessions()

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

        // تخزين معلومات الجلسة
        localStorage.setItem(
          'paymentData',
          JSON.stringify({
            paymentToken: payment_token,
            planId: plan.selectedOption.id.toString()
          })
        )

        // تسجيل callback للانتظار وتلقي إشعارات WebSocket
        registerPaymentCallback(payment_token, (status) => {
          if (status === 'success') {
            handlePaymentSuccess()
            // إذا كان هناك تفاصيل Exchange مفتوحة، نقوم بإغلاقها
            if (exchangeDetails) {
              setExchangeDetails(null)
            }
          } else {
            setPaymentStatus('failed')
          }
        })

        const selectedPlanPrice = plan.selectedOption.price.toString()
        const depositAddress = useTariffStore.getState().walletAddress || '0xRecipientAddress'

        // إضافة اسم الخطة لتحسين تجربة المستخدم
        setExchangeDetails({
          depositAddress,
          amount: selectedPlanPrice,
          network: 'TON Network',
          paymentToken: payment_token,
          planName: plan.name
        })

        // تحديث الحالة إلى processing
        setPaymentStatus('processing')
      }
    } catch (error) {
      console.error('خطأ في عملية الدفع:', error)
      setPaymentStatus('failed')
      showToast.error('فشلت عملية الدفع، يرجى المحاولة مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  // إدارة دفع Telegram Stars – تم تعديلها لاستدعاء وظيفة التنظيف قبل بدء العملية
  const handleStarsPayment = async () => {
    if (!plan) return
    // تنظيف جلسات الدفع السابقة
    cleanupPreviousPaymentSessions()

    try {
      setLoading(true)
      const { paymentToken } = await handleTelegramStarsPayment(
        plan.selectedOption.id,
        plan.selectedOption.telegramStarsPrice
      )

      if (paymentToken) {
        // تسجيل في نظام مراقبة الدفعات
        registerPaymentCallback(paymentToken, (status) => {
          if (status === 'success') {
            handlePaymentSuccess()
          } else {
            setPaymentStatus('failed')
          }
        })

        // تخزين معلومات الجلسة
        localStorage.setItem(
          'paymentData',
          JSON.stringify({
            paymentToken,
            planId: plan.selectedOption.id.toString()
          })
        )

        // تحديث الحالة إلى processing بدلاً من success – سننتظر الإشعار
        setPaymentStatus('processing')
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
    handleStarsPayment,
    resetPaymentStatus
  }
}
