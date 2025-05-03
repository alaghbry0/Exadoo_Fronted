'use client'
import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import SubscriptionModal from '../components/SubscriptionModal'
import { FaChartLine, FaLock, FaStar, FaPercent, FaClock } from 'react-icons/fa'
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
  original_price: number; // إضافة حقل السعر الأصلي
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
  discountedPrice?: number; // سعر بعد الخصم
  discountPercentage?: number; // نسبة الخصم
  hasDiscount: boolean; // هل يوجد خصم؟
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
  const threeMonthPlan = plans.find(p => p.name === '3 شهور');

  if (!monthlyPlan || !threeMonthPlan) return null;

  const monthlyPrice = monthlyPlan.price;
  const threeMonthPrice = threeMonthPlan.price;

  // التحقق من الشرط: إذا كان السعر الشهري * 3 <= سعر ال3 شهور
  if (monthlyPrice * 3 <= threeMonthPrice) {
    return null; // لا يوجد توفير
  }

  const savings = ((monthlyPrice * 3 - threeMonthPrice) / (monthlyPrice * 3)) * 100;
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
      const originalPrice = typeof plan.original_price === 'string' ? parseFloat(plan.original_price) : plan.original_price || price;

      // حساب ما إذا كان هناك خصم
      const hasDiscount = originalPrice > price;
      // حساب نسبة الخصم إذا وُجد
      const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

      return {
        id: plan.id,
        duration: plan.name,
        price: !isNaN(price) ? price.toFixed(0) + '$' : '0$',
        originalPrice: originalPrice,
        discountedPrice: price,
        discountPercentage,
        hasDiscount,
        telegramStarsPrice: plan.telegram_stars_price,
        savings: plan.name === '3 شهور' && savings ? `وفر ${savings}%` : undefined
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
      <div dir="rtl" className="min-h-screen bg-white safe-area-padding pb-32 font-inter">
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
                          {/* عرض السعر بعد الخصم */}
                          <span className="text-4xl font-extrabold text-gray-900">
                            {selectedOption?.price}
                          </span>
                          <span className="text-gray-500 text-lg">
                            / {selectedOption?.duration}
                          </span>
                        </div>

                        {/* عرض نسبة الخصم والسعر الأصلي إذا كان هناك خصم */}
                        {selectedOption?.hasDiscount && (
  <div className="mt-2 flex flex-col items-start">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg text-red-500 line-through font-semibold">
        {selectedOption.originalPrice?.toFixed(0)}$
      </span>
      <div className="flex items-center gap-2">
        {/* خصم */}
        <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full flex items-center">
          <FaPercent className="mr-1 text-xs" />
          {selectedOption.discountPercentage} خصم
        </span>

        {/* توفير */}
        {selectedOption.savings && (
          <span className="text-sm text-green-600 mt-1">
                            {selectedOption.savings}
                          </span>
        )}
      </div>
    </div>

    {/* شريط العد التنازلي */}
    <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
      <div className="flex items-center gap-2 text-amber-800">
        <FaClock className="text-amber-600" />
        <span className="text-sm font-medium">عرض لفترة محدودة!</span>
      </div>
    </div>
  </div>
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
                        اشترك معنا الان
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
