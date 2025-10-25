/**
 * Mini Course Card
 * بطاقة دورة تعليمية مصغرة
 */

import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SmartImage from "@/shared/components/common/SmartImage";
import { LevelBadge } from "./LevelBadge";
import { formatPrice } from "../utils/helpers";
import { colors } from "@/styles/tokens";

interface MiniCourseCardProps {
  id: string;
  title: string;
  desc: string;
  price: string;
  lessons: number;
  level?: string;
  img?: string;
  free?: boolean;
  priority?: boolean;
}

export const MiniCourseCard: React.FC<MiniCourseCardProps> = ({
  id,
  title,
  desc,
  price,
  lessons,
  level,
  img,
  free,
  priority,
}) => {
  const router = useRouter();
  const prefetch = useCallback(
    () => router.prefetch(`/academy/course/${id}`),
    [router, id],
  );

  return (
    <Link
      href={`/academy/course/${id}`}
      prefetch={false}
      onMouseEnter={prefetch}
      onTouchStart={prefetch}
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2"
      aria-label={`فتح دورة ${title}`}
    >
      <Card
        className="group relative h-full overflow-hidden rounded-3xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        style={{
          background: colors.bg.primary,
          borderColor: colors.border.default,
          borderWidth: "1px",
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden">
          <SmartImage
            src={img || "/image.jpg"}
            alt={title}
            fill
            blurType="secondary"
            sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 60vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={!!priority}
            lazy={!priority}
            loaderType="skeleton"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />

          {/* Free Badge */}
          {free && (
            <div className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 rounded-full bg-emerald-500/95 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm">
              مجاني
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3 sm:p-4">
          <h3
            className="mb-1.5 sm:mb-2 line-clamp-1 text-sm sm:text-[15px] font-bold"
            style={{ color: colors.text.primary }}
          >
            {title}
          </h3>

          <p
            className="mb-3 line-clamp-2 text-[13px] sm:text-sm leading-relaxed"
            style={{ color: colors.text.secondary }}
          >
            {desc}
          </p>

          {/* Footer */}
          <div
            className="flex items-center justify-between gap-2.5 sm:gap-3 border-t pt-2.5 sm:pt-3"
            style={{ borderColor: colors.border.default }}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-[12px]">
              <span
                className="flex items-center gap-1"
                style={{ color: colors.text.secondary }}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span className="font-medium">{lessons}</span>
              </span>
              <LevelBadge level={level} />
            </div>

            <span className="text-sm sm:text-[15px] font-extrabold text-primary-600 dark:text-primary-400">
              {free ? "مجاني" : formatPrice(price)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
