// PlanFeaturesList.tsx
'use client'
import { FiCheckCircle } from 'react-icons/fi'

interface PlanFeaturesListProps {
  features?: string[]
}

export const PlanFeaturesList = ({ features }: PlanFeaturesListProps) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">الميزات المتضمنة:</h3>
    <ul className="space-y-3">
      {features?.map((feature, index) => (
        <li key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
          <FiCheckCircle className="text-[#0084FF] mt-1" />
          <span className="text-gray-700 text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  </div>
)
