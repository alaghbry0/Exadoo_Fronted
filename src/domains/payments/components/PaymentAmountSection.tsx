// src/features/payments/components/PaymentAmountSection.tsx
"use client";

import React from "react";
import { Clock } from "lucide-react";
import { colors, gradients, spacing, withAlpha } from "@/styles/tokens";

interface PaymentAmountSectionProps {
  amount: string;
  network: string;
  time: number;
  formatTime: (seconds: number) => string;
}

export const PaymentAmountSection: React.FC<PaymentAmountSectionProps> = ({
  amount,
  network,
  time,
  formatTime,
}) => {
  const timeProgress = (time / 1800) * 100;

  return (
    <section className="text-center space-y-4">
      <p style={{ color: colors.text.secondary }}>المبلغ المطلوب</p>
      <div
        className="flex items-baseline justify-center"
        style={{ gap: spacing[3] }}
      >
        <span
          className="text-5xl font-extrabold"
          style={{ color: colors.brand.primary }}
        >
          {amount}
        </span>
        <span className="text-2xl" style={{ color: colors.text.tertiary }}>
          USDT
        </span>
      </div>
      <div
        className="inline-block text-sm rounded-full font-medium"
        style={{
          backgroundColor: colors.status.infoBg,
          color: colors.brand.primary,
          padding: `${spacing[2]} ${spacing[4]}`,
          border: `1px solid ${withAlpha(colors.brand.primary, 0.2)}`,
        }}
      >
        شبكة: {network || "TON"}
      </div>
      <div style={{ paddingTop: spacing[3] }}>
        <div
          className="flex items-center justify-center text-sm mb-2"
          style={{
            gap: spacing[3],
            color: colors.text.secondary,
          }}
        >
          <Clock size={16} />
          <span>
            الوقت المتبقي:{" "}
            <span
              className="font-mono text-base font-bold"
              style={{ color: colors.text.primary }}
            >
              {formatTime(time)}
            </span>
          </span>
        </div>
        <div
          className="w-full rounded-full h-1.5"
          style={{ backgroundColor: colors.bg.tertiary }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${timeProgress}%`,
              background: gradients.brand.primary,
            }}
          />
        </div>
      </div>
    </section>
  );
};
