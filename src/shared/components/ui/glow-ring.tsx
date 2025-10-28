import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils";

const glowRingVariants = cva(
  "pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-screen transition-opacity duration-300",
  {
    variants: {
      intent: {
        primary: "bg-glow-ring-primary",
        neutral: "bg-glow-ring-neutral",
      },
      blur: {
        none: "",
        sm: "blur-sm",
        md: "blur-lg",
        lg: "blur-2xl",
      },
    },
    defaultVariants: {
      intent: "primary",
      blur: "lg",
    },
  },
);

export type GlowRingProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof glowRingVariants>;

export function GlowRing({
  className,
  intent,
  blur,
  ...props
}: GlowRingProps) {
  return (
    <span
      aria-hidden
      {...props}
      className={cn(glowRingVariants({ intent, blur }), className)}
    />
  );
}
