// src/pages/shop/signals.tsx

"use client";
import { componentVariants } from "@/shared/components/ui/variants";
import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic import للـ SubscriptionModal
const SubscriptionModal = dynamic(
  () =>
    import("@/domains/subscriptions/components/SubscriptionModal").then(
      (mod) => mod.default,
    ),
  { ssr: false },
);

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getSubscriptionTypes,
  getSubscriptionPlans,
  getSubscriptionGroups,
} from "@/domains/subscriptions/api";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/shared/components/ui/scroll-area";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group";
import {
  Crown,
  Zap,
  Gem,
  Star,
  AlertTriangle,
  Layers,
  Tag,
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { useTelegram } from "@/shared/context/TelegramContext";
import PageLayout from "@/shared/components/layout/PageLayout";
import { GridSkeleton, PageLoader } from "@/shared/components/ui/loaders";
import { EmptyState } from "@/shared/components/common/EmptyState";
import { LazyLoad } from "@/shared/components/common/LazyLoad";
import { SubscriptionCardSkeleton } from "@/shared/components/skeletons/SubscriptionCardSkeleton";
import {
  shopSignalsAnimations,
  shopSignalsTransitions,
} from "@/styles/animations/shop-signals";
import {
  colors,
  gradients,
  shadowClasses,
  shadows,
  spacing,
  withAlpha,
} from "@/styles/tokens";

import type { ModalPlanData } from "@/domains/subscriptions/types";
import type {
  ApiSubscriptionType,
  ApiSubscriptionPlan,
  ApiSubscriptionGroup,
  SubscriptionOption,
} from "@/domains/subscriptions/types";

// ----------------------------------------------------
// الأنواع المساعدة + الأيقونات
// ----------------------------------------------------
interface Subscription {
  id: number;
  name: string;
  tagline: string;
  features: string[];
  isRecommended: boolean;
  terms_and_conditions: string[];
  icon: React.ElementType;
  group_id: number | null;
  plans: SubscriptionOption[]; // (يحتوي المدفوعة + التجريبية)
}
const iconMap: { [key: string]: React.ElementType } = {
  default: Star,
  forex: Zap,
  crypto: Gem,
  vip: Crown,
};
const getCardIcon = (type: ApiSubscriptionType): React.ElementType => {
  if (type.is_recommended) return iconMap["vip"];
  if (type.name.toLowerCase().includes("forex")) return iconMap["forex"];
  if (type.name.toLowerCase().includes("crypto")) return iconMap["crypto"];
  return iconMap["default"];
};

interface QueryBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  children: React.ReactNode;
}
const QueryBoundary: React.FC<QueryBoundaryProps> = ({
  isLoading,
  isError,
  children,
}) => {
  if (isLoading) return <PageLoader />;
  if (isError)
    return (
      <EmptyState
        icon={AlertTriangle}
        title="عذراً, حدث خطأ"
        description="لم نتمكن من جلب البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى."
      />
    );
  return <>{children}</>;
};

// ----------------------------------------------------
// الصفحة
// ----------------------------------------------------
const ShopComponent = () => {
  const [selectedPlanForModal, setSelectedPlanForModal] =
    useState<ModalPlanData | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<{
    [key: number]: number;
  }>({});
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [initialGroupSelected, setInitialGroupSelected] = useState(false);

  const { telegramId } = useTelegram();
  const focusRingStyle = {
    "--tw-ring-color": colors.border.focus,
  } as React.CSSProperties;

  const brandRingStyle = {
    "--tw-ring-color": colors.brand.primary,
  } as React.CSSProperties;

  const {
    data: groupsData,
    isLoading: groupsLoading,
    isError: groupsError,
  } = useQuery<ApiSubscriptionGroup[]>({
    queryKey: ["subscriptionGroups"],
    queryFn: getSubscriptionGroups,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: typesData,
    isFetching: isFetchingTypes,
    isError: typesError,
  } = useQuery<ApiSubscriptionType[]>({
    queryKey: ["subscriptionTypes", selectedGroupId],
    queryFn: () => getSubscriptionTypes(selectedGroupId),
    enabled: !!initialGroupSelected,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const {
    data: plansData,
    isLoading: plansLoading,
    isError: plansError,
  } = useQuery<ApiSubscriptionPlan[]>({
    queryKey: ["subscriptionPlans", telegramId],
    queryFn: () => getSubscriptionPlans(telegramId),
    staleTime: 10 * 1000,
  });

  // بناء بيانات البطاقات (تضم خطط مدفوعة + تجريبية)
  const subscriptions: Subscription[] = useMemo(() => {
    if (!typesData || !plansData) return [];
    return typesData
      .filter(
        (type) => selectedGroupId === null || type.group_id === selectedGroupId,
      )
      .map((type) => {
        const associatedPlans = plansData
          .filter((plan) => plan.subscription_type_id === type.id)
          .sort((a, b) => Number(a.price) - Number(b.price));

        if (associatedPlans.length === 0) return null;

        const planOptions: SubscriptionOption[] = associatedPlans.map(
          (plan) => {
            const discountDetails = plan.discount_details ?? undefined;
            const originalPriceNum = plan.original_price
              ? Number(plan.original_price)
              : null;
            const currentPriceNum = Number(plan.price);
            return {
              id: plan.id,
              duration: plan.name,
              price: String(currentPriceNum),
              originalPrice: originalPriceNum,
              hasDiscount:
                originalPriceNum !== null && originalPriceNum > currentPriceNum,
              discountPercentage: originalPriceNum
                ? `${Math.round(((originalPriceNum - currentPriceNum) / originalPriceNum) * 100)}`
                : undefined,
              telegramStarsPrice: plan.telegram_stars_price,
              discountDetails:
                discountDetails && discountDetails.discount_id
                  ? discountDetails
                  : undefined,
              // ⚠️ مهم: قادم من الخادم
              // تأكد أن SubscriptionOption تحتوي isTrial?: boolean في domains/subscriptions/types/subscriptionPlan.ts
              isTrial: plan.is_trial === true,
              trialDurationDays: plan.is_trial ? plan.duration_days : undefined,
            };
          },
        );

        const CardIcon = getCardIcon(type);
        return {
          id: type.id,
          name: type.name,
          tagline: type.description || "اكتشف مزايا هذا الاشتراك",
          features: type.features || [],
          isRecommended: type.is_recommended || false,
          terms_and_conditions: type.terms_and_conditions || [],
          icon: CardIcon,
          group_id: type.group_id,
          plans: planOptions,
        };
      })
      .filter((sub): sub is Subscription => sub !== null);
  }, [typesData, plansData, selectedGroupId]);

  // اختيار افتراضي لخطة "مدفوعة" (استبعاد التجريبية)
  useEffect(() => {
    if (subscriptions.length > 0) {
      const initialPlanIds = subscriptions.reduce(
        (acc, sub) => {
          if (!selectedPlanIds[sub.id]) {
            const paidPlans = sub.plans.filter((p) => !p.isTrial);
            const defaultPlan =
              paidPlans.find((p) => p.duration.includes("شهر")) || paidPlans[0]; // أول خطة مدفوعة مناسبة
            if (defaultPlan) {
              acc[sub.id] = defaultPlan.id;
            }
          }
          return acc;
        },
        {} as { [key: number]: number },
      );

      if (Object.keys(initialPlanIds).length > 0) {
        setSelectedPlanIds((prev) => ({ ...prev, ...initialPlanIds }));
      }
    }
  }, [subscriptions, selectedPlanIds]);

  // مجموعات
  useEffect(() => {
    if (groupsData && !initialGroupSelected) {
      const defaultGroupId = groupsData.length > 0 ? groupsData[0].id : null;
      setSelectedGroupId(defaultGroupId);
      setInitialGroupSelected(true);
    }
  }, [groupsData, initialGroupSelected]);

  const handleSubscribeClick = (
    subscription: Subscription,
    selectedPlan: SubscriptionOption,
  ) => {
    const modalData: ModalPlanData = {
      id: subscription.id,
      name: subscription.name,
      description: subscription.tagline,
      features: subscription.features,
      isRecommended: subscription.isRecommended,
      termsAndConditions: subscription.terms_and_conditions,
      selectedOption: selectedPlan,
    };
    setSelectedPlanForModal(modalData);
  };
  const initialLoading = groupsLoading || (plansLoading && !plansData);
  const hasError = !!(groupsError || typesError || plansError);

  return (
    <QueryBoundary isLoading={initialLoading} isError={hasError}>
      <div
        dir="rtl"
        className="min-h-screen font-arabic flex flex-col"
        style={{
          backgroundColor: colors.bg.secondary,
          color: colors.text.primary,
        }}
      >
        <PageLayout maxWidth="2xl">
            <section
              style={{
                paddingBlockStart: spacing[20],
                paddingBlockEnd: spacing[16],
                textAlign: "center",
              }}
            >
              <div className="relative z-10 max-w-4xl mx-auto px-6">
                <motion.h1
                  {...shopSignalsAnimations.heroTitle}
                  className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
                  style={{ color: colors.text.primary }}
                >
                  <span
                    className="block"
                    style={{ color: colors.brand.primary }}
                  >
                    اختر الاشتراك الأنسب لك!
                  </span>
                  واستثمر بذكاء مع خبرائنا
                </motion.h1>
                <motion.div
                  {...shopSignalsAnimations.heroSubtitle}
                  className="max-w-2xl mx-auto"
                >
                  <div
                    className="h-1.5 w-1/3 mx-auto mb-6 rounded-full"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${withAlpha(
                        colors.brand.primary,
                        0.85,
                      )} 0%, transparent 100%)`,
                    }}
                  />
                  <p
                    className="text-lg leading-relaxed"
                    style={{ color: colors.text.secondary }}
                  >
                    مع إكسادو، أصبح التداول أسهل مما تتخيل – جرّب بنفسك الآن!
                  </p>
                </motion.div>
              </div>
            </section>

            <div className="relative my-12 md:my-16 px-4">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div
                  className="w-full border-t"
                  style={{ borderColor: colors.border.default }}
                />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-4"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    color: colors.brand.primary,
                  }}
                >
                  <Gem className="h-7 w-7" />
                </span>
              </div>
            </div>

            {groupsData && groupsData.length > 1 && (
              <section
                className="sticky top-[60px] z-30 backdrop-blur-sm pt-4 pb-3 -mt-12 mb-8"
                style={{ backgroundColor: withAlpha(colors.bg.secondary, 0.8) }}
              >
                <div className="container mx-auto px-4 relative">
                  <ScrollArea type="scroll" className="-mx-4 px-4">
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      size="lg"
                      value={
                        selectedGroupId === null
                          ? "all"
                          : String(selectedGroupId)
                      }
                      onValueChange={(value) => {
                        if (!value || value === "all") {
                          setSelectedGroupId(null);
                          return;
                        }
                        setSelectedGroupId(Number(value));
                      }}
                      className="flex w-max items-center gap-2 md:gap-4 pb-2 pr-4 justify-start lg:justify-center"
                    >
                      {[
                        { id: null, name: "الكل", icon: Layers },
                        ...groupsData.map((g) => ({ ...g, icon: Tag })),
                      ].map((group) => (
                        <ToggleGroupItem
                          key={group.id ?? "all"}
                          value={
                            group.id === null ? "all" : String(group.id)
                          }
                          className="font-semibold"
                        >
                          <group.icon className="h-4 w-4" />
                          {group.name}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                    <ScrollBar orientation="horizontal" className="mt-2" />
                  </ScrollArea>
                </div>
              </section>
            )}

            <section className="max-w-7xl mx-auto">
              {isFetchingTypes ? (
                <GridSkeleton count={3} />
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {subscriptions.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3">
                      <motion.div
                        {...shopSignalsAnimations.emptyState}
                        className={cn(
                          componentVariants.card.elevated,
                          "text-center py-16",
                        )}
                      >
                        <h3
                          className="text-2xl font-bold mb-2 font-arabic"
                          style={{ color: colors.text.primary }}
                        >
                          لا توجد باقات متاحة حاليًا
                        </h3>
                        <p
                          className="max-w-md mx-auto font-arabic"
                          style={{ color: colors.text.secondary }}
                        >
                          يرجى التحقق مرة أخرى في وقت لاحق أو اختيار فئة أخرى.
                        </p>
                      </motion.div>
                    </div>
                  ) : (
                    subscriptions.map((sub, index) => {
                      // استبعاد التجريبية من العرض
                      const displayPlans = sub.plans.filter((p) => !p.isTrial);
                      const trialPlan =
                        sub.plans.find((p) => p.isTrial) || null;

                      // اختيار الخطة المدفوعة المحددة
                      const selectedPaidPlanId = selectedPlanIds[sub.id];
                      const selectedPlan =
                        displayPlans.find((p) => p.id === selectedPaidPlanId) ||
                        displayPlans[0];

                      const CardIcon = sub.icon;

                      // حالة خاصة: لا توجد خطط مدفوعة (تجريبية فقط)
                      const trialOnly =
                        displayPlans.length === 0 && !!trialPlan;

                      // لرسالة التخفيض المتدرّج (فقط إن كان لدينا خطة مدفوعة مختارة)
                      const isTieredDiscount =
                        !!selectedPlan?.discountDetails?.is_tiered;
                      let nextPrice: number | null = null;
                      if (
                        selectedPlan &&
                        isTieredDiscount &&
                        selectedPlan.discountDetails?.next_tier_info?.message
                      ) {
                        const match =
                          selectedPlan.discountDetails.next_tier_info.message.match(
                            /(\d+(\.\d+)?)/,
                          );
                        if (match) nextPrice = Number(match[0]);
                      }

                      return (
                        <LazyLoad
                          key={`${sub.id}-${selectedGroupId}`}
                          fallback={<SubscriptionCardSkeleton />}
                        >
                          <motion.div
                            key={`${sub.id}-${selectedGroupId}`}
                            {...shopSignalsAnimations.subscriptionCard(index)}
                          >
                            <Card
                              className={cn(
                                "h-full flex flex-col transition-all duration-300 group text-center backdrop-blur-sm rounded-2xl border group-hover:-translate-y-2",
                                shadowClasses.cardInteractive,
                                sub.isRecommended && "ring-2",
                              )}
                              style={{
                                backgroundColor: withAlpha(colors.bg.elevated, 0.92),
                                borderColor: withAlpha(colors.border.default, 0.7),
                                ...(sub.isRecommended ? brandRingStyle : {}),
                              }}
                            >
                              <CardHeader className="flex flex-col items-center pt-8">
                                {sub.isRecommended && (
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "absolute top-4 right-4 border-0 px-2 py-1 text-xs font-bold",
                                      shadowClasses.button,
                                    )}
                                    style={{
                                      background: gradients.status.warning,
                                      color: colors.text.inverse,
                                    }}
                                  >
                                    <Crown className="w-3.5 h-3.5 ml-1" /> موصى
                                    به
                                  </Badge>
                                )}
                                <div
                                  className={cn(
                                    "relative w-16 h-16 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300",
                                    shadowClasses.glow,
                                  )}
                                  style={{ background: gradients.brand.primary }}
                                >
                                  <CardIcon
                                    className="w-8 h-8"
                                    style={{ color: colors.text.inverse }}
                                  />
                                </div>
                                <h3
                                  className="text-2xl font-bold"
                                  style={{ color: colors.text.primary }}
                                >
                                  {sub.name}
                                </h3>
                                <p
                                  className="text-sm min-h-10 px-2"
                                  style={{ color: colors.text.secondary }}
                                >
                                  {sub.tagline}
                                </p>
                              </CardHeader>

                              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                                {/* ====== حالة "تجريبية فقط" ====== */}
                                {trialOnly ? (
                                  <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="text-center mb-4">
                                      <span
                                        className="inline-block px-3 py-1 text-xs font-bold rounded-full"
                                        style={{
                                          backgroundColor: colors.status.successBg,
                                          color: colors.status.success,
                                        }}
                                      >
                                        تجربة مجانية
                                      </span>
                                    </div>
                                    <p
                                      className="text-sm mb-6"
                                      style={{ color: colors.text.secondary }}
                                    >
                                      هذه الباقة متاحة كتجربة مجانية حاليًا.
                                    </p>
                                    <Button
                                      onClick={() =>
                                        trialPlan &&
                                        handleSubscribeClick(sub, trialPlan)
                                      }
                                      density="relaxed"
                                      className={cn(
                                        "w-full relative overflow-hidden group px-4 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                                        shadowClasses.buttonElevated,
                                      )}
                                      style={{
                                        background: gradients.status.success,
                                        color: colors.text.inverse,
                                        boxShadow: shadows.colored.success.md,
                                        ...focusRingStyle,
                                      }}
                                    >
                                      <span className="relative flex items-center justify-center gap-3">
                                        <span>
                                          جرب{" "}
                                          {trialPlan?.trialDurationDays || ""}{" "}
                                          {trialPlan?.trialDurationDays
                                            ? "يوم"
                                            : ""}{" "}
                                          مجانًا
                                        </span>
                                        <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                                      </span>
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    {/* ====== Tabs لخطط مدفوعة فقط ====== */}
                                    {displayPlans.length > 1 && (
                                      <div className="mb-6">
                                        <div
                                          className="flex w-full p-1 rounded-full"
                                          style={{
                                            backgroundColor: withAlpha(
                                              colors.brand.primary,
                                              0.15,
                                            ),
                                          }}
                                        >
                                          {displayPlans.map((option) => (
                                            <button
                                              key={option.id}
                                              onClick={() =>
                                                setSelectedPlanIds((prev) => ({
                                                  ...prev,
                                                  [sub.id]: option.id,
                                                }))
                                              }
                                              className="relative flex-1 text-sm font-semibold py-2.5 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2"
                                              style={focusRingStyle}
                                            >
                                              {selectedPlan?.id ===
                                                option.id && (
                                                <motion.div
                                                  layoutId={`pill-switch-${sub.id}`}
                                                  className={cn(
                                                    "absolute inset-0 rounded-full",
                                                    shadowClasses.button,
                                                  )}
                                                  style={{
                                                    backgroundColor:
                                                      colors.bg.elevated,
                                                  }}
                                                  transition={
                                                    shopSignalsTransitions.pillSwitch
                                                  }
                                                />
                                              )}
                                              <span
                                                className="relative z-10"
                                                style={{
                                                  color:
                                                    selectedPlan?.id ===
                                                    option.id
                                                      ? colors.brand.primary
                                                      : colors.text.secondary,
                                                }}
                                              >
                                                {option.duration}
                                              </span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* ====== السعر ====== */}
                                    {selectedPlan && (
                                      <div className="text-center mb-3">
                                        <div className="flex items-baseline justify-center gap-2">
                                          {selectedPlan.hasDiscount &&
                                            !isTieredDiscount &&
                                            selectedPlan.originalPrice && (
                                              <span
                                                className="text-xl font-medium line-through"
                                                style={{ color: colors.text.secondary }}
                                              >
                                                $
                                                {Number(
                                                  selectedPlan.originalPrice,
                                                ).toFixed(0)}
                                              </span>
                                            )}
                                          <motion.div
                                            key={selectedPlan.price}
                                            {...shopSignalsAnimations.priceHighlight}
                                          >
                                            <span
                                              className={cn(
                                                "text-4xl font-extrabold tracking-tight",
                                                isTieredDiscount && "text-transparent bg-clip-text",
                                              )}
                                              style={{
                                                color: isTieredDiscount
                                                  ? undefined
                                                  : colors.text.primary,
                                                backgroundImage: isTieredDiscount
                                                  ? gradients.status.warning
                                                  : undefined,
                                              }}
                                            >
                                              $
                                              {Number(
                                                selectedPlan.price,
                                              ).toFixed(0)}
                                            </span>
                                          </motion.div>
                                        </div>
                                        <span
                                          className="text-sm"
                                          style={{ color: colors.text.secondary }}
                                        >
                                          {" "}
                                          / {selectedPlan.duration}{" "}
                                        </span>
                                      </div>
                                    )}

                                    {/* ====== معلومات الخصم ====== */}
                                    {selectedPlan && (
                                      <div className="h-auto flex flex-col items-center justify-center">
                                        <AnimatePresence mode="wait">
                                          {isTieredDiscount ? (
                                            <motion.div
                                              key="tiered-info-box"
                                              {...shopSignalsAnimations.tieredDiscountInfo}
                                              className="w-full space-y-2 text-sm rounded-2xl p-3 border"
                                              style={{
                                                background: withAlpha(
                                                  colors.status.warning,
                                                  0.12,
                                                ),
                                                borderColor: withAlpha(
                                                  colors.status.warning,
                                                  0.4,
                                                ),
                                                color: colors.text.secondary,
                                              }}
                                            >
                                              {(selectedPlan.discountDetails
                                                ?.remaining_slots ?? 0) > 0 && (
                                                <div
                                                  className="flex flex-col items-center justify-center text-center gap-2 font-medium"
                                                  style={{ color: colors.text.primary }}
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <Flame
                                                      className="w-6 h-6 animate-pulse"
                                                      style={{
                                                        color: colors.status.warning,
                                                      }}
                                                    />
                                                    <span>
                                                      متبقي{" "}
                                                      <span
                                                        className="font-bold text-lg"
                                                        style={{
                                                          color: colors.brand.primary,
                                                        }}
                                                      >
                                                        {
                                                          selectedPlan
                                                            .discountDetails
                                                            ?.remaining_slots
                                                      }
                                                      </span>{" "}
                                                      مقاعد فقط بهذا السعر
                                                    </span>
                                                  </div>

                                                  {nextPrice !== null && (
                                                    <div
                                                      className="flex items-center gap-1"
                                                      style={{
                                                        color: colors.status.warning,
                                                      }}
                                                    >
                                                      <TrendingUp className="w-4 h-4" />
                                                      <span>
                                                        بعد ذلك سيكون السعر{" "}
                                                        <span className="font-bold text-lg">
                                                          $
                                                          {nextPrice.toFixed(0)}
                                                        </span>
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              )}

                                              {selectedPlan.discountDetails
                                                ?.lock_in_price && (
                                                <div
                                                  className="flex items-center justify-center gap-2 pt-2 mt-2"
                                                  style={{
                                                    color: colors.status.success,
                                                    borderTop: `1px solid ${withAlpha(
                                                      colors.status.warning,
                                                      0.35,
                                                    )}`,
                                                  }}
                                                >
                                                  <ShieldCheck
                                                    className="w-4 h-4 animate-bounce"
                                                    style={{
                                                      color: colors.status.success,
                                                    }}
                                                  />
                                                  <p className="text-sm font-medium">
                                                    سيتم تثبيت سعر اشتراكك
                                                    للشهور القادمة
                                                  </p>
                                                </div>
                                              )}
                                            </motion.div>
                                          ) : selectedPlan.hasDiscount ? (
                                            <motion.div
                                              key="standard-info"
                                              {...shopSignalsAnimations.standardDiscountInfo}
                                            >
                                              <Badge
                                                variant="secondary"
                                                className={cn(
                                                  "font-bold",
                                                  shadowClasses.button,
                                                )}
                                                style={{
                                                  background: gradients.status.success,
                                                  color: colors.text.inverse,
                                                }}
                                              >
                                                خصم{" "}
                                                {
                                                  selectedPlan.discountPercentage
                                                }
                                                %
                                              </Badge>
                                            </motion.div>
                                          ) : null}
                                        </AnimatePresence>
                                      </div>
                                    )}

                                    {isTieredDiscount && (
                                      <div className="mt-4 text-center">
                                        <span
                                          className="inline-block px-3 py-1 text-xs font-bold rounded-full"
                                          style={{
                                            backgroundColor: withAlpha(
                                              colors.status.warning,
                                              0.15,
                                            ),
                                            color: colors.status.warning,
                                          }}
                                        >
                                          عرض محدود
                                        </span>
                                      </div>
                                    )}

                                    {/* زر اشتراك الآن (مدفوع) */}
                                    <Button
                                      onClick={() =>
                                        selectedPlan &&
                                        handleSubscribeClick(sub, selectedPlan)
                                      }
                                      density="relaxed"
                                      className={cn(
                                        "w-full relative overflow-hidden group mt-4 px-4 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed",
                                        shadowClasses.buttonElevated,
                                      )}
                                      style={{
                                        background: gradients.brand.primary,
                                        color: colors.text.inverse,
                                        boxShadow: shadows.colored.primary.lg,
                                        ...focusRingStyle,
                                      }}
                                      disabled={!selectedPlan}
                                    >
                                      <span
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                        style={{
                                          background: gradients.brand.primaryHover,
                                        }}
                                      />
                                      <span className="relative flex items-center justify-center gap-3">
                                        <span>اشترك الآن</span>
                                        <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                                      </span>
                                    </Button>

                                    {/* سطر "جرّب مجانًا" يظهر فقط للتجربة */}
                                    {trialPlan && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSubscribeClick(sub, trialPlan)
                                        }
                                        className="mt-3 text-sm font-bold underline underline-offset-4 hover:opacity-80"
                                        style={{ color: colors.brand.primary }}
                                      >
                                        جرب {trialPlan.trialDurationDays || ""}{" "}
                                        {trialPlan.trialDurationDays
                                          ? "يوم"
                                          : ""}{" "}
                                        مجانًا
                                      </button>
                                    )}
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        </LazyLoad>
                      );
                    })
                  )}
                </div>
              )}
            </section>

            <AnimatePresence>
              {selectedPlanForModal && (
                <SubscriptionModal
                  plan={selectedPlanForModal}
                  onClose={() => setSelectedPlanForModal(null)}
                />
              )}
            </AnimatePresence>
          </PageLayout>
        </div>
      </QueryBoundary>
  );
};

const Shop = dynamic(() => Promise.resolve(ShopComponent), { ssr: false });
export default Shop;
