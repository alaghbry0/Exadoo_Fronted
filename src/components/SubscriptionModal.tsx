'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useTelegramPayment } from '../hooks/useTelegramPayment'
import { useTelegram } from '../context/TelegramContext'
import SubscriptionPlanCard from '../components/SubscriptionModal/SubscriptionPlanCard'
import PaymentButtons from '../components/SubscriptionModal/PaymentButtons'

type SubscriptionPlan = {
  id: number
  name: string
  price: string
  description: string
  features: string[]
  color: string
}

const SubscriptionModal = ({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) => {
  const { handleTelegramStarsPayment } = useTelegramPayment()
  const { telegramId } = useTelegram()
  const [loading, setLoading] = useState(false)
  const [isTelegramAvailable, setIsTelegramAvailable] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegramAvailable(true)
    }
  }, [])

  const handlePayment = async () => {
    if (!plan || !telegramId) return

    try {
      setLoading(true)

      await handleTelegramStarsPayment(plan.id, parseFloat(plan.price.replace(/[^0-9.]/g, '')), async () => {
        try {
          const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id: telegramId, plan_id: plan.id }),
          })

          if (response.ok) {
            console.log("✅ تم تفعيل الاشتراك بنجاح")

            if (isTelegramAvailable) {
              window.Telegram?.WebApp?.showAlert('✅ تم تفعيل الاشتراك بنجاح!', () => {
                onClose()
                window.location.reload()
              })
            } else {
              alert("✅ تم تفعيل الاشتراك بنجاح!")
              onClose()
              window.location.reload()
            }
          } else {
            throw new Error(`❌ فشل في تفعيل الاشتراك: ${await response.text()}`)
          }
        } catch (error) {
          console.error("❌ خطأ أثناء طلب الاشتراك:", error)

          if (isTelegramAvailable) {
            window.Telegram?.WebApp?.showAlert('❌ فشل تفعيل الاشتراك، يرجى المحاولة لاحقًا.')
          } else {
            alert('❌ فشل تفعيل الاشتراك، يرجى المحاولة لاحقًا.')
          }
        }
      })
    } catch (error) {
      console.error("❌ خطأ أثناء عملية الدفع:", error)

      if (isTelegramAvailable) {
        window.Telegram?.WebApp?.showAlert(
          '❌ فشلت عملية الدفع: ' + (error instanceof Error ? error.message : 'خطأ غير معروف')
        )
      } else {
        alert('❌ فشلت عملية الدفع: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {plan && (
        <motion.div
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex justify-center items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-t-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden"
            style={{ height: '65vh', maxHeight: 'calc(180vh - 70px)', marginBottom: '59px' }}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 🔹 رأس النافذة */}
            <div className="bg-[#f8fbff] px-4 py-3 flex justify-between items-center border-b sticky top-0">
              <button onClick={onClose} className="text-gray-500 hover:text-[#2390f1] transition-colors">
                <FiX className="w-6 h-6" />
              </button>
              <h2 className="text-base font-semibold text-[#1a202c] text-right flex-1 pr-2">{plan.name}</h2>
            </div>

            {/* 🔹 محتوى النافذة */}
            <SubscriptionPlanCard plan={plan} />

            {/* 🔹 خيارات الدفع */}
            <PaymentButtons loading={loading} telegramId={telegramId} handlePayment={handlePayment} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SubscriptionModal
