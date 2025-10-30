"use client";

import type { ComponentType, ReactNode } from "react";
import { SectionHeading } from "@/shared/components/common";
import { HorizontalScroll } from "@/shared/components/layout";
import { spacing } from "@/styles/tokens";

interface RailSectionProps<T> {
  id: string;
  title: string;
  icon?: ComponentType<{ size?: number }>;
  action?: ReactNode;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  scrollProps?: {
    padding?: Parameters<typeof HorizontalScroll>[0]["padding"];
    gap?: Parameters<typeof HorizontalScroll>[0]["gap"];
    bottomPadding?: Parameters<typeof HorizontalScroll>[0]["bottomPadding"];
    align?: Parameters<typeof HorizontalScroll>[0]["align"];
    itemClassName?: Parameters<typeof HorizontalScroll>[0]["itemClassName"];
    ariaLabel?: Parameters<typeof HorizontalScroll>[0]["ariaLabel"];
  };
}

export function AcademyRailSection<T>({
  id,
  title,
  icon,
  action,
  items,
  renderItem,
  scrollProps,
}: RailSectionProps<T>) {
  if (!items || items.length === 0) return null;

  return (
    <section aria-labelledby={id} style={{ display: "grid", gap: spacing[4] }}>
      <SectionHeading id={id} title={title} icon={icon} action={action} />
      <HorizontalScroll
        padding={scrollProps?.padding}
        gap={scrollProps?.gap}
        bottomPadding={scrollProps?.bottomPadding}
        align={scrollProps?.align}
        itemClassName={scrollProps?.itemClassName}
        ariaLabel={scrollProps?.ariaLabel}
      >
        {items.map((item, index) => renderItem(item, index))}
      </HorizontalScroll>
    </section>
  );
}

export default AcademyRailSection;



















