// src/components/SubscriptionModal/SubscriptionPlanCard.tsx
import { FiCheckCircle } from 'react-icons/fi'
import PaymentButtons from './PaymentButtons'

type SubscriptionOption = {
  id: number
  duration: string
  price: string
}

type SubscriptionPlan = {
  id: number
  name: string
  description: string
  features: string[]
  color: string
  subscriptionOptions: SubscriptionOption[]
  selectedOption: SubscriptionOption
}

type SubscriptionPlanCardProps = {
  plan: SubscriptionPlan
  loading: boolean
  telegramId: string | null
  handlePayment: () => void
  handleTonPayment: () => void
}

const SubscriptionPlanCard = ({
  plan,
  loading,
  telegramId,
  handlePayment,
  handleTonPayment
}: SubscriptionPlanCardProps) => {
  return (
    <div className="p-4 h-[calc(74vh-56px)] flex flex-col overflow-y-auto pb-12">
      <div className="space-y-4 flex-1">
        {/* عرض السعر والمدة المختارة */}
        <div className="flex items-baseline gap-2 justify-end mb-4">
          <span className="text-gray-500 text-sm">/ {plan.selectedOption.duration}</span>
          <span className="text-xl font-bold text-[#2390f1]">
            {plan.selectedOption.price}
          </span>
        </div>

        {/* عرض الميزات */}

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 text-right">
            المزايا المضمنة:
          </h3>
          <ul className="space-y-2" dir="LTR">
            {plan.features?.length > 0 ? (
              plan.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-600 text-sm text-right"
                >
                  <span className="flex-1 leading-relaxed" >{feature}</span>
                  <FiCheckCircle className="text-[#2390f1] mt-0.5 shrink-0 text-base"  />
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm text-right">
                ❗ لا توجد ميزات متاحة.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* خيارات الدفع */}
      <PaymentButtons
        loading={loading}
        telegramId={telegramId}
        handlePayment={handlePayment}
        handleTonPayment={handleTonPayment}
      />
    </div>
  )
}

export default SubscriptionPlanCard
