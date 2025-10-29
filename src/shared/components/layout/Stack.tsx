import React, { forwardRef } from "react";

import { cn } from "@/shared/utils";
import { semanticSpacing } from "@/styles/tokens";

import styles from "./Stack.module.css";

type StackGapToken =
  | `component.${keyof typeof semanticSpacing.component}`
  | `layout.${keyof typeof semanticSpacing.layout}`
  | `section.${keyof typeof semanticSpacing.section}`;

type StackDirection = "row" | "column";
type StackAlign = "start" | "center" | "end";
type StackJustify = "start" | "center" | "end" | "between";

export interface StackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  direction?: StackDirection;
  align?: StackAlign;
  justify?: StackJustify;
  gap?: StackGapToken;
  fullWidth?: boolean;
}

const alignClassMap: Record<StackAlign, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
};

const justifyClassMap: Record<StackJustify, string> = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
};

function resolveSpacing(token?: StackGapToken) {
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

const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { direction = "column", align, justify, gap, fullWidth = false, style, className, ...props },
  ref,
) {
  const gapValue = resolveSpacing(gap);
  const gapStyle = gapValue
    ? ({ "--stack-gap": gapValue } as React.CSSProperties)
    : undefined;

  return (
    <div
      ref={ref}
      className={cn(
        styles.stack,
        styles[direction],
        gapValue ? styles.withGap : undefined,
        fullWidth ? styles.fullWidth : undefined,
        align ? alignClassMap[align] : undefined,
        justify ? justifyClassMap[justify] : undefined,
        className,
      )}
      style={{ ...gapStyle, ...style }}
      {...props}
    />
  );
});

Stack.displayName = "Stack";

export default Stack;
