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
    background: "var(--color-primary-500)",
    foreground: "var(--color-text-inverse)",
    border: "var(--color-primary-500)",
    hoverBackground: "var(--color-primary-600)",
    hoverForeground: "var(--color-text-inverse)",
    focusRing: "var(--color-border-focus)",
    disabledBackground: "var(--color-border-disabled)",
    disabledForeground: "var(--color-text-disabled)",
    disabledBorder: "var(--color-border-disabled)",
    shadow: shadowClasses.button,
  },
  secondary: {
    background: "var(--color-bg-secondary)",
    foreground: "var(--color-text-primary)",
    border: "var(--color-border-default)",
    hoverBackground: "var(--color-bg-tertiary)",
    hoverForeground: "var(--color-text-primary)",
    focusRing: "var(--color-border-focus)",
    disabledBackground: "var(--color-bg-tertiary)",
    disabledForeground: "var(--color-text-disabled)",
    disabledBorder: "var(--color-border-disabled)",
    shadow: shadowClasses.button,
  },
  destructive: {
    background: "var(--color-error-500)",
    foreground: "var(--color-text-inverse)",
    border: "var(--color-error-500)",
    hoverBackground: withAlpha(colors.status.error, 0.9),
    hoverForeground: "var(--color-text-inverse)",
    focusRing: "var(--color-error-500)",
    disabledBackground: "var(--color-error-50)",
    disabledForeground: "var(--color-text-disabled)",
    disabledBorder: "var(--color-border-disabled)",
    shadow: shadowClasses.button,
  },
  outline: {
    background: "var(--color-bg-primary)",
    foreground: "var(--color-text-primary)",
    border: "var(--color-border-default)",
    hoverBackground: "var(--color-bg-secondary)",
    hoverForeground: "var(--color-text-primary)",
    focusRing: "var(--color-border-focus)",
    disabledBackground: "var(--color-bg-secondary)",
    disabledForeground: "var(--color-text-disabled)",
    disabledBorder: "var(--color-border-disabled)",
    shadow: shadowClasses.button,
  },
  ghost: {
    background: "transparent",
    foreground: "var(--color-text-primary)",
    border: "transparent",
    hoverBackground: "var(--color-bg-secondary)",
    hoverForeground: "var(--color-text-primary)",
    focusRing: "var(--color-border-focus)",
    disabledBackground: "transparent",
    disabledForeground: "var(--color-text-disabled)",
    disabledBorder: "transparent",
    shadow: shadowClasses.none,
  },
  link: {
    background: "transparent",
    foreground: "var(--color-text-link)",
    border: "transparent",
    hoverBackground: "transparent",
    hoverForeground: "var(--color-text-link-hover)",
    focusRing: "var(--color-border-focus)",
    disabledBackground: "transparent",
    disabledForeground: "var(--color-text-disabled)",
    disabledBorder: "transparent",
    shadow: shadowClasses.none,
  },
};
const toCssVarClass = (variable: string, value: string) =>
  `[${variable}:${value.replace(/ /g, "_")}]`;

const buttonIntentVariableClasses: Record<ButtonIntent, string[]> = {
  primary: [
    toCssVarClass("--button-bg", buttonIntentTokens.primary.background!),
    toCssVarClass("--button-foreground", buttonIntentTokens.primary.foreground!),
    toCssVarClass("--button-border", buttonIntentTokens.primary.border!),
    toCssVarClass("--button-hover-bg", buttonIntentTokens.primary.hoverBackground!),
    toCssVarClass(
      "--button-hover-foreground",
      buttonIntentTokens.primary.hoverForeground!,
    ),
    toCssVarClass("--button-focus-ring", buttonIntentTokens.primary.focusRing!),
    toCssVarClass(
      "--button-disabled-bg",
      buttonIntentTokens.primary.disabledBackground!,
    ),
    toCssVarClass(
      "--button-disabled-foreground",
      buttonIntentTokens.primary.disabledForeground!,
    ),
    toCssVarClass(
      "--button-disabled-border",
      buttonIntentTokens.primary.disabledBorder!,
    ),
  ],
  secondary: [
    toCssVarClass("--button-bg", buttonIntentTokens.secondary.background!),
    toCssVarClass("--button-foreground", buttonIntentTokens.secondary.foreground!),
    toCssVarClass("--button-border", buttonIntentTokens.secondary.border!),
    toCssVarClass(
      "--button-hover-bg",
      buttonIntentTokens.secondary.hoverBackground!,
    ),
    toCssVarClass(
      "--button-hover-foreground",
      buttonIntentTokens.secondary.hoverForeground!,
    ),
    toCssVarClass(
      "--button-focus-ring",
      buttonIntentTokens.secondary.focusRing!,
    ),
    toCssVarClass(
      "--button-disabled-bg",
      buttonIntentTokens.secondary.disabledBackground!,
    ),
    toCssVarClass(
      "--button-disabled-foreground",
      buttonIntentTokens.secondary.disabledForeground!,
    ),
    toCssVarClass(
      "--button-disabled-border",
      buttonIntentTokens.secondary.disabledBorder!,
    ),
  ],
  destructive: [
    toCssVarClass("--button-bg", buttonIntentTokens.destructive.background!),
    toCssVarClass(
      "--button-foreground",
      buttonIntentTokens.destructive.foreground!,
    ),
    toCssVarClass("--button-border", buttonIntentTokens.destructive.border!),
    toCssVarClass(
      "--button-hover-bg",
      buttonIntentTokens.destructive.hoverBackground!,
    ),
    toCssVarClass(
      "--button-hover-foreground",
      buttonIntentTokens.destructive.hoverForeground!,
    ),
    toCssVarClass(
      "--button-focus-ring",
      buttonIntentTokens.destructive.focusRing!,
    ),
    toCssVarClass(
      "--button-disabled-bg",
      buttonIntentTokens.destructive.disabledBackground!,
    ),
    toCssVarClass(
      "--button-disabled-foreground",
      buttonIntentTokens.destructive.disabledForeground!,
    ),
    toCssVarClass(
      "--button-disabled-border",
      buttonIntentTokens.destructive.disabledBorder!,
    ),
  ],
  outline: [
    toCssVarClass("--button-bg", buttonIntentTokens.outline.background!),
    toCssVarClass("--button-foreground", buttonIntentTokens.outline.foreground!),
    toCssVarClass("--button-border", buttonIntentTokens.outline.border!),
    toCssVarClass(
      "--button-hover-bg",
      buttonIntentTokens.outline.hoverBackground!,
    ),
    toCssVarClass(
      "--button-hover-foreground",
      buttonIntentTokens.outline.hoverForeground!,
    ),
    toCssVarClass("--button-focus-ring", buttonIntentTokens.outline.focusRing!),
    toCssVarClass(
      "--button-disabled-bg",
      buttonIntentTokens.outline.disabledBackground!,
    ),
    toCssVarClass(
      "--button-disabled-foreground",
      buttonIntentTokens.outline.disabledForeground!,
    ),
    toCssVarClass(
      "--button-disabled-border",
      buttonIntentTokens.outline.disabledBorder!,
    ),
  ],
  ghost: [
    toCssVarClass("--button-bg", buttonIntentTokens.ghost.background!),
    toCssVarClass("--button-foreground", buttonIntentTokens.ghost.foreground!),
    toCssVarClass("--button-border", buttonIntentTokens.ghost.border!),
    toCssVarClass(
      "--button-hover-bg",
      buttonIntentTokens.ghost.hoverBackground!,
    ),
    toCssVarClass(
      "--button-hover-foreground",
      buttonIntentTokens.ghost.hoverForeground!,
    ),
    toCssVarClass("--button-focus-ring", buttonIntentTokens.ghost.focusRing!),
    toCssVarClass(
      "--button-disabled-bg",
      buttonIntentTokens.ghost.disabledBackground!,
    ),
    toCssVarClass(
      "--button-disabled-foreground",
      buttonIntentTokens.ghost.disabledForeground!,
    ),
    toCssVarClass(
      "--button-disabled-border",
      buttonIntentTokens.ghost.disabledBorder!,
    ),
  ],
  link: [
    toCssVarClass("--button-bg", buttonIntentTokens.link.background!),
    toCssVarClass("--button-foreground", buttonIntentTokens.link.foreground!),
    toCssVarClass("--button-border", buttonIntentTokens.link.border!),
    toCssVarClass(
      "--button-hover-bg",
      buttonIntentTokens.link.hoverBackground!,
    ),
    toCssVarClass(
      "--button-hover-foreground",
      buttonIntentTokens.link.hoverForeground!,
    ),
    toCssVarClass("--button-focus-ring", buttonIntentTokens.link.focusRing!),
    toCssVarClass(
      "--button-disabled-bg",
      buttonIntentTokens.link.disabledBackground!,
    ),
    toCssVarClass(
      "--button-disabled-foreground",
      buttonIntentTokens.link.disabledForeground!,
    ),
    toCssVarClass(
      "--button-disabled-border",
      buttonIntentTokens.link.disabledBorder!,
    ),
  ],
};

const buttonIntentClassMap: Record<ButtonIntent, string> = {
  primary: cn(buttonIntentVariableClasses.primary, buttonIntentTokens.primary.shadow),
  secondary: cn(
    buttonIntentVariableClasses.secondary,
    buttonIntentTokens.secondary.shadow,
  ),
  destructive: cn(
    buttonIntentVariableClasses.destructive,
    buttonIntentTokens.destructive.shadow,
  ),
  outline: cn(buttonIntentVariableClasses.outline, buttonIntentTokens.outline.shadow),
  ghost: cn(buttonIntentVariableClasses.ghost, buttonIntentTokens.ghost.shadow),
  link: cn(buttonIntentVariableClasses.link, buttonIntentTokens.link.shadow),
};

const createIntentOverrideStyle = (
  overrides?: ButtonIntentOverrides,
): React.CSSProperties | undefined => {
  if (!overrides) {
    return undefined;
  }

  const cssVars: React.CSSProperties = {};
  const assignVar = (name: string, value?: string) => {
    if (value) {
      cssVars[name as any] = value;
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

  return cssVars;
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
  ),
  {
    variants: {
      intent: {
        primary: cn(buttonIntentClassMap.primary),
        secondary: cn(buttonIntentClassMap.secondary),
        destructive: cn(buttonIntentClassMap.destructive),
        outline: cn(buttonIntentClassMap.outline),
        ghost: cn(buttonIntentClassMap.ghost),
        link: cn(
          buttonIntentClassMap.link,
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
