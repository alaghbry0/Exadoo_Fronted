import type { CSSProperties } from "react";
import {
  colors,
  gradients,
  radius,
  semanticSpacing,
  shadows,
  withAlpha,
} from "@/styles/tokens";

export type ProfileStatusType = "نشط" | "منتهي" | "unknown";

const chipBackground = withAlpha(colors.bg.primary, 0.16);
const chipShadow = shadows.elevation[3];
const chipText = colors.text.inverse;
const chipTextStrong = withAlpha(chipText, 0.92);
const chipTextMuted = withAlpha(chipText, 0.85);
const chipTextSoft = withAlpha(chipText, 0.82);
const chipIcon = withAlpha(chipText, 0.7);
const avatarBackground = withAlpha(colors.bg.inverse, 0.4);
const avatarBorderColor = withAlpha(colors.text.inverse, 0.75);

export const profileHeaderRootStyle: CSSProperties = Object.freeze({
  "--profile-header-gradient": gradients.brand.primary,
  "--profile-header-overlay": gradients.effects.neutralSheen,
  "--profile-header-overlay-opacity": 0.4,
  "--profile-header-radius": radius["3xl"],
  "--profile-header-text-color": colors.text.inverse,
  "--profile-header-padding-inline": semanticSpacing.layout.sm,
  "--profile-header-padding-block-start": semanticSpacing.section.sm,
  "--profile-header-padding-block-end": semanticSpacing.section.sm,
  "--profile-header-inner-padding-inline": semanticSpacing.layout.sm,
  "--profile-header-inner-padding-block-start": semanticSpacing.component.sm,
  "--profile-space-xs": semanticSpacing.component.xs,
  "--profile-space-sm": semanticSpacing.component.sm,
  "--profile-space-md": semanticSpacing.component.md,
  "--profile-chip-padding-inline": semanticSpacing.component.lg,
  "--profile-chip-padding-block": semanticSpacing.component.xs,
  "--profile-chip-background": chipBackground,
  "--profile-chip-shadow": chipShadow,
  "--profile-chip-text": chipText,
  "--profile-chip-text-strong": chipTextStrong,
  "--profile-chip-text-muted": chipTextMuted,
  "--profile-chip-text-soft": chipTextSoft,
  "--profile-chip-icon": chipIcon,
  "--profile-avatar-bg": avatarBackground,
  "--profile-avatar-border-width": "4px",
  "--profile-avatar-border-color": avatarBorderColor,
  "--profile-avatar-shadow": shadows.elevation[4],
  "--profile-ring-color": colors.border.focus,
  "--profile-ring-offset-color": colors.bg.primary,
  "--profile-brand-primary": colors.brand.primary,
  background: "var(--profile-header-gradient)",
  borderRadius: "var(--profile-header-radius)",
  color: "var(--profile-header-text-color)",
});

export const profileHeaderOverlayStyle: CSSProperties = Object.freeze({
  background: "var(--profile-header-overlay)",
  opacity: "var(--profile-header-overlay-opacity)",
});

export const profileHeaderContentStyle: CSSProperties = Object.freeze({
  paddingInline: "var(--profile-header-padding-inline)",
  paddingBlockStart: "var(--profile-header-padding-block-start)",
  paddingBlockEnd: "var(--profile-header-padding-block-end)",
});

export const profileHeaderInnerStyle: CSSProperties = Object.freeze({
  paddingInline: "var(--profile-header-inner-padding-inline)",
  paddingBlockStart: "var(--profile-header-inner-padding-block-start)",
});

export const profileHeaderStackStyle: CSSProperties = Object.freeze({
  marginTop: "var(--profile-space-md)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--profile-space-sm)",
});

const subscriptionCardBackground = withAlpha(colors.bg.elevated, 0.75);
const subscriptionCardBorder = withAlpha(colors.border.default, 0.85);
const subscriptionItemBackground = withAlpha(colors.bg.elevated, 0.92);
const subscriptionItemBorder = withAlpha(colors.border.default, 0.85);
const subscriptionLinkBackground = withAlpha(colors.bg.secondary, 0.65);
const subscriptionLinkBorder = withAlpha(colors.border.default, 0.8);
const subscriptionProgressTrack = withAlpha(colors.bg.secondary, 0.55);
const subscriptionToggleBorder = withAlpha(colors.border.default, 0.6);
const subscriptionToggleBackground = withAlpha(colors.bg.secondary, 0.18);
const subscriptionToggleBackgroundActive = withAlpha(colors.bg.secondary, 0.32);
const subscriptionToggleHover = withAlpha(colors.bg.secondary, 0.35);
const subscriptionDivider = withAlpha(colors.border.default, 0.75);
const subscriptionEmptyBackground = withAlpha(colors.bg.secondary, 0.6);
const subscriptionEmptyBorder = withAlpha(colors.border.default, 0.75);
const supportBadgeBackground = withAlpha(colors.brand.primary, 0.18);

export const profileSubscriptionRootStyle: CSSProperties = Object.freeze({
  "--profile-subscription-card-bg": subscriptionCardBackground,
  "--profile-subscription-card-border": subscriptionCardBorder,
  "--profile-subscription-item-bg": subscriptionItemBackground,
  "--profile-subscription-item-border": subscriptionItemBorder,
  "--profile-subscription-icon-bg": withAlpha(colors.brand.primary, 0.12),
  "--profile-subscription-icon-shadow": shadows.elevation[3],
  "--profile-subscription-icon-color": colors.brand.primary,
  "--profile-brand-primary": colors.brand.primary,
  "--profile-brand-gradient": gradients.brand.primary,
  "--profile-text-primary": colors.text.primary,
  "--profile-text-secondary": colors.text.secondary,
  "--profile-text-inverse": colors.text.inverse,
  "--profile-subscription-progress-track": subscriptionProgressTrack,
  "--profile-subscription-toggle-border": subscriptionToggleBorder,
  "--profile-subscription-toggle-bg": subscriptionToggleBackground,
  "--profile-subscription-toggle-bg-active": subscriptionToggleBackgroundActive,
  "--profile-subscription-toggle-hover": subscriptionToggleHover,
  "--profile-subscription-link-bg": subscriptionLinkBackground,
  "--profile-subscription-link-border": subscriptionLinkBorder,
  "--profile-subscription-link-icon": colors.text.tertiary,
  "--profile-subscription-link-icon-hover": colors.brand.primary,
  "--profile-subscription-divider": subscriptionDivider,
  "--profile-subscription-support-badge-bg": supportBadgeBackground,
  "--profile-subscription-support-badge-color": colors.brand.primary,
  "--profile-subscription-join-gradient": gradients.status.success,
  "--profile-subscription-join-text": colors.text.inverse,
  "--profile-subscription-primary-cta-gradient": gradients.brand.primary,
  "--profile-subscription-empty-bg": subscriptionEmptyBackground,
  "--profile-subscription-empty-border": subscriptionEmptyBorder,
  "--profile-subscription-empty-icon-gradient": gradients.brand.primary,
  "--profile-subscription-empty-icon-shadow": shadows.elevation[4],
  "--profile-subscription-empty-icon-color": colors.text.inverse,
  backgroundColor: "var(--profile-subscription-card-bg)",
  borderColor: "var(--profile-subscription-card-border)",
});

export const profileLinkCardStyle: CSSProperties = Object.freeze({
  background: "var(--profile-subscription-link-bg)",
  borderColor: "var(--profile-subscription-link-border)",
  color: "var(--profile-text-primary)",
  "--link-card-icon-color": "var(--profile-subscription-link-icon)",
  "--link-card-icon-hover": "var(--profile-subscription-link-icon-hover)",
});

export const profileStatusTokens: Record<
  ProfileStatusType,
  { background: string; color: string; border: string; progress: string }
> = Object.freeze({
  نشط: {
    background: withAlpha(colors.status.success, 0.16),
    color: colors.status.success,
    border: withAlpha(colors.status.success, 0.35),
    progress: colors.brand.primary,
  },
  منتهي: {
    background: withAlpha(colors.status.warning, 0.18),
    color: colors.status.warning,
    border: withAlpha(colors.status.warning, 0.35),
    progress: colors.status.warning,
  },
  unknown: {
    background: subscriptionEmptyBackground,
    color: colors.text.secondary,
    border: withAlpha(colors.border.default, 0.9),
    progress: colors.status.warning,
  },
});

export const getProfileStatusTheme = (status: ProfileStatusType) =>
  profileStatusTokens[status] ?? profileStatusTokens.unknown;
