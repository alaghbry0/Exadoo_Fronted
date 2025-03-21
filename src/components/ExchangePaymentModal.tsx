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
      <div className="bg-white rounded-xl max-w-md w-full p-4 md:p-6 space-y-4 relative">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 items-center pb-4 border-b">
          <h1 className="col-span-10 text-xl md:text-2xl font-bold text-gray-800 text-right">
            تفاصيل التحويل
          </h1>
          <button
            onClick={onClose}
            className="col-span-2 flex justify-end text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Address Section */}
          <div className="col-span-12 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-12 text-sm text-gray-600 mb-1">عنوان المحفظة:</label>
              <div className="col-span-10">
                <span className="font-mono text-gray-800 text-sm md:text-base break-all">
                  {details.depositAddress}
                </span>
              </div>
              <button
                onClick={() => copy(details.depositAddress)}
                className="col-span-2 flex justify-center text-blue-600 hover:text-blue-800"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Amount Section */}
          <div className="col-span-12 md:col-span-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-12 text-sm text-gray-600 mb-1">المبلغ المطلوب:</label>
              <div className="col-span-10">
                <span className="font-mono text-gray-800 text-sm md:text-base">
                  {formattedAmount}
                </span>
              </div>
              <button
                onClick={() => copy(details.amount)}
                className="col-span-2 flex justify-center text-blue-600 hover:text-blue-800"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Network Section */}
          <div className="col-span-12 md:col-span-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-12 text-sm text-gray-600 mb-1">الشبكة:</label>
              <div className="col-span-10">
                <span className="font-mono text-gray-800 text-sm md:text-base">
                  {details.network}
                </span>
              </div>
              <button
                onClick={() => copy(details.network)}
                className="col-span-2 flex justify-center text-blue-600 hover:text-blue-800"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Order ID Section */}
          <div className="col-span-12 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-12 text-sm text-gray-600 mb-1">تعليق الدفع (مطلوب):</label>
              <div className="col-span-10">
                <span className="font-mono text-gray-800 text-sm md:text-base break-all">
                  {details.orderId}
                </span>
              </div>
              <button
                onClick={() => copy(details.orderId)}
                className="col-span-2 flex justify-center text-blue-600 hover:text-blue-800"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="col-span-12 flex justify-center p-4 bg-white rounded-lg border">
            <QRCode
              value={`ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.orderId}`}
              size={window.innerWidth < 768 ? 128 : 160}
              fgColor="#1a365d"
            />
          </div>

          {/* Warning Section */}
          <div className="col-span-12 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-yellow-800 font-medium mb-2 text-sm md:text-base">❗ تعليمات مهمة:</h3>
            <ul className="list-disc list-inside text-yellow-700 text-xs md:text-sm space-y-1">
              <li>تأكد من تطابق التعليق مع الطلب</li>
              <li>لا تغلق الصفحة حتى اكتمال التحويل</li>
              <li>قد تستغرق المعالجة حتى 15 دقيقة</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}