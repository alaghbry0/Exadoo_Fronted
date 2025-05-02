'use client'
import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import SubscriptionModal from '../components/SubscriptionModal'
import { FaChartLine, FaLock, FaStar } from 'react-icons/fa'
import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import Navbar from '../components/Navbar'

// ✅ استيراد Zustand Stores
import { useTariffStore } from '../stores/zustand'
import { useProfileStore } from '../stores/profileStore'
import { useSessionStore } from '../stores/sessionStore'

// استيراد React Query والدوال من API
import { useQuery } from '@tanstack/react-query'
import { getSubscriptionTypes, getSubscriptionPlans } from '../services/api'

// تعريف الواجهات المحدثة
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
  is_recommended?: boolean; // الحقل الجديد للخطة المميزة
}

interface ApiSubscriptionPlan {
  id: number;
  name: string;
  price: number;
  duration_days: number;
  subscription_type_id: number;
  telegram_stars_price: number;
  created_at: string;
  is_active: boolean;
}

type SubscriptionOption = {
  id: number;
  duration: string;
  price: string;
  originalPrice?: number;
  savings?: string;
  telegramStarsPrice: number
};

type SubscriptionCard = {
  id: number;
  name: string;
  isRecommended: boolean;
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
};

const defaultStyles: { [key: number]: {
  tagline: string;
  primaryColor: string;
  accentColor: string;
  icon: React.FC;
  backgroundPattern: string;
  color: string;
} } = {
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

type SelectedPlan = SubscriptionCard & {
  selectedOption: SubscriptionOption;
  planId: number;};

const ShopComponent: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [cardId: number]: SubscriptionOption }>({});

  const {
  data: typesData,
  isLoading: typesLoading,

} = useQuery<ApiSubscriptionType[]>({
  queryKey: ['subscriptionTypes'],
  queryFn: getSubscriptionTypes,
});

const {
  data: plansData,
  isLoading: plansLoading,


} = useQuery<ApiSubscriptionPlan[]>({
  queryKey: ['subscriptionPlans'],
  queryFn: getSubscriptionPlans,
});

  const calculateSavings = (plans: ApiSubscriptionPlan[]) => {
    const monthlyPlan = plans.find(p => p.name === 'شهري');
    const annualPlan = plans.find(p => p.name === 'سنوي');

    if (!monthlyPlan || !annualPlan) return null;

    const monthlyPrice = monthlyPlan.price;
    const annualPrice = annualPlan.price;
    const savings = ((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100;

    return savings.toFixed(0);
  };

  const mappedCards: SubscriptionCard[] = useMemo(() => {
  if (!typesData || !plansData) return [];

  return typesData.map((type) => {
    const style = defaultStyles[type.id] || {
      tagline: '',
      primaryColor: '#0084ff',
      accentColor: '#0084ff',
      icon: FaChartLine,
      backgroundPattern: 'bg-none',
      color: '#0084FF'
    };

    const typePlans = plansData.filter(plan => plan.subscription_type_id === type.id);
    const savings = calculateSavings(typePlans);

    const options: SubscriptionOption[] = typePlans.map(plan => {
  const price = typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price;

  return {
    id: plan.id,
    duration: plan.name,
    price: !isNaN(price) ? price.toFixed(0) + '$' : '0$',
    originalPrice: price,
    telegramStarsPrice: plan.telegram_stars_price, // أضف هذا السطر
    savings: plan.name === 'سنوي' && savings ? `وفر ${savings}%` : undefined
  };
});

    return {
      id: type.id,
      name: type.name,
      isRecommended: type.is_recommended || false,
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
    };
  });
}, [typesData, plansData]);

  useEffect(() => {
    if (mappedCards.length > 0) {
      const initialOptions = mappedCards.reduce((acc, card) => {
        if (card.subscriptionOptions.length > 0) {
          acc[card.id] = card.subscriptionOptions[0];
        }
        return acc;
      }, {} as { [key: number]: SubscriptionOption });
      setSelectedOptions(initialOptions);
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
      <p>جاري التحميل...</p>
    </div>
  );
}



  return (
    <TonConnectUIProvider manifestUrl="https://exadooo-plum.vercel.app/tonconnect-manifest.json">
      <div dir="trl" className="min-h-screen bg-white safe-area-padding pb-32 font-inter">
        {/* شريط التنقل المحدث */}
         <Navbar />



        {/* الهيدر المحدث */}
        <motion.div
          className="w-full py-12 md:py-16 bg-gradient-to-br from-blue-50 to-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              اختر الاشتراك الأنسب لك!
              <span className="block text-blue-600 mt-2">واستثمر بذكاء مع خبرائنا</span>
            </h1>
            <div className="max-w-2xl mx-auto">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-transparent w-1/3 mx-auto mb-6" />
              <p className="text-gray-600 text-lg leading-relaxed">
                مع إكسادو، أصبح التداول أسهل مما تتخيل – جرّب بنفسك الآن!
              </p>
            </div>
          </div>
        </motion.div>

        {/* قسم الخطط المحدث */}
        <motion.section
          className="container mx-auto px-4 py-12 md:py-16 lg:py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 60 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {mappedCards.map((card, index) => {
              const selectedOption = selectedOptions[card.id];

              return (
                <motion.div
                dir="rtl"
                  key={card.id}
                  className="relative"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                >
                  {card.isRecommended && (
                    <div className="absolute top-0 right-0 z-20 bg-blue-600 text-white px-3 py-1 rounded-bl-xl text-sm flex items-center gap-1">
                      <FaStar className="text-yellow-300" />
                      الأكثر شيوعًا
                    </div>
                  )}

                  <motion.div
                    className={`relative rounded-xl border-2 ${
                      card.isRecommended ? 'border-blue-600 shadow-xl' : 'border-gray-200 shadow-lg'
                    } bg-white transition-all duration-200 hover:shadow-2xl`}
                    whileHover={{ y: -5 }}
                  >
                    <div className="pt-8 pb-6 px-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        {card.name}
                        {card.isRecommended && (
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            موصى به
                          </span>
                        )}
                      </h2>

                      <div className="flex flex-col items-start mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-extrabold text-gray-900">
                            {selectedOption?.price}
                          </span>
                          <span className="text-gray-500 text-lg">
                            / {selectedOption?.duration}
                          </span>
                        </div>
                        {selectedOption?.savings && (
                          <span className="text-sm text-green-600 mt-1">
                            {selectedOption.savings}
                          </span>
                        )}
                      </div>

                      <ul className="space-y-3 mb-6">
                        {card.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-600">
                            <FaStar className="text-blue-600 mt-1 flex-shrink-0" />
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {card.subscriptionOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOptions(prev => ({ ...prev, [card.id]: option }));
                            }}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedOption?.id === option.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {option.duration}
                          </button>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPlan({ ...card, selectedOption, planId: selectedOption.id })}
                        className="w-full py-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg transition-all"
                        aria-label={`اشترك في خطة ${card.name}`}
                      >
                        ابدأ الاشتراك
                      </motion.button>
                    </div>

                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

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
  );
};

const Shop = dynamic(() => Promise.resolve(ShopComponent), { ssr: false });
export default Shop;