'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCopy, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi'
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
    planName?: string
  }
  onClose: () => void
}) => {
  const { copy } = useClipboard()
  const [timeLeft, setTimeLeft] = useState(1800)
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
    setTimeout(() => setIsCopied(null), 1500)
  }

  const qrValue = `ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.orderId}`

  const InfoBox = ({
    label,
    value,
    copyText,
    helpText,
    required
  }: {
    label: string
    value: string
    copyText?: string
    helpText?: string
    required?: boolean
  }) => (
    <div className="relative bg-blue-50/50 p-4 rounded-xl border-2 border-blue-100/80">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-blue-900">{label}</span>
            {required && <span className="text-xs text-red-500">*مطلوب</span>}
          </div>
          <p className="font-mono text-gray-900 break-all text-base">{value}</p>
          {helpText && (
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <FiAlertTriangle className="shrink-0" />
              {helpText}
            </p>
          )}
        </div>
        {copyText && (
          <button
            onClick={() => handleCopy(copyText, label)}
            className="bg-white/80 hover:bg-white p-2 rounded-lg shadow-sm border border-blue-100 ml-4"
            aria-label={`نسخ ${label}`}
          >
            <FiCopy className="w-5 h-5 text-blue-600" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <motion.div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[1001] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="rounded-lg border-2 border-white/20"
              />
              <div className="flex flex-col">
                <span className="text-white/80 text-sm">الوقت المتبقي</span>
                <div className="flex items-center gap-2">
                  <FiClock className="text-white/90" />
                  <span className="text-white font-bold text-xl">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white p-1 rounded-full transition-colors"
              aria-label="إغلاق"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Plan Info */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {details.planName || 'الخطة المحددة'}
              </h2>
              <div className="text-xl font-semibold text-blue-600">
                {details.amount}
                <span className="text-sm text-gray-500 mr-2">USDT</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-white p-4 rounded-xl border-2 border-blue-100 flex flex-col items-center">
              <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
                <QRCode
                  value={qrValue}
                  size={180}
                  fgColor="#1e3a8a"
                  bgColor="transparent"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                امسح رمز الاستجابة السريعة باستخدام محفظتك
              </p>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <InfoBox
                label="عنوان المحفظة"
                value={details.depositAddress}
                copyText={details.depositAddress}
                helpText="تأكد من استخدام شبكة TON فقط"
              />

              <InfoBox
                label="المبلغ المطلوب"
                value={`${details.amount} USDT`}
                helpText="يشمل رسوم الشبكة (قد تختلف حسب ظروف الشبكة)"
              />

              <InfoBox
                label="المذكرة (الرقم المرجعي)"
                value={details.orderId}
                copyText={details.orderId}
                required
                helpText="يجب إدراج هذا الرقم في ملاحظة التحويل"
              />
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50/80 p-4 rounded-xl border-2 border-amber-100 flex items-start gap-3">
              <FiAlertTriangle className="text-amber-600 mt-1 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900 mb-1">
                  تحذير هام
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  لا تغلق هذه النافذة حتى اكتمال التحويل. قد تستغرق المعالجة حتى 3 دقائق.
                  تأكد من صحة جميع البيانات قبل الإرسال.
                </p>
              </div>
            </div>
          </div>

          {/* Copied Feedback */}
          <AnimatePresence>
            {isCopied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm"
              >
                ✓ تم نسخ {isCopied}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}