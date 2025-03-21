'use client'
import { motion } from 'framer-motion'
import { FiCopy, FiX } from 'react-icons/fi'
import { useClipboard } from '../hooks/useClipboard'
import QRCode from 'react-qr-code'

export const ExchangePaymentModal = ({
  details,
  onClose
}: {
  details: {
    orderId: string
    depositAddress: string
    amount: string
    network: string
    paymentToken: string
  }
  onClose: () => void
}) => {
  const { copy } = useClipboard()

  // تنسيق المبلغ لإضافة العملة
  const formattedAmount = `${details.amount} TON`

  return (
    <motion.div
  className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1001]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6 relative">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">تفاصيل التحويل</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* عنوان المحفظة */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm text-gray-600 block mb-2">عنوان المحفظة:</label>
            <div className="flex items-center justify-between">
              <span className="font-mono text-gray-800 break-all">{details.depositAddress}</span>
              <button
                onClick={() => copy(details.depositAddress)}
                className="text-blue-600 hover:text-blue-800 ml-2"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* المبلغ */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm text-gray-600 block mb-2">المبلغ المطلوب:</label>
            <div className="flex items-center justify-between">
              <span className="font-mono text-gray-800">{formattedAmount}</span>
              <button
                onClick={() => copy(details.amount)}
                className="text-blue-600 hover:text-blue-800 ml-2"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* الشبكة */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm text-gray-600 block mb-2">الشبكة:</label>
            <div className="flex items-center justify-between">
              <span className="font-mono text-gray-800">{details.network}</span>
              <button
                onClick={() => copy(details.network)}
                className="text-blue-600 hover:text-blue-800 ml-2"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* التعليق */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm text-gray-600 block mb-2">تعليق الدفع (مطلوب):</label>
            <div className="flex items-center justify-between">
              <span className="font-mono text-gray-800 break-all">{details.orderId}</span>
              <button
                onClick={() => copy(details.orderId)}
                className="text-blue-600 hover:text-blue-800 ml-2"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            <QRCode
              value={`ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.orderId}`}
              size={160}
              fgColor="#1a365d"
            />
          </div>
        </div>

        {/* تحذيرات مهمة */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-yellow-800 font-medium mb-2">❗ تعليمات مهمة:</h3>
          <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
            <li>تأكد من تطابق التعليق مع الطلب</li>
            <li>لا تغلق الصفحة حتى اكتمال التحويل</li>
            <li>قد تستغرق المعالجة حتى 15 دقيقة</li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}