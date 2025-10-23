import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useClipboard } from "@/hooks/useClipboard";
import {
  colors,
  componentRadius,
  shadowClasses,
  spacing,
  typography,
} from "@/styles/tokens";

type PaymentHistoryItemProps = {
  payment: {
    tx_hash: string | null;
    amount_received: number;
    subscription_plan_id: number;
    status: "completed" | "failed";
    processed_at: string;
    payment_token: string | null;
    error_message?: string | null;
    plan_name: string;
    subscription_name: string;
  };
};

export const PaymentHistoryItem = ({ payment }: PaymentHistoryItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const { copy } = useClipboard();

  // تنسيق التاريخ كما طلبت
  const formattedDate = format(
    new Date(payment.processed_at),
    "MMM dd, yyyy, hh:mm:ss a",
  );

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: colors.status.success,
      background: colors.status.successBg,
      label: "مكتمل",
    },
    failed: {
      icon: XCircle,
      color: colors.status.error,
      background: colors.status.errorBg,
      label: "فاشل",
    },
  } as const;

  // عند النقر على القيمة يتم النسخ
  const handleCopy = (text: string) => {
    copy(text);
  };

  // إعطاء قيم افتراضية لتجنب Null
  const paymentToken = payment.payment_token || "N/A";
  const txHash = payment.tx_hash || "N/A";

  const status = statusConfig[payment.status];

  return (
    <div
      className={`${componentRadius.card} ${shadowClasses.card} animate-slide-up border`}
      style={{
        backgroundColor: colors.bg.elevated,
        borderColor: colors.border.default,
        color: colors.text.primary,
        marginBottom: spacing[5],
        padding: spacing[5],
      }}
    >
      <div className="flex justify-between items-center">
        {/* القسم الأيسر: البيانات الأساسية */}
        <div className="flex flex-col w-full">
          <div className="flex justify-between items-center">
            <span
              className={typography.heading.md}
              style={{ color: colors.text.primary }}
            >
              {payment.amount_received} USDT
            </span>
            <span
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
              style={{
                backgroundColor: status.background,
                color: status.color,
              }}
            >
              {status.label}
              <status.icon className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <div
            className="flex flex-row justify-between items-center"
            style={{ marginTop: spacing[3] }}
          >
            <span
              className={typography.body.sm}
              style={{ color: colors.text.secondary }}
            >
              {formattedDate}
            </span>
            <span
              className="cursor-pointer hover:underline"
              style={{ color: colors.text.link }}
              onClick={() => handleCopy(payment.subscription_name)}
            >
              {payment.subscription_name}
            </span>
            <span
              className="cursor-pointer hover:underline"
              style={{ color: colors.text.link }}
              onClick={() => handleCopy(payment.plan_name)}
            >
              {payment.plan_name}
            </span>
          </div>
        </div>

        {/* زر التوسيع/التقليص */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 transition-colors"
          style={{
            color: colors.text.secondary,
          }}
          aria-label={expanded ? "إغلاق التفاصيل" : "عرض التفاصيل"}
        >
          {expanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {expanded && (
        <div
          className="animate-fade-in overflow-hidden border-t"
          style={{
            borderColor: colors.border.default,
            marginTop: spacing[4],
            paddingTop: spacing[4],
          }}
        >
          <div
            className="flex flex-col text-sm"
            style={{
              color: colors.text.secondary,
              gap: spacing[4],
            }}
          >
            {/* Message و tx Hash بنفس السطر */}
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <span
                  className="font-medium"
                  style={{ color: colors.text.primary }}
                >
                  tx Hash:
                </span>
                <span
                  className="font-mono text-xs rounded cursor-pointer hover:underline"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    color: colors.text.primary,
                    padding: `${spacing[3]} ${spacing[4]}`,
                  }}
                  onClick={() => handleCopy(txHash)}
                >
                  {paymentToken !== "N/A"
                    ? `${paymentToken.slice(0, 8)}...${paymentToken.slice(-4)}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  className="font-medium"
                  style={{ color: colors.text.primary }}
                >
                  Message:
                </span>
                <span
                  className="font-mono text-xs rounded cursor-pointer hover:underline"
                  style={{
                    backgroundColor: colors.bg.secondary,
                    color: colors.text.primary,
                    padding: `${spacing[3]} ${spacing[4]}`,
                  }}
                  onClick={() => handleCopy(paymentToken)}
                >
                  {txHash !== "N/A"
                    ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
                    : "N/A"}
                </span>
              </div>
            </div>

            {payment.error_message && (
              <div
                className="rounded text-xs"
                style={{
                  backgroundColor: colors.status.errorBg,
                  color: colors.status.error,
                  padding: spacing[3],
                }}
              >
                <span
                  className="font-medium"
                  style={{ color: colors.status.error }}
                >
                  ملاحظة:
                </span>
                <p>{payment.error_message}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
