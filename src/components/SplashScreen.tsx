'use client'
import { motion } from 'framer-motion'
import loadingAnimation from '../animations/loading.json'
import dynamic from 'next/dynamic'

// استيراد Lottie بدون SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const SplashScreen = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-[#2390f1] flex flex-col justify-center items-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* شعار التطبيق */}
      <motion.h1
        className="text-white text-4xl font-bold mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      >
        Exaado
      </motion.h1>

      {/* رسوم التحميل */}
      <Lottie animationData={loadingAnimation} className="w-24 h-24" loop />

      {/* مؤشر التحميل */}
      <motion.div
        className="mt-4 w-12 h-1 bg-white rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  )
}

export default SplashScreen
