'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import CustomSpinner from '@/components/CustomSpinner'



const LoadingPage = () => {
  const shouldReduceMotion = useReducedMotion()
  const fadeDuration = shouldReduceMotion ? 0.5 : 2

  return (
    <AnimatePresence>
      <motion.div
        key="splash-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: fadeDuration }}
        className="relative min-h-screen flex flex-col items-center justify-center safe-area-padding"
      >        {/* صورة الخلفية مع تحسينات التحميل */}
        <Image
          src="/background.jpg"
          alt="Background"
          fill
          className="object-cover"
          loading="eager"
          priority
          quality={80}
        />

        {/* طبقة التراكب المحسنة */}
        <div className="absolute inset-0 bg-white/80 supports-backdrop-blur:bg-white/80 backdrop-blur-sm" />

{/* محتوى الصفحة الرئيسي */}
<div className="relative z-10 w-full max-w-md px-4">
  <motion.div
    initial={{ scale: 0.9, y: 20 }}
    animate={{ scale: 1, y: 0 }}
    transition={{
      type: 'spring',
      stiffness: 120,
      damping: 15
    }}
    className="mb-8 flex flex-col items-center gap-4"
  >
    <div className="relative">
      <Image
        src="/logo px_512px.png"
        alt="Exaado"
        width={96}
        height={96}
        className="drop-shadow-lg"
        loading="eager"
      />
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 bg-[#0077ff]/10 blur-xl rounded-full"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      )}
    </div>
    <motion.h1
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-2xl font-bold text-gray-900 tracking-tight"
      role="heading"
      aria-level="1"
    >
      Exaado
    </motion.h1>
  </motion.div>
</div>

          {/* مؤشر التحميل المخصص */}
          <div className="relative h-48 mb-8 w-full">
  <div className="absolute inset-0 flex items-center justify-center">
    <CustomSpinner shouldReduceMotion={!!shouldReduceMotion} />
  </div>

  {!shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-[#0077ff]/20 to-transparent"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
          </div>

          {/* المحتوى النصي مع تحسينات الوصول */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center space-y-3"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
              جاري معالجة البيانات...
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="block w-2 h-2 bg-[#0077ff] rounded-full animate-pulse" />
              <p className="text-[#0077ff] text-sm font-medium">
                يرجى الانتظار قليلاً...
              </p>
            </div>
          </motion.div>

          {/* شريط التقدم مع تحسينات ARIA */}
          <motion.div
  className="mt-8 w-full h-2 bg-gray-100 rounded-full overflow-hidden"
  initial={{ scaleX: 0 }}
  animate={{ scaleX: 1 }}
  transition={{ duration: 2.5, ease: "circOut" }}
  role="progressbar"
  aria-valuemin="0"
  aria-valuemax="100"
>
  <div className="h-full bg-gradient-to-r from-[#0077ff] to-[#0077ff]/70 relative">
    {!shouldReduceMotion && (
      <motion.div
        className="absolute inset-0 bg-white/30"
        animate={{
          left: ['-100%', '150%'],
          opacity: [0, 0.8, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    )}
  </div>
</motion.div>

        {/* تأثيرات الخلفية المشروطة */}
        {!shouldReduceMotion && (
          <div className="fixed inset-0 pointer-events-none">
            <motion.div
              className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0077ff]/10 blur-2xl rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: 0.2
              }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-[#0077ff]/05 blur-2xl rounded-full"
              animate={{
                scale: [0.8, 1.1, 0.8],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: 0.7
              }}
            />
          </div>
        )}

        {/* رسالة ARIA المخفية للقارئ الشاشي */}
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          جاري معالجة البيانات، الرجاء الانتظار
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default dynamic(() => Promise.resolve(LoadingPage), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <CustomSpinner shouldReduceMotion={false} />
    </div>
  )
})