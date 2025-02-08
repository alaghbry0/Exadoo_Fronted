'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SubscriptionModal from '../components/SubscriptionModal'
import { FiZap } from 'react-icons/fi'
import { FaChartLine, FaLock, FaCheckCircle, FaStar } from 'react-icons/fa'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

type SubscriptionPlan = {
    id: number
    name: string
    tagline: string
    price: string
    description: string
    features: string[]
    animation: object
    primaryColor: string // لون العلامة التجارية الرئيسي (الأزرق)
    accentColor: string  // لون العلامة التجارية الثانوي (ذهبي/أصفر)
    icon: React.ComponentType
    backgroundPattern: string
    usp: string
}

const subscriptionPlans: readonly SubscriptionPlan[] = [
    {
        id: 1,
        name: 'قناة الفوركس VIP',
        tagline: 'إشارات نخبة الفوركس لتحقيق أقصى قدر من الأرباح',
        price: '20$',
        description: 'انضم إلى قناة الفوركس VIP واحصل على تحليلات حصرية وإشارات تداول فورية من خبراء السوق.',
        features: [
            'إشارات فوركس فائقة الدقة (معدل نجاح 90%+)',
            'تحليل فني متقدم لأزواج العملات الرئيسية',
            'تنبيهات صفقات فورية عبر Telegram',
            'جلسات تحليل مباشر أسبوعية مع محللين كبار',
            'دعم VIP مخصص على مدار الساعة'
        ],
        animation: dynamic(() => import('../animations/forex.json')) as object,
        primaryColor: '#2390f1', // الأزرق الرئيسي للهوية البصرية
        accentColor: '#eab308',  // الذهبي/الأصفر كلون ثانوي
        icon: FaChartLine,
        backgroundPattern: 'bg-none',
        usp: 'دقة إشارات لا مثيل لها'
    },
    {
        id: 2,
        name: 'قناة الكريبتو VIP',
        tagline: 'استثمر بذكاء في عالم الكريبتو المثير',
        price: '20$',
        description: 'استكشف فرص العملات الرقمية بأمان وثقة مع توصيات خبرائنا وتقارير السوق المتخصصة.',
        features: [
            'توصيات عملات رقمية مختارة بعناية فائقة',
            'تحليل متعمق لاتجاهات سوق الكريبتو',
            'إشعارات صفقات حصرية للعملات الرقمية الواعدة',
            'تقارير وأبحاث سوق الكريبتو لكبار المستثمرين',
            'مجتمع VIP حصري لمستثمري الكريبتو'
        ],
        animation: dynamic(() => import('../animations/crypto.json')) as object,
        primaryColor: '#2390f1', // الأزرق الرئيسي للهوية البصرية
        accentColor: '#eab308',  // الذهبي/الأصفر كلون ثانوي
        icon: FaLock,
        backgroundPattern: 'bg-none',
        usp: 'أمان استثمارات الكريبتو'
    }
] as const

const Shop: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
    const [hoveredPlan, setHoveredPlan] = useState<SubscriptionPlan | null>(null)

    return (
        <div dir="rtl" className="min-h-screen bg-[#f8fafc] safe-area-padding pb-32 font-cairo">
            {/* شريط التنقل العلوي المتناسق مع الصفحة الرئيسية - الشعار في الجهة المعاكسة */}
            <nav className="w-full py-4 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 flex justify-end items-center">
                    <Link href="/" className="flex items-center">
                    <span className="text-lg font-bold text-[#2d3748]">Exaado</span>
                        <svg className="w-7 h-7 mr-2 text-[#2390f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>

                    </Link>
                    {/* روابط التنقل و زر تسجيل الدخول محذوف - متناسق مع الصفحة الرئيسية */}
                </div>
            </nav>

            {/* الشريط العلوي (Hero Section) المتناسق */}
            <motion.div
                className="w-full py-16 md:py-24 relative bg-gradient-to-b from-[#e0e7ed] to-white overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url(/dot-pattern.svg)' }}></div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2d3748] mb-6 leading-tight">
                        اختر خطة <span className="text-[#2390f1]">الاشتراك</span> <br className="hidden sm:block" />
                        المناسبة لك
                    </h1>
                    <motion.p
                        className="text-gray-700 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                    >
                        استثمر بذكاء مع خطط اشتراك Exaado المصممة خصيصًا لتحقيق أهدافك المالية.
                    </motion.p>
                </div>
            </motion.div>

            {/* خط فاصل أنيق ومتناسق */}
            <div className="border-b border-gray-200 my-8 md:my-10 container mx-auto px-4"></div>

            {/* قسم خطط الاشتراك - تذاكر احترافية ومتناسقة مع تحسينات نصية */}
            <motion.section
                className="container mx-auto px-4 py-20 md:py-15 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 60 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    {subscriptionPlans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            className="relative"
                            initial={{ opacity: 0, y: 70 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 + 0.3, type: "spring", stiffness: 75 }}
                            onHoverStart={() => setHoveredPlan(plan)}
                            onHoverEnd={() => setHoveredPlan(null)}
                        >
                            {/* تذاكر احترافية - تصميم متناسق مع الصفحة الرئيسية ونصوص محسنة */}
                            <motion.div
                                className={`rounded-xl shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden cursor-pointer group bg-white hover:shadow-lg hover:border-gray-200 ${hoveredPlan === plan ? 'shadow-xl translate-y-1 scale-101' : 'shadow-md'}`}
                                style={{ perspective: 800 }}
                                onClick={() => setSelectedPlan(plan)}
                            >
                                <div className="pt-6 pb-5 px-5 relative z-20">
                                    {/* اسم الخطة والأيقونة - نصوص محسنة */}
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-xl font-semibold text-[#2d3748]">{plan.name}</h2> {/*  وزن خط متوسط  semibold */}
                                        <plan.icon className="w-7 h-7 text-[#4a5568]" />
                                    </div>
                                    <h3 className="text-lg text-gray-500 italic mb-2">{plan.tagline}</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed mb-4">{plan.description}</p> {/* لون نص أغمق قليلاً */}

                                    {/* قائمة الميزات - نصوص محسنة */}
                                    <ul className="list-none space-y-2 mt-2"> {/* زيادة التباعد الرأسي بين الميزات */}
                                        {plan.features.slice(0, 3).map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-gray-600 text-sm group-hover:text-[#2390f1] transition-colors duration-300"> {/* لون نص أغمق قليلاً للميزات */}
                                                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block ml-2"></span>
                                                <span className="leading-relaxed">{feature}</span> {/*  إضافة تباعد أسطر للميزات */}
                                            </li>
                                        ))}
                                        {plan.features.length > 3 && (
                                            <li className="text-center mt-1">
                                                <span className="text-sm text-[#2390f1] cursor-pointer group-hover:underline transition-colors duration-300">
                                                    + {plan.features.length - 3} ميزات أخرى <span className="italic">(انقر هنا)</span>
                                                </span>
                                            </li>
                                        )}
                                    </ul>

                                    {/* قسم السعر - نصوص محسنة */}
                                    <div className="flex items-center justify-center gap-2 mt-5 md:mt-6"> {/* زيادة المسافة العلوية لقسم السعر قليلاً */}
                                        <span className="text-4xl font-extrabold text-[#2390f1]">{plan.price}</span>
                                        <span className="text-gray-500 text-lg">/ شهر</span>
                                    </div>

                                    {/* USP - نصوص محسنة */}
                                    <div className="mt-3 md:mt-4"> {/* زيادة المسافة العلوية لـ USP قليلاً */}
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-[#2390f1]">
                                            <FaStar className="mr-1 text-yellow-400" /> {plan.usp}
                                        </span>
                                    </div>

                                    {/* زر الاشتراك - بدون تغيير */}
                                    <motion.button
                                        onClick={() => setSelectedPlan(plan)}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full px-6 py-3 rounded-full text-white text-lg font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 mt-5 md:mt-6 bg-gradient-to-br from-[#2390f1] to-[#1a75c4]`}
                                    >
                                        <FiZap className="text-base" />
                                        <span className="text-lg">اشترك الآن</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* تذييل الصفحة (Footer) - يمكن إضافته لاحقًا إذا لزم الأمر */}

            {/* Subscription Modal - بدون تغيير */}
            <AnimatePresence>
                {selectedPlan && (
                    <SubscriptionModal
                        plan={selectedPlan}
                        onClose={() => setSelectedPlan(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default Shop