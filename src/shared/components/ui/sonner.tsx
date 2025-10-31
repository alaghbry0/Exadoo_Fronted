"use client";

import { Toaster as Sonner } from "sonner";

import { useThemeController } from "@/shared/theme/ThemeProvider";

type SonnerToasterProps = React.ComponentProps<typeof Sonner>;

const SonnerToaster = ({ ...props }: SonnerToasterProps) => {
  const { theme = "system", currentTheme, isMounted } = useThemeController();
  const sonnerTheme: SonnerToasterProps["theme"] = !isMounted
    ? "system"
    : theme === "system"
      ? "system"
      : (currentTheme ?? "light");

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { SonnerToaster };
