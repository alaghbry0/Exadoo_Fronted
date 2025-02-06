// components/SubscriptionModal/ComingSoonModal.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import comingSoonAnimation from '@/animations/coming-soon.json'; // ✅ استيراد مباشر بدلاً من dynamic

// ✅ تحميل `Lottie` بدون SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const ComingSoonModal = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 🔹 زر الإغلاق */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-gray-400 hover:text-[#2390f1] transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* 🔹 المحتوى الرئيسي */}
            <div className="flex flex-col items-center space-y-6">
              {/* 🔹 أيقونة متحركة */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2390f1] to-[#1a75c4] rounded-full blur-md opacity-30 animate-pulse" />
                {comingSoonAnimation ? (
                  <Lottie animationData={comingSoonAnimation} className="w-32 h-32" loop={true} />
                ) : (
                  <FiClock className="w-32 h-32 text-[#2390f1] p-6 bg-[#f8fbff] rounded-full" />
                )}
              </div>

              {/* 🔹 النصوص */}
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-[#1a202c]">USDT (Ton)</h3>
                <p className="text-lg text-[#2390f1] font-medium">
                  ستتوفر طريقة الدفع هذه قريبًا
                </p>
                <p className="text-gray-500 text-sm max-w-xs">
                  نعمل جاهدين لإضافة هذه الميزة في أقرب وقت ممكن. ابقَ على اطلاع!
                </p>
              </div>

              {/* 🔹 شريط التحميل */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-[#2390f1] to-[#1a75c4] h-2.5 rounded-full animate-progress-pulse"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonModal;
