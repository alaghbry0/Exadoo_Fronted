import type { CSSProperties, ReactNode } from "react";

import { spacing } from "@/styles/tokens";

interface SkeletonGridProps {
  count?: number;
  /**
   * Minimum width for each grid item before wrapping to the next line.
   * Accepts a number (interpreted as pixels) or any valid CSS width value.
   */
  minItemWidth?: number | string;
  gap?: CSSProperties["gap"];
  ariaLabel?: string;
  className?: string;
  role?: string;
  renderItem: (index: number) => ReactNode;
}

const defaultMinWidth = 280;

export function SkeletonGrid({
  count = 6,
  minItemWidth = defaultMinWidth,
  gap = spacing[6],
  ariaLabel,
  className,
  role,
  renderItem,
}: SkeletonGridProps) {
  const computedMinWidth =
    typeof minItemWidth === "number" ? `${minItemWidth}px` : minItemWidth;

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={className}
      style={{
        display: "grid",
        gap,
        gridTemplateColumns: `repeat(auto-fit, minmax(${computedMinWidth}, 1fr))`,
      }}
    >
      {Array.from({ length: count }).map((_, index) => renderItem(index))}
    </div>
  );
}
