'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Lottie from 'lottie-react'
import subscriptionAnimation from '../animations/subscription.json'
import securePaymentAnimation from '../animations/secure-payment.json'
import supportAnimation from '../animations/support.json'

const Home: React.FC = () => {
  const DESIGN_SETTINGS = {
    colors: {
      primary: '#2390f1',
      secondary: '#eff8ff',
      text: '#1a202c',
      accent: '#FFD700'
    },
    animations: {
      cardHover: { y: -5 },
      buttonHover: { scale: 1.03 }
    }
  }

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
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] to-white safe-area-padding">
      {/* شريط العروض */}
      <motion.div
        className="w-full bg-[#2390f1] bg-opacity-95 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto px-4 py-2.5">
          <p className="text-center text-white font-medium text-sm md:text-base">
            🚀 احصل على شهر مجاني عند التسجيل اليوم!
          </p>
        </div>
      </motion.div>

      {/* المحتوى الرئيسي */}
      <main className="container mx-auto px-4 pt-8 pb-12">
        {/* العنوان والشعار مع التعديلات الجديدة */}
        <motion.div
          className="text-center mb-12 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >

          <h1 className="text-4xl md:text-5xl font-bold relative z-10">
            <span className="text-[#2390f1]">Exaado</span>
            <span className="text-[#1a202c] mr-2"> مرحبا بك في</span>
          </h1>


          <motion.p
            className="text-gray-600 mt-6 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
             قم بإدارة اشتراكاتك بسهولة و
            <br className="hidden md:block" />
            اطلع على أفضل الخدمات التي نقدمها
          </motion.p>

          {/* زر البدء */}
          <motion.div
            className="mt-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <Link href="/shop">
              <motion.button
                className="px-8 py-3.5 bg-gradient-to-bl from-[#2390f1] to-[#1a75c4] text-white
                         rounded-xl shadow-lg font-semibold text-lg hover:shadow-xl transition-all
                         flex items-center gap-3 mx-auto relative overflow-hidden group"
                whileHover={DESIGN_SETTINGS.animations.buttonHover}
              >
                <span className="relative z-10">ابدأ رحلتك الآن</span>
                <div className="relative z-10 w-5 h-5 bg-white/10 rounded-full p-1">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-20 transition-opacity from-[#FFD700] to-transparent" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* ميزات التطبيق */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 border border-[#eff8ff] relative overflow-hidden group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={DESIGN_SETTINGS.animations.cardHover}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-[#f8fbff] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-16 h-1 bg-[#FFD700]" />

              <div className="relative z-10">
                <div className="bg-[#eff8ff] rounded-xl p-4 w-fit mx-auto mb-6">
                  <Lottie
                    animationData={feature.animation}
                    loop={true}
                    className="w-28 h-28 mx-auto"
                  />
                </div>

                <h3 className="text-2xl font-bold text-[#1a202c] mb-4 text-center">
                  {feature.title}
                </h3>

                <p className="text-gray-600 text-center text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home