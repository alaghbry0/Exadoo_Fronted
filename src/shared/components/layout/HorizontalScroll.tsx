import { Children, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/shared/utils";
import {
  colors,
  componentRadius,
  spacing,
  withAlpha,
} from "@/styles/tokens";

type HorizontalScrollPadding = "none" | "xs" | "sm" | "md" | "lg";
type HorizontalScrollGap = "xs" | "sm" | "md" | "lg" | "xl";
type HorizontalScrollBottomPadding = "none" | "xs" | "sm" | "md" | "lg";
type HorizontalScrollAlign = "start" | "center";

const paddingMap: Record<HorizontalScrollPadding, string> = {
  none: "0",
  xs: spacing[2],
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[5],
};

const gapMap: Record<HorizontalScrollGap, string> = {
  xs: spacing[3],
  sm: spacing[4],
  md: spacing[5],
  lg: spacing[7],
  xl: spacing[6],
};

const bottomPaddingMap: Record<HorizontalScrollBottomPadding, string> = {
  none: "0",
  xs: spacing[2],
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[5],
};

interface HorizontalScrollProps {
  children: ReactNode;
  padding?: HorizontalScrollPadding;
  gap?: HorizontalScrollGap;
  bottomPadding?: HorizontalScrollBottomPadding;
  snap?: boolean;
  align?: HorizontalScrollAlign;
  itemClassName?: string;
  className?: string;
  listClassName?: string;
  role?: "list" | "group";
  ariaLabel?: string;
}

const DEFAULT_ITEM_CLASSNAME =
  "min-w-[220px] w-[68%] xs:w-[58%] sm:w-[45%] lg:w-[30%] xl:w-[23%]";

export function HorizontalScroll({
  children,
  padding = "md",
  gap = "lg",
  bottomPadding = "sm",
  snap = true,
  align = "start",
  itemClassName = DEFAULT_ITEM_CLASSNAME,
  className,
  listClassName,
  role = "list",
  ariaLabel = "قائمة أفقية قابلة للتمرير",
}: HorizontalScrollProps) {
  const count = Children.count(children);

  if (count === 0) return null;

  const paddingValue = paddingMap[padding] ?? paddingMap.md;
  const bottomPaddingValue = bottomPaddingMap[bottomPadding] ?? bottomPaddingMap.sm;
  const gapValue = gapMap[gap] ?? gapMap.lg;

  const containerStyle: CSSProperties = {
    paddingInline: paddingValue,
  };

  if (paddingValue !== "0") {
    containerStyle.marginInline = `-${paddingValue}`;
  }

  const listStyle: CSSProperties = {
    gap: gapValue,
    paddingBottom: bottomPaddingValue,
    justifyContent: align === "center" ? "center" : "flex-start",
    scrollSnapType: snap ? ("x proximity" as const) : undefined,
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  return (
    <div className={className} style={containerStyle}>
      <div
        className={cn(
          "hscroll hide-scrollbar",
          snap && "hscroll-snap",
          listClassName,
        )}
        role={role}
        aria-label={ariaLabel}
        style={listStyle}
      >
        {Children.map(children, (child, index) => (
          <div
            key={index}
            className={cn("hscroll-item", itemClassName)}
            role={role === "list" ? "listitem" : undefined}
          >
            {child}
          </div>
        ))}
        <div
          className="hscroll-item"
          aria-hidden="true"
          style={{
            width: spacing[3],
            backgroundColor: "transparent",
            borderColor: "transparent",
          }}
        />
      </div>
    </div>
  );
}

export function buildCountBadge(count: number) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold text-sm",
        componentRadius.badge,
      )}
      style={{
        paddingInline: spacing[4],
        paddingBlock: spacing[1],
        backgroundColor: withAlpha(colors.brand.primary, 0.12),
        color: colors.brand.primary,
        lineHeight: 1,
      }}
    >
      {count}
    </span>
  );
}

export default HorizontalScroll;
