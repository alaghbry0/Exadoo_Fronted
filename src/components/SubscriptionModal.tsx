// src/components/SubscriptionModal.tsx
'use client'

import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useTelegramPayment } from '../hooks/useTelegramPayment'
import { useTelegram } from '../context/TelegramContext'
import SubscriptionPlanCard from '../components/SubscriptionModal/SubscriptionPlanCard'
import { useTonConnectUI } from '@tonconnect/ui-react'
import { useUserStore } from '../stores/zustand/userStore'
import { handleTonPayment } from '../utils/tonPayment'
import { useTariffStore } from '../stores/zustand'
import { useProfileStore } from '../stores/profileStore'
import { useSessionStore } from '../stores/sessionStore'

type SubscriptionOption = {
  id: number
  duration: string
  price: string
}

type SubscriptionPlan = {
  id: number
  name: string
  description: string
  features: string[]
  color: string
  subscriptionOptions: SubscriptionOption[]
  selectedOption: SubscriptionOption
}

const SubscriptionModal = ({
  plan,
  onClose
}: {
  plan: SubscriptionPlan | null
  onClose: () => void
}) => {
  const { handleTelegramStarsPayment } = useTelegramPayment()
  const { telegramId } = useTelegram()
  const { telegramUsername, fullName } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false)
  const [tonConnectUI] = useTonConnectUI()
  const [paymentStatus, setPaymentStatus] = useState<string | null>('idle')

  const { setTariffId } = useTariffStore()
  useProfileStore()
  useSessionStore()

  useEffect(() => {
    console.log('🔍 Zustand Stores:', {
      TariffStore: useTariffStore.getState(),
      ProfileStore: useProfileStore.getState(),
      SessionStore: useSessionStore.getState()
    })
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegramAvailable(true)
    }
  }, [])

  useEffect(() => {
    console.log('🔍 Checking Telegram ID:', telegramId)
  }, [telegramId])

  const showTelegramAlert = (message: string, callback?: () => void) => {
    if (isTelegramAvailable && window.Telegram?.WebApp?.showAlert) {
      window.Telegram.WebApp.showAlert(message, callback)
    } else {
      alert(message)
      callback?.()
    }
  }

  const handlePayment = async () => {
    if (!plan) return

    try {
      setLoading(true)
      setTariffId(plan.id.toString())
      await handleTelegramStarsPayment(
        plan.id,
        parseFloat(plan.selectedOption.price.replace(/[^0-9.]/g, ''))
      )
    } catch (error) {
      console.error('❌ خطأ أثناء عملية الدفع:', error)
      showTelegramAlert(
        '❌ فشلت عملية الدفع: ' +
          (error instanceof Error ? error.message : 'خطأ غير معروف')
      )
    } finally {
      setLoading(false)
      console.log(
        '📢 Tariff Store بعد الدفع (Telegram Stars):',
        useTariffStore.getState().tariffId
      )
    }
  }

  const handleTonPaymentWrapper = async () => {
    if (!plan) {
      console.error('❌ فشل استدعاء handleTonPaymentWrapper: الخطة غير متاحة!')
      showTelegramAlert('⚠️ يرجى تحديد خطة اشتراك قبل المتابعة.')
      return
    }

    console.log('🟢 استدعاء handleTonPaymentWrapper...')
    console.log('🟢 البيانات المرسلة إلى handleTonPayment:', {
      tariffId: plan.id.toString(),
      telegramId: telegramId || 'غير متوفر',
      telegramUsername: telegramUsername || 'غير متوفر',
      fullName: fullName || 'غير متوفر'
    })

    await handleTonPayment(
      tonConnectUI,
      setPaymentStatus,
      plan.id.toString(),
      telegramId || 'unknown_user',
      telegramUsername || 'unknown_username',
      fullName || 'Unknown User'
    )

    setTariffId(plan.id.toString())
  }

  return (
    <>
      {plan && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          dir="LTR"
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس النافذة بخلفية متدرجة */}
            <div
              className="bg-gradient-to-l from-[#1a75c4] to-[#2390f1] px-6 py-4 flex items-center justify-between"
              dir="LTR"
            >
              <h2 className="text-lg font-bold text-white text-right">
                {plan.name}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6" dir="LTR">
              <SubscriptionPlanCard
                plan={plan}
                loading={loading}
                telegramId={telegramId}
                handlePayment={handlePayment}
                handleTonPayment={handleTonPaymentWrapper}
              />

              {/* تمت إزالة PaymentButtons هنا لتجنب التكرار */}
              <div className="mt-4 text-center">
                {paymentStatus === 'pending' && (
                  <p className="text-blue-600 font-medium">جاري معالجة الدفع...</p>
                )}
                {paymentStatus === 'success' && (
                  <p className="text-green-600 font-bold">
                    ✅ تمت عملية الدفع بنجاح!
                  </p>
                )}
                {paymentStatus === 'failed' && (
                  <p className="text-red-600 font-bold">
                    ❌ فشل الدفع، يرجى المحاولة مجددًا.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default SubscriptionModal
