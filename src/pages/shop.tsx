// src/pages/shop.tsx
'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import SubscriptionModal from '../components/SubscriptionModal'
import { FaLayerGroup, FaTags, FaStar as FaStarRecommended, FaClock } from 'react-icons/fa'
import React from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import Navbar from '../components/Navbar'

import { useQuery } from '@tanstack/react-query'
import { getSubscriptionTypes, getSubscriptionPlans, getSubscriptionGroups } from '../services/api'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star as StarFeature } from 'lucide-react';

// --- [إضافة جديدة]: استيراد مكون التحميل الكسول ---
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css'; // تأثير ضبابي اختياري

// ⭐ 1. استيراد useTelegram للحصول على معرف المستخدم
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
}

const defaultStyles: { [key: number]: {
  tagline: string;
  primaryColor: string;
  accentColor: string;
  backgroundPattern: string;
  color: string;
} } = {
  1: {
    tagline: 'إشارات نخبة الفوركس لتحقيق أقصى قدر من الأرباح',
    primaryColor: '#2390f1',
    accentColor: '#eab308',
    backgroundPattern: 'bg-none',
    color: '#2390f1'
  },
  2: {
    tagline: 'استثمر بذكاء في عالم الكريبتو المثير',
    primaryColor: '#2390f1',
    accentColor: '#eab308',
    backgroundPattern: 'bg-none',
    color: '#2390f1'
  },
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

  // ⭐ 2. الحصول على telegramId من الـ Context
  const { telegramId } = useTelegram();

  const {
    data: groupsData,
    isLoading: groupsLoading,
    error: groupsError,
  } = useQuery<ApiSubscriptionGroup[]>({
    queryKey: ['subscriptionGroups'],
    queryFn: getSubscriptionGroups,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: typesData,
    isLoading: typesLoading,
    error: typesError,
  } = useQuery<ApiSubscriptionType[]>({
    queryKey: ['subscriptionTypes', selectedGroupId],
    queryFn: () => getSubscriptionTypes(selectedGroupId),
    enabled: initialGroupSelected,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery<ApiSubscriptionPlan[]>({
    // ⭐ 5. إضافة telegramId إلى مفتاح الاستعلام
    queryKey: ['subscriptionPlans', telegramId],
    // ⭐ 6. تمرير telegramId إلى دالة الجلب
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
    return savings > 0 ? savings.toFixed(0) : null;
  };

  const mappedCards: SubscriptionCard[] = useMemo(() => {
    if (!typesData || !plansData) return [];
    return typesData
      .filter(type => selectedGroupId === null || type.group_id === selectedGroupId)
      .map((type) => {
        const style = defaultStyles[type.id] || {
          tagline: 'اكتشف مزايا هذا الاشتراك', primaryColor: '#4a90e2',
          accentColor: '#f5a623', backgroundPattern: 'bg-none', color: '#4a90e2'
        };
        const typePlans = plansData.filter(plan => plan.subscription_type_id === type.id).sort((a,b) => Number(a.price) - Number(b.price));
        const savingsPercentage = calculateSavings(typePlans);
        const options: SubscriptionOption[] = typePlans.map(plan => {
          const price = typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price;
          const originalPriceNum = plan.original_price ? (typeof plan.original_price === 'string' ? parseFloat(plan.original_price) : plan.original_price) : null;
          const hasDiscount = originalPriceNum !== null && originalPriceNum > price;
          const discountPercentage = hasDiscount && originalPriceNum ? Math.round(((originalPriceNum - price) / originalPriceNum) * 100) : 0;
          let savingsText: string | undefined = undefined;
          if (plan.name === '3 شهور' && savingsPercentage && !hasDiscount) {
            savingsText = `وفر ${savingsPercentage}%`;
          }
          return {
            id: plan.id, duration: plan.name, price: !isNaN(price) ? price.toFixed(0) + '$' : 'N/A',
            originalPrice: originalPriceNum,
            discountedPrice: price, discountPercentage,
            hasDiscount, telegramStarsPrice: plan.telegram_stars_price, savings: savingsText,
          };
        });
        return {
          ...type,
          id: type.id,
          name: type.name,
          isRecommended: type.is_recommended || false,
          tagline: type.description || style.tagline,
          primaryColor: style.primaryColor,
          accentColor: style.accentColor,
          backgroundPattern: style.backgroundPattern,
          color: style.color,
          subscriptionOptions: options,
          icon: FaLayerGroup, // الحل النهائي: مكون React افتراضي
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
      if (groupsData.length > 0) {
        setSelectedGroupId(groupsData[0].id);
        setTimeout(() => {
          const firstTab = groupTabsContainerRef.current?.querySelector(`button[data-group-id="${groupsData[0].id}"]`) as HTMLElement | null;
          firstTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 100);
      } else {
        setSelectedGroupId(null);
      }
      setInitialGroupSelected(true);
    } else if (groupsData && groupsData.length === 0 && !initialGroupSelected) {
        setSelectedGroupId(null);
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
          <section className="sticky top-0 z-30 bg-white border-b shadow-sm pt-2 pb-1">
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

        {/* [START] --- الكود المعدل --- */}
        <motion.section
          ref={subscriptionsSectionRef}
          className="container mx-auto px-4 pb-12 md:pb-16 lg:pb-20 pt-6 sm:pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isLoadingData && ( <div className="flex justify-center items-center py-10"> <div className="flex flex-col items-center"> <div className="w-12 h-12 border-4 border-t-blue-600 border-gray-300 rounded-full animate-spin mb-4"></div> <p className="text-gray-700">جاري تحميل الاشتراكات...</p> </div> </div> )}
          {!isLoadingData && mappedCards.length === 0 && ( <div className="text-center py-16 bg-white rounded-xl shadow-sm"> <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4"> <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> </div> <h3 className="text-xl font-semibold text-gray-800 mb-2"> {selectedGroupId !== null && groupsData && groupsData.length > 0 ? "لا توجد اشتراكات لهذه المجموعة" : "لا توجد اشتراكات متاحة حاليًا"} </h3> <p className="text-gray-600 max-w-md mx-auto"> {selectedGroupId !== null && groupsData && groupsData.length > 0 ? "لا توجد اشتراكات متاحة لهذه المجموعة في الوقت الحالي."  : "يرجى التحقق مرة أخرى في وقت لاحق أو اختيار مجموعة أخرى."} </p> </div> )}

          {mappedCards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {mappedCards.map((cardData, index) => {
                const selectedOption = selectedOptions[cardData.id];
                if (!selectedOption) return null;

                const hasImage = !!cardData.image_url;
                const placeholderHeight = "144px";

                return (
                  <motion.div
                    key={`${cardData.id}-${selectedGroupId}-${selectedOption.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 100, damping: 15 }}
                    whileHover={{ y: -5 }}
                    className="flex flex-col h-full"
                  >
                    <Card className={`
                      w-full bg-white shadow-lg hover:shadow-xl transition-all duration-300
                      flex flex-col flex-grow relative rounded-xl
                      ${hasImage ? 'border-0 overflow-hidden' : 'border border-gray-200'}
                      ${cardData.isRecommended && !hasImage ? 'ring-2 ring-blue-500 ring-opacity-60' : ''}
                    `}>
                      {hasImage && (
                        <div
                          className="relative w-full group"
                          style={{ height: placeholderHeight, backgroundColor: '#e0e0e0' }}
                        >
                          <LazyLoadImage
                            alt={cardData.name}
                            src={cardData.image_url!}
                            effect="blur"
                            wrapperClassName="w-full h-full"
                            className="w-full h-full object-cover"
                            style={{ display: 'block' }}
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                          {cardData.isRecommended && (
                            <div className="absolute top-3 left-3 z-10">
                              <Badge className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg px-2.5 py-1 text-xs font-semibold flex items-center gap-1">
                                <FaStarRecommended className="h-3 w-3" fill="currentColor" />
                                الأكثر طلباً
                              </Badge>
                            </div>
                          )}
                          {(selectedOption?.hasDiscount && selectedOption.discountPercentage && selectedOption.discountPercentage > 0) && (
                            <div className="absolute bottom-3 right-3 z-10">
                              <Badge className="bg-yellow-500 hover:bg-yellow-500 text-black border-0 shadow-lg px-2.5 py-1 text-xs font-bold">
                                خصم {selectedOption.discountPercentage}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}

                      {!hasImage && cardData.isRecommended && (
                        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                          <FaStarRecommended className="text-yellow-300" /> الأكثر طلبا
                        </div>
                      )}

                      <CardHeader className={`text-center p-4 sm:p-5 pb-3 sm:pb-4`}>
                        <CardTitle className="text-lg md:text-xl font-bold text-gray-900 mb-1 line-clamp-2">{cardData.name}</CardTitle>

                        {cardData.tagline && <CardDescription className="mb-2 sm:mb-3 text-sm text-gray-600 line-clamp-2 h-10">{cardData.tagline}</CardDescription>}

                        <div className="flex items-end justify-center gap-1 mb-1">
                          <span className="text-2xl sm:text-3xl font-bold text-gray-900">{selectedOption?.price}</span>
                          <span className="text-sm text-gray-500 mb-1">/ {selectedOption?.duration}</span>
                        </div>

                        {(selectedOption?.hasDiscount && selectedOption.originalPrice) && (
                          <div className="flex items-center justify-center gap-2 mt-1">
                            {!hasImage && selectedOption.discountPercentage && selectedOption.discountPercentage > 0 && (
                                <Badge variant="destructive" className="bg-red-100 text-red-600 hover:bg-red-100 px-2.5 py-1 text-xs">
                                  خصم {selectedOption.discountPercentage}%
                                </Badge>
                            )}
                            <span className="text-sm text-gray-400 line-through">
                              {selectedOption.originalPrice?.toFixed(0)}$
                            </span>
                          </div>
                        )}

                        {!selectedOption?.hasDiscount && selectedOption?.savings && (
                          <div className="mt-1">
                            <span className="text-sm text-green-700 bg-green-100 px-2.5 py-1 rounded-md font-medium">
                              {selectedOption.savings}
                            </span>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="flex flex-col flex-grow pt-0 px-4 sm:px-5 pb-4 sm:pb-5">
                        <div className="space-y-3 flex-grow mb-4">
                            {(selectedOption?.hasDiscount || (cardData.isRecommended && !selectedOption?.hasDiscount)) && (
                                <div className={`
                                    border rounded-lg p-2.5 text-center
                                    ${selectedOption?.hasDiscount
                                        ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 text-red-600'
                                        : 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 text-blue-600'}
                                `}>
                                    <div className="flex items-center justify-center gap-2">
                                        <FaClock className="h-4 w-4" />
                                        <span className="text-xs sm:text-sm font-medium">
                                            {selectedOption?.hasDiscount ? "العرض ينتهي قريباً!" : "خيار رائع!"}
                                        </span>
                                    </div>
                                </div>
                            )}

                          {cardData.features.length > 0 && (
                            <div className="space-y-1.5 text-right pt-2">
                              <h3 className="font-semibold text-gray-700 mb-2 text-sm">المميزات الرئيسية:</h3>
                              {cardData.features.slice(0, 3).map((feature, idx) =>
                                <div key={idx} className="flex items-start gap-2">
                                    <StarFeature className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" />
                                    <span className="text-sm text-gray-700 leading-relaxed line-clamp-2">{feature}</span>
                                  </div>
                              )}
                              {cardData.features.length > 3 && (
                                <button
                                  onClick={() => {
                                    if (selectedOption) {
                                      setSelectedPlan({ ...cardData, selectedOption, planId: selectedOption.id });
                                    }
                                  }}
                                  className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                >
                                  عرض كل المميزات ...
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-auto">
                          {cardData.subscriptionOptions.length > 1 && (
                            <div className="flex flex-wrap gap-2 mb-4 justify-center">
                              {cardData.subscriptionOptions.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOptions(prev => ({ ...prev, [cardData.id]: option }));
                                  }}
                                  className={`
                                    px-2.5 py-1 rounded-md text-xs transition-all border
                                    ${selectedOption?.id === option.id
                                      ? 'bg-blue-100 text-blue-700 font-semibold border-blue-300 ring-1 ring-blue-300'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'}
                                  `}
                                >
                                  {option.duration}
                                </button>
                              ))}
                            </div>
                          )}

                          <Button
                            onClick={() => { if (selectedOption) setSelectedPlan({ ...cardData, selectedOption, planId: selectedOption.id })}}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 sm:h-12 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            disabled={!selectedOption}
                          >
                            اشترك معنا الآن
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
        {/* [END] --- الكود المعدل --- */}

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