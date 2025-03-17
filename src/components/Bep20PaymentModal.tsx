'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiCopy } from 'react-icons/fi'
import QRCode from 'react-qr-code'
import { useTelegram } from '../context/TelegramContext'
import { Spinner } from '../components/Spinner'

interface PaymentDetails {
  deposit_address: string
  network: string
  amount: string
  qr_code: string
}

interface Bep20PaymentModalProps {
  plan: PaymentDetails & { payment_token: string }
  onClose: () => void
}

const Bep20PaymentModal = ({ plan, onClose }: Bep20PaymentModalProps) => {
  const { telegramId } = useTelegram()
  const [copied, setCopied] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'verified' | 'failed'>('idle')

  const copyAddress = () => {
    navigator.clipboard.writeText(plan.deposit_address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // دالة verifyPayment تستخدم deposit_address ومعرّف التليجرام فقط
  const verifyPayment = async () => {
    try {
      setVerificationStatus('pending')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_address: plan.deposit_address,
          telegramId: telegramId
        }),
      })
      const result = await response.json()
      if (!result.success) throw new Error('لم يتم العثور على الدفعة')
      setVerificationStatus('verified')
      setTimeout(onClose, 2000)
    } catch (err) {
      console.error('Verification error:', err)
      setVerificationStatus('failed')
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-end md:items-center p-2 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-500 px-4 py-3 flex justify-between items-center z-10">
            <h2 className="text-lg font-semibold text-white">دفع عبر BEP-20</h2>
            <button onClick={onClose} className="text-white hover:text-white/80">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <h3 className="text-2xl font-bold text-green-600">{plan.amount} USDT</h3>
              <p className="text-sm text-gray-600 mt-2">{plan.network}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">عنوان الاستلام:</span>
                <button onClick={copyAddress} className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm">
                  <FiCopy className="w-4 h-4" />
                  {copied ? 'تم النسخ!' : 'نسخ'}
                </button>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg break-words font-mono text-sm">
                {plan.deposit_address}
              </div>
              <div className="flex justify-center p-4 bg-white rounded-xl shadow-inner">
                <QRCode value={plan.deposit_address} size={160} bgColor="#FFFFFF" fgColor="#000000" />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={verifyPayment}
                disabled={verificationStatus === 'pending'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
              >
                {verificationStatus === 'pending' && <Spinner className="w-4 h-4" />}
                {verificationStatus === 'pending' ? 'جارٍ التحقق...' : 'فحص الدفعة'}
              </button>

              {verificationStatus === 'verified' && (
                <div className="p-3 bg-green-100 text-green-700 rounded-lg text-center">
                  ✅ تم تأكيد الدفعة بنجاح
                </div>
              )}

              {verificationStatus === 'failed' && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-center">
                  ❌ لم يتم العثور على الدفعة
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 text-center">
            <p className="text-xs text-gray-500">سيتم إغلاق النافذة تلقائيًا بعد تأكيد الدفع</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Bep20PaymentModal
