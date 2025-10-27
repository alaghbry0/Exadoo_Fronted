// src/features/payments/components/PaymentDetailsSection.tsx
"use client";

import React, { useState } from "react";
import { QrCode, CheckCircle2, Copy, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { colors, spacing } from "@/styles/tokens";

interface PaymentDetailsSectionProps {
  depositAddress: string;
  paymentToken: string;
  onShowAddressQR: () => void;
  onShowMemoQR: () => void;
}

export const PaymentDetailsSection: React.FC<PaymentDetailsSectionProps> = ({
  depositAddress,
  paymentToken,
  onShowAddressQR,
  onShowMemoQR,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: "العنوان" | "المذكرة") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`تم نسخ ${type} بنجاح!`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section
      className="rounded-xl space-y-4"
      style={{
        backgroundColor: colors.bg.elevated,
        border: `1px solid ${colors.border.default}`,
        padding: spacing[5],
      }}
    >
      {/* حقل العنوان */}
      <div>
        <label
          className="text-sm font-semibold mb-2 block"
          style={{ color: colors.text.primary }}
        >
          عنوان المحفظة (Address)
        </label>
        <div
          className="flex items-center gap-2 rounded-lg"
          style={{
            backgroundColor: colors.bg.secondary,
            padding: spacing[3],
            border: `1px solid ${colors.border.default}`,
          }}
        >
          <p className="flex-1 font-mono text-sm break-all select-all">
            {depositAddress}
          </p>
          <button
            onClick={() => copyToClipboard(depositAddress, "العنوان")}
            className="rounded-md transition-colors"
            style={{
              padding: spacing[3],
              color: colors.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {copied === "العنوان" ? (
              <CheckCircle2 className="w-5 h-5" style={{ color: colors.status.success }} />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onShowAddressQR}
            className="rounded-md transition-colors"
            style={{
              padding: spacing[3],
              color: colors.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* حقل المذكرة */}
      <div>
        <label
          className="text-sm font-semibold mb-2 block"
          style={{ color: colors.text.primary }}
        >
          المذكرة (Memo)
        </label>
        <div
          className="flex items-center gap-2 rounded-lg"
          style={{
            backgroundColor: colors.bg.secondary,
            padding: spacing[3],
            border: `1px solid ${colors.border.default}`,
          }}
        >
          <p className="flex-1 font-mono text-sm break-all select-all">
            {paymentToken}
          </p>
          <button
            onClick={() => copyToClipboard(paymentToken, "المذكرة")}
            className="rounded-md transition-colors"
            style={{
              padding: spacing[3],
              color: colors.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {copied === "المذكرة" ? (
              <CheckCircle2 className="w-5 h-5" style={{ color: colors.status.success }} />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onShowMemoQR}
            className="rounded-md transition-colors"
            style={{
              padding: spacing[3],
              color: colors.text.secondary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* تحذير المذكرة */}
      <div
        className="flex items-start rounded-lg"
        style={{
          gap: spacing[4],
          padding: spacing[4],
          backgroundColor: colors.status.errorBg,
          border: `1px solid ${colors.border.error}`,
        }}
      >
        <AlertTriangle
          className="w-8 h-8 flex-shrink-0"
          style={{ color: colors.status.error }}
        />
        <div>
          <h4
            className="font-semibold"
            style={{ color: colors.status.error }}
          >
            مهم جدًا: لا تنسَ المذكرة
          </h4>
          <p
            className="text-xs"
            style={{ color: colors.status.error }}
          >
            عدم إرسال المذكرة (Memo) مع الدفعة سيؤدي إلى فقدان أموالك وعدم تفعيل
            الاشتراك.
          </p>
        </div>
      </div>
    </section>
  );
};
