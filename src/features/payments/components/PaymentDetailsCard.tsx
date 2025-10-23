// components/details/PaymentDetailsCard.tsx (النسخة النهائية والمحدثة)

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Hash,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import DetailRow from "./DetailRow"; // استيراد المكون المحسن

interface PaymentDetailsCardProps {
  extraData: {
    amount?: string;
    severity?: "success" | "warning" | "error" | "info";
    payment_id?: string;
    payment_token?: string;
    expected_amount?: string;
    difference?: string;
    invite_link?: string; // رابط الدعم الفني
  };
  type: "payment_success" | "payment_warning" | "payment_failed" | string;
}

const PaymentDetailsCard: React.FC<PaymentDetailsCardProps> = ({
  extraData,
  type,
}) => {
  const getTheme = () => {
    switch (type) {
      case "payment_success":
        return {
          title: "تفاصيل الدفع الناجح",
          icon: <CreditCard />,
          color: "emerald",
          border: "border-emerald-200",
          titleColor: "text-emerald-800",
        };
      case "payment_warning":
        return {
          title: "تحذير متعلق بالدفع",
          icon: <AlertCircle />,
          color: "amber",
          border: "border-amber-200",
          titleColor: "text-amber-800",
        };
      case "payment_failed":
        return {
          title: "فشل عملية الدفع",
          icon: <AlertCircle />,
          color: "red",
          border: "border-red-200",
          titleColor: "text-red-800",
        };
      default:
        return {
          title: "تفاصيل الدفع",
          icon: <CreditCard />,
          color: "gray",
          border: "border-gray-200",
          titleColor: "text-gray-800",
        };
    }
  };

  const theme = getTheme();
  const valueColorClass = `text-${theme.color}-600`;

  return (
    <Card className={`mb-6 ${theme.border}`}>
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 text-lg font-semibold ${theme.titleColor}`}
        >
          {theme.icon}
          {theme.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {extraData.payment_id && (
            <DetailRow
              icon={<Hash size={16} />}
              label="معرف العملية (TxHash)"
              value={extraData.payment_id}
              isCopyable={true} // ✨ تم تطبيق التعديل هنا
              valueClass="bg-gray-100 p-1 rounded-md text-gray-700"
            />
          )}

          {extraData.payment_token && (
            <DetailRow
              icon={<Hash size={16} />}
              label="رمز الدفعه (payment_token)"
              value={extraData.payment_token}
              isCopyable={true} // ✨ تم تطبيق التعديل هنا
              valueClass="bg-gray-100 p-1 rounded-md text-gray-700"
            />
          )}
          {extraData.expected_amount && (
            <DetailRow
              icon={<CreditCard size={16} />}
              label="المبلغ المطلوب"
              value={`${extraData.expected_amount} USDT`}
            />
          )}
          {extraData.amount && (
            <DetailRow
              icon={<CreditCard size={16} />}
              label="المبلغ المدفوع"
              value={`${extraData.amount} USDT`}
              valueClass={valueColorClass}
            />
          )}
          {extraData.difference &&
            (type === "payment_warning" || type === "payment_failed") && (
              <DetailRow
                icon={
                  type === "payment_warning" ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )
                }
                label={
                  type === "payment_warning" ? "الفرق (زيادة)" : "الفرق (نقص)"
                }
                value={`${extraData.difference} TON`}
                valueClass={valueColorClass}
              />
            )}
        </div>

        {/* زر التواصل مع الدعم في حالة التحذير أو الفشل */}
        {extraData.invite_link &&
          (type === "payment_warning" || type === "payment_failed") && (
            <div className="mt-6">
              <Button
                className={`w-full gap-2 py-6 text-base bg-${theme.color}-600 hover:bg-${theme.color}-700`}
                onClick={() =>
                  window.open(
                    extraData.invite_link,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <MessageSquare className="w-5 h-5" />
                <span>التواصل مع الدعم الفني</span>
                <ExternalLink className="w-4 h-4 mr-2" />
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default PaymentDetailsCard;
