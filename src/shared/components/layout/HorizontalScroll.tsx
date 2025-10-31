// src/shared/components/layout/HorizontalScroll.tsx
import {
  Children,
  isValidElement,
  type CSSProperties,
  type ReactNode,
} from "react";

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
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: gapValue,
    paddingBottom: bottomPaddingValue,
    justifyContent: align === "center" ? "center" : "flex-start",
    overflowX: "auto",
    overflowY: "hidden",
    scrollSnapType: snap ? ("x proximity" as const) : undefined,
    WebkitOverflowScrolling: "touch",
    // مهم لتمرير اللمس الأفقي حتى لو الأب يحدّد pan-y:
    touchAction: "pan-x",
    // تحسين سلوك الإفراط في السحب:
    overscrollBehaviorX: "contain",
    // إخفاء السكروول:
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  };

  function onWheelToHorizontal(e: React.WheelEvent<HTMLDivElement>) {
    // حوّل عجلة الفأرة لأفقي بدون preventDefault (لتجنّب تحذير passive)
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const el = e.currentTarget;
      const dir = getComputedStyle(el).direction as "rtl" | "ltr";
      const delta = dir === "rtl" ? -e.deltaY : e.deltaY;
      el.scrollLeft += delta;
      // لا تستدعِ preventDefault هنا — هذا كان سبب التحذير
    }
  }

  return (
    <div className={className} style={containerStyle}>
      <div
        className={cn(listClassName)}
        role={role}
        aria-label={ariaLabel}
        style={listStyle}
        onWheel={onWheelToHorizontal}
      >
        {Children.map(children, (child, index) => {
          const key =
            isValidElement(child) && child.key != null ? child.key : index;

          return (
            <div
              key={key as any}
              className={cn(itemClassName)}
              role={role === "list" ? "listitem" : undefined}
              style={{
                flex: "0 0 auto",
                scrollSnapAlign: snap ? ("start" as const) : undefined,
              }}
            >
              {child}
            </div>
          );
        })}

        {/* مسافة مريحة في نهاية الشريط */}
        <div
          aria-hidden="true"
          style={{
            flex: "0 0 auto",
            width: spacing[3],
            backgroundColor: "transparent",
            borderColor: "transparent",
          }}
        />
      </div>

      <style jsx>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
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
