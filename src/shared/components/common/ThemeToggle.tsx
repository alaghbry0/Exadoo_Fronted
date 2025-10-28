"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeController } from "@/shared/theme/ThemeProvider";

const ThemeSwitcher = () => {
  const { isMounted, isDark, toggleTheme } = useThemeController();

  if (!isMounted) return null; // ✅ يمنع مشاكل SSR ويضمن تحميل الزر بشكل صحيح

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-all"
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? (
        <Sun className="text-yellow-500" size={22} />
      ) : (
        <Moon className="text-gray-800" size={22} />
      )}
    </button>
  );
};

export default ThemeSwitcher;
