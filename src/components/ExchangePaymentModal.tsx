'use client'
import { motion } from 'framer-motion'
import { FiCopy,  FiClock, FiAlertTriangle } from 'react-icons/fi'
import { useClipboard } from '../hooks/useClipboard'
import QRCode from 'react-qr-code'
import { useEffect, useState } from 'react'
import Image from 'next/image'

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
  const [timeLeft, setTimeLeft] = useState(1800) // 30 دقيقة
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopy = (text: string, label: string) => {
    copy(text)
    setIsCopied(label)
    setTimeout(() => setIsCopied(null), 2000)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-white flex flex-col z-[1001]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="font-bold text-gray-800">اسم الخطه</h1>
            <p className="text-sm text-gray-600">{details.amount} USDT</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
          <FiClock className="text-red-600 w-5 h-5" />
          <span className="font-medium text-red-600">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* QR Code Section */}
        <div className="bg-gray-50 p-4 rounded-2xl text-center">
          <QRCode
            value={`ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.orderId}`}
            size={256}
            fgColor="#1a365d"
            className="mx-auto"
          />
          <p className="text-sm text-gray-600 mt-4">امسح الباركود باستخدام محفظتك</p>
        </div>

        {/* Payment Details */}
        <div className="space-y-4">
          {/* Currency Section */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image
                  src="/usdt-icon.png"
                  alt="USDT"
                  width={24}
                  height={24}
                />
                <span className="font-medium">USDT (TON Network)</span>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-gray-50 p-4 rounded-xl relative">
            <p className="text-sm text-gray-500 mb-2">العنوان</p>
            <div className="flex justify-between items-center gap-2">
              <p className="font-mono text-gray-800 text-sm break-all">
                {details.depositAddress}
              </p>
              <button
                onClick={() => handleCopy(details.depositAddress, 'العنوان')}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
            {isCopied === 'العنوان' && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-2 right-2 text-xs text-green-600"
              >
                تم النسخ!
              </motion.span>
            )}
          </div>

          {/* Amount Section */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500 mb-2">المبلغ</p>
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-800">{details.amount} USDT</p>
              <span className="text-sm text-gray-500">بما في ذلك رسوم الغاز</span>
            </div>
          </div>

          {/* Memo Section */}
          <div className="bg-gray-50 p-4 rounded-xl relative">
            <p className="text-sm text-gray-500 mb-2">المذكره (مطلوب)</p>
            <div className="flex justify-between items-center gap-2">
              <p className="font-mono text-gray-800 text-sm break-all">
                {details.orderId}
              </p>
              <button
                onClick={() => handleCopy(details.orderId, 'المذكرة')}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
            {isCopied === 'المذكرة' && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-2 right-2 text-xs text-green-600"
              >
                تم النسخ!
              </motion.span>
            )}
          </div>
        </div>

        {/* Warning Section */}
        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 space-y-3">
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

        {/* Processing Time Notice */}
        <div className="text-center text-sm text-gray-500 p-4">
          <p>يرجى عدم اغلاق الصفحة أثناء المعالجة</p>
          <p>انتظر حتى 90 ثانيه لأكمال عمليه النقل</p>
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="sticky bottom-0 w-full bg-white border-t p-4 text-gray-600 hover:text-gray-800 transition-colors"
      >
        إغلاق
      </button>
    </motion.div>
  )
}