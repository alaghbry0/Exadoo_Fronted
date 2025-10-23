// src/components/TieredDiscountInfo.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, ShieldCheck } from 'lucide-react';
import type { DiscountDetails } from '@/typesPlan';

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
      className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-100/50 border border-amber-300/60 rounded-xl text-amber-900 text-sm space-y-3 text-center shadow-inner"
    >
      {/* 1. عرض المقاعد المتبقية */}
      {details.remaining_slots !== null && (
        <div className="flex items-center justify-center gap-2 font-semibold">
          <Flame className="w-5 h-5 text-red-500" />
          <p>
            عرض حصري لـ <span className="font-bold text-lg text-red-600 tracking-wider">{details.remaining_slots}</span> مقاعد فقط!
          </p>
        </div>
      )}
      
      {/* 2. رسالة السعر التالي (إن وجدت) */}
      {details.next_tier_info?.message && (
        <div className="flex items-center justify-center gap-2 text-amber-800">
          <TrendingUp className="w-4 h-4" />
          <p>{details.next_tier_info.message}</p>
        </div>
      )}
      
      {/* 3. رسالة تثبيت السعر */}
      {details.lock_in_price && (
        <div className="flex items-center justify-center gap-2 text-green-700 pt-2">
           <ShieldCheck className="w-4 h-4" />
           <p className="font-semibold">
             اشتر الآن وثبّت هذا السعر
             {details.price_lock_duration_months ? ` لمدة ${details.price_lock_duration_months} أشهر!` : ' للأبد!'}
           </p>
        </div>
      )}
    </motion.div>
  );
};

export default TieredDiscountInfo;