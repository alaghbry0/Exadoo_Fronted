"use client";
import React, { useState } from "react";
import { Copy } from "lucide-react";

interface PaymentExchangePageProps {
  recipientAddress: string; // عنوان محفظة المستلم
  amount: string; // المبلغ المطلوب
  network: string; // اسم الشبكة (مثلاً: "Ton Network")
  paymentToken: string; // التعليق:
}

const PaymentExchangePage: React.FC<PaymentExchangePageProps> = ({
  recipientAddress,
  amount,
  network,
  paymentToken,
}) => {
  const [copied, setCopied] = useState<string>("");

  const copyText = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(""), 2000);
    } catch (error) {
      console.error("خطأ في النسخ:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 z-20">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          تفاصيل الدفع عبر منصات التداول
        </h1>
        <div className="space-y-4">
          {/* عنوان محفظة المستلم */}
          <div>
            <p className="text-gray-600">عنوان محفظة المستلم:</p>
            <div className="flex items-center justify-between bg-gray-200 p-2 rounded">
              <span className="text-gray-800 break-all">
                {recipientAddress}
              </span>
              <button onClick={() => copyText(recipientAddress, "address")}>
                <Copy className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {copied === "address" && (
              <p className="text-green-600 text-sm">تم النسخ!</p>
            )}
          </div>
          {/* المبلغ المطلوب */}
          <div>
            <p className="text-gray-600">المبلغ المطلوب:</p>
            <div className="flex items-center justify-between bg-gray-200 p-2 rounded">
              <span className="text-gray-800">{amount}</span>
              <button onClick={() => copyText(amount, "amount")}>
                <Copy className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {copied === "amount" && (
              <p className="text-green-600 text-sm">تم النسخ!</p>
            )}
          </div>
          {/* اسم الشبكة */}
          <div>
            <p className="text-gray-600">اسم الشبكة:</p>
            <div className="flex items-center justify-between bg-gray-200 p-2 rounded">
              <span className="text-gray-800">{network}</span>
              <button onClick={() => copyText(network, "network")}>
                <Copy className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {copied === "network" && (
              <p className="text-green-600 text-sm">تم النسخ!</p>
            )}
          </div>
          {/* التعليق (orderId) */}
          <div>
            <p className="text-gray-600">التعليق (paymentToken):</p>
            <div className="flex items-center justify-between bg-gray-200 p-2 rounded">
              <span className="text-gray-800 break-all">{paymentToken}</span>
              <button onClick={() => copyText(paymentToken, "paymentToken")}>
                <Copy className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {copied === "paymentToken" && (
              <p className="text-green-600 text-sm">تم النسخ!</p>
            )}
          </div>
        </div>
        <div className="mt-6 p-4 bg-yellow-100 rounded">
          <p className="text-yellow-800 text-center text-sm">
            يرجى عدم إغلاق هذه الصفحة أثناء المعالجة، والتأكد من تضمين التعليق
            (paymentToken) عند إجراء عملية الدفع.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentExchangePage;
