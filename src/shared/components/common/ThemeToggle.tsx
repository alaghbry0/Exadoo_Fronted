"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/shared/utils";
import {
  colors,
  componentRadius,
  semanticSpacing,
  shadowClasses,
  withAlpha,
} from "@/styles/tokens";

import {
  type ThemePreference,
  useThemeController,
} from "@/shared/theme/ThemeProvider";

type ThemeToggleProps = {
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  showStatusText?: boolean;
  className?: string;
};

type ThemeOption = {
  value: ThemePreference;
  label: string;
  description: string;
  icon: typeof Sun;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "الوضع الفاتح",
    description: "استخدم الوضع الفاتح مع خلفيات ساطعة ونص داكن.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "الوضع الداكن",
    description: "استخدم الوضع الداكن لتجربة مريحة في الإضاءة المنخفضة.",
    icon: Moon,
  },
  {
    value: "system",
    label: "مطابق للنظام",
    description: "يتبع إعداد الثيم في النظام تلقائياً.",
    icon: Monitor,
  },
];

export default function ThemeToggle({
  orientation = "horizontal",
  showLabels = false,
  showStatusText = true,
  className,
}: ThemeToggleProps) {
  const {
    isMounted,
    theme,
    currentTheme,
    setTheme,
  } = useThemeController();

  const selectedValue = useMemo<ThemePreference>(() => {
    if (!isMounted) {
      return "system";
    }

    return (theme ?? "system") as ThemePreference;
  }, [isMounted, theme]);

  const selectedOption = THEME_OPTIONS.find(
    (option) => option.value === selectedValue,
  );

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-2">
      <div
        role="radiogroup"
        aria-label="تغيير وضع الثيم"
        className={cn(
          "relative inline-flex border",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          "items-center justify-center",
          componentRadius.dropdown,
          shadowClasses.button,
          className,
        )}
        style={{
          backgroundColor: withAlpha(colors.bg.secondary, 0.72),
          borderColor: withAlpha(colors.border.default, 0.6),
          gap: semanticSpacing.component.xs,
          padding: semanticSpacing.component.xs,
        }}
      >
        {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => {
          const isSelected = selectedValue === value;
          const isCurrent =
            value !== "system" && currentTheme === value && theme !== "system";
          const descriptionId = `theme-toggle-${value}-description`;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-current={isSelected ? "true" : undefined}
              aria-label={label}
              aria-describedby={descriptionId}
              data-state={isSelected ? "active" : "inactive"}
              data-theme-value={value}
              className={cn(
                "flex items-center justify-center text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                `focus-visible:ring-[${colors.border.focus}]`,
                `focus-visible:ring-offset-[${colors.bg.primary}]`,
                componentRadius.badge,
                showLabels
                  ? "gap-2 px-4 py-2"
                  : orientation === "horizontal"
                    ? "h-10 w-10"
                    : "px-3 py-2",
              )}
              style={{
                backgroundColor: isSelected
                  ? colors.brand.primary
                  : withAlpha(colors.bg.primary, 0.96),
                border: `1px solid ${
                  isSelected
                    ? colors.brand.primary
                    : withAlpha(colors.border.default, 0.7)
                }`,
                color: isSelected ? colors.text.inverse : colors.text.primary,
              }}
              onClick={() => setTheme(value)}
            >
              <Icon
                className="h-5 w-5"
                aria-hidden="true"
                style={{
                  color: isSelected
                    ? colors.text.inverse
                    : colors.text.primary,
                }}
              />
              {showLabels && (
                <span className="flex flex-col items-start text-xs sm:text-sm">
                  <span>{label}</span>
                  <span
                    className="text-[0.7rem] opacity-80"
                    style={{ color: colors.text.secondary }}
                  >
                    {isCurrent
                      ? "(الوضع الحالي)"
                      : value === "system"
                        ? "(افتراضي)"
                        : null}
                  </span>
                </span>
              )}
              {!showLabels && (
                <span className="sr-only">
                  {label}
                  {isSelected ? " - مفعل" : ""}
                </span>
              )}
              <span id={descriptionId} className="sr-only">
                {description}
              </span>
            </button>
          );
        })}
      </div>

      <span
        aria-live="polite"
        className={cn(showStatusText ? "text-xs" : "sr-only")}
        style={
          showStatusText
            ? { color: colors.text.secondary }
            : undefined
        }
      >
        {selectedOption?.label ?? "مطابق للنظام"}
      </span>
    </div>
  );
}
