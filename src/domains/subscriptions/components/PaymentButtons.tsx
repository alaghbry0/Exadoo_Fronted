// PaymentButtons.tsx
"use client";
import { motion } from "framer-motion";
import { Spinner } from "@/shared/components/common/Spinner";
// افترض أن PaymentStatus معرفة بشكل صحيح، مثلاً:
// export type PaymentStatus = 'idle' | 'processing' | 'processing_usdt' | 'processing_stars' | 'success' | 'error' | 'exchange_pending' | 'exchange_success';
import type { PaymentStatus } from "@/domains/payments/types"; // تأكد من أن هذا النوع يتضمن 'idle'
import { Star, Wallet } from "lucide-react";

interface PaymentButtonsProps {
  loading: boolean;
  paymentStatus: PaymentStatus;
  onUsdtSelect: () => void;
  onStarsSelect: () => void;
  telegramId?: string;
  disabled?: boolean; // <-- إضافة الخاصية الجديدة
}

export const PaymentButtons = ({
  loading,
  paymentStatus,
  onUsdtSelect,
  onStarsSelect,
  telegramId,
  disabled, // <-- استقبال الخاصية الجديدة
}: PaymentButtonsProps) => {
  // دمج حالة التعطيل من الأعلى مع المنطق الحالي
  // سيكون الزر معطلاً إذا كانت الخاصية disabled الخارجية true، أو إذا كان هناك تحميل، أو إذا لم تكن حالة الدفع 'idle'
  const isUsdtButtonDisabled = disabled || loading || paymentStatus !== "idle";
  const isStarsButtonDisabled =
    disabled || !telegramId || loading || paymentStatus !== "idle";

  // تحديد ما إذا كان Spinner يجب أن يظهر (عادة عندما يكون loading=true وحالة الدفع ليست idle)
  // هذا يفترض أن 'loading' يصبح true عندما تبدأ عملية دفع محددة
  const showUsdtSpinner =
    loading &&
    (paymentStatus === "processing_usdt" ||
      (paymentStatus !== "idle" && paymentStatus !== "processing_stars")); // كن أكثر تحديدًا إذا أمكن
  const showStarsSpinner =
    loading &&
    (paymentStatus === "processing_stars" ||
      (paymentStatus !== "idle" && paymentStatus !== "processing_usdt")); // كن أكثر تحديدًا إذا أمكن

  return (
    <div className="space-y-2">
      {/* زر الدفع عبر USDT */}
      <motion.button
        whileHover={{ scale: !isUsdtButtonDisabled ? 1.02 : 1 }} // لا تقم بالتحريك إذا كان معطلاً
        whileTap={{ scale: !isUsdtButtonDisabled ? 0.98 : 1 }} // لا تقم بالتحريك إذا كان معطلاً
        onClick={onUsdtSelect}
        disabled={isUsdtButtonDisabled} // <-- استخدام حالة التعطيل المدمجة
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0084FF] to-[#0066CC] text-white rounded-lg 
          ${isUsdtButtonDisabled ? "opacity-75 cursor-not-allowed" : "hover:from-[#0075e6] hover:to-[#0059b3]"} 
          shadow-md transition-all duration-200`}
        aria-label="الدفع عبر USDT"
      >
        {showUsdtSpinner ? ( // <-- استخدام حالة إظهار Spinner المحددة
          <Spinner className="w-5 h-5 text-white" />
        ) : (
          <>
            <Wallet className="w-5 h-5 text-white" />
            <span className="font-bold">الدفع عبر USDT</span>
          </>
        )}
      </motion.button>

      {/* Telegram Stars Payment Button */}
      {telegramId && ( // اعرض الزر فقط إذا كان telegramId موجودًا لتجنب الارتباك
        <motion.button
          whileHover={{ scale: !isStarsButtonDisabled ? 1.02 : 1 }}
          whileTap={{ scale: !isStarsButtonDisabled ? 0.98 : 1 }}
          onClick={onStarsSelect}
          disabled={isStarsButtonDisabled} // <-- استخدام حالة التعطيل المدمجة
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFC800] text-gray-900 rounded-lg 
            ${isStarsButtonDisabled ? "opacity-75 cursor-not-allowed" : "hover:from-[#f0c800] hover:to-[#e6b800]"} 
            shadow-md transition-all duration-200`}
          aria-label="الدفع باستخدام Telegram Stars"
        >
          {showStarsSpinner ? ( // <-- استخدام حالة إظهار Spinner المحددة
            <Spinner className="w-5 h-5 text-gray-900" /> // قد تحتاج Spinner بلون مختلف هنا
          ) : (
            <>
              <Star className="w-5 h-5 text-amber-700" />
              <span className="font-bold">Telegram Stars</span>
            </>
          )}
        </motion.button>
      )}
      {!telegramId && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-sm text-yellow-700 font-medium flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-amber-700 inline-block" />
            <span>الدفع عبر Telegram Stars</span>
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            هذه الطريقة متاحة فقط عند فتح التطبيق من داخل تليجرام.
          </p>
        </div>
      )}
    </div>
  );
};
