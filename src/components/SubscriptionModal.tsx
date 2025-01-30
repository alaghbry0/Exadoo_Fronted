'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
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
          style={{ height: '55vh' }}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 160, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* رأس النافذة */}
          <div className="bg-[#f8fbff] px-4 py-3 flex justify-between items-center border-b">
            <h2 className="text-lg font-semibold text-[#1a202c]">{plan.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-[#2390f1] transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* محتوى النافذة */}
          <div className="p-4 h-[calc(55vh-52px)] flex flex-col justify-between">
            <div>
              {/* السعر والمدة */}
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#2390f1]">{plan.price}</span>
                <span className="text-gray-500 text-sm">/ شهرياً</span>
              </div>

              {/* الميزات */}
              <div className="mb-6">
                <ul className="space-y-3">
                  {plan.features.map((feature: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-600 text-sm"
                    >
                      <FiCheckCircle className="text-[#2390f1] mt-1 shrink-0" />
                      <span className="text-right leading-relaxed">{feature}</span>
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
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#2390f1] to-[#1a75c4] text-white rounded-lg"
              >
                <span className="text-sm font-medium">USDT (TON)</span>
                <Lottie
                  animationData={usdtAnimation}
                  className="w-9 h-9"
                  loop={true}
                />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#FFD700] to-[#FFC800] text-[#1a202c] rounded-lg"
              >
                <span className="text-sm font-medium">Telegram Stars</span>
                <Lottie
                  animationData={starsAnimation}
                  className="w-9 h-9"
                  loop={true}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SubscriptionModal