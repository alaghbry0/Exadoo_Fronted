import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils";
import {
  colors,
  componentRadius,
  shadowClasses,
  withAlpha,
} from "@/styles/tokens";

type ButtonIntent =
  | "primary"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

type ButtonIntentStateTokens = {
  background?: string;
  foreground?: string;
  border?: string;
  hoverBackground?: string;
  hoverForeground?: string;
  focusRing?: string;
  disabledBackground?: string;
  disabledForeground?: string;
  disabledBorder?: string;
  shadow?: string;
};

type ButtonIntentOverrides = Partial<ButtonIntentStateTokens>;

const buttonIntentTokens: Record<ButtonIntent, ButtonIntentStateTokens> = {
  primary: {
    background: colors.brand.primary,
    foreground: colors.text.inverse,
    border: colors.brand.primary,
    hoverBackground: colors.brand.primaryHover,
    hoverForeground: colors.text.inverse,
    focusRing: colors.border.focus,
    disabledBackground: colors.border.disabled,
    disabledForeground: colors.text.disabled,
    disabledBorder: colors.border.disabled,
    shadow: shadowClasses.button,
  },
  secondary: {
    background: colors.bg.secondary,
    foreground: colors.text.primary,
    border: colors.border.default,
    hoverBackground: colors.bg.tertiary,
    hoverForeground: colors.text.primary,
    focusRing: colors.border.focus,
    disabledBackground: colors.bg.tertiary,
    disabledForeground: colors.text.disabled,
    disabledBorder: colors.border.disabled,
    shadow: shadowClasses.button,
  },
  destructive: {
    background: colors.status.error,
    foreground: colors.text.inverse,
    border: colors.status.error,
    hoverBackground: withAlpha(colors.status.error, 0.9),
    hoverForeground: colors.text.inverse,
    focusRing: colors.status.error,
    disabledBackground: colors.status.errorBg,
    disabledForeground: colors.text.disabled,
    disabledBorder: colors.border.disabled,
    shadow: shadowClasses.button,
  },
  outline: {
    background: colors.bg.primary,
    foreground: colors.text.primary,
    border: colors.border.default,
    hoverBackground: colors.bg.secondary,
    hoverForeground: colors.text.primary,
    focusRing: colors.border.focus,
    disabledBackground: colors.bg.secondary,
    disabledForeground: colors.text.disabled,
    disabledBorder: colors.border.disabled,
    shadow: shadowClasses.button,
  },
  ghost: {
    foreground: colors.text.primary,
    hoverBackground: colors.bg.secondary,
    hoverForeground: colors.text.primary,
    focusRing: colors.border.focus,
    disabledForeground: colors.text.disabled,
    shadow: shadowClasses.none,
  },
  link: {
    foreground: colors.text.link,
    hoverForeground: colors.text.linkHover,
    focusRing: colors.border.focus,
    disabledForeground: colors.text.disabled,
    shadow: shadowClasses.none,
  },
};

const createIntentClassName = (
  intent: ButtonIntent,
  overrides?: ButtonIntentOverrides,
) => {
  const tokens = {
    borderFallback: "border border-transparent",
    shadowFallback: shadowClasses.button,
    ...buttonIntentTokens[intent],
    ...overrides,
  } as ButtonIntentStateTokens & {
    borderFallback: string;
    shadowFallback: string;
  };

  const {
    background,
    foreground,
    border,
    hoverBackground,
    hoverForeground,
    focusRing,
    disabledBackground,
    disabledForeground,
    disabledBorder,
    shadow,
    borderFallback,
    shadowFallback,
  } = tokens;

  return cn(
    border ? `border border-[${border}]` : borderFallback,
    shadow ? shadow : shadowFallback,
    background && `bg-[${background}]`,
    foreground && `text-[${foreground}]`,
    hoverBackground && `hover:bg-[${hoverBackground}]`,
    hoverForeground && `hover:text-[${hoverForeground}]`,
    focusRing && `focus-visible:ring-[${focusRing}]`,
    disabledBackground && `disabled:bg-[${disabledBackground}]`,
    disabledForeground && `disabled:text-[${disabledForeground}]`,
    disabledBorder && `disabled:border-[${disabledBorder}]`,
  );
};

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    componentRadius.button,
    "focus-visible:ring-offset-[var(--color-bg-primary)]",
  ),
  {
    variants: {
      intent: {
        primary: createIntentClassName("primary"),
        secondary: createIntentClassName("secondary"),
        destructive: createIntentClassName("destructive"),
        outline: createIntentClassName("outline"),
        ghost: createIntentClassName("ghost"),
        link: cn(
          createIntentClassName("link"),
          "underline-offset-4 hover:underline focus-visible:underline",
        ),
        custom: "",
      },
      density: {
        default: "h-10 px-5 text-sm",
        compact: "h-9 px-4 text-xs",
        relaxed: "h-11 px-6 text-base",
        icon: "h-10 w-10 px-0 [&_svg]:size-5",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      intent: "primary",
      density: "default",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  intentOverrides?: ButtonIntentOverrides;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      intent = "primary",
      density = "default",
      fullWidth,
      intentOverrides,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const intentClassName = intentOverrides
      ? createIntentClassName(intent, intentOverrides)
      : undefined;

    return (
      <Comp
        className={cn(
          buttonVariants({ intent: intentOverrides ? "custom" : intent, density, fullWidth }),
          intentOverrides ? intentClassName : undefined,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
