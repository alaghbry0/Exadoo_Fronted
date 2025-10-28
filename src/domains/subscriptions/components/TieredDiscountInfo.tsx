// src/components/TieredDiscountInfo.tsx

import React from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, ShieldCheck } from "lucide-react";
import type { DiscountDetails } from "@/domains/subscriptions/types";
import {
  colors,
  componentRadius,
  gradients,
  shadows,
  withAlpha,
} from "@/styles/tokens";

interface Props {
  details: DiscountDetails;
}

const TieredDiscountInfo: React.FC<Props> = ({ details }) => {
  if (!details.is_tiered) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`mt-4 p-4 text-sm space-y-3 text-center ${componentRadius.card}`}
      style={{
        background: gradients.accent.amber,
        color: colors.text.inverse,
        border: `1px solid ${withAlpha(colors.status.warning, 0.4)}`,
        boxShadow: shadows.inner.md,
      }}
    >
      {/* 1. عرض المقاعد المتبقية */}
      {details.remaining_slots !== null && (
        <div className="flex items-center justify-center gap-2 font-semibold">
          <Flame
            className="w-5 h-5"
            style={{ color: colors.status.warning }}
          />
          <p>
            عرض حصري لـ{" "}
            <span
              className="font-bold text-lg tracking-wider"
              style={{ color: colors.status.error }}
            >
              {details.remaining_slots}
            </span>{" "}
            مقاعد فقط!
          </p>
        </div>
      )}

      {/* 2. رسالة السعر التالي (إن وجدت) */}
      {details.next_tier_info?.message && (
        <div
          className="flex items-center justify-center gap-2"
          style={{ color: withAlpha(colors.text.inverse, 0.85) }}
        >
          <TrendingUp className="w-4 h-4" />
          <p>{details.next_tier_info.message}</p>
        </div>
      )}

      {/* 3. رسالة تثبيت السعر */}
      {details.lock_in_price && (
        <div
          className="flex items-center justify-center gap-2 pt-2"
          style={{ color: colors.status.success }}
        >
          <ShieldCheck className="w-4 h-4" />
          <p className="font-semibold">
            اشتر الآن وثبّت هذا السعر
            {details.price_lock_duration_months
              ? ` لمدة ${details.price_lock_duration_months} أشهر!`
              : " للأبد!"}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default TieredDiscountInfo;
