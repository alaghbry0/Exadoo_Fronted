import type { CSSProperties } from "react";

import { SkeletonGrid } from "@/shared/components/skeletons/SkeletonGrid";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils";
import {
  animations,
  colors,
  radius,
  semanticSpacing,
  shadowClasses,
  spacing,
} from "@/styles/tokens";

const baseSkeletonStyle: CSSProperties = {
  backgroundColor: colors.bg.tertiary,
  borderRadius: radius.md,
  width: "100%",
  opacity: 0.85,
};

const createLine = (width: string, height: string): CSSProperties => ({
  ...baseSkeletonStyle,
  width,
  height,
});

const createCircle = (size: string): CSSProperties => ({
  ...baseSkeletonStyle,
  width: size,
  height: size,
  borderRadius: radius.full,
});

export function SubscriptionCardSkeleton() {
  return (
    <Card
      className={cn(shadowClasses.card, animations.presets.pulse)}
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: colors.bg.elevated,
        borderColor: colors.border.default,
      }}
      aria-label="تحميل بطاقة الاشتراك"
    >
      <CardHeader
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing[4],
          paddingBottom: spacing[4],
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              ...createLine("3rem", "3rem"),
              backgroundImage: `linear-gradient(135deg, ${colors.bg.secondary}, ${colors.bg.tertiary})`,
              borderRadius: radius.xl,
            }}
          />
          <div style={createLine("5rem", "1.5rem")} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing[3],
          }}
        >
          <div style={createLine("75%", "1.5rem")} />
          <div style={createLine("100%", "1.125rem")} />
          <div style={createLine("65%", "1.125rem")} />
        </div>
      </CardHeader>

      <CardContent
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing[4],
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: spacing[3],
          }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`feature-skeleton-${index}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing[3],
              }}
            >
              <div style={createCircle("1rem")} />
              <div style={{ ...createLine("100%", "1rem"), flex: 1 }} />
            </div>
          ))}
        </div>

        <div
          style={{
            paddingTop: semanticSpacing.component.lg,
            borderTop: `1px solid ${colors.border.default}`,
            display: "flex",
            flexDirection: "column",
            gap: spacing[4],
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: spacing[3],
            }}
          >
            <div style={createLine("6rem", "2rem")} />
            <div style={createLine("4rem", "1.25rem")} />
          </div>

          <div
            style={{
              ...createLine("100%", "2.75rem"),
              backgroundImage: `linear-gradient(90deg, ${colors.bg.secondary}, ${colors.bg.tertiary})`,
              borderRadius: radius.xl,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <SkeletonGrid
      count={count}
      minItemWidth={280}
      gap={spacing[8]}
      ariaLabel="شبكة بطاقات الاشتراك قيد التحميل"
      renderItem={index => <SubscriptionCardSkeleton key={index} />}
    />
  );
}
