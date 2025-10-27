"use client";
import { cn } from "@/shared/utils";
import { componentVariants, mergeVariants } from "@/shared/components/ui/variants";

import clsx from "clsx";
import { Wallet, ArrowRightLeft, X, Loader2 } from "lucide-react";

// --- تعريف Props المكون ---
interface UsdtPaymentMethodModal {
  loading: boolean;
  onClose: () => void;
  onWalletSelect: () => void;
  onExchangeSelect: () => void;
}

export const UsdtPaymentMethodModal = ({
  loading,
  onClose,
  onWalletSelect,
  onExchangeSelect,
}: UsdtPaymentMethodModal) => (
  <div
    dir="rtl"
    className="animate-fade-in fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[99]"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="usdt-payment-title"
  >
    <div
      // تعديل 1: استخدام خلفية رمادية فاتحة جدًا لإبراز البطاقات البيضاء
      className={cn(
        componentVariants.card.elevated,
        "animate-slide-up bg-gray-50 w-full max-w-sm overflow-hidden /50",
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* الهيدر: يبقى نظيفًا */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3
          id="usdt-payment-title"
          className="font-bold text-lg text-gray-900"
          role="heading"
          aria-level={2}
        >
          إتمام الدفع بـ USDT
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-full disabled:opacity-50"
          disabled={loading}
          aria-label="إغلاق نافذة الدفع"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* ========================================================= */}
        {/* تعديل 2: زر محفظة ويب 3 بتصميم جذاب وممتلئ بالتدرج اللوني */}
        {/* ========================================================= */}
        <button
          className={clsx(
            "relative w-full p-3 bg-gradient-to-br from-primary-500 to-primary-600 text-white transition-transform duration-300 rounded-xl flex items-center gap-4 text-right disabled:opacity-70 disabled:cursor-wait shadow-lg",
            !loading &&
              "hover:-translate-y-1 hover:shadow-primary-500/40 hover:scale-[1.02]",
            loading && "cursor-progress",
          )}
          onClick={onWalletSelect}
          disabled={loading}
          type="button"
        >
          {/* دائرة الأيقونة تبقى بيضاء لتبرز */}
          <div className="w-12 h-12 bg-white/20 flex-shrink-0 rounded-lg flex items-center justify-center border border-white/30">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <Wallet className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <p className="font-semibold">محفظة ويب 3</p>
            <p className="text-sm text-primary-100">
              مثل Tonkeeper, MyTonWallet
            </p>
          </div>
          {/* اقتراح إضافي: شارة "موصى به" */}
        </button>

        {/* ========================================================= */}
        {/* تعديل 3: زر منصات التداول بتصميم "شبح" (outline) ليكون الخيار الثانوي */}
        {/* ========================================================= */}
        <button
          className={clsx(
            "w-full p-3 bg-white border border-gray-300 transition-transform duration-300 rounded-xl flex items-center gap-4 text-right disabled:opacity-60 disabled:cursor-wait",
            !loading &&
              "hover:bg-gray-100 hover:-translate-y-1 hover:scale-[1.02]",
            loading && "cursor-progress",
          )}
          onClick={onExchangeSelect}
          disabled={loading}
          type="button"
        >
          <div className="w-12 h-12 bg-gray-100 flex-shrink-0 rounded-lg flex items-center justify-center border">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            ) : (
              <ArrowRightLeft className="w-6 h-6 text-gray-600" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-800">منصة تداول</p>
            <p className="text-sm text-gray-500">مثل Binance, OKX, Bybit</p>
          </div>
        </button>
      </div>
    </div>
  </div>
);
