"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type BackMode = "always" | "fallback" | "replace";

type BackHeaderProps = {
  title?: string;
  className?: string;
  /** الوجهة المفضلة للرجوع */
  backTo?: string;
  /** كيف نتصرف عند الرجوع */
  backMode?: BackMode;
  fallbackUrl?: string;
  /** لو حاب تمرر onBack مخصص، سنستدعيه بدل السلوك الافتراضي */
  onBack?: () => void;
};

const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  className,
  backTo,
  backMode = "fallback",
  fallbackUrl = "/shop",
  onBack,
}) => {
  const router = useRouter();

  const handleBack = () => {
    // أولوية لأي onBack مخصص
    if (typeof onBack === "function") {
      onBack();
      return;
    }

    const target = backTo || fallbackUrl;
    const hasHistory =
      typeof window !== "undefined" && window.history.length > 1;

    if (backMode === "always") {
      router.push(target);
      return;
    }

    if (backMode === "replace") {
      router.replace(target);
      return;
    }

    // fallback: جرّب التاريخ، وإلا ارجع للهدف
    if (hasHistory) {
      router.back();
    } else {
      router.push(target);
    }
  };

  return (
    <header
      role="banner"
      className={cn(
        "sticky top-0 z-50",
        "bg-white border-b border-gray-200",
        "shadow-sm",
        className,
      )}
    >
      <div className="flex items-center h-14 px-4">
        {/* زر الرجوع */}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="رجوع"
        >
          <ChevronLeft size={24} className="text-gray-900" aria-hidden="true" />
        </button>

        {/* العنوان في المنتصف */}
        <h1
          className="absolute left-1/2 transform -translate-x-1/2 text-lg font-bold text-gray-900"
          style={{ fontFamily: "var(--font-arabic)" }}
        >
          {title || ""}
        </h1>
      </div>
    </header>
  );
};

export default BackHeader;
