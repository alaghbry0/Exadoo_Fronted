// src/components/AcademyHeroCard.tsx
"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  animations,
  colors,
  radius,
  shadowClasses,
  shadows,
  spacing,
} from "@/styles/tokens";

export interface AcademyHeroCardProps {
  className?: string;
}

const overlayStyle: CSSProperties = {
  pointerEvents: "none",
  position: "absolute",
  inset: 0,
  borderRadius: radius["3xl"],
  opacity: 0,
  transition: `opacity ${animations.duration.normal} ${animations.easing.out}`,
  backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${colors.brand.primary} 18%, transparent), transparent)`,
};

const bubbleStyle = (
  align: "top-right" | "bottom-left",
): CSSProperties => ({
  pointerEvents: "none",
  position: "absolute",
  height: "16rem",
  width: "16rem",
  borderRadius: radius.full,
  backgroundColor: colors.brand.primary,
  opacity: 0.12,
  filter: "blur(48px)",
  transition: `transform ${animations.duration.slow} ${animations.easing.out}`,
  ...(align === "top-right"
    ? { top: "-4rem", right: "-4rem", transform: "translate(0, 0)" }
    : { bottom: "-5rem", left: "-5rem", transform: "translate(0, 0)" }),
});

const cardContentStyle: CSSProperties = {
  padding: spacing[8],
  color: colors.text.primary,
  display: "flex",
  flexDirection: "column",
  gap: spacing[6],
};

function AcademyHeroCard({ className }: AcademyHeroCardProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Link
      href="/academy"
      prefetch
      aria-label="الدخول إلى أكاديمية إكسادو"
      className={cn("group block", className)}
      style={{
        borderRadius: radius["3xl"],
        outline: "none",
        boxShadow: isFocused
          ? `0 0 0 4px color-mix(in srgb, ${colors.brand.primary} 45%, transparent)`
          : undefined,
        transition: `box-shadow ${animations.duration.normal} ${animations.easing.out}`,
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <Card
        dir="rtl"
        className={cn(
          shadowClasses.card,
          "relative overflow-hidden transition-transform duration-300 group-hover:-translate-y-1",
        )}
        style={{
          borderRadius: radius["3xl"],
          backgroundColor: colors.bg.elevated,
          border: `1px solid ${colors.border.default}`,
          color: colors.text.primary,
          boxShadow: "none",
        }}
      >
        <div
          className="transition-opacity duration-300 group-hover:opacity-100"
          style={overlayStyle}
        />
        <div
          className="transition-transform duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2"
          style={bubbleStyle("top-right")}
        />
        <div
          className="transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"
          style={{
            ...bubbleStyle("bottom-left"),
            backgroundColor: colors.brand.secondary,
            opacity: 0.12,
          }}
        />

        {/* زيادة المساحة الداخلية للبطاقة */}
        <CardContent className="font-arabic" style={cardContentStyle}>
          <div
            className="relative flex flex-col items-start justify-between md:flex-row md:items-center"
            style={{ gap: spacing[6] }}
          >
            <div className="flex-1">
              <div
                className="flex items-center"
                style={{ gap: spacing[4] }}
              >
                {/* تكبير حجم الأيقونة والمربع المحيط بها */}
                <div
                  className="grid place-items-center transition-transform duration-300 group-hover:scale-110"
                  style={{
                    height: "3.5rem",
                    width: "3.5rem",
                    borderRadius: radius["2xl"],
                    backgroundColor: colors.brand.primary,
                    color: colors.text.inverse,
                    boxShadow: shadows.colored.primary.sm,
                  }}
                >
                  <GraduationCap className="h-7 w-7" aria-hidden="true" />
                </div>
                {/* تحسين العنوان */}
                <h2
                  id="academy-title"
                  className="font-display"
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: colors.text.primary,
                  }}
                >
                  أكاديمية إكسادو: انطلق نحو الاحتراف
                </h2>
              </div>

              {/* اقتراح نص وصفي بديل وأكثر جاذبية */}
              <p
                style={{
                  marginTop: spacing[4],
                  maxWidth: "42rem",
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  color: colors.text.secondary,
                }}
              >
                حوّل معرفتك إلى مهارات حقيقية. ابدأ رحلتك التعليمية مع مسارات
                عملية وشهادات معتمدة.
              </p>

              {/* زيادة المسافة العلوية للرقائق */}
              <div
                style={{
                  marginTop: spacing[4],
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: spacing[3],
                  fontSize: "0.875rem",
                  color: colors.text.tertiary,
                }}
              ></div>
            </div>

            <div className="shrink-0">
              <div
                className={cn(
                  "inline-flex items-center justify-center gap-2 transition-transform duration-300 group-hover:-translate-x-1",
                )}
                role="button"
                aria-hidden="true"
                style={{
                  height: "2.75rem",
                  paddingInline: spacing[6],
                  borderRadius: radius.full,
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: colors.text.inverse,
                  backgroundImage: `linear-gradient(90deg, ${colors.brand.primary}, ${colors.brand.primaryHover})`,
                  boxShadow: "0 10px 25px rgba(0, 132, 255, 0.15)",
                  transition: `box-shadow ${animations.duration.normal} ${animations.easing.out}`,
                }}
              >
                {/* اقتراح نص CTA بديل */}
                <span>ابدأ التعلّم الآن</span>
                <ArrowLeft
                  className="transition-transform duration-300 group-hover:-translate-x-2"
                  style={{ height: "1.25rem", width: "1.25rem" }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default AcademyHeroCard;
