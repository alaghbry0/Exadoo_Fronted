/**
 * Course Error State
 * حالة الخطأ لصفحة الدورة
 */

import React from "react";
import { colors } from "@/styles/tokens";

interface CourseErrorStateProps {
  message?: string;
}

export const CourseErrorState: React.FC<CourseErrorStateProps> = ({ message }) => {
  return (
    <div
      className="font-arabic min-h-screen flex items-center justify-center p-12"
      style={{
        background: `linear-gradient(to bottom right, ${colors.bg.secondary}, ${colors.bg.primary}, ${colors.bg.secondary})`,
      }}
    >
      <div
        className="max-w-md rounded-3xl border p-8 text-center"
        style={{
          borderColor: colors.status.error,
          backgroundColor: colors.status.errorBg,
        }}
      >
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${colors.status.error}20` }}
        >
          <span className="text-3xl">⚠️</span>
        </div>
        <p
          className="text-lg font-semibold"
          style={{ color: colors.status.error }}
        >
          تعذّر التحميل
        </p>
        <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
          {message || "حدث خطأ أثناء تحميل الدورة"}
        </p>
      </div>
    </div>
  );
};
