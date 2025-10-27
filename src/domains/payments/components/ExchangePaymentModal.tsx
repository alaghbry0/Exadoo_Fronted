// src/features/payments/components/ExchangePaymentModal.tsx
"use client";

import React, { useState, useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import QRCode from "react-qr-code";
import type { PaymentStatus } from "@/domains/payments/types";
import { cn } from "@/shared/utils";
import { componentVariants } from "@/shared/components/ui/variants";
import { colors, spacing } from "@/styles/tokens";
import { Separator } from "@/shared/components/ui/separator";
import { PaymentExchangeSuccess } from "./PaymentExchangeSuccess";
import { QRDisplayModal } from "./QRDisplayModal";
import { PaymentDetailsSection } from "./PaymentDetailsSection";
import { PaymentAmountSection } from "./PaymentAmountSection";

// --- الواجهات والأنواع (لا تغيير) ---
interface ExchangeDetails {
  depositAddress: string;
  amount: string;
  network: string;
  paymentToken: string; // Memo
  planName?: string;
}
interface ExchangePaymentModalProps {
  details: ExchangeDetails;
  onClose: () => void;
  onSuccess?: () => void;
}

// --- Reducer لإدارة المؤقت (لا تغيير) ---
function timeReducer(state: number, action: "reset" | "tick") {
  switch (action) {
    case "reset":
      return 1800;
    case "tick":
      return Math.max(0, state - 1);
    default:
      return state;
  }
}

// ====================================================================
// المكون الرئيسي
// ====================================================================
export const ExchangePaymentModal: React.FC<ExchangePaymentModalProps> = ({
  details,
  onClose,
  onSuccess,
}) => {
  // --- الحالات والـ Hooks ---
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [localPaymentStatus] = useState<PaymentStatus>("processing");
  const [time, dispatch] = useReducer(timeReducer, 1800);
  const [showAddressQR, setShowAddressQR] = useState(false);
  const [showMemoQR, setShowMemoQR] = useState(false);

  // --- التأثيرات الجانبية (منطق التحقق من الدفع والمؤقت يبقى كما هو) ---
  useEffect(() => {
    // ... نفس منطق التحقق من الدفع
  }, [details.paymentToken, onSuccess]);

  useEffect(() => {
    const timer = setInterval(() => dispatch("tick"), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- الدوال المساعدة (لا تغيير جوهري في المنطق) ---
  const handleClose = () => {
    if (localPaymentStatus === "processing") setShowConfirmation(true);
    else onClose();
  };
  const confirmClose = () => {
    setShowConfirmation(false);
    onClose();
  };
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (localPaymentStatus === "success") {
    return (
      <PaymentExchangeSuccess onClose={onClose} planName={details.planName} />
    );
  }

  const qrValue = `ton://transfer/${details.depositAddress}?amount=${details.amount}&text=${details.paymentToken}`;

  return (
    <>
      <div
        className="fixed inset-0 flex flex-col z-[100]"
        style={{
          backgroundColor: colors.bg.secondary,
          color: colors.text.primary,
        }}
      >
        {/* الهيدر */}
        <header
          className="sticky top-0 backdrop-blur-sm z-10"
          style={{
            backgroundColor: `${colors.bg.elevated}CC`,
            borderBottom: `1px solid ${colors.border.default}`,
          }}
        >
          <div
            className="max-w-md mx-auto flex justify-between items-center"
            style={{
              padding: `${spacing[4]} ${spacing[5]}`,
            }}
          >
            <h2 className="text-lg font-bold">
              {details.planName || "إتمام الدفع"}
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full transition-colors"
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
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* المحتوى القابل للتمرير */}
        <main className="flex-1 overflow-y-auto">
          <div
            className="max-w-md mx-auto space-y-6"
            style={{ padding: spacing[5] }}
          >
            {/* قسم المبلغ والمؤقت */}
            <PaymentAmountSection
              amount={details.amount}
              network={details.network}
              time={time}
              formatTime={formatTime}
            />

            <Separator />

            {/* قسم QR Code الرئيسي */}
            <section
              className="flex flex-col items-center"
              style={{ gap: spacing[5] }}
            >
              <div
                className="rounded-xl shadow-lg"
                style={{
                  backgroundColor: colors.bg.elevated,
                  padding: spacing[5],
                  border: `1px solid ${colors.border.default}`,
                }}
              >
                <QRCode value={qrValue} size={190} />
              </div>
              <p
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                امسح الرمز ضوئيًا لإتمام الدفع عبر محفظتك
              </p>
            </section>

            {/* قسم تفاصيل الدفع */}
            <PaymentDetailsSection
              depositAddress={details.depositAddress}
              paymentToken={details.paymentToken}
              onShowAddressQR={() => setShowAddressQR(true)}
              onShowMemoQR={() => setShowMemoQR(true)}
            />
          </div>
        </main>
      </div>
      {/* مودال تأكيد الإغلاق */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-[100]"
            style={{
              backgroundColor: colors.bg.overlay,
              padding: spacing[5],
            }}
            onClick={confirmClose}
          >
            <motion.div
              className={cn(componentVariants.card.elevated, "w-full max-w-sm")}
              style={{ padding: spacing[6] }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-lg font-bold"
                style={{
                  color: colors.text.primary,
                  marginBottom: spacing[3],
                }}
              >
                هل أنت متأكد؟
              </h3>
              <p
                style={{
                  color: colors.text.secondary,
                  marginBottom: spacing[6],
                }}
              >
                عملية الدفع لم تكتمل بعد. هل تريد حقاً إغلاق هذه الصفحة؟
              </p>
              <div
                className="flex justify-end"
                style={{ gap: spacing[4] }}
              >
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="rounded-md transition-colors"
                  style={{
                    padding: `${spacing[3]} ${spacing[5]}`,
                    border: `1px solid ${colors.border.default}`,
                    color: colors.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bg.tertiary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  البقاء
                </button>
                <button
                  onClick={confirmClose}
                  className="rounded-md transition-colors"
                  style={{
                    padding: `${spacing[3]} ${spacing[5]}`,
                    backgroundColor: colors.status.error,
                    color: colors.text.inverse,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  إغلاق على أي حال
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* نوافذ QR Code المنفصلة */}
      <QRDisplayModal
        isOpen={showAddressQR}
        onClose={() => setShowAddressQR(false)}
        title="عنوان المحفظة (Address)"
        value={details.depositAddress}
      />
      <QRDisplayModal
        isOpen={showMemoQR}
        onClose={() => setShowMemoQR(false)}
        title="المذكرة (Memo)"
        value={details.paymentToken}
      />
    </>
  );
};
