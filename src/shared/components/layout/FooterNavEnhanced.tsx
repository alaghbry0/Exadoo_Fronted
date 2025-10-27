// src/shared/components/layout/FooterNavEnhanced.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ShoppingBag, User, GraduationCap } from "lucide-react";
import { cn } from "@/shared/utils";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/shop", icon: ShoppingBag, label: "المتجر" },
  { path: "/academy", icon: GraduationCap, label: "الأكاديمية" },
  { path: "/profile", icon: User, label: "حسابي" },
] as const;

export default function FooterNavEnhanced() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "h-16 border-t bg-white/80 dark:bg-neutral-900/80",
        "backdrop-blur-lg supports-[backdrop-filter]:bg-white/60",
        "safe-area-bottom",
      )}
      aria-label="التنقل الرئيسي"
    >
      <div className="flex h-full max-w-lg mx-auto items-center justify-around px-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);

          return (
            <Link
              key={path}
              href={path}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px]",
                "transition-colors duration-200",
                active
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-neutral-400",
              )}
              aria-current={active ? "page" : undefined}
            >
              <motion.div whileTap={{ scale: 0.9 }} className="relative">
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />

                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute -inset-2 -z-10 rounded-full bg-primary-50 dark:bg-primary-900/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>

              <span
                className={cn("text-xs font-medium", active && "font-semibold")}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
