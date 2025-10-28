"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemePreference = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "exaado-theme";

function ThemeProviderContent({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey={THEME_STORAGE_KEY}
      disableTransitionOnChange
    >
      <ThemeProviderContent>{children}</ThemeProviderContent>
    </NextThemesProvider>
  );
}

export function useThemeController() {
  const { theme, systemTheme, resolvedTheme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = useMemo(() => {
    if (!mounted) return undefined;
    return (resolvedTheme ?? theme ?? systemTheme ?? "light") as Exclude<
      ThemePreference,
      "system"
    >;
  }, [mounted, resolvedTheme, theme, systemTheme]);

  const applyTheme = useCallback(
    (value: ThemePreference) => {
      setTheme(value);
    },
    [setTheme],
  );

  const toggleTheme = useCallback(() => {
    if (!mounted) return;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [currentTheme, mounted, setTheme]);

  return {
    theme,
    systemTheme,
    resolvedTheme,
    currentTheme,
    setTheme: applyTheme,
    toggleTheme,
    isDark: currentTheme === "dark",
    isMounted: mounted,
  } as const;
}

export type { ThemePreference };
