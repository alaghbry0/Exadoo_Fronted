// src/features/home/components/HomeSearchBar.tsx
"use client";

import { Search } from "lucide-react";
import { colors, radius, spacing } from "@/styles/tokens";

interface HomeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function HomeSearchBar({
  value,
  onChange,
  placeholder = "Enter the search word",
}: HomeSearchBarProps) {
  return (
    <div
      className="px-4 pt-4 pb-6"
      style={{ backgroundColor: colors.bg.secondary }}
    >
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2"
          style={{ color: colors.text.tertiary }}
          size={22}
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border-0 focus:outline-none focus:ring-2 transition-all text-gray-900 font-normal placeholder:text-gray-400"
          style={{
            borderRadius: radius["2xl"],
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            fontFamily: "var(--font-arabic)",
            color: colors.text.primary,
          }}
          aria-label="بحث في الخدمات"
        />
      </div>
    </div>
  );
}
