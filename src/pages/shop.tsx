'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
import SubscriptionModal from '../components/SubscriptionModal'
import { FiCheckCircle, FiZap } from 'react-icons/fi'
import forexAnimation from '../animations/forex.json';
import cryptoAnimation from '../animations/crypto.json';

const subscriptionPlans = [
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
    animation: forexAnimation,
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
    animation: cryptoAnimation,
    color: '#2390f1'
  }
]

const Shop: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding">
      {/* القسم الرئيسي */}
      <motion.section
        className="container mx-auto px-4 py-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* العنوان */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a202c] mb-4">
            خطط الاشتراك المميزة
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            اختر الباقة التي تناسب أهدافك الاستثمارية واستفد من محتوى حصري
          </p>
        </motion.div>

        {/* بطاقات الخطط */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-8 relative overflow-hidden">
                {/* شريط لوني علوي */}
                <div
                  className="absolute top-0 right-0 w-full h-2"
                  style={{ backgroundColor: plan.color }}
                />

                {/* الرسوم المتحركة */}
                <div className="bg-[#eff8ff] rounded-xl p-4 mb-6">
                  <Lottie
                    animationData={plan.animation}
                    loop={true}
                    className="w-32 h-32 mx-auto"
                  />
                </div>

                {/* تفاصيل الخطة */}
                <h2 className="text-2xl font-bold text-[#1a202c] mb-3">
                  {plan.name}
                </h2>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* السعر */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  <span className="text-3xl font-bold text-[#2390f1]">
                    {plan.price}
                  </span>
                </div>

                {/* الميزات */}
                <ul className="space-y-4 mb-8 text-right">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 justify-end">
                      <span className="text-gray-600">{feature}</span>
                      <FiCheckCircle className="text-[#2390f1] shrink-0" />
                    </li>
                  ))}
                </ul>

                {/* زر الاشتراك */}
                <motion.button
                  onClick={() => setSelectedPlan(plan)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-4 bg-gradient-to-r from-[#2390f1] to-[#1a75c4] text-white
                           rounded-xl font-semibold flex items-center justify-center gap-2
                           hover:shadow-lg transition-all"
                >
                  <FiZap className="text-xl" />
                  ابدأ الاشتراك
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