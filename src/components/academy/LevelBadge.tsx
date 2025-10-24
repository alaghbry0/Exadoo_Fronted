// src/components/academy/LevelBadge.tsx
import { memo } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/styles/tokens";

interface LevelBadgeProps {
  level?: "beginner" | "intermediate" | "advanced" | string;
}

export const LevelBadge = memo(({ level }: LevelBadgeProps) => {
  if (!level) return null;

  const levelConfig = {
    beginner: {
      label: "مبتدئ",
      bgColor: "rgba(16, 185, 129, 0.1)",
      textColor: colors.status.success,
    },
    intermediate: {
      label: "متوسط",
      bgColor: "rgba(245, 158, 11, 0.1)",
      textColor: colors.status.warning,
    },
    advanced: {
      label: "متقدم",
      bgColor: "rgba(239, 68, 68, 0.1)",
      textColor: colors.status.error,
    },
  } as const;

  const config = (levelConfig as any)[level] || levelConfig.beginner;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium",
      )}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
      }}
    >
      <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      {config.label}
    </span>
  );
});

LevelBadge.displayName = "LevelBadge";
