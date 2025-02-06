import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import starsAnimation from '@/animations/stars.json'
import usdtAnimation from '@/animations/usdt.json'
import { useState } from 'react'
import ComingSoonModal from './ComingSoonModal'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const PaymentButtons = ({
  loading,
  telegramId,
  handlePayment
}: {
  loading: boolean
  telegramId: string | null
  handlePayment: () => void
}) => {
  const [showUSDTModal, setShowUSDTModal] = useState(false)

  return (
    <div className="sticky bottom-0 bg-white pt-4 pb-8 space-y-2 border-t">
      <ComingSoonModal show={showUSDTModal} onClose={() => setShowUSDTModal(false)} />

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowUSDTModal(true)}
        className="w-full flex items-center justify-between px-4 py-2.5
          bg-gradient-to-l from-[#2390f1] to-[#1a75c4] text-white rounded-lg text-sm
          shadow-md hover:shadow-lg transition-shadow"
      >
        <Lottie animationData={usdtAnimation} className="w-8 h-8" loop={true} />
        <span className="font-medium ml-2">الدفع عبر USDT</span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePayment}
        disabled={loading || !telegramId}
        className={`w-full flex items-center justify-between px-4 py-2.5
          bg-gradient-to-l from-[#FFD700] to-[#FFC800] text-[#1a202c] rounded-lg text-sm
          shadow-md hover:shadow-lg transition-shadow
          ${loading || !telegramId ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Lottie animationData={starsAnimation} className="w-8 h-8" loop={true} />
        <span className="font-medium ml-2">
          {loading ? "جاري المعالجة..." : "الدفع بـ Telegram Stars"}
          {!telegramId && " (يتطلب فتح التطبيق داخل تليجرام)"}
        </span>
      </motion.button>
    </div>
  )
}

export default PaymentButtons