'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import supportAnimation from '../animations/support.json'
import securePaymentAnimation from '../animations/secure-payment.json'
import subscriptionAnimation from '../animations/subscription.json'
import React, { useState } from 'react';
import { TonConnectButton, TonConnectUIProvider } from '@tonconnect/ui-react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const Home: React.FC = () => {
    const featuresData = [
        {
            title: "إدارة الاشتراكات الذكية",
            animation: subscriptionAnimation,
            description: "تحكم كامل باشتراكاتك، تنبيهات ذكية، تحديثات فورية."
        },
        {
            title: "مدفوعات آمنة",
            animation: securePaymentAnimation,
            description: "معاملات مشفرة عبر منصات دفع عالمية موثوقة."
        },
        {
            title: "دعم فني 24/7",
            animation: supportAnimation,
            description: "فريق دعم متخصص متواجد لمساعدتك في أي وقت."
        }
    ];

    const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);

    const currentFeature = featuresData[selectedFeatureIndex];

    const handleFeatureChange = (index: number) => {
        setSelectedFeatureIndex(index);
    };

    return (
        <TonConnectUIProvider manifestUrl="/manifest.json">
            <div className="min-h-screen bg-[#f8fafc] safe-area-padding pb-16 font-cairo">
                {/* شريط التنقل العلوي المبسط والمخصص للهاتف */}
                <nav className="w-full py-4 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-20">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                        <Link href="/" className="flex items-center">
                            <svg className="w-7 h-7 mr-2 text-[#2390f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            <span className="text-lg font-bold text-[#2d3748]">Exaado</span>
                        </Link>
                        {/* روابط التنقل و زر تسجيل الدخول محذوف */}
                    </div>
                </nav>

                {/* الشريط العلوي (Hero Section) المختصر والمحسن للهاتف - مع زر ربط المحفظة في الأعلى وبدون إطار */}
                <motion.div
                    className="w-full py-16 md:py-24 relative bg-gradient-to-b from-[#e0e7ed] to-white overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url(/dot-pattern.svg)' }}></div>
                    <div className="container mx-auto px-111 text-center relative z-10">
                        {/* زر ربط محفظة Ton -  تم نقله إلى هنا وإزالة الإطار */}
                        <motion.div
                            className="flex justify-center mb-6"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        >
                            {/*  تم فصل TonConnectButton عن العناصر الداخلية */}
                            <TonConnectButton manifestUrl="/manifest.json" className={`px-8 py-3 bg-white text-[#2d3748] shadow-md rounded-full text-lg sm:text-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 motion-safe:hover:scale-103 motion-safe:active:scale-95`}>
                                <span className="text-base">ربط محفظة Ton</span>
                            </TonConnectButton>
                            <svg className="w-5 h-5 text-[#2390f1] mr-2 absolute top-[50%] right-[calc(50%-70px)] translate-y-[-50%]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h120a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                         </motion.div>


                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2d3748] mb-6 leading-tight">
                            جيل جديد من <span className="text-[#2390f1]">الاستثمار</span> <br className="hidden sm:block" />
                            بين يديك
                        </h1>
                        <motion.p
                            className="text-gray-700 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
                            initial={{ y: 20 }}
                            animate={{ opacity: 1 }}
                        >
                            توصيات دقيقة، تحليلات حصرية، وأدوات متطورة لنموك المالي.
                        </motion.p>

                        <motion.div
                            className="flex justify-center"
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        >
                            <Link href="/shop">
                                <motion.button
                                    className="px-8 py-3 bg-gradient-to-br from-[#facc15] to-[#eab308] text-white
                                    rounded-full text-lg sm:text-xl font-bold flex items-center gap-2 shadow-xl hover:shadow-2xl
                                    transition-all active:scale-95 border-2 border-white/20"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span className="text-base">ابدأ الآن</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3V9m0 9l-3-3V15m-3-3v6m4-9H8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2H9c-1 0-1.9.684-2 1.5M9 5l3 3m-3 12l3-3M15 5l3 3m-3 12l3-3" />
                                    </svg>
                                </motion.button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>

                {/* قسم الميزات التفاعلية - منصة عرض الميزات المحسنة للهاتف */}
                <div className="py-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#2d3748] text-center mb-12">
                        <span className="text-[#2390f1]">استكشف</span> ميزات Exaado
                    </h2>

                    {/* منطقة عرض الميزة المركزية المحسنة للهاتف */}
                    <motion.div
                        className="relative bg-white rounded-2xl p-6 md:p-10 border border-[#e6e9ed] shadow-md mx-auto max-w-md"
                        style={{ boxShadow: '8px 8px 20px rgba(0,0,0,0.04), inset 2px 2px 4px #f0f0f0, inset -2px -2px 4px #fff' }}
                    >
                        {/* الرسوم المتحركة Lottie للميزة الحالية - حجم أصغر على الهاتف */}
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-5 pointer-events-none">
                            <Lottie
                                animationData={currentFeature.animation}
                                loop={true}
                                className="w-full h-full max-w-[70%] max-h-[70%] object-contain"
                            />
                        </div>
                        <div className="relative z-10">
                            <AnimatePresence exitBeforeEnter>
                                <motion.div
                                    key={selectedFeatureIndex}
                                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                                    transition={{ duration: 0.3, type: "spring", stiffness: 70 }}
                                    className="text-center"
                                >
                                    <h3 className="text-xl font-bold text-[#2d3748] mb-4">{currentFeature.title}</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">{currentFeature.description}</p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* عناصر تحكم التنقل بين الميزات - حجم أصغر على الهاتف */}
                    <div className="flex justify-center mt-8 space-x-3">
                        {featuresData.map((feature, index) => (
                            <motion.button
                                key={index}
                                className={`rounded-full w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-300 hover:bg-gray-400 transition-colors ${selectedFeatureIndex === index ? 'bg-[#2390f1]' : ''}`}
                                onClick={() => handleFeatureChange(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            />
                        ))}
                    </div>
                </div>

                {/* قسم دعوة إلى العمل (Call to Action) النهائي المختصر والمحسن للهاتف */}
                <div className="container mx-auto px-4 py-24 bg-[#f0f4f8] rounded-2xl mt-16 shadow-lg text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#2d3748] mb-8">
                        ابدأ رحلتك نحو <span className="text-[#2390f1]">النجاح المالي</span> الآن!
                    </h2>
                    <p className="text-gray-700 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
                         .انضم الى اكسادوا وابدأ استثماراتك بذكاء وفعالية
                    </p>
                    <motion.div
                        className="flex justify-center"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 120, damping: 15 }}
                    >
                        <Link href="/shop">
                            <motion.button
                                className="px-10 py-3.5 bg-gradient-to-br from-[#2390f1] to-[#1a75c4] text-white
                                rounded-full text-lg sm:text-xl font-extrabold flex items-center gap-2 shadow-xl hover:shadow-2xl
                                transition-all active:scale-95 border-2 border-white/20"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="text-base">ابدأ الآن</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </TonConnectUIProvider>
    )
}

export default Home