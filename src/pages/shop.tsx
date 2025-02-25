'use client'
import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import SubscriptionModal from '../components/SubscriptionModal'
import { FiZap } from 'react-icons/fi'
import { FaChartLine, FaLock, FaStar } from 'react-icons/fa'
import Link from 'next/link'
import { TonConnectUIProvider } from '@tonconnect/ui-react'

// ✅ استيراد Zustand Stores
import { useTariffStore } from '../stores/zustand'
import { useProfileStore } from '../stores/profileStore'
import { useSessionStore } from '../stores/sessionStore'

// استيراد React Query والدوال من API
import { useQuery } from 'react-query'
import { getSubscriptionTypes, getSubscriptionPlans } from '../services/api'

// تعريف الواجهات الخاصة ببيانات API
interface ApiSubscriptionType {
  id: number;
  name: string;
  description: string;
  features: string[];
  channel_id: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  usp: string;
}

interface ApiSubscriptionPlan {
  id: number;
  name: string; // مثال: "سنوي", "3 شهور"
  price: string;
  duration_days: number;
  subscription_type_id: number;
  telegram_stars_price: number;
  created_at: string;
  is_active: boolean;
}

// تعريف الواجهات المستخدمة في العرض
type SubscriptionOption = {
  id: number;
  duration: string; // "شهري", "3 شهور", "سنوي"
  price: string;
}

type SubscriptionCard = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  primaryColor: string;
  accentColor: string;
  icon: React.FC;
  backgroundPattern: string;
  usp: string;
  color: string;
  subscriptionOptions: SubscriptionOption[];
}

// إعداد قيم افتراضية للتنسيقات حسب نوع الاشتراك (يمكن تعديلها لاحقًا)
const defaultStyles: { [key: number]: { tagline: string, primaryColor: string, accentColor: string, icon: React.FC, backgroundPattern: string, color: string } } = {
  1: {
    tagline: 'إشارات نخبة الفوركس لتحقيق أقصى قدر من الأرباح',
    primaryColor: '#2390f1',
    accentColor: '#eab308',
    icon: FaChartLine,
    backgroundPattern: 'bg-none',
    color: '#2390f1'
  },
  2: {
    tagline: 'استثمر بذكاء في عالم الكريبتو المثير',
    primaryColor: '#2390f1',
    accentColor: '#eab308',
    icon: FaLock,
    backgroundPattern: 'bg-none',
    color: '#2390f1'
  }
};

type SelectedPlan = SubscriptionCard & { selectedOption: SubscriptionOption };

const ShopComponent: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<SubscriptionCard | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<{ [cardId: number]: SubscriptionOption }>({})

  // جلب بيانات أنواع الاشتراكات وخططها باستخدام React Query
  const { data: typesData, isLoading: typesLoading, error: typesError } = useQuery<ApiSubscriptionType[]>('subscriptionTypes', getSubscriptionTypes)
  const { data: plansData, isLoading: plansLoading, error: plansError } = useQuery<ApiSubscriptionPlan[]>('subscriptionPlans', getSubscriptionPlans)

  // استخدام useMemo لتثبيت mappedCards بحيث لا يتغير مرجعها إلا عند تغير typesData أو plansData
  const mappedCards: SubscriptionCard[] = useMemo(() => {
    if (!typesData) return [];
    return typesData.map((type) => {
      const style = defaultStyles[type.id] || {
        tagline: '',
        primaryColor: '#2390f1',
        accentColor: '#eab308',
        icon: FaChartLine,
        backgroundPattern: 'bg-none',
        color: '#2390f1'
      }
      const options: SubscriptionOption[] = plansData ? plansData
        .filter(plan => plan.subscription_type_id === type.id)
        .map(plan => ({
          id: plan.id,
          duration: plan.name,
          price: parseFloat(plan.price).toFixed(0) + '$'
        })) : []

      return {
        id: type.id,
        name: type.name,
        tagline: style.tagline,
        description: type.description,
        features: type.features,
        primaryColor: style.primaryColor,
        accentColor: style.accentColor,
        icon: style.icon,
        backgroundPattern: style.backgroundPattern,
        usp: type.usp,
        color: style.color,
        subscriptionOptions: options
      }
    });
  }, [typesData, plansData]);

  // تهيئة الخيار المختار لكل بطاقة عند توفر البيانات
  useEffect(() => {
    if (mappedCards.length > 0) {
      const initial: { [cardId: number]: SubscriptionOption } = {};
      mappedCards.forEach(card => {
        if (card.subscriptionOptions.length > 0) {
          initial[card.id] = card.subscriptionOptions[0];
        }
      });
      setSelectedOptions(initial);
    }
  }, [mappedCards]);

  useEffect(() => {
    // تحميل TelegramWebApp ديناميكيًا
    import('@twa-dev/sdk')
      .then((module) => {
        const TelegramWebApp = module.default;
        if (TelegramWebApp) {
          console.log('Telegram.WebApp.initData:', TelegramWebApp.initData);
          const telegramId = TelegramWebApp.initDataUnsafe?.user?.id;
          if (telegramId) {
            console.log('Telegram User ID:', telegramId);
          } else {
            console.log('⚠️ Telegram ID not found in Telegram.WebApp.initData');
          }
        } else {
          console.log('⚠️ Telegram.WebApp is not defined (not in Telegram Web App)');
        }
      })
      .catch((error) => {
        console.error('Error loading TelegramWebApp:', error);
      });

    // عرض حالة Zustand Stores
    console.log('Tariff Store:', JSON.stringify(useTariffStore.getState()));
    console.log('Profile Store:', JSON.stringify(useProfileStore.getState()));
    console.log('Session Store:', JSON.stringify(useSessionStore.getState()));
  }, []);

  // التعامل مع حالات التحميل والأخطاء
  if (typesLoading || plansLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (typesError || plansError) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>حدث خطأ أثناء جلب بيانات الاشتراكات.</p>
      </div>
    );
  }

  return (
    <TonConnectUIProvider manifestUrl="https://exadooo-plum.vercel.app/tonconnect-manifest.json">
      <div dir="rtl" className="min-h-screen bg-[#f8fafc] safe-area-padding pb-32 font-cairo">
        {/* شريط التنقل العلوي */}
        <nav className="w-full py-4 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 flex justify-end items-center">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-bold text-[#2d3748]">Exaado</span>
              <svg
                className="w-7 h-7 mr-2 text-[#2390f1]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Link>
          </div>
        </nav>

        {/* الشريط العلوي (Hero Section) */}
        <motion.div
          className="w-full py-16 md:py-24 relative bg-gradient-to-b from-[#e0e7ed] to-white overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'url(/dot-pattern.svg)' }}
          ></div>
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

        {/* خط فاصل */}
        <div className="border-b border-gray-200 my-8 md:my-10 container mx-auto px-4"></div>

        {/* قسم خطط الاشتراك */}
        <motion.section
          className="container mx-auto px-4 py-20 md:py-15 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 60 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {mappedCards.map((card, index) => {
              const selectedOption = selectedOptions[card.id]
              return (
                <motion.div
                  key={card.id}
                  className="relative"
                  initial={{ opacity: 0, y: 70 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + 0.3, type: 'spring', stiffness: 75 }}
                  onHoverStart={() => setHoveredPlan(card)}
                  onHoverEnd={() => setHoveredPlan(null)}
                >
                  {/* بطاقة الخطة */}
                  <motion.div
                    className={`rounded-xl shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden cursor-pointer group bg-white hover:shadow-lg hover:border-gray-200 ${hoveredPlan?.id === card.id ? 'shadow-xl translate-y-1 scale-101' : 'shadow-md'}`}
                    style={{ perspective: 800 }}
                    onClick={() => setSelectedPlan({ ...card, selectedOption, id: selectedOption.id })}

                  >
                    <div className="pt-6 pb-5 px-5 relative z-20">
                      {/* عنوان الخطة والأيقونة */}
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-semibold text-[#2d3748]">{card.name}</h2>
                        <span
                          style={{
                            width: '1.75rem',
                            height: '1.75rem',
                            color: '#4a5568',
                            display: 'inline-flex'
                          }}
                        >
                          <card.icon />
                        </span>
                      </div>
                      <h3 className="text-lg text-gray-500 italic mb-2">{card.tagline}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">{card.description}</p>

                      {/* قائمة الميزات */}
                      <ul className="list-none space-y-2 mt-2">
                        {card.features.slice(0, 3).map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-gray-600 text-sm group-hover:text-[#2390f1] transition-colors duration-300"
                          >
                            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block ml-2"></span>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                        {card.features.length > 3 && (
                          <li className="text-center mt-1">
                            <span className="text-sm text-[#2390f1] cursor-pointer group-hover:underline transition-colors duration-300">
                              + {card.features.length - 3} ميزات أخرى <span className="italic">(انقر هنا)</span>
                            </span>
                          </li>
                        )}
                      </ul>

                      {/* عرض خيارات الاشتراك */}
                      <div className="flex justify-center gap-2 mt-4">
                        {card.subscriptionOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedOptions((prev) => ({ ...prev, [card.id]: option }))
                            }}
                            className={`px-3 py-1 rounded-full border ${selectedOption?.id === option.id ? 'bg-[#2390f1] text-white' : 'bg-white text-[#2390f1]'}`}
                          >
                            {option.duration}
                          </button>
                        ))}
                      </div>

                      {/* قسم السعر بناءً على الخيار المختار */}
                      <div className="flex items-center justify-center gap-2 mt-5 md:mt-6">
                        <span className="text-4xl font-extrabold text-[#2390f1]">{selectedOption?.price}</span>
                        <span className="text-gray-500 text-lg">/ {selectedOption?.duration}</span>
                      </div>

                      {/* USP */}
                      <div className="mt-3 md:mt-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-[#2390f1]">
                          <FaStar className="mr-1 text-yellow-400" /> {card.usp}
                        </span>
                      </div>

                      {/* زر الاشتراك */}
                      <motion.button
                        onClick={() => setSelectedPlan({ ...card, selectedOption })}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-6 py-3 rounded-full text-white text-lg font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 mt-5 md:mt-6 bg-gradient-to-br from-[#2390f1] to-[#1a75c4]"
                      >
                        <FiZap className="text-base" />
                        <span className="text-lg">اشترك الآن</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Subscription Modal */}
        <AnimatePresence>
          {selectedPlan && (
            <SubscriptionModal
              plan={selectedPlan}
              onClose={() => setSelectedPlan(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </TonConnectUIProvider>
  )
}

// تصدير المكون ديناميكيًا مع تعطيل SSR
const Shop = dynamic(() => Promise.resolve(ShopComponent), { ssr: false })
export default Shop
