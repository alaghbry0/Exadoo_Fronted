'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useTelegramPayment } from '@/hooks/useTelegramPayment'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { useUserStore } from '@/stores/zustand/userStore'
import { handleTonPayment } from '@/utils/tonPayment'
import { useTelegram } from '@/context/TelegramContext'
import type { ModalPlanData } from '@/types/modalPlanData';
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

// عدّل هذه الدالة لترجع Promise<boolean>
export const useSubscriptionPayment = (plan: ModalPlanData | null, onSuccess: () => void) => {
  const { handleTelegramStarsPayment } = useTelegramPayment()
  const { telegramId } = useTelegram()
  const { telegramUsername, fullName } = useUserStore()
  const [tonConnectUI] = useTonConnectUI()
  const queryClient = useQueryClient()

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [loading, setLoading] = useState<boolean>(false)
  const [exchangeDetails, setExchangeDetails] = useState<ExchangeDetails | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const paymentSessionRef = useRef<{
    paymentToken?: string
    planId?: string
  }>({})

  const cleanupPaymentSession = useCallback(() => {
    localStorage.removeItem('paymentData')
    paymentSessionRef.current = {}
    setExchangeDetails(null)
  }, [])

  const resetPaymentStatus = useCallback(() => {
    setPaymentStatus('idle')
    cleanupPaymentSession()

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [cleanupPaymentSession])

  const handlePaymentSuccess = useCallback(() => {
    cleanupPaymentSession()
    setPaymentStatus('success')
    queryClient.invalidateQueries({
      queryKey: ['subscriptions', telegramId || '']
    })
    onSuccess()

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [cleanupPaymentSession, queryClient, telegramId, onSuccess])

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

  const restoreSession = useCallback(async () => {
    if (!plan || paymentStatus !== 'idle') return

    setIsInitializing(true)
    try {
      const savedData = localStorage.getItem('paymentData')
      if (!savedData) {
        setIsInitializing(false)
        return
      }

      const { paymentToken, planId, timestamp } = JSON.parse(savedData)

      if (Date.now() - timestamp > 30 * 60 * 1000) {
        localStorage.removeItem('paymentData')
        setIsInitializing(false)
        return
      }

      if (planId !== plan.selectedOption.id.toString()) {
        localStorage.removeItem('paymentData')
        setIsInitializing(false)
        return
      }

      if (paymentToken) {
        handlePaymentSuccess()
      }
    } catch (error) {
      console.error('فشل في استعادة الجلسة:', error)
      showToast.error('تعذر استعادة جلسة الدفع، يرجى البدء من جديد')
      localStorage.removeItem('paymentData')
    } finally {
      setIsInitializing(false)
    }
  }, [plan, paymentStatus, handlePaymentSuccess])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  useEffect(() => {
    if (paymentStatus === 'exchange_success') {
      const timer = setTimeout(() => {
        onSuccess()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [paymentStatus, onSuccess])

  const handleTonPaymentWrapper = useCallback(async () => {
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

      if (payment_token) {
        handlePaymentSuccess()
      } else {
        setPaymentStatus('failed')
      }
    } catch (error) {
      console.error('فشل الدفع:', error)
      showToast.error(error instanceof Error ? error.message : 'فشلت عملية الدفع')
      setPaymentStatus('failed')
    } finally {
      setLoading(false)
    }
  }, [plan, tonConnectUI, telegramId, telegramUsername, fullName, handlePaymentSuccess, setPaymentStatus])

  const startPollingPaymentStatus = useCallback((paymentToken: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/status?token=${paymentToken}`)
        if (!response.ok) throw new Error(response.statusText)

        const data = await response.json()
        if (data.status === 'exchange_success') {
          setPaymentStatus('exchange_success')
          localStorage.setItem('paymentData', JSON.stringify({
            paymentToken,
            planId: plan?.selectedOption.id.toString(),
            status: 'exchange_success',
            timestamp: Date.now()
          }))

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        }
      } catch (error) {
        console.error('خطأ في استطلاع حالة الدفع:', error)
      }
    }

    pollStatus()
    pollingIntervalRef.current = setInterval(pollStatus, 3000)
  }, [plan])

  // 👇 --- التعديل يبدأ هنا --- 👇
  const handleUsdtPaymentChoice = useCallback(async (method: 'wallet' | 'exchange'): Promise<boolean> => {
    if (!plan) return false;

    setLoading(true);
    try {
      if (method === 'wallet') {
        // منطق المحفظة يبقى كما هو، لكن نرجع true عند البدء
        await handleTonPaymentWrapper();
        return true;
      } else {
        // منطق منصات التداول
        let payment_token = paymentSessionRef.current.paymentToken || '';
        if (!payment_token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/confirm_payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Telegram-Id': telegramId || 'unknown'
            },
            body: JSON.stringify({
              webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET,
              planId: plan.selectedOption.id,
              telegramId,
              telegramUsername,
              fullName
            }),
          });

          if (!response.ok) throw new Error('فشل في إنشاء طلب الدفع');
          const data = await response.json();
          payment_token = data.payment_token;
        }

        paymentSessionRef.current = {
          paymentToken: payment_token,
          planId: plan.selectedOption.id.toString()
        };

        localStorage.setItem('paymentData', JSON.stringify({
          paymentToken: payment_token,
          planId: plan.selectedOption.id.toString(),
          timestamp: Date.now()
        }));

        setExchangeDetails({
          depositAddress: useTariffStore.getState().walletAddress || '0xRecipientAddress',
          amount: plan.selectedOption.price.toString(),
          network: 'TON Network',
          paymentToken: payment_token,
          planName: plan.name
        });

        setPaymentStatus('processing');
        startPollingPaymentStatus(payment_token);
        return true; // ✅ مهم جداً: أرجع true عند النجاح
      }
    } catch (error) {
      console.error('خطأ في عملية الدفع:', error);
      setPaymentStatus('failed');
      showToast.error('فشلت عملية الدفع، يرجى المحاولة مرة أخرى');
      return false; // ✅ مهم جداً: أرجع false عند الفشل
    } finally {
      setLoading(false);
    }
  }, [plan, telegramId, telegramUsername, fullName, startPollingPaymentStatus, handleTonPaymentWrapper]);
  // 👆 --- التعديل ينتهي هنا --- 👆

  const handleStarsPayment = async () => {
    // 👇 --- بداية التعديل --- 👇

    // 1. التحقق من البيانات بالطريقة الصحيحة
    // يجب أن نتأكد من وجود السعر ومعامل التحويل في `selectedOption`
    if (!plan || !plan.selectedOption.price || plan.selectedOption.telegramStarsPrice == null) {
        console.error("Missing plan data for Stars payment:", { plan });
        showToast.error("بيانات الخطة غير مكتملة للدفع بالنجوم.");
        return;
    }

    try {
        setLoading(true);
        // 2. تعيين حالة الدفع الصحيحة لإظهار Spinner على زر النجوم
        setPaymentStatus('processing_stars');

        // 3. الوصول إلى السعر النهائي من المسار الصحيح
        const finalUsdtPrice = plan.selectedOption.price;
    const starsMultiplier = plan.selectedOption.telegramStarsPrice;

    // لم تعد هناك حاجة لـ Number()
    const finalStarsPrice = Math.round(Number(finalUsdtPrice) * Number(starsMultiplier));

        // استدعاء دالة الدفع بالقيم الصحيحة
        const { paymentToken } = await handleTelegramStarsPayment(
            plan.selectedOption.id,
            finalStarsPrice
        );

        if (paymentToken) {
            handlePaymentSuccess();
        } else {
            // في حالة فشل الدفع (مثل إغلاق المستخدم للنافذة)
            setPaymentStatus('failed');
        }
    } catch (error) {
        // في حالة حدوث خطأ أثناء العملية
        console.error("Stars payment failed:", error);
        setPaymentStatus('failed');
        showToast.error("فشلت عملية الدفع بالنجوم.");
    } finally {
        // إيقاف التحميل في جميع الحالات
        setLoading(false);
    }
  };

  useEffect(() => {
    if (!exchangeDetails && paymentStatus === 'processing') {
      setPaymentStatus('idle')
    }
  }, [exchangeDetails, paymentStatus])

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  return {
    paymentStatus,
    loading: !!loading,
    exchangeDetails,
    setExchangeDetails,
    isInitializing,
    handleUsdtPaymentChoice,
    handleStarsPayment,
    resetPaymentStatus,
    cleanupPaymentSession
  }
}
