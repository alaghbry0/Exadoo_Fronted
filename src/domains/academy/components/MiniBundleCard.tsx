/**
 * Mini Bundle Card
 * بطاقة حزمة تعليمية مصغرة
 */

import React from "react";
import Link from "next/link";
import { Check, X, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/shared/utils";
import { componentVariants } from "@/shared/components/ui/variants";
import SmartImage from "@/shared/components/common/SmartImage";
import { formatPrice } from "../utils/helpers";
import { colors, fontFamily } from "@/styles/tokens";

const cardHoverVariant = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2 },
};

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

export const MiniBundleCard: React.FC<MiniBundleCardProps> = ({
  id,
  title,
  desc,
  price,
  img,
  subCategoryId,
  freeSessionsCount,
  priority,
}) => {
  // Check if bundle has access to 3 levels
  const hasAccessTo3Levels = Number(subCategoryId || 0) >= 2;

  const sessionsCount = Number(freeSessionsCount || 0);
  const hasFreeSessions = sessionsCount > 0;

  // Define features with conditional check
  const features = [
    { text: "الوصول إلى 3 مستويات", available: hasAccessTo3Levels },
    {
      text: hasFreeSessions
        ? `${sessionsCount} استشارات مجانية`
        : "استشارات مجانية",
      available: hasFreeSessions,
    },
    { text: "لايفات اسبوعية", available: true },
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
              <SmartImage
                src={img || "/11.png"}
                alt={title}
                fill
                blurType="secondary"
                className="object-cover"
                sizes="56px"
                priority={!!priority}
                lazy={!priority}
              />
            </div>
            
            {/* Title + Price */}
            <div className="flex-1 text-right min-w-0">
              <h3
                className="text-sm font-bold mb-1.5 line-clamp-2"
                style={{ color: colors.text.primary, fontFamily: fontFamily.arabic }}
                title={title}
              >
                {title}
              </h3>
              <p className="text-blue-500 text-base font-bold">
                {formatPrice(price)}
              </p>
            </div>
          </div>

          {/* Description */}
          <p
            className="text-[11px] leading-relaxed text-right mb-4 line-clamp-3"
            style={{ color: colors.text.secondary, fontFamily: fontFamily.arabic }}
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
                style={{ color: colors.text.secondary, fontFamily: fontFamily.arabic }}
              >
                {feature.available ? (
                  <Check className="text-green-500 flex-shrink-0" size={16} aria-hidden="true" />
                ) : (
                  <X className="text-red-500 flex-shrink-0" size={16} aria-hidden="true" />
                )}
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 font-semibold text-sm transition-colors mt-auto"
            style={{ fontFamily: fontFamily.arabic }}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/academy/bundle/${id}`;
            }}
          >
            <RefreshCw size={16} aria-hidden="true" />
            <span>{formatPrice(price)}</span>
          </button>
        </div>
      </motion.div>
    </Link>
  );
};
