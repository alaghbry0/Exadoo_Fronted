'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Spinner } from '../components/Spinner1';
import { TrendingUp, BarChart3, LineChart, CandlestickChart } from 'lucide-react';

const LoadingPage = () => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const fadeDuration = shouldReduceMotion ? 1 : 3;
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [loadingText, setLoadingText] = useState('جاري تحميل التطبيق');

  // محاكاة تقدم التحميل مع تحديث نصوص الحالة
  useEffect(() => {
    const loadingTexts = [
      'جاري تحميل التطبيق',
      'إعداد الواجهة',
      'تحميل البيانات',
      'جاري تجهيز المحتوى',
      'اكتمل التحميل'
    ];

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setLoadingPercent(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const newPercent = prev + (100 - prev) * 0.1;
          const textIndex = Math.min(
            Math.floor(newPercent / 25),
            loadingTexts.length - 1
          );
          setLoadingText(loadingTexts[textIndex]);
          return newPercent;
        });
      }, 300);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: fadeDuration } }}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800"
      >
        {/* الخلفية مع الصورة الرئيسية */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src="/background.jpg"
            alt="Trading Background"
            layout="fill"
            objectFit="cover"
            loading="eager"
            priority
          />
        </div>

        {/* تأثيرات الرسوم البيانية والحركة على الخلفية */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <motion.div
              className="absolute top-[10%] left-[5%] text-white/20"
              animate={{ y: [0, -10, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <LineChart size={120} strokeWidth={1} />
            </motion.div>
            <motion.div
              className="absolute top-[40%] right-[15%] text-white/20"
              animate={{ y: [0, 10, 0], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <BarChart3 size={100} strokeWidth={1} />
            </motion.div>
            <motion.div
              className="absolute bottom-[20%] left-[20%] text-white/20"
              animate={{ y: [0, -5, 0], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <TrendingUp size={130} strokeWidth={1} />
            </motion.div>
            <motion.div
              className="absolute bottom-[30%] right-[8%] text-white/20"
              animate={{ y: [0, 8, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <CandlestickChart size={110} strokeWidth={1} />
            </motion.div>
            {/* خطوط الشبكة الأفقية */}
            {Array.from({ length: 10 }).map((_, index) => (
              <motion.div
                key={`horizontal-${index}`}
                className="absolute h-[1px] w-full bg-blue-400/10"
                style={{ top: `${(index + 1) * 10}%` }}
                animate={{ scaleX: [1, 1.05, 1], opacity: [0.05, 0.2, 0.05] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
              />
            ))}
            {/* خطوط الشبكة العمودية */}
            {Array.from({ length: 10 }).map((_, index) => (
              <motion.div
                key={`vertical-${index}`}
                className="absolute w-[1px] h-full bg-blue-400/10"
                style={{ left: `${(index + 1) * 10}%` }}
                animate={{ scaleY: [1, 1.05, 1], opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
              />
            ))}
          </div>
          {/* طبقة التراكب الضبابية */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-800/60 backdrop-blur-sm" />
        </div>

        {/* الحاوية الرئيسية للمحتوى */}
        <div className="relative z-10 w-full max-w-md px-4 flex flex-col items-center">
          {/* الشعار واسم التطبيق */}
          <motion.div
            initial={{ scale: 0.8, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="mb-8 flex flex-col items-center gap-4"
          >
            <div className="relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="relative w-24 h-24 flex items-center justify-center"
              >
                <Image
                  src="/logo px_512px.png"
                  alt="Exaado"
                  width={96}
                  height={96}
                  className="object-contain drop-shadow-lg"
                />
                {!shouldReduceMotion && (
                  <motion.div
                    className="absolute inset-0 bg-blue-400/30 blur-xl rounded-full"
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white tracking-tight"
              role="heading"
              aria-level={1}
            >
              Exaado
            </motion.h1>
          </motion.div>

          {/* مؤشر التحميل مع تأثير دوار */}
          <div className="relative h-40 mb-8 w-full flex items-center justify-center">
            <Spinner className="w-16 h-16 text-white" />
            {!shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-blue-400/20 to-transparent"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
          </div>

          {/* نص الحالة ونسبة التقدم */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-4 w-full"
          >
            <h2 className="text-xl font-semibold text-white leading-tight" dir="rtl">
              {loadingText}
            </h2>
            <p className="text-blue-200 text-sm font-medium" dir="rtl">
              {Math.round(loadingPercent)}%
            </p>
          </motion.div>

          {/* شريط التقدم المتحرك */}
          <div className="mt-10 w-full">
            <motion.div
              className="w-full h-1.5 bg-blue-950/50 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 relative"
                initial={{ width: '0%' }}
                animate={{ width: `${loadingPercent}%` }}
                transition={{ duration: 3.5, ease: 'easeInOut' }}
              >
                {!shouldReduceMotion && (
                  <motion.div
                    className="absolute inset-0 bg-white/40"
                    animate={{ left: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* تأثيرات خلفية ديناميكية إضافية */}
        {!shouldReduceMotion && (
          <>
            <motion.div
              className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-400/20 blur-3xl rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-blue-200/20 blur-2xl rounded-full"
              animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.7 }}
            />
            <motion.div
              className="absolute top-2/3 right-1/3 w-24 h-24 bg-blue-300/20 blur-xl rounded-full"
              animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </>
        )}

        {/* رسالة ARIA للقارئ الشاشي */}
        <div role="status" aria-live="polite" className="sr-only">
          {loadingText} - {Math.round(loadingPercent)}%
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default dynamic(() => Promise.resolve(LoadingPage), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-blue-900">
      <div className="w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full animate-spin" viewBox="0 0 50 50">
          <circle
            className="opacity-25"
            cx="25"
            cy="25"
            r="20"
            stroke="#0077ff"
            strokeWidth="4"
            fill="none"
          />
          <circle
            className="opacity-75"
            cx="25"
            cy="25"
            r="20"
            stroke="#0077ff"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
            strokeDashoffset="0"
          />
        </svg>
      </div>
    </div>
  )
});
