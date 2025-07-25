// src/pages/shop.tsx
'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import SubscriptionModal from '../components/SubscriptionModal'
import React from 'react'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import Navbar from '../components/Navbar'
import { useQuery } from '@tanstack/react-query'
import { getSubscriptionTypes, getSubscriptionPlans, getSubscriptionGroups } from '../services/api'
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Gem, Star, RefreshCw, AlertTriangle, Layers, Tag, Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTelegram } from '../context/TelegramContext'

// --- استيراد أنواع البيانات الجديدة لتوافق المودال ---
import type { ModalPlanData, PlanOption as ModalPlanOption } from '@/types/modalPlanData';

// --- أنواع البيانات الأساسية من API ---
import type {
  ApiSubscriptionType,
  ApiSubscriptionPlan,
  ApiSubscriptionGroup
} from '../typesPlan'

// --- تعريف هيكل البيانات الجديد للبطاقات داخل المكون ---
interface Subscription {
  id: number;
  name: string;
  tagline: string;
  features: string[];
  isRecommended: boolean;
  terms_and_conditions: string[];
  icon: React.ElementType;
  group_id: number | null;
  plans: ModalPlanOption[];
}

// --- خريطة الأيقونات ---
const iconMap: { [key: string]: React.ElementType } = {
  'default': Star,
  'forex': Zap,
  'crypto': Gem,
  'vip': Crown,
};

const getCardIcon = (type: ApiSubscriptionType): React.ElementType => {
    if (type.is_recommended) return iconMap['vip'];
    if (type.name.toLowerCase().includes('forex')) return iconMap['forex'];
    if (type.name.toLowerCase().includes('crypto')) return iconMap['crypto'];
    return iconMap['default'];
};

// ====================================================================
// تعديل 1: إنشاء مكون بطاقة التحميل (Skeleton Card)
// هذا المكون سيمثل شكل البطاقة أثناء جلب البيانات.
// ====================================================================
const CardSkeleton = () => (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md animate-pulse">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-300 rounded-xl mb-5"></div>
            <div className="h-7 w-3/4 bg-gray-300 rounded-md mb-3"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded-md mb-8"></div>
        </div>
        <div className="mb-6">
            <div className="h-10 bg-gray-200 rounded-full mb-8"></div>
        </div>
        <div className="flex items-baseline justify-center gap-2 mb-8">
            <div className="h-10 w-24 bg-gray-300 rounded-md"></div>
        </div>
        <div className="h-12 w-full bg-gray-300 rounded-xl"></div>
    </div>
);


interface QueryBoundaryProps {
    isLoading: boolean;
    isError: boolean;
    children: React.ReactNode;
}

const QueryBoundary: React.FC<QueryBoundaryProps> = ({ isLoading, isError, children }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <Loader2 className="w-16 h-16 text-primary-600 animate-spin" />
                <p className="text-gray-700 font-arabic mt-4 text-lg">جاري تحميل البيانات...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div dir="rtl" className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-6 text-center">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2 font-arabic">عذراً, حدث خطأ</h3>
                <p className="text-gray-600 mb-6 max-w-md font-arabic">لم نتمكن من جلب البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى.</p>
                <Button onClick={() => window.location.reload()} size="lg" variant="destructive">
                    <RefreshCw className="h-5 w-5 ml-2" />
                    إعادة المحاولة
                </Button>
            </div>
        );
    }

    return <>{children}</>;
};

const ShopComponent = () => {
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<ModalPlanData | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<{ [key: number]: number }>({});
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [initialGroupSelected, setInitialGroupSelected] = useState(false);
  const { telegramId } = useTelegram();

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState({ left: false, right: false });

  // استعلامات البيانات
  const { data: groupsData, isLoading: groupsLoading, isError: groupsError } = useQuery<ApiSubscriptionGroup[]>({ queryKey: ['subscriptionGroups'], queryFn: getSubscriptionGroups, staleTime: 5 * 60 * 1000 });

  // ====================================================================
  // تعديل 2: تحديث منطق استعلام الأنواع (Types) مع keepPreviousData
  // ====================================================================
  const {
  data: typesData,
  isFetching: isFetchingTypes, // <-- أضفنا هذه
  isError: typesError
} = useQuery<ApiSubscriptionType[]>({
    queryKey: ['subscriptionTypes', selectedGroupId],
    queryFn: () => getSubscriptionTypes(selectedGroupId),
    enabled: !!initialGroupSelected,
    staleTime: 5 * 60 * 1000,
    // هذا الخيار يحافظ على البيانات القديمة ظاهرة حتى تصل الجديدة
    // وهو ما يسبب المشكلة إذا لم نستخدم isFetching
    placeholderData: (previousData) => previousData,
});

  const { data: plansData, isLoading: plansLoading, isError: plansError } = useQuery<ApiSubscriptionPlan[]>({ queryKey: ['subscriptionPlans', telegramId], queryFn: () => getSubscriptionPlans(telegramId), staleTime: 5 * 60 * 1000 });

  const subscriptions: Subscription[] = useMemo(() => {
    if (!typesData || !plansData) return [];

    return typesData
      .filter(type => selectedGroupId === null || type.group_id === selectedGroupId)
      .map(type => {
        const associatedPlans = plansData.filter(plan => plan.subscription_type_id === type.id).sort((a, b) => Number(a.price) - Number(b.price));
        if (associatedPlans.length === 0) return null;

        const planOptions: ModalPlanOption[] = associatedPlans.map(plan => ({
          id: plan.id,
          duration: plan.name,
          price: plan.price.toString(),
          originalPrice: plan.original_price,
          hasDiscount: plan.original_price != null && Number(plan.original_price) > Number(plan.price),
          discountPercentage: plan.original_price ? `${Math.round(((Number(plan.original_price) - Number(plan.price)) / Number(plan.original_price)) * 100)}` : undefined,
          telegramStarsPrice: plan.telegram_stars_price,
        }));

        const CardIcon = getCardIcon(type);

        return {
          id: type.id,
          name: type.name,
          tagline: type.description || 'اكتشف مزايا هذا الاشتراك',
          features: type.features || [],
          isRecommended: type.is_recommended || false,
          terms_and_conditions: type.terms_and_conditions || [],
          icon: CardIcon,
          group_id: type.group_id,
          plans: planOptions,
        };
      }).filter((sub): sub is Subscription => sub !== null);
  }, [typesData, plansData, selectedGroupId]);

  useEffect(() => {
    if (subscriptions.length > 0) {
      const initialPlanIds = subscriptions.reduce((acc, sub) => {
        if (!selectedPlanIds[sub.id]) {
            const defaultPlan = sub.plans.find(p => p.duration === 'شهري') || sub.plans[0];
            if (defaultPlan) {
              acc[sub.id] = defaultPlan.id;
            }
        }
        return acc;
      }, {} as { [key: number]: number });
      if(Object.keys(initialPlanIds).length > 0) {
        setSelectedPlanIds(prev => ({...prev, ...initialPlanIds}));
      }
    }
  }, [subscriptions, selectedPlanIds]);

  useEffect(() => {
    if (groupsData && !initialGroupSelected) {
      const defaultGroupId = groupsData.length > 0 ? groupsData[0].id : null;
      setSelectedGroupId(defaultGroupId);
      setInitialGroupSelected(true);
    }
  }, [groupsData, initialGroupSelected]);

  // منطق مؤشرات التمرير
  useEffect(() => {
    const checkScroll = () => {
      const el = tabsContainerRef.current;
      if (el) {
        const hasOverflow = el.scrollWidth > el.clientWidth;
        setShowScrollButtons({
          left: el.scrollLeft > 0,
          right: hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
        });
      }
    };
    checkScroll();
    const el = tabsContainerRef.current;
    el?.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el?.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [groupsData]);

  const handleSubscribeClick = (subscription: Subscription, selectedPlan: ModalPlanOption) => {
      const modalData: ModalPlanData = {
          id: subscription.id,
          name: subscription.name,
          description: subscription.tagline,
          features: subscription.features,
          isRecommended: subscription.isRecommended,
          termsAndConditions: subscription.terms_and_conditions,
          selectedOption: selectedPlan
      };
      setSelectedPlanForModal(modalData);
  };

  const handleGroupSelect = (groupId: number | null) => setSelectedGroupId(groupId);

  const scrollTabs = (direction: 'left' | 'right') => {
      tabsContainerRef.current?.scrollBy({
          left: direction === 'left' ? -200 : 200,
          behavior: 'smooth',
      });
  };

  // ====================================================================
  // تعديل 3: تحديث منطق تحديد حالات التحميل والخطأ
  // `initialLoading` للتحميل الأولي الكامل للصفحة فقط.
  // ====================================================================
  const initialLoading = groupsLoading || (plansLoading && !plansData);
  const hasError = !!(groupsError || typesError || plansError);

  return (
    <TonConnectUIProvider manifestUrl="https://exadooo-plum.vercel.app/tonconnect-manifest.json">
        <QueryBoundary isLoading={initialLoading} isError={hasError}>
            <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 font-arabic flex flex-col">
                <Navbar />

                <main className="px-4 pb-20 flex-grow">
                    {/* قسم Hero */}
                    <section className="pt-20 pb-16 text-center">
                        <div className="relative z-10 max-w-4xl mx-auto px-6">
                            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                <span className="block text-primary-600">اختر الاشتراك الأنسب لك!</span>
                                واستثمر بذكاء مع خبرائنا
                            </motion.h1>
                            <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
                                <div className="h-1.5 bg-gradient-to-r from-primary-500/80 to-transparent w-1/3 mx-auto mb-6 rounded-full"></div>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    مع إكسادو، أصبح التداول أسهل مما تتخيل – جرّب بنفسك الآن!
                                </p>
                            </motion.div>
                        </div>
                    </section>

                    {/* فاصل */}
                    <div className="relative my-12 md:my-16 px-4">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-200" /></div>
                        <div className="relative flex justify-center"><span className="bg-gray-50 px-4 text-primary-600"><Gem className="h-7 w-7" /></span></div>
                    </div>

                    {/* ألسنة تبويب المجموعات */}
                    {(groupsData && groupsData.length > 1) && (
                        <section className="sticky top-[60px] z-30 bg-gray-50/80 backdrop-blur-sm pt-4 pb-3 -mt-12 mb-8">
                            <div className="container mx-auto px-4 relative">
                                <AnimatePresence>
                                    {showScrollButtons.left && (
                                        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => scrollTabs('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 backdrop-blur-sm rounded-full shadow-md w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                                <div ref={tabsContainerRef} className="flex justify-start lg:justify-center items-center overflow-x-auto gap-2 md:gap-4 pb-2 scrollbar-hide -mx-4 px-4">
                                    {[{id: null, name: 'الكل', icon: Layers}, ...groupsData.map(g => ({...g, icon: Tag}))].map(group => (
                                        <button key={group.id ?? 'all'} onClick={() => handleGroupSelect(group.id)} className={cn("flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2", {'bg-primary-600 text-white shadow-md': selectedGroupId === group.id, 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60': selectedGroupId !== group.id})}>
                                            <group.icon className="w-4 h-4" />
                                            {group.name}
                                        </button>
                                    ))}
                                </div>
                                <AnimatePresence>
                                    {showScrollButtons.right && (
                                        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => scrollTabs('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 backdrop-blur-sm rounded-full shadow-md w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors">
                                            <ChevronLeft className="w-5 h-5" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>
                    )}

                    {/* قسم عرض البطاقات */}
                    <section className="max-w-7xl mx-auto">
                        {/* ==================================================================== */}
                        {/* تعديل 4: منطق عرض البطاقات أو هياكل التحميل (Skeletons) */}
                        {/* ==================================================================== */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {isFetchingTypes ? ( // <-- تصحيح: استخدم isFetchingTypes هنا
        // أثناء جلب البيانات (أول مرة أو عند التبديل)، اعرض هياكل التحميل
        Array.from({ length: 3 }).map((_, index) => <CardSkeleton key={index} />)
    ) : subscriptions.length === 0 ? (
                                // إذا لم يكن هناك تحميل ولا توجد اشتراكات، اعرض رسالة "لا توجد باقات"
                                <div className="md:col-span-2 lg:col-span-3">
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 bg-white rounded-2xl shadow-sm border">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2 font-arabic">لا توجد باقات متاحة حاليًا</h3>
                                        <p className="text-gray-600 max-w-md mx-auto font-arabic">يرجى التحقق مرة أخرى في وقت لاحق أو اختيار فئة أخرى.</p>
                                    </motion.div>
                                </div>
                            ) : (
                                // في الحالة الطبيعية، اعرض بطاقات الاشتراكات
                                subscriptions.map((sub, index) => {
                                    const selectedPlan = sub.plans.find(p => p.id === selectedPlanIds[sub.id]);
                                    if (!selectedPlan) return null;
                                    const CardIcon = sub.icon;

                                    return (
                                        <motion.div key={`${sub.id}-${selectedGroupId}`} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 25 }}>
                                            <Card className={cn("h-full flex flex-col border-gray-200/80 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 bg-white/70 backdrop-blur-sm rounded-2xl text-center", sub.isRecommended && "ring-2 ring-primary-500")}>
                                                <CardHeader className="flex flex-col items-center pt-8">
                                                    {sub.isRecommended && (<Badge variant="secondary" className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 px-2 py-1 text-xs font-bold shadow-lg"><Crown className="w-3.5 h-3.5 ml-1" /> موصى به</Badge>)}
                                                    <div className="relative w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                        <CardIcon className="w-8 h-8 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-900">{sub.name}</h3>
                                                    <p className="text-gray-500 text-sm h-10 px-2">{sub.tagline}</p>
                                                </CardHeader>
                                                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        {sub.plans.length > 1 && (
                                                            <div className="mb-6">
                                                                <div className="flex w-full bg-gray-200/70 p-1 rounded-full">
                                                                    {sub.plans.map((option) => (
                                                                        <button key={option.id} onClick={() => setSelectedPlanIds(prev => ({ ...prev, [sub.id]: option.id }))} className="relative flex-1 text-xs font-semibold py-2.5 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                                                                            {selectedPlan.id === option.id && (<motion.div layoutId={`pill-switch-${sub.id}`} className="absolute inset-0 bg-white rounded-full shadow" transition={{ type: "spring", stiffness: 300, damping: 30 }} />)}
                                                                            <span className={cn('relative z-10', {'text-primary-600': selectedPlan.id === option.id, 'text-gray-600 hover:text-gray-900': selectedPlan.id !== option.id})}>{option.duration}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="text-center mb-6">
                                                            <div className="flex items-baseline justify-center gap-2">
                                                                {selectedPlan.hasDiscount && selectedPlan.originalPrice && (<span className="text-xl font-medium text-gray-400 line-through">{Number(selectedPlan.originalPrice).toFixed(0)}$</span>)}
                                                                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{Number(selectedPlan.price).toFixed(0)}$</span>
                                                            </div>
                                                            <span className="text-sm text-gray-500">/ {selectedPlan.duration}</span>
                                                            <div className="h-6 flex items-center justify-center mt-2">
                                                                {selectedPlan.hasDiscount && selectedPlan.discountPercentage && (<Badge variant="destructive" className="font-bold">خصم {selectedPlan.discountPercentage}%</Badge>)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button onClick={() => handleSubscribeClick(sub, selectedPlan)} size="lg" className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-1" disabled={!selectedPlan}>
                                                        اشترك الآن
                                                        <ArrowLeft className="w-5 h-5 mr-2" />
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </main>

                {/* المودال */}
                <AnimatePresence>
                    {selectedPlanForModal && (
                        <SubscriptionModal
                            plan={selectedPlanForModal}
                            onClose={() => setSelectedPlanForModal(null)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </QueryBoundary>
    </TonConnectUIProvider>
  );
}

const Shop = dynamic(() => Promise.resolve(ShopComponent), { ssr: false });
export default Shop;
