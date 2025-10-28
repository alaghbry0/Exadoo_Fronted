import * as React from "react";

import { cn } from "@/shared/utils";
import {
  colors,
  componentRadius,
  shadowClasses,
} from "@/styles/tokens";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full px-3 py-1 text-base transition-colors duration-200 file:border-0 file:text-sm file:font-medium md:text-sm",
          componentRadius.input,
          shadowClasses.input,
          `h-10 border bg-[${colors.bg.primary}] text-[${colors.text.primary}] border-[${colors.border.default}]`,
          `placeholder:text-[${colors.text.secondary}]`,
          `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${colors.border.focus}] focus-visible:ring-offset-[${colors.bg.primary}]`,
          `disabled:cursor-not-allowed disabled:bg-[${colors.bg.secondary}] disabled:text-[${colors.text.disabled}] disabled:border-[${colors.border.disabled}] disabled:shadow-none`,
          `file:bg-[${colors.bg.secondary}] file:text-[${colors.text.primary}]`,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
