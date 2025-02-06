'use client';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import loadingAnimation from '../animations/loading.json';

// ✅ استيراد Lottie بدون SSR لتجنب أخطاء التقديم من جانب الخادم
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const SplashScreen = ({ isAppLoaded }: { isAppLoaded?: boolean }) => {
  const [progress, setProgress] = useState(0);
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    if (isAppLoaded) {
      setTimeout(() => setShouldHide(true), 800);
    }
  }, [isAppLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + (Math.random() * 15 + 5)));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return !shouldHide ? (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-[#1a1f3d] to-[#2390f1] flex flex-col justify-center items-center z-50 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isAppLoaded ? 0 : 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* تأثير الخلفية المتحركة */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 bg-white/10 rounded-full blur-[2px]"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, -200],
              x: [-50, 0, 50],
              scale: [1, 0.8, 0],
              opacity: [0.8, 0.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* شعار متحرك */}
        <motion.div
          className="relative w-32 h-32 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        >
          {/* ✅ تأكد من أن `Lottie` يعمل بدون مشاكل */}
          <Lottie animationData={loadingAnimation} className="w-full h-full" loop />

          {/* دائرة التقدم */}
          <motion.div
            className="absolute -inset-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-current text-white/20"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-current text-white"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 * (1 - progress / 100)}
                initial={{ strokeDashoffset: 283 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* عنوان ونص */}
        <motion.div
          className="text-center space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <motion.h1
            className="text-white text-4xl font-bold tracking-tighter bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            Exaado
          </motion.h1>
          <motion.p
            className="text-white/80 text-sm font-medium tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Your Smart Business Solution
          </motion.p>
        </motion.div>

        {/* نسبة التقدم */}
        <motion.div
          className="text-white/60 text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {Math.round(progress)}% Loaded
        </motion.div>
      </div>

      {/* تذييل الصفحة */}
      <motion.div
        className="absolute bottom-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Exaado</p>
        <p className="text-[0.6rem] text-white/30 mt-1">Optimizing your experience...</p>
      </motion.div>
    </motion.div>
  ) : null;
};

export default SplashScreen;
