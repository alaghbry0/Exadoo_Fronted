// src/components/IndicatorsPurchaseModal.tsx
"use client";
import { cn } from "@/lib/utils";
import { componentVariants, mergeVariants } from "@/components/ui/variants";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X, Loader2, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic imports للـ Modals
const UsdtPaymentMethodModal = dynamic(
  () =>
    import("@/features/payments/components/UsdtPaymentMethodModal").then(
      (mod) => ({ default: mod.UsdtPaymentMethodModal }),
    ),
  { ssr: false },
);
const ExchangePaymentModal = dynamic(
  () =>
    import("@/features/payments/components/ExchangePaymentModal").then(
      (mod) => ({ default: mod.ExchangePaymentModal }),
    ),
  { ssr: false },
);
const PaymentSuccessModal = dynamic(
  () =>
    import("@/features/payments/components/PaymentSuccessModal").then(
      (mod) => ({ default: mod.PaymentSuccessModal }),
    ),
  { ssr: false },
);
const PaymentExchangeSuccess = dynamic(
  () =>
    import("@/features/payments/components/PaymentExchangeSuccess").then(
      (mod) => ({ default: mod.PaymentExchangeSuccess }),
    ),
  { ssr: false },
);
import { useServicePayment } from "@/hooks/useServicePayment";
import { showToast } from "@/components/ui/showToast";

type OpenIndicatorsPayload = {
  productType: "buy_indicators";
  plan: {
    id: string;
    name: string;
    price: string;
    discounted_price?: string | null;
    duration_in_months?: string; // "0" => lifetime
  };
};

const fmt = (v?: string | null) => {
  if (!v) return "";
  if (v.toLowerCase?.() === "free") return "مجاني";
  const n = Number(v);
  return isNaN(n) ? v : `$${n.toFixed(0)}`;
};

export default function IndicatorsPurchaseModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<
    "details" | "choose_method" | "show_exchange"
  >("details");
  const [payload, setPayload] = useState<OpenIndicatorsPayload | null>(null);

  const {
    paymentStatus,
    loading,
    exchangeDetails,
    setExchangeDetails,
    payWithUSDT,
    reset,
  } = useServicePayment();

  // listen to global event
  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<OpenIndicatorsPayload>).detail;
      if (!d || d.productType !== "buy_indicators") return;
      setPayload(d);
      setStep("details");
      setOpen(true);
    };
    window.addEventListener("open-service-purchase", onOpen as EventListener);
    return () =>
      window.removeEventListener(
        "open-service-purchase",
        onOpen as EventListener,
      );
  }, []);

  const closeAll = useCallback(() => {
    reset();
    setExchangeDetails(null);
    setStep("details");
    setOpen(false);
  }, [reset, setExchangeDetails]);

  const priceInfo = useMemo(() => {
    if (!payload) return { isFree: false, priceNum: 0, priceStr: "" };
    const base = payload.plan.discounted_price || payload.plan.price;
    const isFree = base?.toLowerCase?.() === "free" || Number(base) === 0;
    const n = Number(base);
    return { isFree, priceNum: isNaN(n) ? 0 : n, priceStr: fmt(base) };
  }, [payload]);

  const onChooseMethod = useCallback(() => {
    if (!payload) return;
    if (priceInfo.isFree) {
      showToast.success("تم تفعيل المؤشرات مجانًا!");
      closeAll();
      return;
    }
    setStep("choose_method");
  }, [payload, priceInfo.isFree, closeAll]);

  const onWallet = useCallback(async () => {
    if (!payload) return;
    await payWithUSDT("wallet", {
      productType: "buy_indicators",
      productId: Number(payload.plan.id),
      amountUsdt: priceInfo.priceNum,
      displayName: payload.plan.name,
    });
    setStep("details"); // نترك التحقق النهائي للباك والبولينغ
  }, [payload, payWithUSDT, priceInfo.priceNum]);

  const onExchange = useCallback(async () => {
    if (!payload) return;
    const ok = await payWithUSDT("exchange", {
      productType: "buy_indicators",
      productId: Number(payload.plan.id),
      amountUsdt: priceInfo.priceNum,
      displayName: payload.plan.name,
    });
    if (ok) setStep("show_exchange");
  }, [payload, payWithUSDT, priceInfo.priceNum]);

  if (!open || !payload) return null;

  return (
    <>
      {/* details */}
      <Sheet open={step === "details"} onOpenChange={(o) => !o && closeAll()}>
        <SheetContent
          side="bottom"
          className="h-[65vh] md:h-[85vh] rounded-t-3xl border-0 bg-gray-50 p-0 flex flex-col"
          dir="rtl"
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full z-20" />
          <SheetHeader className="p-4 pt-8 text-center border-b border-gray-200">
            <SheetTitle className="text-xl font-bold font-arabic text-gray-800 dark:text-neutral-100 text-center pr-6 pl-10">
              {payload.plan.name}
            </SheetTitle>
            <button
              onClick={closeAll}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 p-1 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-8 p-4 pt-6 pb-12 text-right">
              <div
                className={cn(
                  componentVariants.card.elevated,
                  "bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white text-center relative overflow-hidden",
                )}
              >
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-2 w-32 h-32 bg-white/10 rounded-full" />
                <p className="font-medium text-white/80 mb-1 z-10 relative">
                  خطة المؤشرات
                </p>
                <div className="flex items-baseline justify-center gap-2 z-10 relative">
                  <span className="text-5xl font-extrabold tracking-tight">
                    {priceInfo.isFree ? "مجاني" : priceInfo.priceStr}
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <ShieldCheck className="w-5 h-5 text-primary-600" />
                  <span className="ml-2">ما الذي ستحصل عليه؟</span>
                </h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>وصول كامل لحزمة مؤشرات Exaado (Invite-only)</li>
                  <li>تحديثات مجانية مستقبلية</li>
                  <li>دعم فني عبر تيليجرام</li>
                </ul>
              </div>
            </div>
          </ScrollArea>

          <div className="bg-white/90 border-t-2 border-primary-100 p-4">
            <Button
              onClick={onChooseMethod}
              size="lg"
              className="w-full h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold"
              disabled={loading}
            >
              {loading && paymentStatus === "processing_usdt" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : priceInfo.isFree ? (
                "سجّل الآن مجانًا"
              ) : (
                "الدفع باستخدام USDT"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      {/* choose method */}
      <AnimatePresence>
        {step === "choose_method" && (
          <UsdtPaymentMethodModal
            loading={loading}
            onClose={() => setStep("details")}
            onWalletSelect={onWallet}
            onExchangeSelect={onExchange}
          />
        )}
      </AnimatePresence>
      {/* exchange flow */}
      {step === "show_exchange" && exchangeDetails && (
        <ExchangePaymentModal
          details={exchangeDetails}
          onClose={() => {
            reset();
            setExchangeDetails(null);
            setStep("details");
          }}
        />
      )}
      {/* success states */}
      {paymentStatus === "exchange_success" && (
        <PaymentExchangeSuccess
          onClose={closeAll}
          planName={payload.plan.name}
        />
      )}
      {paymentStatus === "success" && (
        <PaymentSuccessModal onClose={closeAll} />
      )}
    </>
  );
}
