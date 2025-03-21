'use client'
import { motion } from 'framer-motion'


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
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1000]" // تغيير z-index إلى 1000
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
      <h3 className="text-xl font-bold text-center">اختر طريقة الدفع</h3>

      <button
        onClick={onWalletSelect}
        className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-2"
      >
        <span>محفظة ويب 3</span>
        <span className="text-sm text-gray-500">(معالجة فورية)</span>
      </button>

      <button
        onClick={onExchangeSelect}
        className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg flex items-center justify-center gap-2"
      >
        <span>منصات التداول</span>
        <span className="text-sm text-gray-500">(تحويل خارجي)</span>
      </button>

      <button
        onClick={onClose}
        className="w-full py-2 text-gray-500 hover:text-gray-700"
      >
        إلغاء
      </button>
    </div>
  </motion.div>
)