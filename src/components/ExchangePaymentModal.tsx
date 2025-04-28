'use client'
import React, { useState, useEffect, useRef, useReducer } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiClock, FiAlertTriangle } from 'react-icons/fi'
import { QrCode, CheckCircle2, Copy } from 'lucide-react'
import QRCode from 'react-qr-code'
import { PaymentStatus } from '@/types/payment'
import toast from 'react-hot-toast'
import { PaymentExchangeSuccess } from './PaymentExchangeSuccess'

interface ExchangeDetails {
  depositAddress: string
  amount: string
  network: string
  paymentToken: string
  planName?: string
}

interface ExchangePaymentModalProps {
  details: ExchangeDetails
  onClose: () => void
  onSuccess?: () => void
}

// Reducer function for timer management
function timeReducer(state: number, action: 'reset' | 'tick') {
  switch (action) {
    case 'reset': return 1800
    case 'tick': return Math.max(0, state - 1)
    default: return state
  }
}

export const ExchangePaymentModal: React.FC<ExchangePaymentModalProps> = ({
  details,
  onClose,
  onSuccess
}) => {
  const [copied, setCopied] = useState<string | null>(null)
  const [showAddressQR, setShowAddressQR] = useState(false)
  const [showMemoQR, setShowMemoQR] = useState(false)
  const [localPaymentStatus, setLocalPaymentStatus] = useState<PaymentStatus>('processing')
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [time, dispatch] = useReducer(timeReducer, 1800)
  // حالة ظهور نافذة التأكيد عند الإغلاق
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Dynamic QR value with timestamp to prevent caching
  const qrValue = `ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.paymentToken}&t=${Date.now()}`

  // Handle modal close with confirmation using a custom confirmation modal
  const handleClose = () => {
    if (localPaymentStatus === 'processing') {
      setShowConfirmation(true)
    } else {
      cleanupPolling()
      onClose()
    }
  }

  // Function to actually close after confirmation
  const confirmClose = () => {
    cleanupPolling()
    setShowConfirmation(false)
    onClose()
  }

  // Cancel close and hide confirmation modal
  const cancelClose = () => {
    setShowConfirmation(false)
  }

  // Cleanup polling interval
  const cleanupPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  // Payment status polling effect
  useEffect(() => {
    let isMounted = true

    const pollPaymentStatus = async () => {
      if (!isMounted) return

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/status?token=${details.paymentToken}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.status === 'exchange_success' && isMounted) {
          setLocalPaymentStatus('success')
          cleanupPolling()

          if (onSuccess) {
            onSuccess()
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log('تم إلغاء طلب الاستطلاع')
          } else if (isMounted) {
            console.error('فشل في التحقق من حالة الدفع:', error)
            toast.error('فقدان الاتصال بالخادم')
          }
        } else if (isMounted) {
          console.error('فشل غير معروف في التحقق من حالة الدفع:', error)
          toast.error('حدث خطأ غير متوقع')
        }
      }
    }

    if (details.paymentToken) {
      pollPaymentStatus() // Initial immediate poll
      pollingIntervalRef.current = setInterval(pollPaymentStatus, 3000)
    }

    return () => {
      isMounted = false
      cleanupPolling()
    }
  }, [details.paymentToken, onSuccess])

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => dispatch('tick'), 1000)
    return () => clearInterval(timer)
  }, [])

  // Success notification effect
  useEffect(() => {
  if (localPaymentStatus === 'success') {
      toast.success('تم الدفع بنجاح! تم تجديد اشتراكك بنجاح')
    }
  }, [localPaymentStatus])

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Copy to clipboard function
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast.success(`تم النسخ: تم نسخ ${type === 'address' ? 'العنوان' : 'المذكرة'} بنجاح`)
    setTimeout(() => setCopied(null), 2000)
  }

  // Calculate progress percentage for timer bar
  const timeProgress = (time / 1800) * 100

  // Show success modal if payment succeeded
    if (localPaymentStatus === 'success') {
    return <PaymentExchangeSuccess onClose={handleClose} planName={details.planName} />
  }

  return (
    <>
      <div className="fixed inset-0 bg-white flex flex-col max-h-screen overflow-auto"
  style={{
    zIndex: 922, // أعلى من UsdtPaymentMethodModal
    position: 'fixed',
    isolation: 'isolate'
  }}
>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 z-10 shadow-sm">
          <div className="container max-w-md mx-auto px-4 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">{details.planName || 'دفع الاشتراك'}</h2>
            <button
              onClick={handleClose}
              aria-label="إغلاق"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Amount card */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white">
          <div className="container max-w-md mx-auto px-4 py-8">
            <div className="flex flex-col items-center">
              <span className="text-lg font-medium tracking-wide mb-2">المبلغ المطلوب</span>
              <div className="flex items-center">
                <span className="text-5xl font-extrabold">{details.amount}</span>
                <span className="ml-3 text-2xl font-semibold">USDT</span>
              </div>
              <div className="mt-4 bg-blue-600 px-3 py-1 rounded-full">
                <span className="text-sm font-medium">شبكة: {details.network || 'TON'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown timer with progress bar */}
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="container max-w-md mx-auto px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <FiClock className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-700 font-medium">
                متبقي للدفع: <span className="font-mono font-bold text-lg">{formatTime(time)}</span>
              </p>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${timeProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container max-w-md mx-auto px-4 py-6 flex-1 flex flex-col gap-6">
          {/* Payment QR code */}
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white rounded-xl border border-blue-100 shadow-md"
            >
              <QRCode value={qrValue} size={180} fgColor="#1a365d" />
              <p className="text-center text-sm text-gray-500 mt-3">امسح لإتمام الدفع</p>
            </motion.div>
          </div>

          {/* Address card */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-gray-700">العنوان</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(details.depositAddress, 'address')}
                  className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
                >
                  {copied === 'address' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setShowAddressQR(true)}
                  className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-mono text-sm break-all text-gray-800 select-all">
                {details.depositAddress}
              </p>
            </div>
          </div>

          {/* Memo card */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-gray-700">المذكرة</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(details.paymentToken, 'memo')}
                  className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
                >
                  {copied === 'memo' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setShowMemoQR(true)}
                  className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 p-1 rounded-md transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-3">
              <p className="font-mono text-sm break-all text-gray-800 select-all">
                {details.paymentToken}
              </p>
            </div>
            <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 rounded-md border border-red-100">
              <FiAlertTriangle className="text-red-600 flex-shrink-0 mt-0.5 w-5 h-5" />
              <div>
                <span className="text-red-700 text-sm font-medium block mb-1">
                  تأكد من إضافة رمز المذكرة
                </span>
                <span className="text-red-600 text-xs">
                  عدم إضافة المذكرة سيؤدي إلى فشل العملية ولن يتم تفعيل اشتراكك
                </span>
              </div>
            </div>
          </div>

          {/* Payment tips */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">نصائح للدفع الناجح:</h3>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>تأكد من إضافة كلٍ من العنوان والمذكرة بشكل صحيح</li>
              <li>أرسل المبلغ بالضبط كما هو محدد (مع مراعاة رسوم الشبكة)</li>
              <li>استخدم شبكة TON فقط للتحويل</li>
            </ul>
          </div>
        </div>

        {/* Address QR modal */}
        <AnimatePresence>
  {showAddressQR && (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4"
      style={{
        zIndex: 925, // أعلى من جميع العناصر الأخرى
        position: 'fixed'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowAddressQR(false)}
    >
              <motion.div
                className="bg-white rounded-2xl w-full max-w-xs overflow-hidden p-4 flex flex-col items-center"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">عنوان المحفظة</h3>
                <QRCode value={details.depositAddress} size={180} fgColor="#1a365d" />
                <p className="text-center text-sm text-gray-500 mt-2">امسح الرمز باستخدام تطبيق TON</p>
                <button
                  onClick={() => {
                    copyToClipboard(details.depositAddress, 'address')
                    setShowAddressQR(false)
                  }}
                  className="mt-4 bg-blue-600 text-white rounded-md px-4 py-2"
                >
                  نسخ العنوان وإغلاق
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memo QR modal */}
        <AnimatePresence>
          {showMemoQR && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex justify-center items-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMemoQR(false)}
            >
              <motion.div
                className="bg-white rounded-2xl w-full max-w-xs overflow-hidden p-4 flex flex-col items-center"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">رمز المذكرة</h3>
                <QRCode value={details.paymentToken} size={180} fgColor="#1a365d" />
                <p className="text-center text-sm text-gray-500 mt-2">امسح الرمز باستخدام تطبيق TON</p>
                <button
                  onClick={() => {
                    copyToClipboard(details.paymentToken, 'memo')
                    setShowMemoQR(false)
                  }}
                  className="mt-4 bg-blue-600 text-white rounded-md px-4 py-2"
                >
                  نسخ المذكرة وإغلاق
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 text-center shadow-lg">
          <p className="text-xs text-gray-500">
            يرجى عدم إغلاق هذه الصفحة أثناء المعالجة، قد تستغرق العملية بضع دقائق للاكتمال
          </p>
        </div>
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
  {showConfirmation && (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4"
      style={{
        zIndex: 925, // أعلى من جميع العناصر الأخرى
        position: 'fixed'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={cancelClose}
    >
            <motion.div
              className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4 text-gray-800">

              </h3>
              <p className="mb-6 text-gray-600">
                لديك عملية دفع قيد التقدم، هل انت متأكد من الخروج؟
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelClose}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmClose}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  نعم
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
