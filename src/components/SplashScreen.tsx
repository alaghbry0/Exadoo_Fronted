'use client';

import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

// الخطاف المساعد لمحاكاة التحميل (لا تغيير هنا)
const useLoadingSimulator = () => {
    const [percent, setPercent] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => {
        setPercent(prev => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          const remaining = 100 - prev;
          const increment = prev < 70 ? 1 : Math.max(2, remaining * 0.05);
          return Math.min(prev + increment, 100);
        });
      }, 70);
      return () => clearInterval(interval);
    }, []);
    const smoothPercent = useSpring(percent, { stiffness: 120, damping: 40 });
    return { percent: smoothPercent };
};

// مكون الخلفية المتموجة (لا تغيير هنا)
const WavyBackground = () => {
    const waveVariants = {
      initial: { d: "M0 50 C 150 150, 250 -50, 400 50" },
      animate: {
        d: "M0 50 C 150 -50, 250 150, 400 50",
        transition: { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },

      },
    };
    return (
      <div className="absolute inset-0 z-[-1] flex items-center justify-center overflow-hidden">
        <svg className="w-full h-[300px]" viewBox="0 0 400 100" preserveAspectRatio="none">
          <motion.path fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-700/10" variants={waveVariants} initial="initial" animate="animate" />
          <motion.path fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary-500/10" variants={waveVariants} initial="animate" animate="initial" />
        </svg>
      </div>
    );
};

// ====================================================================
//  مكون شاشة التحميل النهائي (مع كل التحسينات)
// ====================================================================
const SplashScreen = () => {
  // <-- التحسين 1: تنظيم الثوابت
  const CONFIG = {
    MESSAGE_INTERVAL_MS: 2500,
    EXIT_DELAY_MS: 800,
    LOGO_PERSPECTIVE: '1000px',
  };

  const { percent } = useLoadingSimulator();
  const [isDone, setIsDone] = useState(false);

  const loadingMessages = [
    'جارٍ بدء الاتصال بالخوادم...',
    'تحميل بيانات المستخدم...',
    'صقل وحدات البكسل النهائية...',
    'نوشك على الانتهاء...',
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, CONFIG.MESSAGE_INTERVAL_MS); // <-- استخدام الثابت
    return () => clearInterval(messageInterval);
  }, [CONFIG.MESSAGE_INTERVAL_MS]);

  useEffect(() => {
    const unsubscribe = percent.on("change", (latest) => {
      if (latest >= 100) {
        const timer = setTimeout(() => setIsDone(true), CONFIG.EXIT_DELAY_MS); // <-- استخدام الثابت
        return () => { clearTimeout(timer); unsubscribe(); }
      }
    });
    return () => unsubscribe();
  }, [percent, CONFIG.EXIT_DELAY_MS]);

  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-150, 150], [7, -7]);
  const rotateY = useTransform(mouseX, [-150, 150], [-7, 7]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // <-- التحسين 4: إضافة حركة خروج أفضل
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.25, delayChildren: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.6, ease: 'easeOut', when: "afterChildren" } }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: [0.87, 0, 0.13, 1] } },
  };

  const progressBarWidth = useTransform(percent, value => `${value}%`);
  // <-- التحسين 2: تحويل النسبة لقيمة صحيحة لاستخدامها في سمات الوصولية
  const percentAsInt = useTransform(percent, value => Math.round(value));


  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-[100] flex h-screen w-screen flex-col items-center justify-center bg-slate-50"
        >
          <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-white to-slate-50" />
          <WavyBackground />
          <div className="absolute inset-0 z-[-1] bg-gradient-radial from-transparent to-white" />

          {/* <-- التحسين 2: شريط التقدم الآن مع سمات الوصولية */}
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-500/10">
            <motion.div
              className="h-1 bg-gradient-to-r from-primary-400 to-secondary-400"
              style={{ width: progressBarWidth }}
              role="progressbar"
              aria-label="Loading progress"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={percentAsInt.get()}
            />
          </div>

          <div className="flex flex-col items-center">
            {/* <-- التحسين 3: إضافة حركة تنفس للشعار */}
            <motion.div
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, perspective: CONFIG.LOGO_PERSPECTIVE }}
              variants={itemVariants}
              animate={{
                ...itemVariants.animate,
                scale: [1, 1.03, 1],
              }}
              transition={{
                  ...itemVariants.animate.transition,
                  scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="relative w-36 h-36 flex items-center justify-center bg-white shadow-2xl shadow-primary-500/10 rounded-full overflow-hidden"
            >
              <Image src="/logo px_512px.png" alt="Exaado Logo" width={144} height={144} className="object-contain" priority />
              <motion.div
                className="absolute inset-0"
                initial={{ x: '-130%' }}
                animate={{ x: '130%' }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                style={{
                  background: 'linear-gradient(to right, transparent 30%, rgba(255, 255, 255, 0.5) 50%, transparent 70%)'
                }}
              />
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mt-8 text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-500"
            >
              Exaado
            </motion.h1>

            {/* <-- التحسين 2: إضافة سمات الوصولية للرسائل المتغيرة */}
            <div className="relative mt-4 h-6 w-full max-w-xs text-center" aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 text-sm text-slate-500"
                    >
                        {loadingMessages[messageIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
          </div>

          <motion.footer
            variants={itemVariants}
            className="absolute bottom-8 text-sm text-slate-400"
          >
            © {new Date().getFullYear()} Exaado
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default dynamic(() => Promise.resolve(SplashScreen), { ssr: false });