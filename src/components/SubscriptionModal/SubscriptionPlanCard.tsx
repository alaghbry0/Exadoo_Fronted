import { FiCheckCircle } from 'react-icons/fi'

const SubscriptionPlanCard = ({ plan }: { plan: any }) => {
  return (
    <div className="p-4 h-[calc(80.4vh-56px)] flex flex-col overflow-y-auto pb-4">
      <div className="space-y-4 flex-1">
        {/* 🔹 السعر والمدة */}
        <div className="flex items-baseline gap-2 justify-end mb-4">
          <span className="text-gray-500 text-sm">/ شهرياً</span>
          <span className="text-xl font-bold text-[#2390f1]">{plan.price}</span>
        </div>

        {/* 🔹 الميزات */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 text-right">المزايا المضمنة:</h3>
          <ul className="space-y-2">
            {plan.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-gray-600 text-sm text-right">
                <span className="flex-1 leading-relaxed">{feature}</span>
                <FiCheckCircle className="text-[#2390f1] mt-0.5 shrink-0 text-base" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPlanCard
