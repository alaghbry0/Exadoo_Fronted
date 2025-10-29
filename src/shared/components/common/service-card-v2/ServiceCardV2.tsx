"use client";

import Link from "next/link";
import type { CSSProperties, ComponentType } from "react";
import { spacing } from "@/styles/tokens";
import { cn } from "@/shared/utils";
import {
  accentThemes,
  cardClasses,
  iconSizes,
  variantThemes,
} from "./theme";
import {
  InlineCTA,
  IconBadge,
  PrimaryCTA,
  SplitImage,
  StatsChips,
  TitleBlock,
} from "./components";
import type {
  Accent,
  AccentTheme,
  IconConfig,
  IconSize,
  Layout,
  ServiceCardV2Props,
  StatChip,
} from "./types";

export function ServiceCardV2({
  title,
  description,
  icon,
  href,
  accent = "primary",
  badge,
  ctaLabel = "عرض التفاصيل",
  imageUrl,
  stats,
  rightSlot,
  className,
  layout = "half",
  variant = "minimal",
  size = "md",
  prefetch,
}: ServiceCardV2Props) {
  const titleId = `${slugify(title)}-title`;
  const descId = description ? `${slugify(title)}-desc` : undefined;
  const theme = variantThemes[variant];
  const iconTheme = accentThemes[accent];
  const iconSizing = resolveIconSize(accent, size);
  const padding = variant === "compact" ? spacing[5] : spacing[6];

  return (
    <Link
      href={href}
      aria-labelledby={titleId}
      aria-describedby={descId}
      prefetch={prefetch}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <article className={cn(cardClasses, className)} style={theme.container}>
        {theme.overlay}
        {variant === "split" ? (
          <SplitLayout
            title={title}
            description={description}
            titleId={titleId}
            descId={descId}
            icon={icon}
            iconTheme={iconTheme}
            iconSizing={iconSizing}
            stats={stats}
            badge={badge}
            rightSlot={rightSlot}
            ctaLabel={ctaLabel}
            descriptionColor={theme.descriptionColor}
            titleColor={theme.titleColor}
            padding={padding}
            imageUrl={imageUrl}
            ctaTone={theme.ctaTone}
          />
        ) : (
          <StandardLayout
            title={title}
            description={description}
            titleId={titleId}
            descId={descId}
            icon={icon}
            iconTheme={iconTheme}
            iconSizing={iconSizing}
            stats={stats}
            badge={badge}
            rightSlot={rightSlot}
            ctaLabel={ctaLabel}
            descriptionColor={theme.descriptionColor}
            titleColor={theme.titleColor}
            padding={padding}
            layout={layout}
            ctaTone={theme.ctaTone}
          />
        )}
      </article>
    </Link>
  );
}

interface SharedLayoutProps {
  title: string;
  description?: string;
  titleId: string;
  descId?: string;
  icon?: ComponentType<{ size?: number }>;
  iconTheme: AccentTheme;
  iconSizing: IconConfig;
  stats?: StatChip[];
  badge?: string;
  descriptionColor: string;
  titleColor: string;
  padding: string;
}

interface StandardLayoutProps extends SharedLayoutProps {
  layout: Layout;
  rightSlot?: ServiceCardV2Props["rightSlot"];
  ctaLabel: string;
  ctaTone: "primary" | "light";
}

function StandardLayout({
  title,
  description,
  titleId,
  descId,
  icon,
  iconTheme,
  iconSizing,
  stats,
  badge,
  rightSlot,
  ctaLabel,
  descriptionColor,
  titleColor,
  padding,
  layout,
  ctaTone,
}: StandardLayoutProps) {
  const containerStyle: CSSProperties = {
    padding,
    display: "flex",
    flexDirection: "column",
    gap: spacing[4],
  };

  const shouldInlineCTA = layout === "half" && !rightSlot;

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: layout === "wide" ? "flex" : "block",
          alignItems: layout === "wide" ? "flex-start" : undefined,
          justifyContent: layout === "wide" ? "space-between" : undefined,
          gap: spacing[4],
        }}
      >
        <div
          style={{
            display: "flex",
            gap: spacing[4],
            alignItems: "flex-start",
            flex: 1,
            minWidth: 0,
          }}
        >
          <IconBadge icon={icon} theme={iconTheme} sizing={iconSizing} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <TitleBlock
              title={title}
              titleId={titleId}
              badge={badge}
              titleColor={titleColor}
            />
            {description && (
              <p
                id={descId}
                style={{ color: descriptionColor, marginTop: spacing[2] }}
              >
                {description}
              </p>
            )}
            <StatsChips stats={stats} style={{ marginTop: spacing[4] }} />
          </div>
        </div>
        {layout === "wide" && (
          <div style={{ marginLeft: spacing[4], minWidth: "5rem" }}>
            {rightSlot ?? <PrimaryCTA label={ctaLabel} tone={ctaTone} />}
          </div>
        )}
      </div>
      {shouldInlineCTA && <InlineCTA label={ctaLabel} tone={ctaTone} />}
    </div>
  );
}

interface SplitLayoutProps extends SharedLayoutProps {
  rightSlot?: ServiceCardV2Props["rightSlot"];
  ctaLabel: string;
  imageUrl?: string;
  ctaTone: "primary" | "light";
}

function SplitLayout({
  title,
  description,
  titleId,
  descId,
  icon,
  iconTheme,
  iconSizing,
  stats,
  badge,
  rightSlot,
  ctaLabel,
  descriptionColor,
  titleColor,
  padding,
  imageUrl,
  ctaTone,
}: SplitLayoutProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr" }}>
      <div
        style={{
          padding,
          display: "flex",
          flexDirection: "column",
          gap: spacing[4],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: spacing[4],
          }}
        >
          <IconBadge icon={icon} theme={iconTheme} sizing={iconSizing} />
          <div style={{ flex: 1 }}>
            <TitleBlock
              title={title}
              titleId={titleId}
              badge={badge}
              titleColor={titleColor}
            />
            {description && (
              <p
                id={descId}
                style={{ color: descriptionColor, marginTop: spacing[2] }}
              >
                {description}
              </p>
            )}
            <StatsChips stats={stats} style={{ marginTop: spacing[4] }} />
          </div>
        </div>
        <div style={{ marginTop: spacing[5] }}>
          {rightSlot ?? <PrimaryCTA label={ctaLabel} tone={ctaTone} />}
        </div>
      </div>
      <SplitImage imageUrl={imageUrl} />
    </div>
  );
}

function resolveIconSize(accent: Accent, size: IconSize): IconConfig {
  const base = iconSizes[accent] ?? iconSizes.default;
  if (size === "lg") {
    return { ...base, size: base.size + 4, dimension: "3.5rem" };
  }
  return base;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}
