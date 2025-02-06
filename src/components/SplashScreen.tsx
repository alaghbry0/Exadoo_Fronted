'use client'
import { motion } from 'framer-motion'
import loadingAnimation from '../animations/loading.json'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// استيراد Lottie بدون SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const SplashScreen = ({ isAppLoaded }: { isAppLoaded?: boolean }) => {
  const [shouldHide, setShouldHide] = useState(false)

  useEffect(() => {
    if (isAppLoaded) {
      setTimeout(() => setShouldHide(true), 500)
    }
  }, [isAppLoaded])

  return !shouldHide ? (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-[#2390f1] to-[#1a75c4] flex flex-col justify-center items-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: isAppLoaded ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
      </motion.div>

      <motion.div
        className="relative z-10 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-white text-5xl font-bold mb-4 tracking-tighter"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Exaado
        </motion.h1>
        <motion.p
          className="text-white/80 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Your Smart Business Solution
        </motion.p>
      </motion.div>

      <motion.div
        className="relative z-10 mt-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Lottie animationData={loadingAnimation} className="w-32 h-32" loop />
      </motion.div>

      <motion.div
        className="relative z-10 mt-6 w-48 h-1.5 bg-white/20 rounded-full overflow-hidden"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 bg-white rounded-full"
          animate={{
            x: ['-100%', '200%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <motion.div
        className="absolute bottom-8 text-center text-white/60 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        © {new Date().getFullYear()} Exaado. All rights reserved.
      </motion.div>
    </motion.div>
  ) : null
}

export default SplashScreen
