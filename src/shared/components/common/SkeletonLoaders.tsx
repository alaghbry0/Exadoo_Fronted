import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/utils";
import { colors, spacing, radius, componentRadius, shadowClasses } from "@/styles/tokens";
import type { CSSProperties } from "react";

const skeletonStyle: CSSProperties = {
  backgroundColor: colors.bg.tertiary,
  borderRadius: radius.sm,
};

function SkeletonBlock({ width, height }: { width: string; height: string }) {
  return (
    <div
      style={{
        ...skeletonStyle,
        width,
        height,
      }}
    />
  );
}

function IconSkeleton() {
  return (
    <div
      style={{
        width: spacing[12],
        height: spacing[12],
        borderRadius: radius["2xl"],
        backgroundColor: colors.bg.secondary,
      }}
    />
  );
}

const cardClassName = cn(componentRadius.card, shadowClasses.card);

export const HalfCardSkeleton = () => (
  <Card className={cardClassName} style={{ borderColor: colors.border.default }}>
    <CardContent style={{ padding: spacing[5] }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: spacing[4],
          marginBottom: spacing[4],
        }}
      >
        <IconSkeleton />
        <div style={{ flex: 1 }}>
          <SkeletonBlock width="75%" height="1.25rem" />
          <div style={{ marginTop: spacing[3], display: "grid", gap: spacing[2] }}>
            <SkeletonBlock width="100%" height="1rem" />
            <SkeletonBlock width="83%" height="1rem" />
          </div>
        </div>
      </div>
      <SkeletonBlock width="6rem" height="1rem" />
    </CardContent>
  </Card>
);

export const WideCardSkeleton = () => (
  <Card className={cardClassName} style={{ borderColor: colors.border.default }}>
    <CardContent style={{ padding: spacing[5], paddingTop: spacing[5] }}>
      <div style={{ display: "grid", gap: spacing[6] }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: spacing[4],
            alignItems: "flex-start",
          }}
        >
          <IconSkeleton />
          <div style={{ flex: 1, minWidth: "12rem" }}>
            <SkeletonBlock width="66%" height="1.5rem" />
            <div style={{ marginTop: spacing[3], display: "grid", gap: spacing[2] }}>
              <SkeletonBlock width="100%" height="1rem" />
              <SkeletonBlock width="80%" height="1rem" />
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: spacing[4],
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "grid", gap: spacing[2], minWidth: "10rem" }}>
            <SkeletonBlock width="8rem" height="0.75rem" />
            <SkeletonBlock width="6rem" height="2rem" />
          </div>
          <SkeletonBlock width="8rem" height="2.5rem" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const AcademyCardSkeleton = () => (
  <Card className={cardClassName} style={{ borderColor: colors.border.default }}>
    <CardContent style={{ padding: spacing[6] }}>
      <div style={{ display: "grid", gap: spacing[4] }}>
        <SkeletonBlock width="50%" height="2rem" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: spacing[4],
          }}
        >
          {[1, 2, 3].map(key => (
            <div key={key} style={{ display: "grid", gap: spacing[2], justifyItems: "center" }}>
              <SkeletonBlock width="4rem" height="2.5rem" />
              <SkeletonBlock width="5rem" height="0.75rem" />
            </div>
          ))}
        </div>
        <SkeletonBlock width="100%" height="2.5rem" />
      </div>
    </CardContent>
  </Card>
);

interface GridSkeletonProps {
  count?: number;
  variant?: "half" | "wide" | "mixed";
}

export const GridSkeleton = ({ count = 4, variant = "mixed" }: GridSkeletonProps) => {
  if (variant === "half") {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
          gap: spacing[4],
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <HalfCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (variant === "wide") {
    return (
      <div style={{ display: "grid", gap: spacing[4] }}>
        {Array.from({ length: count }).map((_, index) => (
          <WideCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: spacing[4] }}>
      <WideCardSkeleton />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
          gap: spacing[4],
        }}
      >
        {[0, 1].map(index => (
          <HalfCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export const SearchSkeleton = () => (
  <div style={{ display: "grid", gap: spacing[4] }}>
    <SkeletonBlock width="12rem" height="1rem" />
    <GridSkeleton count={3} variant="mixed" />
  </div>
);
