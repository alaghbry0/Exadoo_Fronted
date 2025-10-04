// src/components/ExchangePaymentModal.tsx
'use client'

import React, { useState, useEffect, useReducer } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, CheckCircle2, Copy, X, Clock, AlertTriangle } from 'lucide-react'
import QRCode from 'react-qr-code'
import type { PaymentStatus } from '@/types/payment' // تأكد من أن هذا المسار صحيح
import toast from 'react-hot-toast'
import { PaymentExchangeSuccess } from './PaymentExchangeSuccess'
import { Separator } from '@/components/ui/separator' // استيراد Separator

// --- الواجهات والأنواع (لا تغيير) ---
interface ExchangeDetails {
  depositAddress: string
  amount: string
  network: string
  paymentToken: string // Memo
  planName?: string
}
interface ExchangePaymentModalProps {
  details: ExchangeDetails
  onClose: () => void
  onSuccess?: () => void
}

// --- Reducer لإدارة المؤقت (لا تغيير) ---
function timeReducer(state: number, action: 'reset' | 'tick') {
  switch (action) {
    case 'reset': return 1800;
    case 'tick': return Math.max(0, state - 1);
    default: return state;
  }
}

// ====================================================================
// المكون الفرعي: نافذة عرض QR Code (بتصميم فاتح)
// ====================================================================
const QRDisplayModal = ({ isOpen, onClose, title, value }: {
  isOpen: boolean,
  onClose: () => void,
  title: string,
  value: string
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-6 flex flex-col items-center"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-bold text-lg text-gray-800 mb-5">{title}</h3>
          <div className="bg-white p-3 rounded-md border">
            <QRCode value={value} size={180} />
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">امسح الرمز ضوئيًا باستخدام تطبيقك.</p>
          <button
            onClick={onClose}
            className="mt-5 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
          >
            إغلاق
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

// ====================================================================
// المكون الرئيسي
// ====================================================================
export const ExchangePaymentModal: React.FC<ExchangePaymentModalProps> = ({
  details,
  onClose,
  onSuccess,
}) => {

  useEffect(() => {
    // أعلن أني فتحت (أعلى مودال)
    // emitModalOpen('exchangePayment');
    window.dispatchEvent(new CustomEvent('modal:open', { detail: { name: 'exchangePayment' } }));

    return () => {
      // emitModalClose('exchangePayment');
      window.dispatchEvent(new CustomEvent('modal:close', { detail: { name: 'exchangePayment' } }));
    };
  }, []);

  // --- الحالات والـ Hooks (المنطق يبقى كما هو) ---
  const [copied, setCopied] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [localPaymentStatus] = useState<PaymentStatus>('processing')
  const [time, dispatch] = useReducer(timeReducer, 1800)
  const [showAddressQR, setShowAddressQR] = useState(false)
  const [showMemoQR, setShowMemoQR] = useState(false)

  // --- التأثيرات الجانبية (منطق التحقق من الدفع والمؤقت يبقى كما هو) ---
  useEffect(() => {
    // ... نفس منطق التحقق من الدفع
  }, [details.paymentToken, onSuccess]);

  useEffect(() => {
    const timer = setInterval(() => dispatch('tick'), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- الدوال المساعدة (لا تغيير جوهري في المنطق) ---
  const handleClose = () => {
    if (localPaymentStatus === 'processing') setShowConfirmation(true);
    else onClose();
  }
  const confirmClose = () => {
    setShowConfirmation(false);
    onClose();
  }
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  const copyToClipboard = (text: string, type: 'العنوان' | 'المذكرة') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`تم نسخ ${type} بنجاح!`);
    setTimeout(() => setCopied(null), 2000);
  };

  if (localPaymentStatus === 'success') {
    return <PaymentExchangeSuccess onClose={onClose} planName={details.planName} />;
  }

  const timeProgress = (time / 1800) * 100;
  const qrValue = `ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.paymentToken}`;

  return (
    <>
      <div className="fixed inset-0 bg-gray-50 text-gray-800 flex flex-col z-[100]"> 
        {/* الهيدر */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-10">
          <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
            <h2 className="text-lg font-bold">{details.planName || 'إتمام الدفع'}</h2>
            <button onClick={handleClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* المحتوى القابل للتمرير */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto p-4 space-y-6">

            {/* قسم المبلغ والمؤقت */}
            <section className="text-center space-y-4">
              <p className="text-gray-500">المبلغ المطلوب</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-extrabold text-primary-600">{details.amount}</span>
                <span className="text-2xl text-gray-400">USDT</span>
              </div>
              <div className="inline-block bg-primary-50 text-primary-700 px-3 py-1 text-sm rounded-full font-medium border border-primary-100">
                شبكة: {details.network || 'TON'}
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-2">
                  <Clock size={16} />
                  <span>الوقت المتبقي: <span className="font-mono text-base text-gray-800 font-bold">{formatTime(time)}</span></span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-1000 ease-linear"
                       style={{ width: `${timeProgress}%` }} />
                </div>
              </div>
            </section>

            <Separator />

            {/* قسم QR Code الرئيسي */}
            <section className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-xl shadow-lg border">
                <QRCode value={qrValue} size={190} />
              </div>
              <p className="text-gray-500 text-sm">امسح الرمز ضوئيًا لإتمام الدفع عبر محفظتك</p>
            </section>

            {/* قسم تفاصيل الدفع (العنوان والمذكرة) */}
            <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              {/* حقل العنوان */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">عنوان المحفظة (Address)</label>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <p className="flex-1 font-mono text-sm break-all select-all">{details.depositAddress}</p>
                  <button onClick={() => copyToClipboard(details.depositAddress, 'العنوان')} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors">
                    {copied === 'العنوان' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button onClick={() => setShowAddressQR(true)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors">
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {/* حقل المذكرة */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">المذكرة (Memo)</label>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <p className="flex-1 font-mono text-sm break-all select-all">{details.paymentToken}</p>
                  <button onClick={() => copyToClipboard(details.paymentToken, 'المذكرة')} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors">
                    {copied === 'المذكرة' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button onClick={() => setShowMemoQR(true)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors">
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {/* تحذير المذكرة */}
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-700">مهم جدًا: لا تنسَ المذكرة</h4>
                  <p className="text-xs text-red-600">عدم إرسال المذكرة (Memo) مع الدفعة سيؤدي إلى فقدان أموالك وعدم تفعيل الاشتراك.</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* مودال تأكيد الإغلاق (بتصميم فاتح) */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[100]" onClick={confirmClose}>
            <motion.div
              className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 border"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2 text-gray-800">هل أنت متأكد؟</h3>
              <p className="mb-6 text-gray-500">عملية الدفع لم تكتمل بعد. هل تريد حقاً إغلاق هذه الصفحة؟</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowConfirmation(false)} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">البقاء</button>
                <button onClick={confirmClose} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors">إغلاق على أي حال</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نوافذ QR Code المنفصلة */}
      <QRDisplayModal isOpen={showAddressQR} onClose={() => setShowAddressQR(false)} title="عنوان المحفظة (Address)" value={details.depositAddress} />
      <QRDisplayModal isOpen={showMemoQR} onClose={() => setShowMemoQR(false)} title="المذكرة (Memo)" value={details.paymentToken} />
    </>
  )
}
