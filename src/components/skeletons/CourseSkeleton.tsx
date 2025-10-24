import type { CSSProperties } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  animations,
  colors,
  radius,
  semanticSpacing,
  shadowClasses,
  spacing,
} from "@/styles/tokens";

const baseBarStyle: CSSProperties = {
  backgroundColor: colors.bg.tertiary,
  borderRadius: radius.md,
  width: "100%",
  opacity: 0.85,
};

const accentBarStyle: CSSProperties = {
  ...baseBarStyle,
  backgroundColor: colors.bg.secondary,
  opacity: 0.95,
};

const createLineStyle = (width: string, height: string): CSSProperties => ({
  ...baseBarStyle,
  width,
  height,
});

const createAccentLineStyle = (
  width: string,
  height: string,
): CSSProperties => ({
  ...accentBarStyle,
  width,
  height,
});

const createCircleStyle = (size: string): CSSProperties => ({
  ...baseBarStyle,
  width: size,
  height: size,
  borderRadius: radius.full,
});

export function CourseSkeleton() {
  return (
    <Card
      className={cn(shadowClasses.card, animations.presets.pulse)}
      style={{
        overflow: "hidden",
        backgroundColor: colors.bg.elevated,
        borderColor: colors.border.default,
      }}
      aria-label="تحميل محتوى الدورة"
    >
      <div
        style={{
          aspectRatio: "16 / 9",
          width: "100%",
          backgroundImage: `linear-gradient(135deg, ${colors.bg.secondary}, ${colors.bg.tertiary})`,
        }}
      />

      <CardContent
        style={{
          padding: spacing[5],
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
          <div style={createLineStyle("75%", "1.25rem")} />
          <div style={createLineStyle("50%", "1.25rem")} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing[3],
          }}
        >
          <div style={createCircleStyle("1.5rem")} />
          <div style={createLineStyle("6rem", "1rem")} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing[4],
          }}
        >
          <div style={createLineStyle("4rem", "1rem")} />
          <div style={createLineStyle("5rem", "1rem")} />
          <div style={createLineStyle("4rem", "1rem")} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: semanticSpacing.component.lg,
          }}
        >
          <div style={createAccentLineStyle("5.5rem", "1.5rem")} />
          <div style={createAccentLineStyle("6.5rem", "2.25rem")} />
        </div>
      </CardContent>
    </Card>
  );
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid"
      style={{
        gap: spacing[6],
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      }}
      aria-label="شبكة دورات قيد التحميل"
    >
      {Array.from({ length: count }).map((_, index) => (
        <CourseSkeleton key={index} />
      ))}
    </div>
  );
}
