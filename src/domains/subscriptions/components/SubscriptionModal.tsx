// src/components/SubscriptionModal.tsx
"use client";
import { cn } from "@/shared/utils";

import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import type { LucideIcon } from "lucide-react";
import {
  X,
  Loader2,
  CheckCircle,
  ShieldCheck,
  ScrollText,
  Sparkles,
  Timer,
  BadgePercent,
  Crown,
} from "lucide-react";
import type { ModalPlanData } from "@/domains/subscriptions/types";
import { useTelegram } from "@/shared/context/TelegramContext";
import { useSubscriptionPayment } from "@/domains/subscriptions/components/useSubscriptionPayment";
import { UsdtPaymentMethodModal } from "@/domains/payments/components/UsdtPaymentMethodModal";
import { ExchangePaymentModal } from "@/domains/payments/components/ExchangePaymentModal";
import { PaymentSuccessModal } from "@/domains/payments/components/PaymentSuccessModal";
import { PaymentExchangeSuccess } from "@/domains/payments/components/PaymentExchangeSuccess";
import { claimTrial } from "@/domains/subscriptions/api";
import {
  colors,
  componentRadius,
  gradients,
  shadowClasses,
  spacing,
  withAlpha,
} from "@/styles/tokens";

// ====================================================================
// المكون الرئيسي لمودال شراء اشتراكات الاشارات
// ====================================================================
const SubscriptionModal = ({
  plan,
  onClose,
}: {
  plan: ModalPlanData | null;
  onClose: () => void;
}) => {
  const { telegramId } = useTelegram();
  const queryClient = useQueryClient();

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "details" | "choose_method" | "show_exchange"
  >("details");

  // Trial local state
  const [trialStatus, setTrialStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [trialError, setTrialError] = useState<string | null>(null);

  const termsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (plan) {
      setPaymentStep("details");
      setTermsAgreed(false);
      setTrialStatus("idle");
      setTrialError(null);
    }
  }, [plan]);

  function handlePaymentSuccess() {
    queryClient.invalidateQueries({
      queryKey: ["allSubscriptions", telegramId],
    });
  }

  const {
    paymentStatus,
    loading,
    exchangeDetails,
    setExchangeDetails,
    isInitializing,
    handleUsdtPaymentChoice,
    handleStarsPayment,
    resetPaymentStatus,
  } = useSubscriptionPayment(plan, handlePaymentSuccess);

  const resetAllModals = () => {
    resetPaymentStatus();
    setExchangeDetails(null);
  };

  const handleCloseAll = () => {
    resetAllModals();
    onClose();
  };

  const goToChooseMethod = () => setPaymentStep("choose_method");
  const goBackToDetails = () => setPaymentStep("details");

  const selectExchangePayment = async () => {
    const success = await handleUsdtPaymentChoice("exchange");
    if (success) setPaymentStep("show_exchange");
  };

  const selectWalletPayment = async () => {
    await handleUsdtPaymentChoice("wallet");
  };

  const handleExchangeModalClose = () => {
    resetAllModals();
    goBackToDetails();
  };

  const handleSuccessAndCloseAll = () => {
    resetAllModals();
    onClose();
  };

  const scrollToTerms = () => {
    termsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const hasTerms = !!(
    plan &&
    plan.termsAndConditions &&
    plan.termsAndConditions.length > 0
  );
  const isTrial = !!plan?.selectedOption?.isTrial;
  const hasDiscount =
    !isTrial &&
    plan?.selectedOption?.hasDiscount &&
    plan.selectedOption?.originalPrice;
  const durationLabel = isTrial
    ? plan?.selectedOption?.trialDurationDays
      ? `${plan.selectedOption.trialDurationDays} يوم`
      : plan?.selectedOption?.duration
    : plan?.selectedOption?.duration;
  const discountLabel = hasDiscount
    ? `وفر ${plan.selectedOption.discountPercentage}%`
    : "سعر ثابت";
  const planMetaItems = [
    {
      icon: Timer,
      title: "مدة الاشتراك",
      description: durationLabel,
    },
    !isTrial && {
      icon: BadgePercent,
      title: "العرض الحالي",
      description: discountLabel,
    },
    isTrial && {
      icon: Crown,
      title: "فترة التجربة",
      description: "ابدأ الآن بدون دفع مقدم",
    },
  ].filter(Boolean) as {
    icon: LucideIcon;
    title: string;
    description?: string | null;
  }[];
  const handleClaimTrial = async () => {
    if (!plan?.selectedOption?.id || !telegramId) return;
    try {
      setTrialError(null);
      setTrialStatus("processing");
      await claimTrial({ telegramId, planId: plan.selectedOption.id });
      setTrialStatus("success");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["allSubscriptions", telegramId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["subscriptionPlans", telegramId],
        }),
      ]);
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "فشل تفعيل التجربة";
      setTrialError(message);
      setTrialStatus("error");
    }
  };

  if (!plan) return null;

  return (
    <>
      {isInitializing && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[100]"
          style={{ backgroundColor: withAlpha(colors.bg.overlay, 0.85) }}
        >
          <Loader2
            className="w-12 h-12 animate-spin"
            style={{ color: colors.text.inverse }}
          />
        </div>
      )}
      <Sheet
        open={paymentStep === "details"}
        onOpenChange={(isOpen) => !isOpen && handleCloseAll()}
      >
        <SheetContent
          side="bottom"
          className="h-[90vh] md:h-[85vh] rounded-t-3xl border-0 p-0 flex flex-col"
          dir="rtl"
          style={{ background: gradients.surface.elevated }}
        >
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full z-20"
            style={{ backgroundColor: withAlpha(colors.border.default, 0.8) }}
          />

          <SheetHeader
            className="p-4 pt-8 text-center border-b"
            style={{ borderColor: withAlpha(colors.border.default, 0.6) }}
          >
            <SheetTitle
              className={cn(
                "text-xl font-bold font-arabic",
                `text-[${colors.text.primary}]`,
              )}
            >
              {plan.name}
            </SheetTitle>
            <button
              onClick={handleCloseAll}
              className={cn(
                "absolute top-4 left-4 p-1 rounded-full transition-colors",
                `text-[${colors.text.tertiary}]`,
                `hover:text-[${colors.text.primary}]`,
              )}
            >
              <X className="w-6 h-6" />
            </button>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-8 p-4 pt-6 pb-12 text-right">
              {/* Price / Trial hero card */}
              <div
                className={cn(
                  "p-6 text-center relative overflow-hidden",
                  componentRadius.card,
                  shadowClasses.card,
                  `text-[${colors.text.inverse}]`,
                )}
                style={{ backgroundImage: gradients.brand.primary }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at top, ${withAlpha(colors.bg.inverse, 0.16)} 0%, transparent 55%)`,
                  }}
                />
                <div
                  className="relative z-10 flex flex-col items-center gap-4"
                  style={{ color: colors.text.inverse }}
                >
                  <span
                    className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                    style={{
                      backgroundColor: withAlpha(colors.bg.inverse, 0.22),
                      letterSpacing: "0.2em",
                    }}
                  >
                    {isTrial ? "Free Trial" : "Premium Plan"}
                  </span>
                  <div className="space-y-2">
                    <p
                      className="font-medium"
                      style={{ color: withAlpha(colors.text.inverse, 0.85) }}
                    >
                      {isTrial
                        ? `اشترك الآن مجانًا لمدة ${durationLabel}`
                        : `السعر لخطة ${plan.selectedOption.duration}`}
                    </p>
                    <div className="flex items-baseline justify-center gap-3">
                      {!isTrial &&
                        plan.selectedOption.hasDiscount &&
                        plan.selectedOption.originalPrice && (
                          <span
                            className="text-2xl font-medium line-through"
                            style={{ color: withAlpha(colors.text.inverse, 0.55) }}
                          >
                            {Number(plan.selectedOption.originalPrice).toFixed(0)}$
                          </span>
                        )}
                      {isTrial ? (
                        <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
                          فترة تجريبية
                        </span>
                      ) : (
                        <span className="text-5xl font-extrabold tracking-tight">
                          {Number(plan.selectedOption.price).toFixed(0)}$
                        </span>
                      )}
                    </div>
                  </div>
                  {isTrial ? (
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
                      style={{
                        background: withAlpha(colors.status.success, 0.14),
                        color: colors.text.inverse,
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                      ابدأ خلال دقيقة واحدة فقط
                    </div>
                  ) : (
                    hasDiscount && (
                      <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                        style={{
                          background: colors.bg.primary,
                          color: colors.brand.primary,
                        }}
                      >
                        <BadgePercent className="w-4 h-4" />
                        وفر {plan.selectedOption.discountPercentage}% الآن
                      </div>
                    )
                  )}
                </div>
              </div>

           

              {/* Features */}
              <div className="space-y-6">
                <div
                  className="p-5 rounded-2xl border"
                  style={{
                    background: colors.bg.elevated,
                    borderColor: withAlpha(colors.border.default, 0.5),
                  }}
                >
                  <h4
                    className={cn(
                      "text-lg font-bold mb-4 flex items-center font-arabic",
                      `text-[${colors.text.primary}]`,
                    )}
                  >
                    <ShieldCheck
                      className="w-5 h-5"
                      style={{ color: colors.brand.primary }}
                    />
                    
                    <span className="ml-2">ماذا ستحصل عليه؟</span>
                    
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3"
                        style={{ color: colors.text.secondary }}
                      >
                       
                        <span className="leading-relaxed text-sm">{feature}</span>
                         <CheckCircle
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: colors.status.success }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Terms & Conditions */}
                {hasTerms && (
                  <div
                    ref={termsSectionRef}
                    className="p-5 rounded-2xl border"
                    style={{
                      background: colors.bg.elevated,
                      borderColor: withAlpha(colors.border.default, 0.5),
                    }}
                  >
                    <h4
                      className={cn(
                        "text-lg font-bold mb-4 flex items-center font-arabic",
                        `text-[${colors.text.primary}]`,
                      )}
                    >
                      <ScrollText
                        className="w-5 h-5"
                        style={{ color: colors.text.secondary }}
                      />
                      <span className="ml-2">الشروط والأحكام</span>
                    </h4>
                    <ul className="space-y-3">
                      {plan.termsAndConditions.map(
                        (term: string, index: number) => (
                          <li key={index} className="flex gap-3 text-right">
                           
                            <span
                              className="flex-1 leading-relaxed text-sm"
                              style={{ color: colors.text.secondary }}
                            >
                              {term}
                            </span>
                             <span
                              className="flex-shrink-0 mt-1 text-sm"
                              style={{ color: withAlpha(colors.text.secondary, 0.7) }}
                            >
                              {index + 1}.
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          {/* Footer actions */}
          <div
            className="backdrop-blur-sm border-t-2 p-4 shadow-top-strong z-10"
            style={{
              background: withAlpha(colors.bg.elevated, 0.95),
              borderColor: withAlpha(colors.border.default, 0.6),
            }}
          >
            {hasTerms && (
              <div className="flex items-start gap-3 mb-4">
                <Checkbox
                  id="termsAgreementModal"
                  checked={termsAgreed}
                  onCheckedChange={(checked: boolean) =>
                    setTermsAgreed(!!checked)
                  }
                  className="mt-0.5"
                />
                <label
                  htmlFor="termsAgreementModal"
                  className="text-sm select-none"
                  style={{ color: colors.text.secondary }}
                >
                  أوافق على{" "}
                  <span
                    className="font-bold hover:underline cursor-pointer"
                    style={{ color: colors.brand.primary }}
                    onClick={scrollToTerms}
                  >
                    الشروط والأحكام
                  </span>{" "}
                  المذكورة أعلاه.
                </label>
              </div>
            )}

            {!isTrial ? (
              <div className="grid grid-cols-1 gap-3">
                {/* التعديل هنا: استخدام لون أساسي صريح للزر الرئيسي */}
                <Button
                  onClick={goToChooseMethod}
                  density="relaxed"
                  fullWidth
                  className="h-14 text-base font-bold transition-shadow duration-300"
                  intentOverrides={{
                    background: colors.brand.primary,
                    hoverBackground: gradients.brand.primaryHover,
                    foreground: colors.text.inverse,
                    hoverForeground: colors.text.inverse,
                    shadow: shadowClasses.buttonElevated,
                  }}
                  disabled={loading || (hasTerms && !termsAgreed)}
                >
                  {loading && paymentStatus === "processing_usdt" ? (
                    <Loader2
                      className="w-5 h-5 animate-spin"
                      style={{ color: colors.text.inverse }}
                    />
                  ) : (
                    "الدفع باستخدام USDT"
                  )}
                </Button>

                {plan.selectedOption.telegramStarsPrice != null && (
                  <Button
                    onClick={handleStarsPayment}
                    density="relaxed"
                    fullWidth
                    className="h-14 text-base font-bold transition-shadow duration-300"
                    // الزر الثانوي يمكن أن يستخدم لونا أفتح أو مختلف
                    intentOverrides={{
                      background: withAlpha(colors.brand.secondary, 0.9),
                      hoverBackground: colors.brand.secondary,
                      foreground: colors.text.inverse,
                      hoverForeground: colors.text.inverse,
                      shadow: shadowClasses.button,
                    }}
                    disabled={loading || (hasTerms && !termsAgreed)}
                  >
                    {loading && paymentStatus === "processing_stars" ? (
                      <Loader2
                        className="w-5 h-5 animate-spin"
                        style={{ color: colors.text.inverse }}
                      />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 ml-2" />
                        الدفع بـ Telegram Stars
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Button
                  onClick={handleClaimTrial}
                  density="relaxed"
                  fullWidth
                  className="h-14 text-base font-bold transition-shadow duration-300"
                  intentOverrides={{
                    background: gradients.status.success,
                    hoverBackground: gradients.status.success,
                    foreground: colors.text.inverse,
                    hoverForeground: colors.text.inverse,
                    shadow: shadowClasses.buttonElevated,
                  }}
                  disabled={
                    (hasTerms && !termsAgreed) || trialStatus === "processing"
                  }
                >
                  {trialStatus === "processing" ? (
                    <Loader2
                      className="w-5 h-5 animate-spin"
                      style={{ color: colors.text.inverse }}
                    />
                  ) : (
                    "اشترك الآن مجانًا"
                  )}
                </Button>

                {trialStatus === "error" && (
                  <p
                    className="text-sm text-center"
                    style={{ color: colors.status.error }}
                  >
                    {trialError}
                  </p>
                )}
                {trialStatus === "success" && (
                  <p
                    className="text-sm text-center"
                    style={{ color: colors.status.success }}
                  >
                    تم تفعيل التجربة بنجاح 🎉
                  </p>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <AnimatePresence>
        {paymentStep === "choose_method" && (
          <UsdtPaymentMethodModal
            loading={loading}
            onClose={goBackToDetails}
            onWalletSelect={selectWalletPayment}
            onExchangeSelect={selectExchangePayment}
          />
        )}
      </AnimatePresence>
      {paymentStep === "show_exchange" && exchangeDetails && (
        <ExchangePaymentModal
          details={exchangeDetails}
          onClose={handleExchangeModalClose}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {paymentStatus === "success" && (
        <PaymentSuccessModal onClose={handleSuccessAndCloseAll} />
      )}
      {paymentStatus === "exchange_success" && (
        <PaymentExchangeSuccess
          onClose={handleSuccessAndCloseAll}
          planName={plan.name}
        />
      )}
    </>
  );
};

export default SubscriptionModal;
