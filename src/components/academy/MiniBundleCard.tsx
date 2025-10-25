// src/components/academy/MiniBundleCard.tsx
import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { componentVariants } from "@/components/ui/variants";
import Image from "next/image";
import { cardHoverVariant } from "./animation-variants";
import { colors } from "@/styles/tokens";

interface MiniBundleCardProps {
  id: string;
  title: string;
  desc: string;
  price: string;
  img?: string;
  subCategoryId?: string | number;
  freeSessionsCount?: string | number;
  priority?: boolean;
}

const formatPrice = (value?: string) => {
  if (!value) return "";
  if (value.toLowerCase?.() === "free") return "مجاني";
  const n = Number(value);
  return isNaN(n) ? value : `${n.toFixed(0)}`;
};

export const MiniBundleCard = memo(function MiniBundleCard({
  id,
  title,
  desc,
  price,
  img,
  subCategoryId,
  freeSessionsCount,
  priority,
}: MiniBundleCardProps) {
  // Check if bundle has access to 3 levels (sub_category_id >= 3)
  const hasAccessTo3Levels = Number(subCategoryId || 0) >= 2;
  
  // Get free sessions count
  const sessionsCount = Number(freeSessionsCount || 0);
  const hasFreeSessions = sessionsCount > 0;
  
  // Define features with dynamic data
  const features = [
    { 
      text: "الوصول إلى 3 مستويات", 
      available: hasAccessTo3Levels 
    },
    { 
      text: hasFreeSessions 
        ? `${sessionsCount} استشارات مجانية`
        : "استشارات مجانية",
      available: hasFreeSessions 
    },
    { 
      text: "لايفات اسبوعية", 
      available: true // دائماً صح
    },
  ];
  return (
    <Link
      href={`/academy/bundle/${id}`}
      prefetch
      className="block group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl"
    >
      <motion.div {...cardHoverVariant}>
        <div
          className={cn(
            componentVariants.card.base,
            componentVariants.card.elevated,
            componentVariants.card.interactive,
            "relative overflow-hidden rounded-2xl backdrop-blur-sm p-5 flex flex-col h-full",
            "hover:border-blue-500/30",
          )}
          style={{ minHeight: '320px', maxHeight: '320px' }}
        >
          {/* Header: Image + Title + Price */}
          <div className="flex items-start gap-3 mb-4" dir="rtl">
            {/* Circular Image */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-200">
              <Image
                src={img || "/11.png"}
                alt={title}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            
            {/* Title + Price */}
            <div className="flex-1 text-right min-w-0">
              <h3
                className="text-sm font-bold mb-1.5 line-clamp-2"
                style={{ color: colors.text.primary, fontFamily: 'var(--font-arabic)' }}
                title={title}
              >
                {title}
              </h3>
              <p className="text-blue-500 text-base font-bold">
                ${formatPrice(price)}
              </p>
            </div>
          </div>

          {/* Description */}
          <p
            className="text-[11px] leading-relaxed text-right mb-4 line-clamp-3"
            style={{ color: colors.text.secondary, fontFamily: 'var(--font-arabic)' }}
            dir="rtl"
          >
            {(desc || "").replace(/\\r\\n/g, " ")}
          </p>

          {/* Features List */}
          <div className="space-y-2 mb-4 flex-grow">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 text-xs" 
                dir="rtl" 
                style={{ color: colors.text.secondary, fontFamily: 'var(--font-arabic)' }}
              >
                {feature.available ? (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="text-white" size={12} aria-hidden="true" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <X className="text-white" size={12} aria-hidden="true" />
                  </div>
                )}
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 font-semibold text-sm transition-colors mt-auto"
            style={{ fontFamily: 'var(--font-arabic)' }}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/academy/bundle/${id}`;
            }}
          >
            <RefreshCw size={16} aria-hidden="true" />
            <span>${formatPrice(price)}</span>
          </button>
        </div>
      </motion.div>
    </Link>
  );
});
