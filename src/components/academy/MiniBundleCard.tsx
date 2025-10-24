// src/components/academy/MiniBundleCard.tsx
import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { componentVariants } from "@/components/ui/variants";
import SmartImage from "@/shared/components/common/SmartImage";
import { cardHoverVariant } from "./animation-variants";
import { colors, spacing } from "@/styles/tokens";

interface MiniBundleCardProps {
  id: string;
  title: string;
  desc: string;
  price: string;
  img?: string;
  variant?: "default" | "highlight";
  priority?: boolean;
}

const formatPrice = (value?: string) => {
  if (!value) return "";
  if (value.toLowerCase?.() === "free") return "مجاني";
  const n = Number(value);
  return isNaN(n) ? value : `$${n.toFixed(0)}`;
};

export const MiniBundleCard = memo(function MiniBundleCard({
  id,
  title,
  desc,
  price,
  img,
  variant = "default",
  priority,
}: MiniBundleCardProps) {
  return (
    <Link
      href={`/academy/bundle/${id}`}
      prefetch
      className="block h-full group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-3xl"
    >
      <motion.div {...cardHoverVariant}>
        <div
          className={cn(
            componentVariants.card.base,
            componentVariants.card.elevated,
            componentVariants.card.interactive,
            "relative h-full overflow-hidden rounded-3xl backdrop-blur-sm",
            variant === "highlight"
              ? "border-purple-400/30 hover:border-purple-500/50"
              : "hover:border-blue-500/30",
          )}
        >
          {/* Image Section */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden">
            <SmartImage
              src={img || "/image.jpg"}
              alt={title}
              fill
              blurType="secondary"
              sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 60vw"
              priority={!!priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ borderRadius: "0 0 0rem 0rem" }}
              noFade
              disableSkeleton
              eager
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {variant === "highlight" && (
              <div className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 flex items-center gap-1.5 rounded-full bg-purple-600/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-white shadow-lg shadow-purple-500/30 backdrop-blur-sm">
                <Award className="h-3.5 w-3.5" />
                <span className="text-[10px] sm:text-xs font-semibold">
                  حزمة مميزة
                </span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div
            className="p-3 sm:p-4 flex flex-col flex-grow"
            style={{ gap: spacing[2] }}
          >
            <h3
              className="line-clamp-1 text-sm sm:text-base font-bold mb-1.5 sm:mb-2"
              style={{ color: colors.text.primary }}
            >
              {title}
            </h3>
            <p
              className="line-clamp-2 text-[13px] sm:text-sm leading-relaxed text-balance mb-3 sm:mb-4 flex-grow"
              style={{ color: colors.text.secondary }}
            >
              {(desc || "").replace(/\\r\\n/g, " ")}
            </p>
            <div
              className="flex items-center justify-between pt-2.5 sm:pt-3 mt-auto"
              style={{ 
                borderTop: `1px solid ${colors.border.default}`,
                paddingTop: spacing[3]
              }}
            >
              <span
                className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium"
                style={{ color: colors.text.secondary }}
              >
                <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>حزمة تعليمية</span>
              </span>
              <span className="text-sm sm:text-base font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">
                {formatPrice(price)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
