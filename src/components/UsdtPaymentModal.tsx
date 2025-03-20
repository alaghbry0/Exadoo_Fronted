'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
// استيراد النوع الصحيح
import type { SubscriptionPlanExtended } from '@/types/payment';

interface UsdtPaymentModalProps {
  plan: SubscriptionPlanExtended | null;
  telegramId: string;
  telegramUsername: string;
  fullName: string;
  onClose: () => void;
  handleTonPayment: () => Promise<void>;
  startSSEConnection: (paymentToken: string, retryCount?: number) => void;
}

const UsdtPaymentModal: React.FC<UsdtPaymentModalProps> = ({
  plan,
  telegramId,
  telegramUsername,
  fullName,
  onClose,
  handleTonPayment,
  startSSEConnection,
}) => {
  const [loadingExchange, setLoadingExchange] = useState(false);
  const router = useRouter();

  // دالة الدفع عبر منصات التداول مع إعادة التوجيه إلى صفحة الدفع
  const handleExchangePayment = async () => {
    const orderId = uuidv4();

    const payload = {
      webhookSecret: process.env.NEXT_PUBLIC_WEBHOOK_SECRET,
      planId: plan?.selectedOption.id,
      amount: '1e-05', // مؤقت أثناء البناء والاختبار
      telegramId,
      telegramUsername,
      fullName,
      orderId,
    };

    try {
      setLoadingExchange(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/confirm_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Id': telegramId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('فشل إنشاء الطلب للدفع عبر منصات التداول');
      }
      const data = await response.json();
      const { payment_token } = data;
      if (payment_token) {
        startSSEConnection(payment_token);
      }
      // إعادة التوجيه إلى صفحة PaymentExchangePage مع تمرير البيانات عبر معلمات URL
      const recipientAddress = process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS || '0xRecipientAddress';
      const amount = plan?.selectedOption.price || 'Unknown';
      const network = 'Ton Network';

      router.push(
        `/payment-exchange?recipientAddress=${encodeURIComponent(
          recipientAddress
        )}&amount=${encodeURIComponent(amount)}&network=${encodeURIComponent(
          network
        )}&orderId=${encodeURIComponent(orderId)}`
      );
    } catch (error) {
      console.error('خطأ في الدفع عبر منصات التداول:', error);
      alert('حدث خطأ أثناء معالجة الدفع عبر منصات التداول. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoadingExchange(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر إغلاق النافذة */}
        <button className="absolute top-3 right-3 text-gray-600" onClick={onClose} aria-label="إغلاق النافذة">
          <FiX className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">اختر طريقة الدفع عبر USDT</h2>
        <p className="text-sm text-gray-700 mb-6 text-center">
          الرجاء اختيار أحد الخيارات للدفع:
        </p>
        <div className="space-y-4">
          {/* الدفع من محفظة Web3 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              await handleTonPayment();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium shadow hover:shadow-md transition"
          >
            الدفع من محفظة Web3
          </motion.button>
          {/* الدفع عبر منصات التداول */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExchangePayment}
            disabled={loadingExchange}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium shadow hover:shadow-md transition ${
              loadingExchange ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            الدفع عبر منصات التداول
          </motion.button>
        </div>
        <div className="mt-6 bg-yellow-100 p-3 rounded">
          <p className="text-sm text-yellow-800">
            الرجاء عدم إغلاق هذه النافذة أثناء المعالجة، والتأكد من تضمين التعليق (orderId) عند إجراء عملية الدفع.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UsdtPaymentModal;
