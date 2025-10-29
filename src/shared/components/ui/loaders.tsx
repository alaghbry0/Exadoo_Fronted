import { Loader2 } from "lucide-react";

import { SkeletonGrid } from "@/shared/components/skeletons/SkeletonGrid";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils";
import {
  colors,
  componentRadius,
  radius,
  semanticSpacing,
  shadowClasses,
  spacing,
  typography,
} from "@/styles/tokens";

export function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: semanticSpacing.layout.sm,
      }}
    >
      <div
        style={{
          display: "grid",
          gap: spacing[4],
          textAlign: "center",
        }}
      >
        <Loader2
          aria-hidden
          className="animate-spin"
          style={{
            width: spacing[12],
            height: spacing[12],
            color: colors.brand.primary,
            marginInline: "auto",
          }}
        />
        <p
          className={typography.body.md}
          style={{ color: colors.text.secondary }}
        >
          جاري التحميل...
        </p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <Card
      className={cn(componentRadius.card, shadowClasses.card)}
      style={{ borderColor: colors.border.default }}
    >
      <CardContent style={{ padding: spacing[6] }}>
        <div style={{ display: "grid", gap: spacing[4] }}>
          <Skeleton style={{ height: spacing[12], width: spacing[12], borderRadius: radius.xl }} />
          <Skeleton style={{ height: spacing[3], width: "75%" }} />
          <Skeleton style={{ height: spacing[3], width: "50%" }} />
        </div>
      </CardContent>
    </Card>
  );
}

interface GridSkeletonProps {
  count?: number;
}

export function GridSkeleton({ count = 6 }: GridSkeletonProps) {
  return (
    <SkeletonGrid
      count={count}
      minItemWidth="16rem"
      gap={spacing[4]}
      renderItem={index => <CardSkeleton key={index} />}
    />
  );
}

export function InlineLoader() {
  return (
    <Loader2
      aria-hidden
      className="animate-spin"
      style={{ width: spacing[4], height: spacing[4], color: colors.brand.primary }}
    />
  );
}

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div style={{ display: "grid", gap: spacing[3] }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Card
          key={index}
          className={cn(componentRadius.card, shadowClasses.card)}
          style={{
            borderColor: colors.border.default,
          }}
        >
          <CardContent
            style={{ padding: spacing[5], display: "flex", gap: spacing[4], alignItems: "center" }}
          >
            <Skeleton style={{ height: spacing[10], width: spacing[10], borderRadius: radius.full }} />
            <div style={{ flex: 1, display: "grid", gap: spacing[3] }}>
              <Skeleton style={{ height: spacing[3], width: "100%" }} />
              <Skeleton style={{ height: spacing[3], width: "66%" }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
