import { ArrowLeft } from "lucide-react";
import type { CSSProperties, ComponentType } from "react";
import { cn } from "@/shared/utils";
import { colors, spacing, radius, typography } from "@/styles/tokens";
import type { AccentTheme, IconConfig, StatChip } from "./types";
import SmartImage from "@/shared/components/common/SmartImage";

export function IconBadge({
  icon: Icon,
  theme,
  sizing,
}: {
  icon?: ComponentType<{ size?: number }>;
  theme: AccentTheme;
  sizing: IconConfig;
}) {
  if (!Icon) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: sizing.dimension,
        height: sizing.dimension,
        padding: sizing.padding,
        borderRadius: radius["2xl"],
        backgroundColor: theme.background,
        color: theme.color,
      }}
    >
      <Icon size={sizing.size} />
    </div>
  );
}

export function TitleBlock({
  title,
  titleId,
  badge,
  titleColor,
}: {
  title: string;
  titleId: string;
  badge?: string;
  titleColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: spacing[3],
        flexWrap: "wrap",
      }}
    >
      <h3
        id={titleId}
        className={cn(typography.heading.lg)}
        style={{ color: titleColor, margin: 0 }}
      >
        {title}
      </h3>
      {badge && (
        <span
          className={cn(typography.label.md)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            paddingInline: spacing[3],
            paddingBlock: spacing[1],
            borderRadius: radius.full,
            backgroundColor: colors.bg.secondary,
            color: colors.text.secondary,
            whiteSpace: "nowrap",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

export function PrimaryCTA({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "light";
}) {
  const background = tone === "light" ? colors.bg.primary : colors.brand.primary;
  const textColor = tone === "light" ? colors.text.primary : colors.text.inverse;

  return (
    <div
      role="presentation"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: spacing[3],
        borderRadius: radius.full,
        paddingInline: spacing[6],
        paddingBlock: spacing[3],
        backgroundColor: background,
        color: textColor,
        fontWeight: 600,
        fontSize: "0.95rem",
      }}
    >
      <span>{label}</span>
      <ArrowLeft size={18} />
    </div>
  );
}

export function InlineCTA({
  label,
  tone,
}: {
  label: string;
  tone: "primary" | "light";
}) {
  const textColor = tone === "light" ? colors.text.inverse : colors.brand.primary;
  return (
    <div
      role="presentation"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: spacing[2],
        color: textColor,
        fontWeight: 600,
        fontSize: "0.9rem",
      }}
    >
      {label}
      <ArrowLeft size={16} />
    </div>
  );
}

export function StatsChips({
  stats,
  style,
}: {
  stats?: StatChip[];
  style?: CSSProperties;
}) {
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: spacing[3],
        fontSize: "0.75rem",
        ...style,
      }}
    >
      {stats.map((item, index) => {
        const isSuccess = item.variant === "success";
        const background = isSuccess
          ? colors.status.successBg
          : colors.bg.secondary;
        const color = isSuccess ? colors.status.success : colors.text.secondary;
        const borderColor = isSuccess
          ? `${colors.status.success}33`
          : colors.border.default;

        return (
          <span
            key={`${item.label}-${index}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: spacing[2],
              borderRadius: radius.full,
              paddingInline: spacing[3],
              paddingBlock: spacing[1],
              backgroundColor: background,
              color,
              border: `1px solid ${borderColor}`,
              fontFeatureSettings: "\"tnum\"",
            }}
          >
            <span style={{ opacity: 0.75 }}>{item.label}:</span>
            <span>{item.value}</span>
          </span>
        );
      })}
    </div>
  );
}

export function SplitImage({ imageUrl }: { imageUrl?: string }) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "180px",
        backgroundImage: `linear-gradient(135deg, ${colors.brand.primary}26, ${colors.brand.primary}13)`,
      }}
    >
      <SmartImage
        alt=""
        src={imageUrl}
        fill
        blurType="secondary"
        className="object-cover"
        priority
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(90deg, ${colors.bg.primary}E6, transparent)`,
        }}
      />
    </div>
  );
}
