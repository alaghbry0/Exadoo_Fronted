'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiX } from 'react-icons/fi'
import usdtAnimation from '../animations/usdt.json';
import starsAnimation from '../animations/stars.json';


const SubscriptionModal = ({ plan, onClose }: { plan: any; onClose: () => void }) => {
  if (!plan) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-t-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden"
          style={{ height: '60vh', maxHeight: '500px' }}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* رأس النافذة */}
          <div className="bg-[#f8fbff] px-4 py-3 flex justify-between items-center border-b">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-[#2390f1] transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-[#1a202c] text-right flex-1 pr-2">
              {plan.name}
            </h2>
          </div>

          {/* محتوى النافذة */}
          <div className="p-4 h-[calc(60vh-52px)] flex flex-col justify-between">
            <div className="space-y-4">
              {/* السعر والمدة */}
              <div className="flex items-baseline gap-2 justify-end">
                <span className="text-gray-500 text-sm">/ شهرياً</span>
                <span className="text-2xl font-bold text-[#2390f1]">{plan.price}</span>
              </div>

              {/* الميزات */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 text-right">المزايا المضمنة:</h3>
                <ul className="space-y-2.5">
                  {plan.features.map((feature: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-600 text-sm text-right"
                    >
                      <span className="flex-1 leading-relaxed">{feature}</span>
                      <FiCheckCircle className="text-[#2390f1] mt-0.5 shrink-0" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* خيارات الدفع */}
            <div className="space-y-2.5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-l from-[#2390f1] to-[#1a75c4] text-white rounded-lg"
              >
                <Lottie
                  animationData={usdtAnimation}
                  className="w-8 h-8"
                  loop={true}
                />
                <span className="text-sm font-medium ml-2">الدفع عبر USDT</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-l from-[#FFD700] to-[#FFC800] text-[#1a202c] rounded-lg"
              >
                <Lottie
                  animationData={starsAnimation}
                  className="w-8 h-8"
                  loop={true}
                />
                <span className="text-sm font-medium ml-2">الدفع بـ Telegram Stars</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SubscriptionModal