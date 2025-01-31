'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SubscriptionModal from '../components/SubscriptionModal'
import { FiZap } from 'react-icons/fi'
import forexAnimation from '../animations/forex.json'
import cryptoAnimation from '../animations/crypto.json'
import dynamic from 'next/dynamic'

// استيراد Lottie بدون SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })


// تحديد نوع البيانات لخطة الاشتراك
type SubscriptionPlan = {
  id: number
  name: string
  price: string
  description: string
  features: string[]
  animation: object
  color: string
}

// ✅ بيانات خطط الاشتراك مع `as const` لجعلها ثابتة
const subscriptionPlans: readonly SubscriptionPlan[] = [
  {
    id: 1,
    name: 'قناة الفوركس المميزة',
    price: '5 دولار/شهر',
    description: 'تحليلات حصرية وإشارات تداول فورية',
    features: [
      'إشارات تداول يومية مباشرة',
      'تحليلات فنية مفصلة',
      'تنبيهات دخول/خروج',
      'دعم مباشر من الخبراء'
    ],
    animation: forexAnimation as object, // ✅ إصلاح خطأ `any`
    color: '#2390f1'
  },
  {
    id: 2,
    name: 'قناة العملات الرقمية VIP',
    price: '10 دولار/شهر',
    description: 'توصيات متقدمة لسوق الكريبتو',
    features: [
      'توصيات تداول يومية',
      'تحليل السوق العميق',
      'إشعارات الصفقات الحصرية',
      'وصول مبكر للتقارير'
    ],
    animation: cryptoAnimation as object, // ✅ إصلاح خطأ `any`
    color: '#2390f1'
  }
] as const

const Shop: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-20"> {/* إضافة padding-bottom */}
      {/* القسم الرئيسي */}
      <motion.section
        className="container mx-auto px-4 py-6 md:py-8 h-[calc(108vh-140px)] overflow-auto" // تحديد ارتفاع وoverflow
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* العنوان */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-6 md:mb-8 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a202c] mb-2">
            الخطط المميزة
          </h1>
          <p className="text-gray-600 text-xs md:text-sm max-w-lg mx-auto">
            اختر الباقة المناسبة وابدأ رحلتك الاستثمارية
          </p>
        </motion.div>

        {/* بطاقات الخطط */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 md:p-4">
                {/* الرسوم المتحركة */}
                <div className="bg-[#eff8ff]/50 rounded-lg p-1 mb-2">
                  <Lottie
                    animationData={plan.animation}
                    loop={true}
                    className="w-16 h-16 mx-auto"
                  />
                </div>

                {/* تفاصيل الخطة */}
                <div className="text-center space-y-2">
                  <h2 className="text-lg md:text-xl font-semibold text-[#1a202c]">
                    {plan.name}
                  </h2>
                  <p className="text-gray-600 text-xs md:text-sm">{plan.description}</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xl md:text-2xl font-bold text-[#2390f1]">
                      {plan.price}
                    </span>
                  </div>
                </div>

                {/* زر الاشتراك */}
                <motion.button
                  onClick={() => setSelectedPlan(plan)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-[#2390f1] to-[#1a75c4]
                           text-white rounded-lg text-xs md:text-sm font-medium flex items-center justify-center gap-1"
                >
                  <FiZap className="text-sm" />
                  <span>الاشتراك الآن</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* نافذة الاشتراك */}
      <AnimatePresence>
        {selectedPlan && (
          <SubscriptionModal
            plan={selectedPlan}
            onClose={() => setSelectedPlan(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Shop
