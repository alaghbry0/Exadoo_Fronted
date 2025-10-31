// src/components/FooterNav.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/shared/utils";
import { Home, Bell, GraduationCap, User } from "lucide-react";

export type FooterNavItem = { path: string; icon: React.ElementType; label: string };

const DEFAULT_NAV_ITEMS: FooterNavItem[] = [
  { path: "/shop/signals", icon: Bell, label: "الإشارات" },
  { path: "/", icon: Home, label: "الرئيسية" },
  { path: "/academy", icon: GraduationCap, label: "الأكاديمية" },
  { path: "/profile", icon: User, label: "الملف" },
];

/**
 * ⚠️ ملاحظة مهمة:
 * - نستقبل currentPath من _app.tsx لتفادي مشاكل الهيدرشن مع usePathname في مشروع Pages Router.
 * - لو ما وصل currentPath لأي سبب، نستخدم router.asPath وننظفه (بدون كويري/هاش).
 */
export interface FooterNavProps {
  items?: FooterNavItem[];
  currentPath?: string;
}

export default function FooterNav({
  items = DEFAULT_NAV_ITEMS,
  currentPath,
}: FooterNavProps) {
  const router = useRouter();

  // مسار مستقر + fallback آمن
  const pathname = useMemo(() => {
    let p =
      currentPath ??
      (router.asPath ? router.asPath.split("?")[0].split("#")[0] : "/");
    if (!p || p === "/index") p = "/";
    return p;
  }, [currentPath, router.asPath]);

  const isItemActive = (itemPath: string) => {
    if (itemPath === "/") return pathname === "/";
    // فعّل التبويب لو المسار يساويه أو يبدأ به مع '/'
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
  };

  const tabVariants: Variants = {
    active: {
      y: -2,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
    inactive: {
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
  };

  return (
    <nav
      dir="rtl"
      aria-label="التنقّل السفلي"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[9] h-[70px]",
        "bg-gray-50/90 dark:bg-neutral-900/80 backdrop-blur-lg",
        "border-t border-gray-200/80 dark:border-neutral-800",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-stretch h-full max-w-lg mx-auto">
        {items.map((item) => {
          const active = isItemActive(item.path);
          return (
            <Link
              href={item.path}
              key={item.path}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center gap-1",
                "transition-colors duration-300 ease-out select-none",
                active
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400",
              )}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
            >
              <motion.div
                className="flex flex-col items-center"
                animate={active ? "active" : "inactive"}
                variants={tabVariants}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </motion.div>

              {active && (
                <motion.div
                  className="absolute bottom-1.5 w-5 h-1 rounded-full bg-primary-600 dark:bg-primary-400"
                  layoutId="active-indicator"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
