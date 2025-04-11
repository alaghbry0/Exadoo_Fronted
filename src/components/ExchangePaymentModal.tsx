'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCopy, FiX, FiClock, FiAlertTriangle, FiCheck } from 'react-icons/fi'
import { QrCode, CheckCircle2, Copy } from 'lucide-react'
import QRCode from 'react-qr-code'
import { PaymentStatus } from '@/types/payment'
import { useToast } from '@/hooks/use-toast'

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
  paymentStatus: PaymentStatus
}

export const ExchangePaymentModal: React.FC<ExchangePaymentModalProps> = ({
  details,
  onClose,
  onSuccess,
  paymentStatus
}) => {
  const [copied, setCopied] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(1800)
  const [showAddressQR, setShowAddressQR] = useState(false)
  const [showMemoQR, setShowMemoQR] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (paymentStatus === 'success' && onSuccess) {
      toast({
        title: 'تم الدفع بنجاح!',
        description: 'تم تجديد اشتراكك بنجاح',
        variant: 'default',
      })
      onSuccess()
    }
  }, [paymentStatus, onSuccess, toast])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    toast({
      title: "تم النسخ",
      description: `تم نسخ ${type === 'address' ? 'العنوان' : 'المذكرة'} بنجاح`,
      variant: "default",
    })
    setTimeout(() => setCopied(null), 2000)
  }

  const qrValue = `ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.paymentToken}`

  // حساب نسبة الوقت المتبقي للعرض في شريط التقدم
  const timeProgress = (timeLeft / 1800) * 100

  if (paymentStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-50 to-white z-[100] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{details.planName || 'دفع الاشتراك'}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="p-2">
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
          >
            <FiCheck className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">تمت عملية الدفع بنجاح!</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            تم استلام المبلغ وتفعيل اشتراكك. يمكنك الآن الاستمتاع بخدماتنا.
          </p>
          <button onClick={onClose} className="bg-blue-600 text-white rounded-md px-4 py-2">
            العودة للرئيسية
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col max-h-screen overflow-auto">
      {/* الرأس */}
      <div className="sticky top-0 bg-white border-b border-gray-100 z-10 shadow-sm">
        <div className="container max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{details.planName || 'دفع الاشتراك'}</h2>
          <button 
            onClick={onClose} 
            aria-label="إغلاق" 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* بطاقة المبلغ - عرض مُحسن */}
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

      {/* شريط العد التنازلي مع شريط تقدم */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="container max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <FiClock className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700 font-medium">
              متبقي للدفع: <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
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

      {/* المحتوى الرئيسي */}
      <div className="container max-w-md mx-auto px-4 py-6 flex-1 flex flex-col gap-6">
        {/* رمز QR الخاص بالدفع */}
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

        {/* بطاقة العنوان */}
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

        {/* بطاقة المذكرة */}
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

        {/* نصائح إضافية */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2">نصائح للدفع الناجح:</h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>تأكد من إضافة كلٍ من العنوان والمذكرة بشكل صحيح</li>
            <li>أرسل المبلغ بالضبط كما هو محدد (مع مراعاة رسوم الشبكة)</li>
            <li>استخدم شبكة TON فقط للتحويل</li>
          </ul>
        </div>
      </div>

      {/* نافذة QR لعنوان المحفظة */}
      <AnimatePresence>
        {showAddressQR && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex justify-center items-center p-4"
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

      {/* نافذة QR للمذكرة */}
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

      {/* تذييل الصفحة */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 text-center shadow-lg">
        <p className="text-xs text-gray-500">
          يرجى عدم إغلاق هذه الصفحة أثناء المعالجة، قد تستغرق العملية بضع دقائق للاكتمال
        </p>
      </div>
    </div>
  )
}
