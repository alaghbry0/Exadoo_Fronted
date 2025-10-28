import { colors } from "./colors";
import { withAlpha } from "./helpers";

export const gradients = {
  brand: {
    primary: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.primaryHover} 100%)`,
    primaryHover: `linear-gradient(135deg, ${colors.brand.primaryHover} 0%, ${colors.brand.primaryActive} 100%)`,
    primaryActive: `linear-gradient(135deg, ${colors.brand.primaryActive} 0%, ${colors.brand.primaryHover} 100%)`,
    secondary: `linear-gradient(135deg, ${colors.brand.secondary} 0%, ${colors.brand.secondaryHover} 100%)`,
    subtle: `linear-gradient(135deg, ${withAlpha(colors.brand.primary, 0.08)} 0%, ${withAlpha(colors.brand.primary, 0.02)} 100%)`,
  },
  surface: {
    elevated: `linear-gradient(135deg, ${colors.bg.primary} 0%, ${colors.bg.secondary} 100%)`,
    neutral: `linear-gradient(135deg, ${colors.bg.secondary} 0%, ${colors.bg.tertiary} 100%)`,
  },
  status: {
    success: `linear-gradient(135deg, ${colors.status.success} 0%, ${withAlpha(colors.status.success, 0.85)} 100%)`,
    warning: `linear-gradient(135deg, ${colors.status.warning} 0%, ${withAlpha(colors.status.warning, 0.85)} 100%)`,
    info: `linear-gradient(135deg, ${colors.status.info} 0%, ${withAlpha(colors.status.info, 0.85)} 100%)`,
  },
  overlays: {
    darkTop: `linear-gradient(180deg, ${withAlpha(colors.bg.overlay, 0.75)} 0%, transparent 70%)`,
    darkBottom: `linear-gradient(0deg, ${withAlpha(colors.bg.overlay, 0.75)} 0%, transparent 70%)`,
    darkInward: `linear-gradient(135deg, ${withAlpha(colors.bg.overlay, 0.25)} 0%, transparent 100%)`,
    lightSheen: `linear-gradient(90deg, transparent 0%, ${withAlpha(colors.bg.inverse, 0.18)} 45%, transparent 90%)`,
  },
  accent: {
    amber: `linear-gradient(135deg, ${colors.status.warning} 0%, ${withAlpha(colors.status.warning, 0.9)} 100%)`,
  },
  text: {
    brand: `linear-gradient(135deg, ${colors.brand.primary} 0%, ${colors.brand.primaryHover} 100%)`,
  },
} as const;

export type GradientGroup = keyof typeof gradients;
