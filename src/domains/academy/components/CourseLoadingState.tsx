/**
 * Course Loading State
 * حالة التحميل لصفحة الدورة
 */

import React from "react";
import { Loader2 } from "lucide-react";
import { colors } from "@/styles/tokens";

export const CourseLoadingState: React.FC = () => {
  return (
    <div
      className="font-arabic min-h-screen flex items-center justify-center p-12"
      style={{
        background: `linear-gradient(to bottom right, ${colors.bg.secondary}, ${colors.bg.primary}, ${colors.bg.secondary})`,
        color: colors.text.secondary,
      }}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-lg font-medium">جاري تحميل تفاصيل الدورة...</p>
      </div>
    </div>
  );
};
