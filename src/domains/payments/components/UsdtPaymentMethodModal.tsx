"use client";
import type { CSSProperties } from "react";
import { cn } from "@/shared/utils";
import {
  colors,
  gradients,
  shadowClasses,
  shadows,
  withAlpha,
} from "@/styles/tokens";
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
    className="animate-fade-in fixed inset-0 backdrop-blur-sm flex justify-center items-center p-4 z-[99]"
    style={{
      backgroundColor: withAlpha(colors.bg.overlay, 0.85),
      backgroundImage: gradients.overlays.darkInward,
    }}
    onClick={onClose}
    role="dialog"
    aria-modal="true"
    aria-labelledby="usdt-payment-title"
  >
    <div
      className={cn(
        "animate-slide-up w-full max-w-sm overflow-hidden rounded-2xl",
        shadowClasses.cardElevated,
      )}
      style={{
        background: colors.bg.primary,
        color: colors.text.primary,
        boxShadow: shadows.elevation[4],
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* الهيدر: يبقى نظيفًا */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: colors.border.default }}
      >
        <h3
          id="usdt-payment-title"
          className="font-bold text-lg"
          style={{ color: colors.text.primary }}
          role="heading"
          aria-level={2}
        >
          إتمام الدفع بـ USDT
        </h3>
        <button
          onClick={onClose}
          className={cn("transition-colors", "token-icon-button")}
          style={{
            "--token-icon-size": "2.25rem",
            "--token-icon-bg": withAlpha(colors.bg.overlay, 0.08),
            "--token-icon-bg-hover": withAlpha(colors.bg.overlay, 0.14),
            "--token-icon-color": colors.text.secondary,
            "--token-icon-color-hover": colors.text.primary,
            "--token-icon-shadow": shadows.elevation[1],
            "--token-icon-shadow-hover": shadows.elevation[2],
          } as CSSProperties}
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
          className={cn(
            "relative w-full p-3 rounded-xl flex items-center gap-4 text-right disabled:opacity-70 disabled:cursor-wait",
            loading && "cursor-progress",
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
            "--token-transform-hover": "translateY(-0.25rem)",
            "--token-transform-active": "translateY(-0.125rem)",
          } as CSSProperties}
          onClick={onWalletSelect}
          disabled={loading}
          type="button"
        >
          {/* دائرة الأيقونة تبقى بيضاء لتبرز */}
          <div
            className="w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center border"
            style={{
              backgroundColor: withAlpha(colors.bg.inverse, 0.2),
              borderColor: withAlpha(colors.bg.inverse, 0.3),
            }}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.text.inverse }} />
            ) : (
              <Wallet className="w-7 h-7" style={{ color: colors.text.inverse }} />
            )}
          </div>
          <div>
            <p className="font-semibold" style={{ color: colors.text.inverse }}>
              محفظة ويب 3
            </p>
            <p className="text-sm" style={{ color: withAlpha(colors.text.inverse, 0.75) }}>
              مثل Tonkeeper, MyTonWallet
            </p>
          </div>
          {/* اقتراح إضافي: شارة "موصى به" */}
        </button>

        {/* ========================================================= */}
        {/* تعديل 3: زر منصات التداول بتصميم "شبح" (outline) ليكون الخيار الثانوي */}
        {/* ========================================================= */}
        <button
          className={cn(
            "w-full p-3 rounded-xl flex items-center gap-4 text-right disabled:opacity-60 disabled:cursor-wait",
            loading && "cursor-progress",
            shadowClasses.button,
            "token-interactive",
          )}
          style={{
            "--token-bg": colors.bg.primary,
            "--token-bg-hover": colors.bg.secondary,
            "--token-bg-active": withAlpha(colors.bg.secondary, 0.95),
            "--token-fg": colors.text.primary,
            "--token-fg-hover": colors.text.primary,
            "--token-shadow": shadows.elevation[1],
            "--token-shadow-hover": shadows.elevation[2],
            "--token-shadow-active": shadows.elevation[1],
            "--token-border-color": colors.border.default,
            "--token-border-color-hover": colors.border.hover,
            "--token-border-color-active": colors.border.focus,
            "--token-border-width": "1px",
            "--token-transform-hover": "translateY(-0.1875rem)",
            "--token-transform-active": "translateY(-0.0625rem)",
          } as CSSProperties}
          onClick={onExchangeSelect}
          disabled={loading}
          type="button"
        >
          <div
            className="w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center border"
            style={{
              backgroundColor: colors.bg.secondary,
              borderColor: colors.border.default,
            }}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.text.secondary }} />
            ) : (
              <ArrowRightLeft className="w-6 h-6" style={{ color: colors.text.secondary }} />
            )}
          </div>
          <div>
            <p className="font-semibold" style={{ color: colors.text.primary }}>
              منصة تداول
            </p>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              مثل Binance, OKX, Bybit
            </p>
          </div>
        </button>
      </div>
    </div>
  </div>
);
