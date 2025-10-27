/**
 * Course Not Found State
 * حالة عدم العثور على الدورة
 */

import React from "react";
import { BookOpen } from "lucide-react";
import { colors } from "@/styles/tokens";

export const CourseNotFoundState: React.FC = () => {
  return (
    <div
      className="font-arabic min-h-screen flex items-center justify-center p-12"
      style={{
        background: `linear-gradient(to bottom right, ${colors.bg.secondary}, ${colors.bg.primary}, ${colors.bg.secondary})`,
      }}
    >
      <div
        className="max-w-md rounded-3xl border border-dashed p-8 text-center"
        style={{
          borderColor: colors.border.default,
          backgroundColor: colors.bg.primary,
        }}
      >
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.bg.tertiary }}
        >
          <BookOpen className="h-8 w-8" style={{ color: colors.text.tertiary }} />
        </div>
        <p
          className="text-lg font-semibold"
          style={{ color: colors.text.primary }}
        >
          لم يتم العثور على الدورة
        </p>
        <p className="mt-2 text-sm" style={{ color: colors.text.secondary }}>
          عذرًا، الدورة المطلوبة غير متوفرة
        </p>
      </div>
    </div>
  );
};
