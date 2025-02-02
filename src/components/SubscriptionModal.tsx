'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiX } from 'react-icons/fi'
import usdtAnimation from '../animations/usdt.json'
import starsAnimation from '../animations/stars.json'
import dynamic from 'next/dynamic'
import { useTelegramPayment } from '../hooks/useTelegramPayment' // ✅ استيراد نظام الدفع بـ Telegram Stars

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

const SubscriptionModal = ({ plan, onClose }: { plan: SubscriptionPlan | null; onClose: () => void }) => {
  if (!plan) return null

  const { handleTelegramStarsPayment, loading } = useTelegramPayment() // ✅ استخدام نظام الدفع بـ Telegram Stars

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex justify-center items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-t-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden"
          style={{
            height: '65vh',
            maxHeight: 'calc(150vh - 70px)',
            marginBottom: '56px' // يتوافق مع ارتفاع شريط التنقل الجديد
          }}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 150, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* رأس النافذة */}
          <div className="bg-[#f8fbff] px-4 py-3 flex justify-between items-center border-b sticky top-0">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-[#2390f1] transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
            <h2 className="text-base font-semibold text-[#1a202c] text-right flex-1 pr-2">
              {plan.name}
            </h2>
          </div>

          {/* محتوى النافذة مع مساحة مضمونة */}
          <div className="p-4 h-[calc(82vh-56px)] flex flex-col overflow-y-auto pb-4">
            <div className="space-y-4 flex-1">
              {/* السعر والمدة */}
              <div className="flex items-baseline gap-2 justify-end mb-4">
                <span className="text-gray-500 text-sm">/ شهرياً</span>
                <span className="text-xl font-bold text-[#2390f1]">{plan.price}</span>
              </div>

              {/* الميزات */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 text-right">المزايا المضمنة:</h3>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-600 text-sm text-right"
                    >
                      <span className="flex-1 leading-relaxed">{feature}</span>
                      <FiCheckCircle className="text-[#2390f1] mt-0.5 shrink-0 text-base" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* خيارات الدفع مع هامش آمن */}
            <div className="sticky bottom-20 bg-white pt-4 pb-8 space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-l from-[#2390f1] to-[#1a75c4] text-white rounded-lg text-sm"
              >
                <Lottie
                  animationData={usdtAnimation}
                  className="w-8 h-8"
                  loop={true}
                />
                <span className="font-medium ml-2">الدفع عبر USDT</span>
              </motion.button>

              {/* ✅ زر الدفع بـ Telegram Stars */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTelegramStarsPayment(plan.id, plan.price, onClose)} // ✅ استدعاء الدفع عند النقر
                disabled={loading} // ✅ تعطيل الزر أثناء التحميل
                className={`w-full flex items-center justify-between px-4 py-2.5
                  bg-gradient-to-l from-[#FFD700] to-[#FFC800] text-[#1a202c] rounded-lg text-sm
                  ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Lottie animationData={starsAnimation} className="w-8 h-8" loop={true} />
                <span className="font-medium ml-2">
                  {loading ? "جاري المعالجة..." : "الدفع بـ Telegram Stars"}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SubscriptionModal
