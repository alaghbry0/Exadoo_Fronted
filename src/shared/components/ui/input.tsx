import * as React from "react";

import { cn } from "@/shared/utils";
import {
  colors,
  componentRadius,
  shadowClasses,
} from "@/styles/tokens";

const inputCssVariables: React.CSSProperties = {
  "--input-bg": colors.bg.primary,
  "--input-fg": colors.text.primary,
  "--input-border": colors.border.default,
  "--input-placeholder": colors.text.secondary,
  "--input-focus-ring": colors.border.focus,
  "--input-ring-offset": colors.bg.primary,
  "--input-disabled-bg": colors.bg.secondary,
  "--input-disabled-text": colors.text.disabled,
  "--input-disabled-border": colors.border.disabled,
  "--input-file-bg": colors.bg.secondary,
  "--input-file-text": colors.text.primary,
};

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full px-3 py-1 text-base transition-colors duration-200 file:border-0 file:text-sm file:font-medium md:text-sm",
          componentRadius.input,
          shadowClasses.input,
          "h-10 border",
          "bg-[var(--input-bg)]",
          "text-[var(--input-fg)]",
          "border-[var(--input-border)]",
          "placeholder:text-[var(--input-placeholder)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--input-focus-ring)] focus-visible:ring-offset-[var(--input-ring-offset)]",
          "disabled:cursor-not-allowed disabled:bg-[var(--input-disabled-bg)] disabled:text-[var(--input-disabled-text)] disabled:border-[var(--input-disabled-border)] disabled:shadow-none",
          "file:bg-[var(--input-file-bg)] file:text-[var(--input-file-text)]",
          className,
        )}
        style={{ ...inputCssVariables, ...style }}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
