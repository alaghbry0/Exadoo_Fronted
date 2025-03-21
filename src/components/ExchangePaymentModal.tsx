'use client'
import { motion } from 'framer-motion'
import { FiCopy, FiX, FiClock, FiExternalLink, FiAlertTriangle } from 'react-icons/fi'
import { useClipboard } from '../hooks/useClipboard'
import QRCode from 'react-qr-code'
import { useEffect, useState } from 'react'

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
  const [timeLeft, setTimeLeft] = useState(900) // 15 دقيقة بالثواني
  const [isCopied, setIsCopied] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopy = (text: string, label: string) => {
    copy(text)
    setIsCopied(label)
    setTimeout(() => setIsCopied(null), 2000)
  }

  const openWallet = () => {
    window.open(`ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.orderId}`, '_blank')
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1001]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white rounded-xl max-w-md w-full p-4 md:p-6 space-y-4 relative mx-2 shadow-xl">
        {/* Header Section */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FiClock className="text-red-600 w-5 h-5" />
            <span className="font-medium text-red-600">
              {formatTime(timeLeft)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="إغلاق النافذة"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Payment Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                label: 'عنوان المحفظة',
                value: details.depositAddress,
                fullWidth: true,
                icon: <FiCopy />
              },
              {
                label: 'المبلغ المطلوب',
                value: `${details.amount} TON`,
                icon: <FiCopy />
              },
              {
                label: 'الشبكة',
                value: details.network,
                icon: <FiCopy />
              },
              {
                label: 'رقم الطلب',
                value: details.orderId,
                fullWidth: true,
                icon: <FiCopy />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className={`col-span-${item.fullWidth ? 'full' : '1'} relative`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                      <p className="font-mono text-gray-800 text-sm break-all">
                        {item.value}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(item.value, item.label)}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                      aria-label={`نسخ ${item.label}`}
                    >
                      {item.icon}
                    </button>
                  </div>
                  {isCopied === item.label && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-1 right-1 text-xs text-green-600"
                    >
                      تم النسخ!
                    </motion.span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* QR Code Section */}
          <motion.div
            className="p-4 bg-white rounded-lg border-2 border-dashed border-blue-200 text-center"
            whileHover={{ scale: 1.01 }}
          >
            <QRCode
              value={`ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.orderId}`}
              size={160}
              fgColor="#1a365d"
              className="mx-auto mb-4"
            />
            <button
              onClick={openWallet}
              className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiExternalLink className="w-4 h-4" />
              <span>فتح في المحفظة</span>
            </button>
          </motion.div>

          {/* Warning Section */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 space-y-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <FiAlertTriangle className="flex-shrink-0" />
              <h3 className="font-medium">تعليمات مهمة</h3>
            </div>
            <ul className="text-yellow-700 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>الالتزام برقم الطلب في حقل الملاحظات إلزامي</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>عدم إغلاق النافذة حتى اكتمال التحويل</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>التحويلات بدون ملاحظات لن يتم اعتمادها</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}