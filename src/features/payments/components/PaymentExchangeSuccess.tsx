// PaymentExchangeSuccess.tsx
"use client";
import React from "react";
import { Check, X } from "lucide-react";

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
      className="fixed inset-0 bg-gradient-to-b from-blue-50 to-white flex flex-col"
      style={{
        zIndex: 924,
        position: "fixed",
        isolation: "isolate",
      }}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">{planName || "دفع الاشتراك"}</h2>
        <button onClick={onClose} aria-label="إغلاق" className="p-2">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-scale-in w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          تمت عملية الدفع بنجاح!
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          تم استلام المبلغ وتفعيل اشتراكك. يمكنك الآن الاستمتاع بخدماتنا.
        </p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white rounded-md px-4 py-2"
        >
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
};
