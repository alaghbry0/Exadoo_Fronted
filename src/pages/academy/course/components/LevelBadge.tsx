// src/pages/academy/course/components/LevelBadge.tsx
import React from "react";
import type { Course } from "@/domains/academy/types";
import { colors, spacing } from "@/styles/tokens";

export default function LevelBadge({ level }: { level?: Course["level"] }) {
  if (!level) return null;

  const cfg = {
    beginner: {
      label: "مبتدئ",
      bg: `${colors.status.success}0D`,
      text: colors.status.success,
      border: `${colors.status.success}33`,
      icon: "🌱",
    },
    intermediate: {
      label: "متوسط",
      bg: `${colors.status.warning}0D`,
      text: colors.status.warning,
      border: `${colors.status.warning}33`,
      icon: "⚡",
    },
    advanced: {
      label: "متقدم",
      bg: `${colors.status.error}0D`,
      text: colors.status.error,
      border: `${colors.status.error}33`,
      icon: "🚀",
    },
  } as const;

  const levelKey =
    typeof level === "string" && level in cfg
      ? (level as keyof typeof cfg)
      : undefined;

  const c = levelKey
    ? cfg[levelKey]
    : {
        label: String(level),
        bg: colors.bg.secondary,
        text: colors.text.secondary,
        border: colors.border.default,
        icon: "🎯",
      };

  return (
    <span
      className="inline-flex items-center rounded-xl border text-sm font-semibold"
      style={{
        backgroundColor: c.bg,
        color: c.text,
        borderColor: c.border,
        padding: `${spacing[2]} ${spacing[3]}`,
        gap: spacing[2],
      }}
    >
      <span>{c.icon}</span>
      {c.label}
    </span>
  );
}
