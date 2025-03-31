// PaymentButtons.tsx
'use client'
import { motion } from 'framer-motion'
import { Spinner } from '@/components/Spinner'
import {  FiStar } from 'react-icons/fi' // أيقونات جديدة
import type { PaymentStatus } from '@/types/payment'
import { FaEthereum } from 'react-icons/fa'

interface PaymentButtonsProps {
  loading: boolean
  paymentStatus: PaymentStatus
  onUsdtSelect: () => void
  onStarsSelect: () => void
  telegramId?: string
}

export const PaymentButtons = ({
  loading,

  onUsdtSelect,
  onStarsSelect,
  telegramId
}: PaymentButtonsProps) => (
  <div className="space-y-2">
    {/* زر الدفع عبر USDT */}
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onUsdtSelect}
      disabled={loading}
      className={`w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0084FF] to-[#0066CC] text-white rounded-lg ${
        loading ? 'opacity-75 cursor-not-allowed' : ''
      }`}
      aria-label="الدفع عبر USDT"
    >
      {loading ? (
        <Spinner className="w-5 h-5 text-white" />
      ) : (
        <>
          <FaEthereum className="w-4 h-5 text-white" />
          <span>الدفع عبر USDT</span>
        </>
      )}
    </motion.button>

    {/* زر الدفع باستخدام Telegram Stars */}
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onStarsSelect}
      disabled={!telegramId}
      className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FFD700] to-[#FFC800] text-gray-900 rounded-lg"
      aria-label="الدفع باستخدام Telegram Stars"
    >

       <FiStar className="w-4 h-6 text-amber-700" />
      <span>{!telegramId ? 'Telegram Stars (يتطلب تليجرام)' : 'Telegram Stars'}</span>
    </motion.button>
  </div>
)
