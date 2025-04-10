// PaymentSuccessModal.tsx
'use client'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface PaymentSuccessModalProps {
  onClose: () => void
}

export const PaymentSuccessModal = ({ onClose }: PaymentSuccessModalProps) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تمت عملية الدفع بنجاح!</h2>
          <p className="text-gray-600 mb-6">
            تم ارسال المبلغ وسيتم تفعيل اشتراكك خلال دقائق
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            العودة
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}