/**
 * Level Badge Component
 * شارة المستوى التعليمي (مبتدئ، متوسط، متقدم)
 */

import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/styles/tokens";
import type { CourseLevel } from "../types/academy.types";

interface LevelBadgeProps {
  level?: string;
  className?: string;
}

const levelConfig: Record<
  CourseLevel,
  { label: string; bgColor: string; textColor: string }
> = {
  beginner: {
    label: "مبتدئ",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-700 dark:text-emerald-400",
  },
  intermediate: {
    label: "متوسط",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-700 dark:text-amber-400",
  },
  advanced: {
    label: "متقدم",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    textColor: "text-rose-700 dark:text-rose-400",
  },
};

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, className }) => {
  if (!level) return null;

  const config = levelConfig[level as CourseLevel] || levelConfig.beginner;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium",
        config.bgColor,
        config.textColor,
        className,
      )}
    >
      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
      {config.label}
    </span>
  );
};
