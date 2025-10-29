import { cn } from "@/shared/utils";
import {
  colors,
  componentRadius,
  gradients,
  shadowClasses,
  withAlpha,
} from "@/styles/tokens";

export const academyCardClassNames = {
  base: cn(
    "flex flex-col overflow-hidden transition-transform duration-300",
    componentRadius.card,
  ),
  interactive: cn(
    "flex flex-col overflow-hidden transition-transform duration-300",
    componentRadius.card,
    shadowClasses.cardInteractive,
  ),
};

export const academyCardTokens = {
  surface: {
    background: colors.bg.elevated,
    border: colors.border.default,
    focusRing: colors.border.focus,
  },
  overlay: {
    image: gradients.overlays.darkBottom,
    accent: gradients.overlays.darkInward,
  },
  media: {
    ring: withAlpha(colors.brand.primary, 0.18),
  },
  badge: {
    background: withAlpha(colors.bg.inverse, 0.72),
    foreground: colors.text.inverse,
  },
  title: colors.text.primary,
  subtitle: colors.text.secondary,
  price: colors.text.primary,
  meta: colors.text.secondary,
  rating: {
    active: colors.status.warning,
    inactive: colors.text.disabled,
  },
  features: {
    text: colors.text.secondary,
    available: colors.status.success,
    unavailable: colors.status.error,
  },
} as const;

export const academySectionTokens = {
  badge: {
    background: withAlpha(colors.brand.primary, 0.12),
    foreground: colors.brand.primary,
  },
  title: colors.text.primary,
  subtitle: colors.text.secondary,
  focusRing: colors.border.focus,
  icon: {
    background: withAlpha(colors.brand.primary, 0.14),
    foreground: colors.brand.primary,
  },
} as const;
