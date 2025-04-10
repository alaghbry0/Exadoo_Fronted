// PaymentButtons.tsx
'use client'
import { motion } from 'framer-motion'
import { Spinner } from '@/components/Spinner'
import type { PaymentStatus } from '@/types/payment'
import { Star, Wallet } from 'lucide-react';

interface PaymentButtonsProps {
  loading: boolean
  paymentStatus: PaymentStatus
  onUsdtSelect: () => void
  onStarsSelect: () => void
  telegramId?: string
}

export const PaymentButtons = ({
  loading,
  paymentStatus,
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
      disabled={loading || paymentStatus !== 'idle'}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0084FF] to-[#0066CC] text-white rounded-lg ${
        loading || paymentStatus !== 'idle' ? 'opacity-75 cursor-not-allowed' : ''
      } shadow-md transition-all duration-200`}
      aria-label="الدفع عبر USDT"
    >
      {loading ? (
        <Spinner className="w-5 h-5 text-white" />
      ) : (
        <>
          <Wallet className="w-5 h-5 text-white" />
          <span className="font-bold">الدفع عبر USDT</span>
        </>
      )}
    </motion.button>

    {/* Telegram Stars Payment Button */}
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onStarsSelect}
      disabled={!telegramId || loading || paymentStatus !== 'idle'}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFC800] text-gray-900 rounded-lg ${
        !telegramId || loading || paymentStatus !== 'idle' ? 'opacity-75 cursor-not-allowed' : ''
      } shadow-md transition-all duration-200`}
      aria-label="الدفع باستخدام Telegram Stars"
    >
      <Star className="w-5 h-5 text-amber-700" />
      <span className="font-bold">{!telegramId ? 'Telegram Stars (يتطلب تليجرام)' : 'Telegram Stars'}</span>
    </motion.button>
    {!telegramId && (
      <p className="text-xs text-gray-500 text-center mt-1">
        يتطلب الدفع عبر Telegram Stars فتح التطبيق من داخل تطبيق تليجرام
      </p>
    )}
  </div>
)
