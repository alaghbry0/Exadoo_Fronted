// src/pages/academy/bundle/components/TitleMetaBundle.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, Gift, MessageSquare, Layers, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors, spacing } from "@/styles/tokens";

interface Bundle {
  id: string;
  title: string;
  price: string;
  free_sessions_count?: string;
  telegram_url?: string;
}

interface TitleMetaBundleProps {
  bundle: Bundle;
  coursesCount: number;
  onCTA: () => void;
}

const formatPrice = (value?: string) => {
  if (!value) return "";
  if (value.toLowerCase?.() === "free") return "مجاني";
  const n = Number(value);
  return isNaN(n) ? value : `$${n.toFixed(0)}`;
};

export const TitleMetaBundle: React.FC<TitleMetaBundleProps> = ({
  bundle,
  coursesCount,
  onCTA,
}) => {
  const isFree =
    bundle.price?.toLowerCase?.() === "free" || Number(bundle.price) === 0;
  const hasPrice = !!bundle.price;
  const buttonText = isFree
    ? "ابدأ الآن"
    : `اشترك - ${formatPrice(bundle.price)}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto -mt-10 md:-mt-12 max-w-6xl"
      style={{ padding: `0 ${spacing[5]}` }}
    >
      <div
        className={cn("rounded-2xl md:rounded-3xl backdrop-blur-xl")}
        style={{
          backgroundColor: `${colors.bg.elevated}CC`,
          border: `1px solid ${colors.border.default}B0`,
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.25)",
          padding: `${spacing[5]} ${spacing[6]} ${spacing[8]}`,
        }}
      >
        {/* Badges */}
        <div
          className="mb-2 flex flex-wrap items-center"
          style={{ gap: spacing[3] }}
        >
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold"
            style={{
              backgroundColor: `${colors.status.warning}E6`,
              color: colors.text.inverse,
              gap: spacing[2],
            }}
          >
            <Award className="h-4 w-4" />
            حزمة تعليمية متكاملة
          </span>
          {parseInt(bundle.free_sessions_count || "0") > 0 && (
            <span
              className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                backgroundColor: `${colors.status.success}E6`,
                color: colors.text.inverse,
                gap: spacing[2],
              }}
            >
              <Gift className="h-4 w-4" />
              جلسات خاصة: {bundle.free_sessions_count}
            </span>
          )}
          {bundle.telegram_url?.trim() && (
            <span
              className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                backgroundColor: `${colors.brand.primary}E6`,
                color: colors.text.inverse,
                gap: spacing[2],
              }}
            >
              <MessageSquare className="h-4 w-4" />
              مجموعة تيليجرام
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
          style={{ color: colors.text.primary }}
        >
          {bundle.title}
        </h1>

        {/* Meta chips */}
        <div
          className="mt-3 flex flex-wrap items-center text-xs sm:text-sm"
          style={{ gap: spacing[3] }}
        >
          <span
            className="inline-flex items-center rounded-lg border px-3 py-1 font-semibold"
            style={{
              borderColor: colors.border.default,
              backgroundColor: colors.bg.secondary,
              color: colors.text.primary,
              gap: spacing[2],
            }}
          >
            <Layers className="h-4 w-4" />
            {coursesCount} دورات تدريبية
          </span>
        </div>

        {/* CTA Row */}
        {hasPrice && (
          <div
            className="mt-4 flex flex-wrap items-center"
            style={{ gap: spacing[4] }}
          >
            <button
              onClick={onCTA}
              className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-colors"
              style={{
                backgroundColor: colors.brand.primary,
                color: colors.text.inverse,
                padding: `${spacing[3]} ${spacing[5]}`,
                gap: spacing[2],
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.brand.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.brand.primary;
              }}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{buttonText}</span>
            </button>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default TitleMetaBundle;
