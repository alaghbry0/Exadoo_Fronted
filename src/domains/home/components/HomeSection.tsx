"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { SectionHeading } from "@/shared/components/common/SectionHeading";
import { colors, spacing } from "@/styles/tokens";

type HomeSectionHeading = {
  id: string;
  title: string;
  icon?: LucideIcon;
  description?: string;
  action?: ReactNode;
};

type ContentSpacing = "none" | "sm" | "md" | "lg";

const contentSpacingMap: Record<ContentSpacing, string> = {
  none: "0",
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[6],
};

export type HomeSectionProps = {
  heading: HomeSectionHeading;
  children: ReactNode;
  contentSpacing?: ContentSpacing;
};

export function HomeSection({ heading, children, contentSpacing = "md" }: HomeSectionProps) {
  return (
    <section
      aria-labelledby={heading.id}
      style={{
        display: "grid",
        gap: contentSpacingMap[contentSpacing],
        backgroundColor: colors.bg.secondary,
      }}
    >
      <SectionHeading {...heading} />
      <div>{children}</div>
    </section>
  );
}
