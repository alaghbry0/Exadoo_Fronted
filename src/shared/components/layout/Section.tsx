import React, { ElementType, forwardRef } from "react";

import { cn } from "@/shared/utils";
import { semanticSpacing } from "@/styles/tokens";

import styles from "./Section.module.css";

type SectionSpacingToken =
  | `component.${keyof typeof semanticSpacing.component}`
  | `layout.${keyof typeof semanticSpacing.layout}`
  | `section.${keyof typeof semanticSpacing.section}`;

export interface SectionProps<T extends ElementType = "section">
  extends Omit<React.ComponentPropsWithoutRef<T>, "as" | "color"> {
  as?: T;
  paddingBlock?: SectionSpacingToken;
  paddingInline?: SectionSpacingToken;
  background?: string;
  foreground?: string;
  radius?: string;
  borderColor?: string;
  borderWidth?: string;
  fullWidth?: boolean;
}

function resolveSpacing(token?: SectionSpacingToken) {
  if (!token) return undefined;

  const [group, key] = token.split(".") as [
    keyof typeof semanticSpacing,
    string,
  ];

  const tokens = semanticSpacing[group];
  if (!tokens) return undefined;

  if (key in tokens) {
    return tokens[key as keyof typeof tokens];
  }

  return undefined;
}

const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    as,
    paddingBlock,
    paddingInline,
    background,
    foreground,
    radius,
    borderColor,
    borderWidth,
    fullWidth = true,
    className,
    style,
    ...props
  },
  ref,
) {
  const Component = (as ?? "section") as ElementType;

  const vars: React.CSSProperties = {};
  const blockSpacing = resolveSpacing(paddingBlock);
  const inlineSpacing = resolveSpacing(paddingInline);

  if (blockSpacing) {
    vars["--section-padding-block"] = blockSpacing;
  }
  if (inlineSpacing) {
    vars["--section-padding-inline"] = inlineSpacing;
  }
  if (background) {
    vars["--section-background"] = background;
  }
  if (foreground) {
    vars["--section-foreground"] = foreground;
  }
  if (radius) {
    vars["--section-radius"] = radius;
  }
  if (borderColor) {
    vars["--section-border-color"] = borderColor;
  }
  if (borderWidth) {
    vars["--section-border-width"] = borderWidth;
  }

  return (
    <Component
      ref={ref as any}
      className={cn(
        styles.section,
        blockSpacing ? styles.withPaddingBlock : undefined,
        inlineSpacing ? styles.withPaddingInline : undefined,
        background ? styles.withBackground : undefined,
        foreground ? styles.withForeground : undefined,
        radius ? styles.rounded : undefined,
        borderColor || borderWidth ? styles.withBorder : undefined,
        fullWidth ? styles.fullWidth : undefined,
        className,
      )}
      style={{ ...vars, ...style }}
      {...props}
    />
  );
});

Section.displayName = "Section";

export default Section;
