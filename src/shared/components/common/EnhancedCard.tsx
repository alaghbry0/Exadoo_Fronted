// src/shared/components/common/EnhancedCard.tsx
import { Card as ShadcnCard, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  colors,
  spacing,
  radius,
  shadowClasses,
  componentRadius,
  typography,
} from "@/styles/tokens";

interface EnhancedCardProps {
  children: ReactNode;
  hover?: boolean;
  gradient?: boolean;
  className?: string;
  onClick?: () => void;
}

export function EnhancedCard({
  children,
  hover = true,
  gradient = false,
  className,
  onClick,
}: EnhancedCardProps) {
  const cardStyles: CSSProperties = {
    backgroundColor: colors.bg.primary,
    color: colors.text.primary,
    borderColor: colors.border.default,
    transition: "transform 0.3s ease",
  };

  if (gradient) {
    cardStyles.backgroundImage = `linear-gradient(135deg, ${colors.bg.primary}, ${colors.bg.secondary})`;
  }

  if (hover) {
    cardStyles.cursor = "pointer";
  }

  return (
    <ShadcnCard
      className={cn(
        componentRadius.card,
        hover ? shadowClasses.cardInteractive : shadowClasses.card,
        className,
      )}
      style={cardStyles}
      onClick={onClick}
    >
      {children}
    </ShadcnCard>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  badge?: {
    text: string;
    variant?: "default" | "success" | "warning";
  };
}

const baseBadgeStyles: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  paddingInline: spacing[3],
  paddingBlock: spacing[1],
  borderRadius: radius.full,
};

function getBadgeStyles(
  variant?: "default" | "success" | "warning",
): CSSProperties {
  switch (variant) {
    case "success":
      return {
        ...baseBadgeStyles,
        backgroundColor: colors.status.successBg,
        color: colors.status.success,
      };
    case "warning":
      return {
        ...baseBadgeStyles,
        backgroundColor: colors.status.warningBg,
        color: colors.status.warning,
      };
    default:
      return {
        ...baseBadgeStyles,
        backgroundColor: colors.bg.secondary,
        color: colors.text.secondary,
      };
  }
}

export function ServiceCard({
  title,
  description,
  icon: Icon,
  href,
  badge,
}: ServiceCardProps) {
  return (
    <Link href={href}>
      <EnhancedCard hover>
        <CardContent
          style={{
            padding: spacing[6],
            paddingTop: spacing[6],
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: spacing[4],
                borderRadius: radius["2xl"],
                backgroundColor: colors.status.infoBg,
                color: colors.brand.primary,
              }}
              aria-hidden="true"
            >
              <Icon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing[3],
                  marginBottom: spacing[3],
                }}
              >
                <h3
                  className={cn(typography.heading.md)}
                  style={{ color: colors.text.primary }}
                >
                  {title}
                </h3>
                {badge && (
                  <span
                    className={cn(typography.label.md)}
                    style={getBadgeStyles(badge.variant)}
                  >
                    {badge.text}
                  </span>
                )}
              </div>
              <p
                className={cn(typography.body.sm)}
                style={{ color: colors.text.secondary }}
              >
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>
    </Link>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  const trendColor = trend
    ? trend.isPositive
      ? colors.status.success
      : colors.status.error
    : undefined;

  return (
    <EnhancedCard gradient>
      <CardContent
        style={{
          padding: spacing[6],
          paddingTop: spacing[6],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing[4],
          }}
        >
          <div>
            <p
              className={cn(typography.body.sm)}
              style={{
                color: colors.text.secondary,
                marginBottom: spacing[2],
              }}
            >
              {title}
            </p>
            <p
              className={cn(typography.heading.xl)}
              style={{ color: colors.text.primary }}
            >
              {value}
            </p>
            {trend && (
              <p
                className={cn(typography.label.lg)}
                style={{
                  color: trendColor,
                  marginTop: spacing[2],
                }}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </p>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: spacing[5],
              borderRadius: radius.full,
              backgroundColor: colors.status.infoBg,
              color: colors.brand.primary,
              minWidth: "3.5rem",
              minHeight: "3.5rem",
            }}
            aria-hidden="true"
          >
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </EnhancedCard>
  );
}
