'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import supportAnimation from '../animations/support.json'
import securePaymentAnimation from '../animations/secure-payment.json'
import subscriptionAnimation from '../animations/subscription.json'


// استيراد Lottie بدون SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const Home: React.FC = () => {
  const features = [
    {
      title: "إدارة الاشتراكات",
      animation: subscriptionAnimation,
      description: "تحكم كامل في اشتراكاتك مع تحديثات فورية"
    },
    {
      title: "دفع آمن",
      animation: securePaymentAnimation,
      description: "معاملات مشفرة عبر منصات دفع موثوقة"
    },
    {
      title: "دعم فني",
      animation: supportAnimation,
      description: "مساعدة فورية على مدار الساعة"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding pb-20">
      {/* شريط العروض */}
      <motion.div
        className="w-full bg-[#2390f1]/95 backdrop-blur-sm py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto px-3">
          <p className="text-center text-white font-medium text-xs sm:text-sm">
            🚀 احصل على شهر مجاني عند التسجيل اليوم!
          </p>
        </div>
      </motion.div>

      {/* المحتوى الرئيسي */}
      <main className="container mx-auto px-3 pt-6 pb-8">
        {/* العنوان الرئيسي */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a202c]">
            <span className="text-[#2390f1]">Exaado</span>
            <span className="mr-1 text-[#1a202c]"> مرحبًا بك في</span>
          </h1>

          <motion.p
            className="text-gray-600 text-sm sm:text-base mt-3 max-w-xs sm:max-w-md mx-auto leading-relaxed"
            initial={{ y: 10 }}
            animate={{ y: 0 }}
          >
            قم بإدارة اشتراكاتك بسهولة واطلع على أفضل الخدمات التي نقدمها
          </motion.p>
        </motion.div>

        {/* زر البدء */}
        <motion.div
          className="flex justify-center mb-8 sm:mb-12"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          <Link href="/shop">
            <motion.button
              className="px-5 py-2.5 bg-gradient-to-r from-[#2390f1] to-[#1a75c4] text-white
                       rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg
                       transition-all active:scale-95"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>ابدأ الآن</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </motion.button>
          </Link>
        </motion.div>

        {/* الميزات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-3 sm:p-4 border border-[#eff8ff] shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-[#eff8ff]/50 rounded-lg p-1.5 mb-2">
                <Lottie
                  animationData={feature.animation}
                  loop={true}
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto"
                />
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-[#1a202c] text-center mb-1.5">
                {feature.title}
              </h3>

              <p className="text-gray-600 text-xs sm:text-sm text-center leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home