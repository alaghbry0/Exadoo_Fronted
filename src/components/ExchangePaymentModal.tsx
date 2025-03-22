'use client'
import { motion } from 'framer-motion'
import { FiCopy, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi'
import { useClipboard } from '../hooks/useClipboard'
import QRCode from 'react-qr-code'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { PaymentStatus } from '@/types/payment'

export const ExchangePaymentModal = ({
  details,
  onClose,
  onSuccess
}: {
  details: {
    orderId: string
    depositAddress: string
    amount: string
    network: string
    paymentToken: string
    planName?: string
  }
  onClose: () => void
  onSuccess?: () => void
}) => {
  const { copy } = useClipboard()
  const [timeLeft, setTimeLeft] = useState(1800)
  const [isCopied, setIsCopied] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')

  // إزالة useEffect الخاص بالإغلاق التلقائي
  // useEffect(() => { ... }) // تم إزالته

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // محاكاة حالة الدفع الناجحة
  useEffect(() => {
    if (timeLeft === 1700) {
      setPaymentStatus('success')
    }
  }, [timeLeft])

  // إدارة نجاح الدفع
  useEffect(() => {
    if (paymentStatus === 'success' && onSuccess) {
      onSuccess()
    }
  }, [paymentStatus, onSuccess])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopy = (text: string, label: string) => {
    copy(text)
    setIsCopied(label)
    setTimeout(() => setIsCopied(null), 2000)
  }

  const qrValue = `ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.orderId}`

  const WarningMessage = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 rounded-md border border-red-100">
      <FiAlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" />
      <span className="text-red-700 text-xs">{children}</span>
    </div>
  )

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001] overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <div className="flex items-center gap-1">
              <FiClock className="text-red-600 w-5 h-5" />
              <span className="font-medium text-red-600">
                متبقي للدفع {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="إغلاق النافذة"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {details.planName || 'اسم الخطة'}
          </h2>
          <p className="text-lg text-gray-600">
            {details.amount ? `السعر: ${details.amount}` : 'سعر الخطة'}
          </p>
        </div>

        <div className="p-4 flex flex-col items-center">
          <QRCode
            value={qrValue}
            size={180}
            fgColor="#1a365d"
            className="mb-4"
          />
        </div>

        <div className="p-4 space-y-6">
          <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <span className="font-medium text-gray-800">USDT (TON Network)</span>
          </div>

          <div className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <p className="text-xs text-gray-500 mb-1">العنوان</p>
              <button
                onClick={() => handleCopy(details.depositAddress, 'العنوان')}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
            <p className="font-mono text-gray-800 break-all">
              {details.depositAddress}
            </p>
            {isCopied === 'العنوان' && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-2 right-2 text-xs text-green-600"
              >

              </motion.span>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">المبلغ</p>
            <p className="font-mono text-gray-800">{details.amount}</p>
            <p className="text-xs text-gray-500 mt-1">يرجى احتساب رسوم الغاز</p>
          </div>

          <div className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <p className="text-xs text-gray-500 mb-1">المذكرة (مطلوب)</p>
              <button
                onClick={() => handleCopy(details.orderId, 'المذكرة')}
                className="text-gray-400 hover:text-blue-600 transition-colors"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
            <p className="font-mono text-gray-800 break-all">
              {details.orderId}
            </p>
            <WarningMessage>
              تأكد من إضافة رمز المذكرة في الحقل المخصص أثناء التحويل
            </WarningMessage>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            يرجى عدم إغلاق هذه الصفحة أثناء المعالجة، انتظر حتى 90 ثانية لإكمال عملية النقل.
          </p>
        </div>
      </div>
    </motion.div>
  )
}