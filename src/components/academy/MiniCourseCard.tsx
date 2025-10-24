// src/components/academy/MiniCourseCard.tsx
import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Star, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { componentVariants } from "@/components/ui/variants";
import SmartImage from "@/shared/components/common/SmartImage";
import { LevelBadge } from "./LevelBadge";
import { cardHoverVariant } from "./animation-variants";
import { colors, spacing } from "@/styles/tokens";

interface CourseItem {
  level?: "beginner" | "intermediate" | "advanced" | string;
}

interface MiniCourseCardProps {
  id: string;
  title: string;
  desc: string;
  price: string;
  lessons: number;
  level?: CourseItem["level"];
  img?: string;
  free?: boolean;
  variant?: "default" | "highlight" | "top";
  priority?: boolean;
}

const formatPrice = (value?: string) => {
  if (!value) return "";
  if (value.toLowerCase?.() === "free") return "مجاني";
  const n = Number(value);
  return isNaN(n) ? value : `$${n.toFixed(0)}`;
};

export const MiniCourseCard = memo(function MiniCourseCard({
  id,
  title,
  desc,
  price,
  lessons,
  level,
  img,
  free,
  variant = "default",
  priority,
}: MiniCourseCardProps) {
  const borderVariant =
    variant === "highlight"
      ? "border-amber-400/30 hover:border-amber-500/50"
      : variant === "top"
        ? "border-blue-400/30 hover:border-blue-500/50"
        : "hover:border-blue-500/30";

  return (
    <Link
      href={`/academy/course/${id}`}
      prefetch
      className="block h-full group outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-3xl"
    >
      <motion.div {...cardHoverVariant}>
        <div
          className={cn(
            componentVariants.card.base,
            componentVariants.card.elevated,
            componentVariants.card.interactive,
            "relative h-full overflow-hidden rounded-3xl backdrop-blur-sm sm:[&_*]:text-[inherit]",
            borderVariant,
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

            {/* Badges */}
            {variant === "top" && (
              <div className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 flex items-center gap-1.5 rounded-full bg-blue-600/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-white shadow-lg shadow-blue-500/30 backdrop-blur-sm">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] sm:text-xs font-semibold">
                  الأكثر طلباً
                </span>
              </div>
            )}
            {variant === "highlight" && (
              <div className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 flex items-center gap-1.5 rounded-full bg-amber-500/90 px-2 py-0.5 sm:px-2.5 sm:py-1 text-white shadow-lg shadow-amber-500/30 backdrop-blur-sm">
                <Star className="h-3.5 w-3.5" />
                <span className="text-[10px] sm:text-xs font-semibold">
                  مميّز
                </span>
              </div>
            )}
            {free && (
              <div className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 rounded-full bg-emerald-500/90 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 backdrop-blur-sm">
                مجاني
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
              {desc}
            </p>
            <div
              className="flex items-center justify-between gap-2.5 sm:gap-3 pt-2.5 sm:pt-3 mt-auto"
              style={{ 
                borderTop: `1px solid ${colors.border.default}`,
                paddingTop: spacing[3]
              }}
            >
              <div
                className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs"
                style={{ color: colors.text.secondary }}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{lessons} درس</span>
                </span>
                <LevelBadge level={level} />
              </div>
              <span className="text-sm sm:text-base font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500">
                {free ? "مجاني" : formatPrice(price)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
