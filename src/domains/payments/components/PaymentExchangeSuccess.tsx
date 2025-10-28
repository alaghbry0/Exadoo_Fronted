// PaymentExchangeSuccess.tsx
"use client";
import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/shared/utils";
import {
  colors,
  gradients,
  shadowClasses,
  shadows,
  withAlpha,
} from "@/styles/tokens";

interface PaymentExchangeSuccessProps {
  onClose: () => void;
  planName?: string;
}

export const PaymentExchangeSuccess: React.FC<PaymentExchangeSuccessProps> = ({
  onClose,
  planName,
}) => {
  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        zIndex: 924,
        position: "fixed",
        isolation: "isolate",
        background: gradients.surface.elevated,
      }}
    >
      <div
        className="flex justify-between items-center p-4 border-b"
        style={{ borderColor: colors.border.default, background: colors.bg.primary }}
      >
        <h2 className="text-xl font-bold" style={{ color: colors.text.primary }}>
          {planName || "دفع الاشتراك"}
        </h2>
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="token-icon-button"
          style={{
            "--token-icon-size": "2.5rem",
            "--token-icon-bg": withAlpha(colors.bg.overlay, 0.08),
            "--token-icon-bg-hover": withAlpha(colors.bg.overlay, 0.12),
            "--token-icon-color": colors.text.secondary,
            "--token-icon-color-hover": colors.text.primary,
            "--token-icon-shadow": shadows.elevation[1],
            "--token-icon-shadow-hover": shadows.elevation[2],
          } as React.CSSProperties}
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div
          className="animate-scale-in w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{
            background: gradients.status.success,
            boxShadow: shadows.colored.primary.md,
            color: colors.text.inverse,
          }}
        >
          <Check className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: colors.text.primary }}>
          تمت عملية الدفع بنجاح!
        </h2>
        <p className="mb-8 max-w-md" style={{ color: colors.text.secondary }}>
          تم استلام المبلغ وتفعيل اشتراكك. يمكنك الآن الاستمتاع بخدماتنا.
        </p>
        <button
          onClick={onClose}
          className={cn(
            "rounded-lg px-6 py-3 font-semibold",
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
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
};
