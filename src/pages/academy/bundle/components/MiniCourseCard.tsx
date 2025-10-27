// src/pages/academy/bundle/components/MiniCourseCard.tsx
"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import SmartImage from "@/shared/components/common/SmartImage";
import { colors, spacing } from "@/styles/tokens";
import { cn } from "@/shared/utils";

interface MiniCourseCardProps {
  id: string;
  title: string;
  desc?: string;
  lessons: number;
  level?: string;
  img?: string;
  free?: boolean;
  price?: string;
  priority?: boolean;
}

const formatPrice = (value?: string) => {
  if (!value) return "";
  if (value.toLowerCase?.() === "free") return "مجاني";
  const n = Number(value);
  return isNaN(n) ? value : `$${n.toFixed(0)}`;
};

export const MiniCourseCard: React.FC<MiniCourseCardProps> = ({
  id,
  title,
  desc,
  lessons,
  level,
  img,
  free,
  price,
  priority,
}) => {
  const router = useRouter();
  const prefetch = useCallback(
    () => router.prefetch(`/academy/course/${id}`),
    [router, id],
  );

  const levelConfig = {
    beginner: { label: "مبتدئ", color: colors.status.success },
    intermediate: { label: "متوسط", color: colors.status.warning },
    advanced: { label: "متقدم", color: colors.status.error },
  };
  const levelInfo = level
    ? levelConfig[level as keyof typeof levelConfig]
    : null;

  return (
    <Link
      href={`/academy/course/${id}`}
      prefetch={false}
      onMouseEnter={prefetch}
      onTouchStart={prefetch}
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ 
        outlineColor: `${colors.brand.primary}80`,
      }}
      aria-label={`فتح دورة ${title}`}
    >
      <Card
        className="group relative h-full overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        style={{
          backgroundColor: colors.bg.elevated,
          borderColor: `${colors.border.default}80`,
        }}
      >
        <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden">
          <SmartImage
            src={img || "/image.jpg"}
            alt={`${title} — ${lessons} درس${level ? ` • ${level}` : ""}`}
            fill
            blurType="secondary"
            sizes="(min-width:1280px) 28vw, (min-width:640px) 45vw, 60vw"
            className="object-cover md:group-hover:scale-105 transition-transform duration-300"
            priority={!!priority}
            lazy={!priority}
            loaderType="skeleton"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          {free && (
            <div
              className="absolute right-2.5 sm:right-3 top-2.5 sm:top-3 rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold text-white shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: `${colors.status.success}F0` }}
            >
              مجاني
            </div>
          )}
        </div>

        <CardContent style={{ padding: `${spacing[4]} ${spacing[5]}` }}>
          <h3
            className="mb-1.5 sm:mb-2 line-clamp-1 text-sm sm:text-[15px] font-bold"
            style={{ color: colors.text.primary }}
          >
            {title}
          </h3>

          {desc && (
            <p
              className="mb-3 line-clamp-2 text-[13px] sm:text-sm leading-relaxed"
              style={{ color: colors.text.secondary }}
            >
              {desc}
            </p>
          )}

          <div
            className="flex items-center justify-between gap-2.5 sm:gap-3 border-t pt-2.5 sm:pt-3"
            style={{
              borderColor: colors.border.default,
              gap: spacing[3],
            }}
          >
            <div
              className="flex items-center gap-2.5 sm:gap-2 text-[11px] sm:text-[12px]"
              style={{ gap: spacing[3] }}
            >
              <BookOpen
                className="h-3.5 w-3.5"
                style={{ color: colors.text.tertiary }}
              />
              <span
                className="font-medium"
                style={{ color: colors.text.secondary }}
              >
                {lessons} درس
              </span>
              {levelInfo && (
                <>
                  <span style={{ color: colors.border.default }}>•</span>
                  <span
                    className="font-medium"
                    style={{ color: levelInfo.color }}
                  >
                    {levelInfo.label}
                  </span>
                </>
              )}
            </div>

            <span
              className="text-sm sm:text-[15px] font-extrabold"
              style={{ color: colors.brand.primary }}
            >
              {free ? "مجاني" : formatPrice(price)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MiniCourseCard;
