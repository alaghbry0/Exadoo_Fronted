// src/components/academy/OngoingCourseCard.tsx
import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { componentVariants } from "@/components/ui/variants";
import SmartImage from "@/shared/components/common/SmartImage";
import { cardHoverVariant } from "./animation-variants";
import { colors, spacing } from "@/styles/tokens";
import { Progress } from "@/components/ui/progress";

interface OngoingCourseCardProps {
  id: string;
  title: string;
  subtitle: string;
  instructor: string;
  lessonsCount: number;
  progress: number;
  imageUrl: string;
  priority?: boolean;
}

export const OngoingCourseCard = memo(function OngoingCourseCard({
  id,
  title,
  subtitle,
  instructor,
  lessonsCount,
  progress,
  imageUrl,
  priority,
}: OngoingCourseCardProps) {
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
            "relative h-full overflow-hidden rounded-3xl backdrop-blur-sm",
          )}
        >
          {/* Image Section */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden">
            <SmartImage
              src={imageUrl || "/image.jpg"}
              alt={title}
              fill
              blurType="secondary"
              sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 80vw"
              priority={!!priority}
              lazy={!priority}
              loaderType="skeleton"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ borderRadius: "0 0 0rem 0rem" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Lessons Badge */}
            <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold backdrop-blur-sm">
              {lessonsCount} lessons
            </div>
          </div>

          {/* Content Section */}
          <div
            className="p-3 sm:p-4 flex flex-col"
            style={{ gap: spacing[2] }}
          >
            <h3
              className="line-clamp-1 text-sm sm:text-base font-bold"
              style={{ color: colors.text.primary }}
            >
              {title} | {subtitle}
            </h3>
            <p
              className="text-xs sm:text-sm mb-2"
              style={{ color: colors.text.secondary }}
            >
              {instructor}
            </p>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className="text-gray-300"
                  fill="none"
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs sm:text-sm text-right" style={{ color: colors.text.secondary }}>
                {progress}% Completed
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});