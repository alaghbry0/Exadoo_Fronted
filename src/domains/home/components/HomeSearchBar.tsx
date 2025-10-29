// src/features/home/components/HomeSearchBar.tsx
"use client";

import type { CSSProperties } from "react";
import { Search } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils";
import {
  colors,
  radius,
  semanticSpacing,
  shadows,
  withAlpha,
  fontFamily,
} from "@/styles/tokens";

interface HomeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  containerClassName?: string;
  containerStyle?: CSSProperties;
}

export function HomeSearchBar({
  value,
  onChange,
  placeholder = "Enter the search word",
  ariaLabel = "بحث في الخدمات",
  containerClassName,
  containerStyle,
}: HomeSearchBarProps) {
  const inputStyles: CSSProperties & Record<string, string | number> = {
    backgroundColor: colors.bg.primary,
    borderRadius: radius["2xl"],
    fontFamily: fontFamily.arabic,
    color: colors.text.primary,
    "--placeholder-color": colors.text.tertiary,
    "--focus-ring-color": colors.border.focus,
  };

  return (
    <div
      className={cn("px-4", containerClassName)}
      style={{
        backgroundColor: colors.bg.secondary,
        paddingTop: semanticSpacing.component.xl,
        paddingBottom: semanticSpacing.component.xl,
        ...containerStyle,
      }}
    >
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2"
          style={{ color: colors.text.tertiary }}
          size={22}
          aria-hidden
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="h-14 w-full pl-12 pr-4 py-0 text-base font-normal"
          style={{
            ...inputStyles,
            boxShadow: shadows.elevation[2],
            borderColor: withAlpha(colors.border.default, 0.9),
          }}
        />
      </div>
    </div>
  );
}
