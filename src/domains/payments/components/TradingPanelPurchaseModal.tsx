// src/components/TradingPanelPurchaseModal.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { X, Loader2, ShieldCheck } from "lucide-react";
import { UsdtPaymentMethodModal } from "./UsdtPaymentMethodModal";
import { ExchangePaymentModal } from "@/domains/payments/components/ExchangePaymentModal";
import { PaymentSuccessModal } from "./PaymentSuccessModal";
import { PaymentExchangeSuccess } from "./PaymentExchangeSuccess";
import { useServicePayment } from "@/domains/payments/hooks/useServicePayment";
import { showToast } from "@/shared/components/ui/showToast";
import { cn } from "@/shared/utils";
import {
  colors,
  gradients,
  shadowClasses,
  shadows,
  withAlpha,
} from "@/styles/tokens";

type OpenTradingPanelPayload = {
  productType: "utility_trading_panel";
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

export default function TradingPanelPurchaseModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<
    "details" | "choose_method" | "show_exchange"
  >("details");
  const [payload, setPayload] = useState<OpenTradingPanelPayload | null>(null);

  const {
    paymentStatus,
    loading,
    exchangeDetails,
    setExchangeDetails,
    payWithUSDT,
    reset,
  } = useServicePayment();

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<OpenTradingPanelPayload>).detail;
      if (!d || d.productType !== "utility_trading_panel") return;
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
      showToast.success("تم تفعيل لوحة التداول مجانًا!");
      closeAll();
      return;
    }
    setStep("choose_method");
  }, [payload, priceInfo.isFree, closeAll]);

  const onWallet = useCallback(async () => {
    if (!payload) return;
    await payWithUSDT("wallet", {
      productType: "utility_trading_panel",
      productId: Number(payload.plan.id),
      amountUsdt: priceInfo.priceNum,
      displayName: payload.plan.name,
    });
    setStep("details");
  }, [payload, payWithUSDT, priceInfo.priceNum]);

  const onExchange = useCallback(async () => {
    if (!payload) return;
    const ok = await payWithUSDT("exchange", {
      productType: "utility_trading_panel",
      productId: Number(payload.plan.id),
      amountUsdt: priceInfo.priceNum,
      displayName: payload.plan.name,
    });
    if (ok) setStep("show_exchange");
  }, [payload, payWithUSDT, priceInfo.priceNum]);

  if (!open || !payload) return null;

  return (
    <>
      <Sheet open={step === "details"} onOpenChange={(o) => !o && closeAll()}>
        <SheetContent
          side="bottom"
          className="h-[65vh] md:h-[85vh] rounded-t-3xl border-0 p-0 flex flex-col"
          dir="rtl"
          style={{ background: colors.bg.secondary }}
        >
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full z-20"
            style={{ backgroundColor: colors.border.hover }}
          />
          <SheetHeader
            className="p-4 pt-8 text-center border-b"
            style={{ borderColor: colors.border.default, background: colors.bg.primary }}
          >
            <SheetTitle
              className="text-xl font-bold font-arabic text-center pr-6 pl-10"
              style={{ color: colors.text.primary }}
            >
              {payload.plan.name}
            </SheetTitle>
            <button
              onClick={closeAll}
              className={cn("absolute top-4 left-4", "token-icon-button")}
              style={{
                "--token-icon-size": "2.5rem",
                "--token-icon-bg": withAlpha(colors.bg.overlay, 0.1),
                "--token-icon-bg-hover": withAlpha(colors.bg.overlay, 0.16),
                "--token-icon-color": colors.text.tertiary,
                "--token-icon-color-hover": colors.text.secondary,
                "--token-icon-shadow": shadows.elevation[1],
                "--token-icon-shadow-hover": shadows.elevation[2],
              } as React.CSSProperties}
            >
              <X className="w-6 h-6" />
            </button>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-8 p-4 pt-6 pb-12 text-right">
              <div
                className={cn(
                  "rounded-2xl p-6 text-center relative overflow-hidden",
                  shadowClasses.cardElevated,
                )}
                style={{
                  background: gradients.brand.primary,
                  color: colors.text.inverse,
                }}
              >
                <div
                  className="absolute -top-4 -right-4 w-24 h-24 rounded-full"
                  style={{ background: withAlpha(colors.bg.inverse, 0.15) }}
                />
                <div
                  className="absolute -bottom-8 -left-2 w-32 h-32 rounded-full"
                  style={{ background: withAlpha(colors.bg.inverse, 0.12) }}
                />
                <p className="font-medium mb-1" style={{ color: withAlpha(colors.text.inverse, 0.8) }}>
                  خطة لوحة التداول
                </p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-extrabold">
                    {priceInfo.isFree ? "مجاني" : priceInfo.priceStr}
                  </span>
                </div>
              </div>

              <div
                className="p-5 rounded-2xl border"
                style={{
                  background: colors.bg.primary,
                  borderColor: colors.border.default,
                  color: colors.text.primary,
                }}
              >
                <h4 className="text-lg font-bold mb-4 flex items-center" style={{ color: colors.text.primary }}>
                  <ShieldCheck
                    className="w-5 h-5"
                    style={{ color: colors.brand.primary }}
                    aria-hidden
                  />
                  <span className="ml-2">ما الذي ستحصل عليه؟</span>
                </h4>
                <ul className="space-y-3 text-sm" style={{ color: colors.text.secondary }}>
                  <li>لوحة تداول احترافية (MT4/MT5)</li>
                  <li>تحديثات مستقبلية بدون تكلفة إضافية</li>
                  <li>دعم فني عبر تيليجرام</li>
                </ul>
              </div>
            </div>
          </ScrollArea>

          <div
            className="p-4"
            style={{
              background: withAlpha(colors.bg.primary, 0.95),
              borderTop: `1px solid ${withAlpha(colors.brand.primary, 0.2)}`,
            }}
          >
          <Button
            onClick={onChooseMethod}
            className={cn(
              "w-full h-14 font-bold",
              shadowClasses.buttonElevated,
              "token-interactive",
            )}
            style={{
              "--token-bg": gradients.brand.primary,
              "--token-bg-hover": gradients.brand.primaryHover,
              "--token-bg-active": gradients.brand.primaryActive,
              "--token-fg": colors.text.inverse,
              "--token-shadow": shadows.colored.primary.md,
              "--token-shadow-hover": shadows.colored.primary.lg,
              "--token-shadow-active": shadows.colored.primary.md,
              "--token-transform-hover": "translateY(-0.1875rem)",
              "--token-transform-active": "translateY(-0.0625rem)",
            } as React.CSSProperties}
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

      {step === "choose_method" && (
        <UsdtPaymentMethodModal
          loading={loading}
          onClose={() => setStep("details")}
          onWalletSelect={onWallet}
          onExchangeSelect={onExchange}
        />
      )}

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
