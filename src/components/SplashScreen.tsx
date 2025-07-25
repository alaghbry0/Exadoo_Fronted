'use client';

import { motion, AnimatePresence, useSpring, useTransform, useMotionValue, Variants, MotionValue, TargetAndTransition } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState, useEffect, useRef, MouseEvent } from 'react';

// الخطاف المساعد لمحاكاة التحميل (يبقى كما هو)
const useLoadingSimulator = () => {
    const [percentValue, setPercentValue] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setPercentValue(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const remaining = 100 - prev;
          const increment = prev < 70 ? 1 : Math.max(2, remaining * 0.05);
          return Math.min(prev + increment, 100);
        });
      }, 70);

      return () => clearInterval(interval);
    }, []);

    const percent = useSpring(percentValue, {
        stiffness: 120,
        damping: 40,
        mass: 1,
    });

    return { percent };
};


// ====================================================================
//  مكون الخلفية الثابتة (تنفيذ مقترح)
//  ملاحظة: هذا تنفيذ مقترح لمكون الخلفية. يمكنك استبداله بالكود الخاص بك.
// ====================================================================
const StaticContourBackground = () => {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-white">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="contour-pattern"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 10 C 20 20, 40 20, 50 10 S 70 0, 80 10 M -10 30 C 0 40, 20 40, 30 30 S 50 20, 60 30 M 30 50 C 40 60, 60 60, 70 50 S 90 40, 100 50 M 50 70 C 60 80, 80 80, 90 70 S 110 60, 120 70"
              stroke="rgba(203, 213, 225, 0.2)" // slate-300 with low opacity
              fill="none"
              strokeWidth="1.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#contour-pattern)" />
      </svg>
    </div>
  );
};


// ====================================================================
//  مكون شاشة التحميل النهائي (بالخلفية الثابتة الجديدة)
// ====================================================================
const SplashScreen = () => {
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
    }, CONFIG.MESSAGE_INTERVAL_MS);
    return () => clearInterval(messageInterval);
  }, [CONFIG.MESSAGE_INTERVAL_MS, loadingMessages.length]);

  useEffect(() => {
    const unsubscribe = percent.on("change", (latest) => {
      if (latest >= 100) {
        const timer = setTimeout(() => setIsDone(true), CONFIG.EXIT_DELAY_MS);
        return () => { clearTimeout(timer); unsubscribe(); }
      }
    });
    return () => unsubscribe();
  }, [percent, CONFIG.EXIT_DELAY_MS]);

  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-150, 150], [7, -7]);
  const rotateY = useTransform(mouseX, [-150, 150], [-7, 7]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.25, delayChildren: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.6, ease: 'easeOut', when: "afterChildren" } }
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: [0.87, 0, 0.13, 1] } },
  };

  const progressBarWidth = useTransform(percent, value => `${value}%`);
  const percentAsInt: MotionValue<number> = useTransform(percent, value => Math.round(value));


  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-[100] flex h-screen w-screen flex-col items-center justify-center bg-white"
        >
          <StaticContourBackground />

          <div className="absolute top-0 left-0 w-full h-1 bg-primary-500/10">
            <motion.div
              className="h-1 bg-gradient-to-r from-primary-400 to-secondary-400"
              style={{ width: progressBarWidth }}
              role="progressbar"
              aria-label="Loading progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentAsInt.get()}
            />
          </div>

          <div className="flex flex-col items-center">
            <motion.div
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, perspective: CONFIG.LOGO_PERSPECTIVE }}
              variants={itemVariants}
              animate={{
                opacity: 1,
                y: 0,
                scale: [1, 1.03, 1],
              }}
              transition={{
                  ...((itemVariants.animate as TargetAndTransition).transition),
                  scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="relative w-36 h-36 flex items-center justify-center bg-white shadow-2xl shadow-primary-500/10 rounded-full overflow-hidden"
            >
              <Image src="/logo-288.png" alt="Exaado Logo" width={132} height={132} className="object-contain" priority />
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
              className="mt-6 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-500"
            >
              Exaado
            </motion.h1>

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
