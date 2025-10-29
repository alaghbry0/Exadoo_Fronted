import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils";
import { componentRadius, shadowClasses } from "@/styles/tokens";

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

const buttonIntentDataAttributeClasses = [
  // Primary
  "data-[button-intent=primary]:[--button-bg:var(--color-primary-500)]",
  "data-[button-intent=primary]:[--button-foreground:var(--color-text-inverse)]",
  "data-[button-intent=primary]:[--button-border:var(--color-primary-500)]",
  "data-[button-intent=primary]:[--button-hover-bg:var(--color-primary-600)]",
  "data-[button-intent=primary]:[--button-hover-foreground:var(--color-text-inverse)]",
  "data-[button-intent=primary]:[--button-focus-ring:var(--color-border-focus)]",
  "data-[button-intent=primary]:[--button-disabled-bg:var(--color-border-disabled)]",
  "data-[button-intent=primary]:[--button-disabled-foreground:var(--color-text-disabled)]",
  "data-[button-intent=primary]:[--button-disabled-border:var(--color-border-disabled)]",
  // Secondary
  "data-[button-intent=secondary]:[--button-bg:var(--color-bg-secondary)]",
  "data-[button-intent=secondary]:[--button-foreground:var(--color-text-primary)]",
  "data-[button-intent=secondary]:[--button-border:var(--color-border-default)]",
  "data-[button-intent=secondary]:[--button-hover-bg:var(--color-bg-tertiary)]",
  "data-[button-intent=secondary]:[--button-hover-foreground:var(--color-text-primary)]",
  "data-[button-intent=secondary]:[--button-focus-ring:var(--color-border-focus)]",
  "data-[button-intent=secondary]:[--button-disabled-bg:var(--color-bg-tertiary)]",
  "data-[button-intent=secondary]:[--button-disabled-foreground:var(--color-text-disabled)]",
  "data-[button-intent=secondary]:[--button-disabled-border:var(--color-border-disabled)]",
  // Destructive
  "data-[button-intent=destructive]:[--button-bg:var(--color-error-500)]",
  "data-[button-intent=destructive]:[--button-foreground:var(--color-text-inverse)]",
  "data-[button-intent=destructive]:[--button-border:var(--color-error-500)]",
  "data-[button-intent=destructive]:[--button-hover-bg:color-mix(in_srgb,_var(--color-error-500)_90%,_transparent)]",
  "data-[button-intent=destructive]:[--button-hover-foreground:var(--color-text-inverse)]",
  "data-[button-intent=destructive]:[--button-focus-ring:var(--color-error-500)]",
  "data-[button-intent=destructive]:[--button-disabled-bg:var(--color-error-50)]",
  "data-[button-intent=destructive]:[--button-disabled-foreground:var(--color-text-disabled)]",
  "data-[button-intent=destructive]:[--button-disabled-border:var(--color-border-disabled)]",
  // Outline
  "data-[button-intent=outline]:[--button-bg:var(--color-bg-primary)]",
  "data-[button-intent=outline]:[--button-foreground:var(--color-text-primary)]",
  "data-[button-intent=outline]:[--button-border:var(--color-border-default)]",
  "data-[button-intent=outline]:[--button-hover-bg:var(--color-bg-secondary)]",
  "data-[button-intent=outline]:[--button-hover-foreground:var(--color-text-primary)]",
  "data-[button-intent=outline]:[--button-focus-ring:var(--color-border-focus)]",
  "data-[button-intent=outline]:[--button-disabled-bg:var(--color-bg-secondary)]",
  "data-[button-intent=outline]:[--button-disabled-foreground:var(--color-text-disabled)]",
  "data-[button-intent=outline]:[--button-disabled-border:var(--color-border-disabled)]",
  // Ghost
  "data-[button-intent=ghost]:[--button-bg:transparent]",
  "data-[button-intent=ghost]:[--button-foreground:var(--color-text-primary)]",
  "data-[button-intent=ghost]:[--button-border:transparent]",
  "data-[button-intent=ghost]:[--button-hover-bg:var(--color-bg-secondary)]",
  "data-[button-intent=ghost]:[--button-hover-foreground:var(--color-text-primary)]",
  "data-[button-intent=ghost]:[--button-focus-ring:var(--color-border-focus)]",
  "data-[button-intent=ghost]:[--button-disabled-bg:transparent]",
  "data-[button-intent=ghost]:[--button-disabled-foreground:var(--color-text-disabled)]",
  "data-[button-intent=ghost]:[--button-disabled-border:transparent]",
  // Link
  "data-[button-intent=link]:[--button-bg:transparent]",
  "data-[button-intent=link]:[--button-foreground:var(--color-text-link)]",
  "data-[button-intent=link]:[--button-border:transparent]",
  "data-[button-intent=link]:[--button-hover-bg:transparent]",
  "data-[button-intent=link]:[--button-hover-foreground:var(--color-text-link-hover)]",
  "data-[button-intent=link]:[--button-focus-ring:var(--color-border-focus)]",
  "data-[button-intent=link]:[--button-disabled-bg:transparent]",
  "data-[button-intent=link]:[--button-disabled-foreground:var(--color-text-disabled)]",
  "data-[button-intent=link]:[--button-disabled-border:transparent]",
] as const;

const buttonIntentShadowClasses: Record<ButtonIntent, string> = {
  primary: shadowClasses.button,
  secondary: shadowClasses.button,
  destructive: shadowClasses.button,
  outline: shadowClasses.button,
  ghost: shadowClasses.none,
  link: shadowClasses.none,
};

const createIntentOverrideStyle = (
  overrides?: ButtonIntentOverrides,
): React.CSSProperties | undefined => {
  if (!overrides) {
    return undefined;
  }

  const cssVars: Record<string, string> = {};
  const assignVar = (name: string, value?: string) => {
    if (value) {
      cssVars[name] = value;
    }
  };

  assignVar("--button-bg", overrides.background);
  assignVar("--button-foreground", overrides.foreground);
  assignVar("--button-border", overrides.border);
  assignVar("--button-hover-bg", overrides.hoverBackground);
  assignVar("--button-hover-foreground", overrides.hoverForeground);
  assignVar("--button-focus-ring", overrides.focusRing);
  assignVar("--button-disabled-bg", overrides.disabledBackground);
  assignVar("--button-disabled-foreground", overrides.disabledForeground);
  assignVar("--button-disabled-border", overrides.disabledBorder);

  return cssVars as React.CSSProperties;
};

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    componentRadius.button,
    "[--button-ring-offset:var(--color-bg-primary)]",
    "border",
    "border-[var(--button-border)]",
    "bg-[var(--button-bg)]",
    "text-[var(--button-foreground)]",
    "hover:bg-[var(--button-hover-bg)]",
    "hover:text-[var(--button-hover-foreground)]",
    "focus-visible:ring-[var(--button-focus-ring)]",
    "focus-visible:ring-offset-[var(--button-ring-offset, var(--color-bg-primary))]",
    "disabled:bg-[var(--button-disabled-bg)]",
    "disabled:text-[var(--button-disabled-foreground)]",
    "disabled:border-[var(--button-disabled-border)]",
    ...buttonIntentDataAttributeClasses,
  ),
  {
    variants: {
      intent: {
        primary: cn(buttonIntentShadowClasses.primary),
        secondary: cn(buttonIntentShadowClasses.secondary),
        destructive: cn(buttonIntentShadowClasses.destructive),
        outline: cn(buttonIntentShadowClasses.outline),
        ghost: cn(buttonIntentShadowClasses.ghost),
        link: cn(
          buttonIntentShadowClasses.link,
          "underline-offset-4 hover:underline focus-visible:underline",
        ),
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
  intent?: ButtonIntent;
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
      style,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const overrideStyle = createIntentOverrideStyle(intentOverrides);

    return (
      <Comp
        className={cn(
          buttonVariants({ intent, density, fullWidth }),
          intentOverrides?.shadow,
          className,
        )}
        style={{ ...overrideStyle, ...style }}
        ref={ref}
        data-button-intent={intent}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
