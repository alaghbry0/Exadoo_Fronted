import * as React from "react";

import { cn } from "@/shared/utils";
import {
  colors,
  componentRadius,
  gradients,
  shadowClasses,
  withAlpha,
} from "@/styles/tokens";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "success"
  | "outline"
  | "highlight";

type BadgeTokenConfig = {
  background?: string;
  foreground?: string;
  border?: string;
  hoverBackground?: string;
  hoverForeground?: string;
  focusRing?: string;
  focusRingOffset?: string;
  shadow?: string;
};

const badgeTokenMap: Record<BadgeVariant, BadgeTokenConfig> = {
  default: {
    background: colors.brand.primary,
    foreground: colors.text.inverse,
    border: withAlpha(colors.brand.primary, 0.1),
    hoverBackground: colors.brand.primaryHover,
    hoverForeground: colors.text.inverse,
    focusRing: colors.border.focus,
    focusRingOffset: colors.bg.primary,
    shadow: shadowClasses.button,
  },
  secondary: {
    background: colors.bg.secondary,
    foreground: colors.text.primary,
    border: colors.border.default,
    hoverBackground: colors.bg.tertiary,
    hoverForeground: colors.text.primary,
    focusRing: colors.border.focus,
    focusRingOffset: colors.bg.primary,
    shadow: shadowClasses.button,
  },
  destructive: {
    background: colors.status.error,
    foreground: colors.text.inverse,
    border: withAlpha(colors.status.error, 0.2),
    hoverBackground: withAlpha(colors.status.error, 0.9),
    hoverForeground: colors.text.inverse,
    focusRing: colors.status.error,
    focusRingOffset: colors.bg.primary,
    shadow: shadowClasses.button,
  },
  success: {
    background: colors.status.success,
    foreground: colors.text.inverse,
    border: withAlpha(colors.status.success, 0.2),
    hoverBackground: withAlpha(colors.status.success, 0.9),
    hoverForeground: colors.text.inverse,
    focusRing: colors.status.success,
    focusRingOffset: colors.bg.primary,
    shadow: shadowClasses.button,
  },
  outline: {
    background: withAlpha(colors.bg.secondary, 0.3),
    foreground: colors.text.primary,
    border: colors.border.default,
    hoverBackground: colors.bg.secondary,
    hoverForeground: colors.text.primary,
    focusRing: colors.border.focus,
    focusRingOffset: colors.bg.primary,
    shadow: shadowClasses.none,
  },
  highlight: {
    background: gradients.accent.amber,
    foreground: colors.text.inverse,
    border: withAlpha(colors.status.warning, 0.3),
    hoverBackground: gradients.accent.amber,
    hoverForeground: colors.text.inverse,
    focusRing: colors.status.warning,
    focusRingOffset: colors.bg.primary,
    shadow: shadowClasses.buttonElevated,
  },
};

const baseClasses = cn(
  "inline-flex items-center px-2.5 py-0.5 text-xs font-semibold transition-colors",
  "focus-visible:outline-none focus-visible:ring-2",
  componentRadius.badge,
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", style, ...props }, ref) => {
    const tokens = badgeTokenMap[variant] ?? badgeTokenMap.default;

    const classes = cn(
      baseClasses,
      "border",
      tokens.shadow,
      tokens.background && `bg-[${tokens.background}]`,
      tokens.foreground && `text-[${tokens.foreground}]`,
      tokens.border && `border-[${tokens.border}]`,
      tokens.hoverBackground && `hover:bg-[${tokens.hoverBackground}]`,
      tokens.hoverForeground && `hover:text-[${tokens.hoverForeground}]`,
      tokens.focusRing && `focus-visible:ring-[${tokens.focusRing}]`,
      tokens.focusRingOffset &&
        `focus-visible:ring-offset-[${tokens.focusRingOffset}]`,
      className,
    );

    return <div ref={ref} className={classes} style={style} {...props} />;
  },
);

Badge.displayName = "Badge";

export { Badge };
