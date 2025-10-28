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
import {
  X,
  Loader2,
  CheckCircle,
  ShieldCheck,
  ScrollText,
  Sparkles,
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
            <div className="space-y-8 p-4 pt-6 pb-24 text-right">
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
                  className="absolute -top-4 -right-4 w-24 h-24 rounded-full"
                  style={{ backgroundColor: withAlpha(colors.bg.inverse, 0.1) }}
                />
                <div
                  className="absolute -bottom-8 -left-2 w-32 h-32 rounded-full"
                  style={{ backgroundColor: withAlpha(colors.bg.inverse, 0.1) }}
                />

                {/* العنوان يتغير حسب كونها تجربة أم لا */}
                <p
                  className="font-medium mb-1 z-10 relative"
                  style={{ color: withAlpha(colors.text.inverse, 0.8) }}
                >
                  {isTrial ? (
                    <>
                      {" "}
                      اشترك الان مجانا لمده{" "}
                      {plan.selectedOption.trialDurationDays ||
                        plan.selectedOption.duration}{" "}
                      {plan.selectedOption.trialDurationDays ? "يوم" : ""}
                    </>
                  ) : (
                    <>السعر لخطة {plan.selectedOption.duration}</>
                  )}
                </p>

                {/* السعر/النص الكبير */}
                <div className="flex items-baseline justify-center gap-2 z-10 relative">
                  {!isTrial &&
                    plan.selectedOption.hasDiscount &&
                    plan.selectedOption.originalPrice && (
                      <span
                        className="text-2xl font-medium line-through"
                        style={{ color: withAlpha(colors.text.inverse, 0.6) }}
                      >
                        {Number(plan.selectedOption.originalPrice).toFixed(0)}$
                      </span>
                    )}

                  {/* لو تجربة: لا نعرض 0$، بل نص واضح */}
                  {isTrial ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl md:text-5xl font-extrabold tracking-tight">
                        فترة تجريبية{" "}
                      </span>
                      <span
                        className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: withAlpha(colors.bg.inverse, 0.2),
                          color: colors.text.inverse,
                        }}
                      >
                        Free Trial
                      </span>
                    </div>
                  ) : (
                    <span className="text-5xl font-extrabold tracking-tight">
                      {Number(plan.selectedOption.price).toFixed(0)}$
                    </span>
                  )}
                </div>

                {/* شارة الخصم فقط للخطط المدفوعة */}
                {!isTrial && plan.selectedOption.hasDiscount && (
                  <div
                    className={cn(
                      "mt-3 inline-block px-3 py-1 rounded-full text-sm font-bold z-10 relative",
                      shadowClasses.button,
                    )}
                    style={{
                      background: colors.bg.primary,
                      color: colors.brand.primary,
                    }}
                  >
                    وفر {plan.selectedOption.discountPercentage}% الآن!
                  </div>
                )}

                {/* شارة تجربة للوضوح (اختيارية) */}
                {isTrial && (
                  <div
                    className={cn(
                      "mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold z-10 relative",
                      shadowClasses.button,
                    )}
                    style={{
                      background: withAlpha(colors.status.success, 0.12),
                      color: colors.status.success,
                    }}
                  >
                    {plan.selectedOption.trialDurationDays
                      ? `جرب ${plan.selectedOption.trialDurationDays} يوم مجانًا — بدون دفع`
                      : "بدون دفع — ابدأ الآن"}
                  </div>
                )}
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
                      <li key={index} className="flex items-start">
                        <span
                          className="leading-relaxed text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          {feature}
                        </span>
                        <CheckCircle
                          className="w-5 h-5 flex-shrink-0 ml-3 mt-1"
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
                          <li
                            key={index}
                            className="flex items-start text-right"
                          >
                            <span
                              className="flex-1 leading-relaxed text-sm"
                              style={{ color: colors.text.secondary }}
                            >
                              {term}
                            </span>
                            <span
                              className="mt-1.5 ml-3"
                              style={{ color: colors.text.secondary }}
                            >
                              •
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
                <Button
                  onClick={goToChooseMethod}
                  density="relaxed"
                  fullWidth
                  className="h-14 text-base font-bold transition-shadow duration-300"
                  intentOverrides={{
                    background: gradients.brand.primary,
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
                    intentOverrides={{
                      background: gradients.brand.secondary,
                      hoverBackground: gradients.brand.secondary,
                      foreground: colors.text.inverse,
                      hoverForeground: colors.text.inverse,
                      shadow: shadowClasses.buttonElevated,
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
