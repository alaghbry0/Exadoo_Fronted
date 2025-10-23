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
import { useServicePayment } from "@/hooks/useServicePayment";
import { UsdtPaymentMethodModal } from "@/features/payments/components/UsdtPaymentMethodModal";
import { ExchangePaymentModal } from "@/components/ExchangePaymentModal";
import { PaymentExchangeSuccess } from "@/features/payments/components/PaymentExchangeSuccess";
import { PaymentSuccessModal } from "@/features/payments/components/PaymentSuccessModal";
import { useTelegram } from "@/context/TelegramContext";
import { useAcademyData } from "@/services/academy";
import { showToast } from "@/components/ui/showToast";

/** ✅ Payload موحد + متوافق مع القديم */
type OpenSubscribeUnified =
  | { productType: "course"; productId: string; title?: string; price?: string }
  | {
      productType: "bundle";
      productId: string;
      title?: string;
      price?: string;
      telegramUrl?: string | null;
    };

type OpenSubscribeLegacy = { courseId: string } | { bundleId: string };

type ProductKind = "course" | "bundle";

const fmt = (v?: string) => {
  if (!v) return "";
  if (v.toLowerCase?.() === "free") return "مجاني";
  const n = Number(v);
  return isNaN(n) ? v : `$${n.toFixed(0)}`;
};

export default function AcademyPurchaseModal() {
  const { telegramId } = useTelegram();
  const { data } = useAcademyData(telegramId || undefined);

  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ProductKind>("course");
  const [targetId, setTargetId] = useState<string | null>(null);

  const [titleOverride, setTitleOverride] = useState<string>(""); // من الحدث إن وُجد
  const [priceOverride, setPriceOverride] = useState<string>(""); // من الحدث إن وُجد
  const [bundleTelegramUrl, setBundleTelegramUrl] = useState<string | null>(
    null,
  ); // للحِزم فقط

  const [step, setStep] = useState<
    "details" | "choose_method" | "show_exchange"
  >("details");

  const {
    paymentStatus,
    loading,
    exchangeDetails,
    setExchangeDetails,
    payWithUSDT,
    reset,
  } = useServicePayment();

  const closeAll = useCallback(() => {
    reset();
    setExchangeDetails(null);
    setStep("details");
    setOpen(false);
    // أعلن إغلاق المودال (لإعادة إظهار SubscribeFab إن لم توجد مودالات أخرى)
    window.dispatchEvent(
      new CustomEvent("modal:close", { detail: { name: "academyPurchase" } }),
    );
  }, [reset, setExchangeDetails]);

  /** ✅ مستمع الحدث: يدعم الموّحد والجديد + يتوافق مع القديم */
  useEffect(() => {
    const onOpen = (e: Event) => {
      const ce = e as CustomEvent<any>;
      const detail: OpenSubscribeUnified | OpenSubscribeLegacy | undefined =
        ce.detail;
      if (!detail) return;

      // reset state for a fresh open
      setStep("details");
      setTitleOverride("");
      setPriceOverride("");
      setBundleTelegramUrl(null);

      // Payload الموحد
      if ("productType" in detail && "productId" in detail) {
        const d = detail as OpenSubscribeUnified;
        setKind(d.productType);
        setTargetId(d.productId);
        if (d.title) setTitleOverride(d.title);
        if (d.price) setPriceOverride(d.price);
        if (d.productType === "bundle") {
          setBundleTelegramUrl((d as any).telegramUrl ?? null);
        }
      } else {
        // التوافق الخلفي مع { courseId } | { bundleId }
        const d = detail as OpenSubscribeLegacy;
        if ("courseId" in d) {
          setKind("course");
          setTargetId(d.courseId);
        } else if ("bundleId" in d) {
          setKind("bundle");
          setTargetId(d.bundleId);
        }
      }

      setOpen(true);
      window.dispatchEvent(
        new CustomEvent("modal:open", { detail: { name: "academyPurchase" } }),
      );
    };

    window.addEventListener("open-subscribe" as any, onOpen as any);
    return () =>
      window.removeEventListener("open-subscribe" as any, onOpen as any);
  }, []);

  /** ✅ تحديد المنتج المختار من الـ data إلا لو فيه override من الحدث */
  const selected = useMemo(() => {
    if (!data || !targetId) return null;
    if (kind === "course") {
      return (data.courses || []).find((c: any) => c.id === targetId) || null;
    }
    return (data.bundles || []).find((b: any) => b.id === targetId) || null;
  }, [data, kind, targetId]);

  /** ✅ العنوان المعروض */
  const displayTitle = useMemo(() => {
    if (titleOverride) return titleOverride;
    return (selected?.title as string) || "";
  }, [titleOverride, selected]);

  /** ✅ حساب السعر (مع دعم discounted_price للكورسات) + احترام أي override للـ price */
  const priceInfo = useMemo(() => {
    if (!selected && !priceOverride)
      return { isFree: false, price: 0, priceStr: "" };

    let pv: string | undefined =
      priceOverride || (selected?.price as string | undefined);
    // للكورسات: خذ الخصم إن موجود
    if (
      !priceOverride &&
      selected &&
      "discounted_price" in selected &&
      selected.discounted_price
    ) {
      pv = selected.discounted_price as string;
    }

    const isFree = pv?.toLowerCase?.() === "free" || Number(pv) === 0;
    const n = Number(pv);
    return { isFree, price: isNaN(n) ? 0 : n, priceStr: fmt(pv) };
  }, [selected, priceOverride]);

  /** عند اختيار طريقة الدفع */
  const onChooseMethod = useCallback(() => {
    if (!selected) return;
    if (priceInfo.isFree) {
      // تسجيل مجاني
      showToast.success("تم التسجيل في المحتوى مجانًا!");
      // لو الحزمة معها تيليجرام، نفتح الرابط مباشرة بعد التسجيل المجاني
      if (kind === "bundle" && bundleTelegramUrl) {
        try {
          window.open(bundleTelegramUrl, "_blank", "noopener,noreferrer");
        } catch {}
      }
      closeAll();
      return;
    }
    setStep("choose_method");
  }, [selected, priceInfo.isFree, closeAll, kind, bundleTelegramUrl]);

  /** دفع USDT - محفظة */
  const onSelectWallet = useCallback(async () => {
    if (!selected) return;
    const ok = await payWithUSDT("wallet", {
      productType: kind === "course" ? "course" : "bundle",
      productId: Number(selected.id),
      amountUsdt: priceInfo.price,
      displayName: selected.title,
    });
    if (ok) setStep("details");
  }, [selected, kind, payWithUSDT, priceInfo.price]);

  /** دفع USDT - تحويل (Exchange) */
  const onSelectExchange = useCallback(async () => {
    if (!selected) return;
    const ok = await payWithUSDT(
      "exchange",
      {
        productType: kind === "course" ? "course" : "bundle",
        productId: Number(selected.id),
        amountUsdt: priceInfo.price,
        displayName: selected.title,
      },
      {},
    );
    if (ok) setStep("show_exchange");
  }, [selected, kind, payWithUSDT, priceInfo.price]);

  const onCloseExchange = useCallback(() => {
    reset();
    setExchangeDetails(null);
    setStep("details");
  }, [reset, setExchangeDetails]);

  /** ⛳ عند إغلاق مودال النجاح: نقفل ونفتح تيليجرام للحزم إن توفر */
  const handleSuccessClose = useCallback(() => {
    const tgUrl = bundleTelegramUrl;
    const isBundle = kind === "bundle";
    closeAll();
    if (isBundle && tgUrl) {
      try {
        window.open(tgUrl, "_blank", "noopener,noreferrer");
      } catch {}
    }
  }, [closeAll, kind, bundleTelegramUrl]);

  if (!open || !selected) return null;

  const rightBadge = kind === "course" ? "كورس" : "حزمة";

  return (
    <>
      {/* تفاصيل المنتج */}
      <Sheet open={step === "details"} onOpenChange={(o) => !o && closeAll()}>
        <SheetContent
          side="bottom"
          className="h-[65vh] md:h-[85vh] rounded-t-3xl border-0 bg-gray-50 p-0 flex flex-col"
          dir="rtl"
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full z-20" />
          <SheetHeader className="p-4 pt-8 text-center border-b border-gray-200">
            <SheetTitle className="text-xl font-bold font-arabic text-gray-800 dark:text-neutral-100 text-center pr-6 pl-10">
              {displayTitle}
            </SheetTitle>
            <button
              onClick={closeAll}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-8 p-4 pt-6 pb-12 text-right">
              {/* السعر */}
              <div
                className={cn(
                  componentVariants.card.elevated,
                  "bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white text-center relative overflow-hidden",
                )}
              >
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-2 w-32 h-32 bg-white/10 rounded-full" />
                <p className="font-medium text-white/80 mb-1 z-10 relative">
                  {rightBadge}
                </p>
                <div className="flex items-baseline justify-center gap-2 z-10 relative">
                  <span className="text-5xl font-extrabold tracking-tight">
                    {priceInfo.isFree ? "مجاني" : priceInfo.priceStr}
                  </span>
                </div>
              </div>

              {/* الميزات */}
              <div className="bg-white p-5 rounded-2xl border">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center font-arabic">
                  <ShieldCheck className="w-5 h-5 text-primary-600" />
                  <span className="ml-2">ما الذي ستحصل عليه؟</span>
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-gray-600 leading-relaxed text-sm">
                      {kind === "course"
                        ? "وصول كامل للدورة ومحتواها"
                        : "وصول لجميع الدورات داخل الحزمة"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-gray-600 leading-relaxed text-sm">
                      تحديثات مدى الحياة للمحتوى (عند توفرها)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </ScrollArea>

          {/* أزرار الدفع */}
          <div className="bg-white/90 backdrop-blur-sm border-t-2 border-primary-100 p-4 shadow-top-strong z-10">
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={onChooseMethod}
                size="lg"
                className="w-full h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-base font-bold shadow-lg hover:shadow-primary-500/40 transition-shadow duration-300"
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
          </div>
        </SheetContent>
      </Sheet>
      {/* اختيار طريقة USDT */}
      <AnimatePresence>
        {step === "choose_method" && (
          <UsdtPaymentMethodModal
            loading={loading}
            onClose={() => setStep("details")}
            onWalletSelect={onSelectWallet}
            onExchangeSelect={onSelectExchange}
          />
        )}
      </AnimatePresence>
      {/* شاشة التحويل (Exchange) */}
      {step === "show_exchange" && exchangeDetails && (
        <ExchangePaymentModal
          details={exchangeDetails}
          onClose={onCloseExchange}
          onSuccess={() => {}}
        />
      )}
      {/* نجاح */}
      {paymentStatus === "exchange_success" && (
        <PaymentExchangeSuccess
          onClose={handleSuccessClose}
          planName={displayTitle}
        />
      )}
      {paymentStatus === "success" && (
        <PaymentSuccessModal onClose={handleSuccessClose} />
      )}
    </>
  );
}
