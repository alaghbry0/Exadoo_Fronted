import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiChevronDown, FiChevronUp, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { format } from 'date-fns'
import { useClipboard } from '@/hooks/useClipboard'


type PaymentHistoryItemProps = {
  payment: {
    tx_hash: string | null
    amount_received: number
    subscription_plan_id: number
    status: 'completed' | 'failed'
    processed_at: string
    payment_token: string | null
    error_message?: string | null
    plan_name: string
    subscription_name: string
  }
}

export const PaymentHistoryItem = ({ payment }: PaymentHistoryItemProps) => {
  const [expanded, setExpanded] = useState(false)
  const { copy } = useClipboard()

  // تنسيق التاريخ كما طلبت
  const formattedDate = format(new Date(payment.processed_at), 'MMM dd, yyyy, hh:mm:ss a')

  const statusConfig = {
    completed: {
      icon: <FiCheckCircle className="text-green-500 ml-2" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'مكتمل'
    },
    failed: {
      icon: <FiXCircle className="text-red-500 ml-2" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'فاشل'
    }
  }

  // عند النقر على القيمة يتم النسخ
  const handleCopy = (text: string) => {
    copy(text)
  }

  // إعطاء قيم افتراضية لتجنب Null
  const paymentToken = payment.payment_token || 'N/A'
  const txHash = payment.tx_hash || 'N/A'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg shadow-sm p-4 mb-4 bg-white hover:shadow-md transition-shadow"

    >
      <div className="flex justify-between items-center">
        {/* القسم الأيسر: البيانات الأساسية */}
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">
              {payment.amount_received} USDT
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[payment.status].bgColor} ${statusConfig[payment.status].color}`}>
              {statusConfig[payment.status].label}
              {statusConfig[payment.status].icon}
            </span>
          </div>
          <div className="flex flex-row justify-between items-center mt-2">


            <span>{formattedDate}</span>
            <span
              className="cursor-pointer hover:underline"
              onClick={() => handleCopy(payment.subscription_name)}
            >
              {payment.subscription_name}
            </span>
            <span
              className="cursor-pointer hover:underline"
              onClick={() => handleCopy(payment.plan_name)}
            >
              {payment.plan_name}
            </span>
          </div>
        </div>

        {/* زر التوسيع/التقليص */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
          aria-label={expanded ? 'إغلاق التفاصيل' : 'عرض التفاصيل'}
        >
          {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mt-3 pt-3 border-t"
        >
          <div className="flex flex-col gap-3 text-sm text-gray-700">
            {/* Message و tx Hash بنفس السطر */}
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <span className="font-medium">tx Hash:</span>
                <span
                  className="font-mono text-xs bg-gray-100 px-2 py-1 rounded cursor-pointer hover:underline"
                  onClick={() => handleCopy(txHash)}
                >
                  {paymentToken !== 'N/A' ? `${paymentToken.slice(0, 8)}...${paymentToken.slice(-4)}` : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Message:</span>
                <span
                  className="font-mono text-xs bg-gray-100 px-2 py-1 rounded cursor-pointer hover:underline"
                  onClick={() => handleCopy(paymentToken)}
                >
                  {txHash !== 'N/A' ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : 'N/A'}
                </span>
              </div>
            </div>

            {payment.error_message && (
              <div className="bg-red-50 p-2 rounded text-red-600 text-xs">
                <span className="font-medium">ملاحظة:</span>
                <p>{payment.error_message}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
