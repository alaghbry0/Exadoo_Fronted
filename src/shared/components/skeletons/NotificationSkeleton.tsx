import type { CSSProperties } from "react";

import { animations, colors, radius, spacing } from "@/styles/tokens";

const baseSkeletonStyle: CSSProperties = {
  backgroundColor: colors.bg.tertiary,
  borderRadius: radius.md,
};

const createLine = (width: string, height: string): CSSProperties => ({
  ...baseSkeletonStyle,
  width,
  height,
});

export function NotificationSkeleton() {
  return (
    <div
      className={animations.presets.pulse}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: spacing[4],
        padding: spacing[4],
        borderRadius: radius.xl,
        backgroundColor: colors.bg.elevated,
        border: `1px solid ${colors.border.default}`,
      }}
      aria-label="إشعار قيد التحميل"
    >
      <div
        style={{
          width: spacing[10],
          height: spacing[10],
          borderRadius: radius.full,
          backgroundImage: `linear-gradient(135deg, ${colors.bg.secondary}, ${colors.bg.tertiary})`,
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1, display: "grid", gap: spacing[3] }}>
        <div style={createLine("75%", "1.25rem")} />
        <div style={{ display: "grid", gap: spacing[2] }}>
          <div style={createLine("100%", "1rem")} />
          <div style={createLine("80%", "1rem")} />
        </div>
        <div style={createLine("6rem", "0.75rem")} />
      </div>

      <div
        style={{
          width: spacing[2],
          height: spacing[2],
          borderRadius: radius.full,
          backgroundColor: colors.bg.tertiary,
          flexShrink: 0,
        }}
      />
    </div>
  );
}

export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gap: spacing[3],
      }}
      aria-label="قائمة إشعارات قيد التحميل"
    >
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}
