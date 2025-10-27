import { Fragment } from "react";
import {
  colors,
  spacing,
  radius,
  componentRadius,
  shadowClasses,
} from "@/styles/tokens";
import { cn } from "@/shared/utils";
import type {
  Accent,
  AccentTheme,
  IconConfig,
  Variant,
  VariantTheme,
} from "./types";
import type { CSSProperties } from "react";

export const iconSizes: Record<Accent | "default", IconConfig> = {
  default: { size: 24, dimension: spacing[12], padding: spacing[4] },
  primary: { size: 24, dimension: spacing[12], padding: spacing[4] },
  secondary: { size: 24, dimension: spacing[12], padding: spacing[4] },
  success: { size: 24, dimension: spacing[12], padding: spacing[4] },
};

export const accentThemes: Record<Accent, AccentTheme> = {
  primary: {
    background: colors.status.infoBg,
    color: colors.brand.primary,
  },
  secondary: {
    background: colors.bg.secondary,
    color: colors.brand.secondary,
  },
  success: {
    background: colors.status.successBg,
    color: colors.status.success,
  },
};

const baseCardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  display: "block",
};

export const variantThemes: Record<Variant, VariantTheme> = {
  minimal: {
    container: {
      ...baseCardStyle,
      backgroundColor: colors.bg.primary,
      border: `1px solid ${colors.border.default}`,
    },
    descriptionColor: colors.text.secondary,
    titleColor: colors.text.primary,
    ctaTone: "primary",
  },
  compact: {
    container: {
      ...baseCardStyle,
      backgroundColor: colors.bg.primary,
      border: `1px solid ${colors.border.default}`,
    },
    descriptionColor: colors.text.secondary,
    titleColor: colors.text.primary,
    ctaTone: "primary",
  },
  glass: {
    container: {
      ...baseCardStyle,
      backgroundColor: `${colors.bg.elevated}CC`,
      border: `1px solid ${colors.border.hover}`,
      backdropFilter: "blur(24px)",
    },
    overlay: (
      <Fragment>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: `-${spacing[16]}`,
            right: `-${spacing[16]}`,
            width: spacing[32],
            height: spacing[32],
            borderRadius: radius["4xl"],
            backgroundColor: colors.brand.primary,
            opacity: 0.12,
            filter: "blur(48px)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: `-${spacing[16]}`,
            left: `-${spacing[16]}`,
            width: spacing[32],
            height: spacing[32],
            borderRadius: radius["4xl"],
            backgroundColor: colors.brand.secondary,
            opacity: 0.12,
            filter: "blur(48px)",
          }}
        />
      </Fragment>
    ),
    descriptionColor: colors.text.secondary,
    titleColor: colors.text.primary,
    ctaTone: "primary",
  },
  dark: {
    container: {
      ...baseCardStyle,
      backgroundImage: `linear-gradient(135deg, ${colors.bg.inverse}, ${colors.bg.secondary})`,
      border: `1px solid ${colors.border.hover}`,
      color: colors.text.inverse,
    },
    overlay: (
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 55%)",
        }}
      />
    ),
    descriptionColor: colors.text.secondary,
    titleColor: colors.text.inverse,
    ctaTone: "light",
  },
  split: {
    container: {
      ...baseCardStyle,
      backgroundColor: colors.bg.primary,
      border: `1px solid ${colors.border.default}`,
    },
    descriptionColor: colors.text.secondary,
    titleColor: colors.text.primary,
    ctaTone: "primary",
  },
};

export const cardClasses = cn(componentRadius.card, shadowClasses.cardInteractive);
