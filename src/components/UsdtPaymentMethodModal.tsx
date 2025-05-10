'use client'
import { motion } from 'framer-motion'
import { Wallet, RefreshCcw, X } from 'lucide-react'



export const UsdtPaymentMethodModal = ({
  onClose,
  onWalletSelect,
  onExchangeSelect
}: {
  onClose: () => void
  onWalletSelect: () => void
  onExchangeSelect: () => void
}) => (
  <motion.div
  dir="rtl"
  className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4"
  style={{
    zIndex: 921, // القيمة القصوى لـ z-index
    position: 'fixed',
    isolation: 'isolate'
  }}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={onClose}
>
    <motion.div


      className="bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-lg">اختر طريقة الدفع</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <motion.button

          className="w-full p-4 bg-blue-50 hover:bg-blue-100 transition-colors rounded-xl flex items-center gap-3"
          onClick={onWalletSelect}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="bg-blue-100 p-2 rounded-full">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">محفظة ويب 3 (tonkeeper, …etc)</p>
            <p className="text-sm text-gray-500">استخدم محفظتك الشخصية</p>
          </div>
        </motion.button>

        <motion.button

          className="w-full p-4 bg-purple-50 hover:bg-purple-100 transition-colors rounded-xl flex items-center gap-3"
          onClick={onExchangeSelect}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="bg-purple-100 p-2 rounded-full">
            <RefreshCcw className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">منصات التداول (binance, Okx …etc)</p>
            <p className="text-sm text-gray-500">استخدم منصة تبادل العملات</p>
          </div>
        </motion.button>
      </div>

      <div className="p-4 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          اختر الطريقة المناسبة لك للدفع باستخدام USDT
        </p>
      </div>
    </motion.div>
  </motion.div>
)
