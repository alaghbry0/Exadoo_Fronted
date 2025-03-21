'use client'
import { useSearchParams } from 'next/navigation'
import { ExchangePaymentModal } from '../components/ExchangePaymentModal'


const PaymentExchange = () => {
  const searchParams = useSearchParams()

  // استخراج المعلمات من URL
  const details = {
    orderId: searchParams.get('orderId') || '',
    depositAddress: searchParams.get('depositAddress') || '',
    amount: searchParams.get('amount') || '',
    network: searchParams.get('network') || 'TON',
    paymentToken: searchParams.get('paymentToken') || ''
  }

  // التحقق من اكتمال البيانات
  if (!details.orderId || !details.depositAddress || !details.amount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل البيانات</h1>
          <p className="text-gray-600">يرجى التأكد من صحة رابط الدفع</p>
        </div>
      </div>
    )
  }

  return <ExchangePaymentModal details={details} onClose={() => window.close()} />
}

export default PaymentExchange