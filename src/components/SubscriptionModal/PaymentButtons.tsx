// src/components/SubscriptionModal/PaymentButtons.tsx
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import starsAnimation from '@/animations/stars.json'
import usdtAnimation from '@/animations/usdt.json'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const PaymentButtons = ({
  loading,
  telegramId,
  handlePayment, // دالة الدفع بـ Telegram Stars
  handleTonPayment // دالة الدفع بـ TON
}: {
  loading: boolean
  telegramId: string | null
  handlePayment: () => void
  handleTonPayment: () => void
}) => {
  return (
    <div className="mt-6 space-y-4" dir="rtl">
      {/* زر الدفع عبر USDT */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleTonPayment}
        className="w-full flex flex-row-reverse items-center justify-between px-6 py-3 bg-gradient-to-r from-[#1a75c4] to-[#2390f1] text-white rounded-xl text-base font-bold shadow-lg hover:shadow-2xl transition-transform duration-200"
      >
        <Lottie animationData={usdtAnimation} className="w-10 h-10" loop={true} />
        <span className="ml-2 text-right">الدفع عبر USDT</span>
      </motion.button>

      {/* زر الدفع بـ Telegram Stars */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handlePayment}
        disabled={loading || !telegramId}
        className={`w-full flex flex-row-reverse items-center justify-between px-6 py-3 bg-gradient-to-r from-[#FFC800] to-[#FFD700] text-[#1a202c] rounded-xl text-base font-bold shadow-lg hover:shadow-2xl transition-transform duration-200 ${
          loading || !telegramId ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Lottie animationData={starsAnimation} className="w-10 h-10" loop={true} />
        <span className="ml-2 text-right">
          {loading ? 'جاري المعالجة...' : 'الدفع بـ Telegram Stars'}
          {!telegramId && ' (يتطلب تليجرام)'}
        </span>
      </motion.button>
    </div>
  )
}

export default PaymentButtons
