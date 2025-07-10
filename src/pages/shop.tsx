// src/pages/shop.tsx
'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import SubscriptionModal from '../components/SubscriptionModal'
import { FaLayerGroup, FaTags } from 'react-icons/fa'
import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import Navbar from '../components/Navbar'

import { useQuery } from '@tanstack/react-query'
import { getSubscriptionTypes, getSubscriptionPlans, getSubscriptionGroups } from '../services/api'

// --- استيراد cn لتجميع الكلاسات ---
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// --- استيراد أيقونات متنوعة من lucide-react لإعطاء هوية بصرية ---
import { Crown, Zap, Gem, Star } from 'lucide-react';

import { useTelegram } from '../context/TelegramContext';

import type {
  ApiSubscriptionType,
  ApiSubscriptionPlan,
  SubscriptionOption,
  SubscriptionCard as OriginalSubscriptionCard,
  ApiSubscriptionGroup
} from '../typesPlan';

interface SubscriptionCard extends OriginalSubscriptionCard {
  group_id: number | null;
  terms_and_conditions: string[];
  image_url: string | null;
  icon: React.ElementType;
}

// --- تبسيط الأنماط والتركيز على اللون والأيقونة ---
const defaultStyles: { [key: number]: {
  primaryColor: string;
  accentColor: string;
} } = {
  1: { primaryColor: '#2563eb', accentColor: '#3b82f6' }, // Blue tones
  2: { primaryColor: '#f97316', accentColor: '#fb923c' }, // Orange tones
};

// --- تعريف خريطة الأيقونات للاستخدام الديناميكي ---
const iconMap: { [key: string]: React.ElementType } = {
  'default': Star,
  'forex': Zap,
  'crypto': Gem,
  'vip': Crown,
};


type SelectedPlan = SubscriptionCard & {
  selectedOption: SubscriptionOption;
  planId: number;
};

const ShopComponent: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [cardId: number]: SubscriptionOption }>({});
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [initialGroupSelected, setInitialGroupSelected] = useState(false);

  const subscriptionsSectionRef = useRef<HTMLElement>(null);
  const groupTabsContainerRef = useRef<HTMLDivElement>(null);
  const { telegramId } = useTelegram();

  const { data: groupsData, isLoading: groupsLoading, error: groupsError } = useQuery<ApiSubscriptionGroup[]>({
    queryKey: ['subscriptionGroups'],
    queryFn: getSubscriptionGroups,
    staleTime: 5 * 60 * 1000,
  });

  const { data: typesData, isLoading: typesLoading, error: typesError } = useQuery<ApiSubscriptionType[]>({
    queryKey: ['subscriptionTypes', selectedGroupId],
    queryFn: () => getSubscriptionTypes(selectedGroupId),
    enabled: initialGroupSelected,
    staleTime: 5 * 60 * 1000,
  });

  const { data: plansData, isLoading: plansLoading, error: plansError } = useQuery<ApiSubscriptionPlan[]>({
    queryKey: ['subscriptionPlans', telegramId],
    queryFn: () => getSubscriptionPlans(telegramId),
    staleTime: 5 * 60 * 1000,
  });

  const calculateSavings = (plans: ApiSubscriptionPlan[]) => {
    const monthlyPlan = plans.find(p => p.name === 'شهري');
    const threeMonthPlan = plans.find(p => p.name === '3 شهور');
    if (!monthlyPlan || !threeMonthPlan) return null;
    const monthlyPrice = Number(monthlyPlan.price);
    const threeMonthPrice = Number(threeMonthPlan.price);
    if (isNaN(monthlyPrice) || isNaN(threeMonthPrice) || monthlyPrice <= 0 || (monthlyPrice * 3 <= threeMonthPrice)) return null;
    const savings = ((monthlyPrice * 3 - threeMonthPrice) / (monthlyPrice * 3)) * 100;
    return savings > 0 ? `وفر ${savings.toFixed(0)}%` : null;
  };

  const mappedCards: SubscriptionCard[] = useMemo(() => {
    if (!typesData || !plansData) return [];
    return typesData
      .filter(type => selectedGroupId === null || type.group_id === selectedGroupId)
      .map((type) => {
        const style = defaultStyles[type.id] || { primaryColor: '#6d28d9', accentColor: '#8b5cf6' };
        const typePlans = plansData.filter(plan => plan.subscription_type_id === type.id).sort((a, b) => Number(a.price) - Number(b.price));

        const options: SubscriptionOption[] = typePlans.map(plan => {
          const price = typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price;
          const originalPriceNum = plan.original_price ? (typeof plan.original_price === 'string' ? parseFloat(plan.original_price) : plan.original_price) : null;
          const hasDiscount = originalPriceNum !== null && originalPriceNum > price;
          const discountPercentage = hasDiscount && originalPriceNum ? Math.round(((originalPriceNum - price) / originalPriceNum) * 100) : 0;

          return {
            id: plan.id,
            duration: plan.name,
            price: !isNaN(price) ? price.toFixed(0) + '$' : 'N/A',
            originalPrice: originalPriceNum,
            discountedPrice: price,
            discountPercentage,
            hasDiscount,
            telegramStarsPrice: plan.telegram_stars_price,
            savings: plan.name === '3 شهور' ? calculateSavings(typePlans) ?? undefined : undefined,
          };
        });

        let CardIcon = iconMap['default'];
        if (type.name.toLowerCase().includes('forex')) CardIcon = iconMap['forex'];
        if (type.name.toLowerCase().includes('crypto')) CardIcon = iconMap['crypto'];
        if (type.is_recommended) CardIcon = iconMap['vip'];

        return {
  ...type,
  id: type.id,
  name: type.name,
  isRecommended: type.is_recommended || false,
  tagline: type.description || 'اكتشف مزايا هذا الاشتراك',
  primaryColor: style.primaryColor,
  accentColor: style.accentColor,
  subscriptionOptions: options,
  icon: CardIcon,
  backgroundPattern: '', // أو أي قيمة افتراضية مناسبة
  color: '', // أو أي قيمة افتراضية مناسبة
};
      });
  }, [typesData, plansData, selectedGroupId]);

  useEffect(() => {
    if (mappedCards.length > 0) {
      const initialOptions = mappedCards.reduce((acc, card) => {
        if (card.subscriptionOptions.length > 0) {
          const defaultOption = card.subscriptionOptions.find(opt => opt.duration === 'شهري') || card.subscriptionOptions[0];
          acc[card.id] = defaultOption;
        }
        return acc;
      }, {} as { [key: number]: SubscriptionOption });
      setSelectedOptions(initialOptions);
    } else {
      setSelectedOptions({});
    }
  }, [mappedCards]);

  useEffect(() => {
    if (groupsData && !initialGroupSelected) {
      const defaultGroupId = groupsData.length > 0 ? groupsData[0].id : null;
      setSelectedGroupId(defaultGroupId);
      if(defaultGroupId) {
        setTimeout(() => {
          const firstTab = groupTabsContainerRef.current?.querySelector(`button[data-group-id="${defaultGroupId}"]`) as HTMLElement | null;
          firstTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 100);
      }
      setInitialGroupSelected(true);
    }
  }, [groupsData, initialGroupSelected]);

  useEffect(() => {
    import('@twa-dev/sdk').then(() => {}).catch(() => {});
  }, []);

  const handleGroupSelect = (groupId: number | null, eventTarget: HTMLElement) => {
    setSelectedGroupId(groupId);
    eventTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const isLoadingInitial = groupsLoading;
  const isLoadingData = (typesLoading || plansLoading) && !groupsLoading;
  const hasError = groupsError || typesError || plansError;

  if (isLoadingInitial && !hasError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-t-blue-600 border-gray-300 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700">جاري تحميل المجموعات...</p>
      </div>
    );
  }

  if (hasError) {
    let errorMsg = "حدث خطأ ما. يرجى المحاولة مرة أخرى.";
    if (groupsError) errorMsg = `خطأ في تحميل المجموعات: ${(groupsError as Error).message}`;
    else if (typesError) errorMsg = `خطأ في تحميل الاشتراكات: ${(typesError as Error).message}`;
    else if (plansError) errorMsg = `خطأ في تحميل الخطط: ${(plansError as Error).message}`;
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">حدث خطأ</h3>
        <p className="text-gray-600 mb-6 max-w-md">{errorMsg}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          إعادة تحميل الصفحة
        </button>
      </div>
    );
  }

  if (!initialGroupSelected) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-t-blue-600 border-gray-300 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700">جاري تهيئة البيانات...</p>
      </div>
    );
  }

  return (
    <TonConnectUIProvider manifestUrl="https://exadooo-plum.vercel.app/tonconnect-manifest.json">
      <div dir="rtl" className="min-h-screen bg-gray-50 safe-area-padding pb-32 font-inter">
        <Navbar />

        <motion.div
          className="w-full py-12 md:py-16 bg-gradient-to-br from-blue-50 to-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
           <div className="container mx-auto px-4 text-center">
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              اختر الاشتراك الأنسب لك!
              <span className="block text-blue-600 mt-2">واستثمر بذكاء مع خبرائنا</span>
            </motion.h1>

            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-transparent w-1/3 mx-auto mb-6 rounded-full"></div>
              <p className="text-gray-600 text-lg leading-relaxed">
                مع إكسادو، أصبح التداول أسهل مما تتخيل – جرّب بنفسك الآن!
              </p>
            </motion.div>
          </div>
        </motion.div>

        {(groupsData && groupsData.length > 0) && (
          <section className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b shadow-sm pt-2 pb-1">
            <div
              ref={groupTabsContainerRef}
              className="container mx-auto px-4 flex overflow-x-auto gap-2 pb-4 scrollbar-hide"
            >
              <button onClick={(e) => handleGroupSelect(null, e.currentTarget)} data-group-id="all" className={` flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${selectedGroupId === null  ? 'text-blue-700 font-semibold'  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}>
                <div className="flex items-center gap-2"> <FaLayerGroup size={16} /> الكل </div>
                {selectedGroupId === null && ( <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" layoutId="activeTabIndicator" /> )}
              </button>
              {groupsData?.map((group) => (
                <button key={group.id} data-group-id={group.id} onClick={(e) => handleGroupSelect(group.id, e.currentTarget)} className={` flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${selectedGroupId === group.id  ? 'text-blue-700 font-semibold'  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-2"> <FaTags size={16} className="text-gray-500" /> {group.name} </div>
                  {selectedGroupId === group.id && ( <motion.div  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" layoutId="activeTabIndicator" /> )}
                </button>
              ))}
            </div>
          </section>
        )}

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* --- بداية قسم البطاقات النهائي --- */}
        <motion.section
          ref={subscriptionsSectionRef}
          className="container mx-auto px-4 pb-12 md:pb-16 lg:pb-20 pt-8 sm:pt-10"
        >
          {isLoadingData && ( <div className="flex justify-center items-center py-10"> <div className="flex flex-col items-center"> <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-300 rounded-full animate-spin mb-4"></div> <p className="text-gray-700">جاري تحميل الاشتراكات...</p> </div> </div> )}
          {!isLoadingData && mappedCards.length === 0 && ( <div className="text-center py-16 bg-white rounded-xl shadow-sm"> <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد اشتراكات متاحة حاليًا</h3> <p className="text-gray-600 max-w-md mx-auto">يرجى التحقق مرة أخرى في وقت لاحق أو اختيار مجموعة أخرى.</p> </div> )}

          {mappedCards.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto">
              {mappedCards.map((cardData, index) => {
                const selectedOption = selectedOptions[cardData.id];
                const CardIcon = cardData.icon;
                if (!selectedOption) return null;

                return (
                  <motion.div
                    key={`${cardData.id}-${selectedGroupId}-${selectedOption.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="h-full"
                  >
                    <Card
                      className={cn(
                        "h-full flex flex-col relative bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl border border-gray-200",
                        cardData.isRecommended && "ring-2 ring-blue-500 ring-opacity-60"
                      )}
                    >
                      {/* رأس البطاقة المحسن */}
                      <div
                        className="relative h-16 flex items-center justify-center rounded-t-xl"
                        style={{
                          background: `linear-gradient(45deg, ${cardData.primaryColor}10, ${cardData.accentColor}10)`,
                          borderBottom: `1px solid ${cardData.primaryColor}20`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20"></div>
                        <CardIcon
                          className="h-5 w-5 z-10"
                          style={{ color: cardData.primaryColor }}
                        />

                        {/* الشارات العلوية المحسنة */}
                        <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-start">
                          {cardData.isRecommended ? (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 text-[10px] px-1.5 py-0.5 flex items-center gap-1 font-semibold shadow-sm">
                                <Crown className="h-3 w-3" />
                                موصى به
                              </Badge>
                            ) : <div></div>
                          }

                          {selectedOption?.hasDiscount && selectedOption.discountPercentage && (
                            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 text-[10px] px-1.5 py-0.5 shadow-sm font-semibold">
                              خصم {selectedOption.discountPercentage}%
                            </Badge>
                          )}
                        </div>
                      </div>

                      <CardHeader className="pb-2 pt-4 px-4 text-center">
                        <CardTitle className="text-lg font-bold text-gray-800">
                          {cardData.name}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-end">
                        <div className="text-center mb-4">
                          <div className="flex items-baseline justify-center gap-1">
                            {selectedOption?.hasDiscount && selectedOption.originalPrice && (
                                <span className="text-lg font-medium text-gray-400 line-through">{selectedOption.originalPrice.toFixed(0)}$</span>
                            )}
                            <span className="text-3xl font-extrabold text-gray-900 tracking-tighter">
                                {selectedOption?.price}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">/ {selectedOption?.duration}</span>

                          <div className="h-6 flex items-center justify-center mt-1.5">
                            {!selectedOption?.hasDiscount && selectedOption?.savings && (
                                <Badge className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-md font-medium border-0">
                                    {selectedOption.savings}
                                </Badge>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto">
                          {cardData.subscriptionOptions.length > 1 && (
                            <div className="mb-3">
                              <div className="flex w-full bg-gray-100 p-1 rounded-xl">
                                {cardData.subscriptionOptions.map((option) => (
                                  <button
                                    key={option.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedOptions(prev => ({ ...prev, [cardData.id]: option }));
                                    }}
                                    className="relative flex-1 text-xs font-semibold py-2 rounded-lg transition-colors duration-200 focus:outline-none"
                                  >
                                    {selectedOption?.id === option.id && (
                                      <motion.div
                                        layoutId={`pill-switch-${cardData.id}`}
                                        className="absolute inset-0 bg-white rounded-lg shadow-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                      />
                                    )}
                                    <span className={`relative z-10 ${selectedOption?.id === option.id ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                                      {option.duration}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <Button onClick={() => { if (selectedOption) setSelectedPlan({ ...cardData, selectedOption, planId: selectedOption.id })}}
                              className="w-full h-11 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md hover:shadow-lg transition-all text-white"
                              disabled={!selectedOption}
                          >
                              اشترك الآن
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>
        {/* --- نهاية قسم البطاقات النهائي --- */}

        <AnimatePresence>
          {selectedPlan && (
            <SubscriptionModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
          )}
        </AnimatePresence>
      </div>
    </TonConnectUIProvider>
  );
};

const Shop = dynamic(() => Promise.resolve(ShopComponent), { ssr: false });
export default Shop;