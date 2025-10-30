"use client";

import { cn } from "@/shared/utils";
import { colors, shadowClasses, semanticSpacing, withAlpha } from "@/styles/tokens";
import { NavbarLogo } from "./NavbarLogo";
import { DesktopNav } from "./DesktopNav";
import { NavActions } from "./NavActions";
import { MobileNav } from "./MobileNav";
import { DEFAULT_LINKS } from "./constants";
import type { NavbarProps } from "./types";

/**
 * Main Navbar Component
 * 
 * Features:
 * - Responsive design (desktop + mobile)
 * - RTL support
 * - Dark mode support
 * - Notifications badge
 * - Theme toggle
 * - Sticky header with backdrop blur
 * 
 * @example
 * ```tsx
 * <Navbar
 *   links={[
 *     { href: "/academy", label: "الأكاديمية" },
 *     { href: "/profile", label: "حسابي" }
 *   ]}
 *   notificationCount={5}
 *   direction="rtl"
 * />
 * ```
 */
export function Navbar({
  links = DEFAULT_LINKS,
  logoHref = "/",
  logo,
  notificationCount = 0,
  notificationsHref = "/notifications",
  showNotifications = true,
  className,
  mobileMenuLabel = "القائمة",
  direction = "ltr",
}: NavbarProps) {
  const isRTL = direction === "rtl";
  const unreadCount = Math.max(0, notificationCount || 0);

  return (
    <header
      dir={direction}
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-md supports-[backdrop-filter]:bg-transparent",
        shadowClasses.card,
        className
      )}
      style={{
        backgroundColor: withAlpha(colors.bg.elevated, 0.92),
        borderColor: withAlpha(colors.border.default, 0.85),
      }}
    >
      <nav
        className={cn(
          "mx-auto flex h-16 w-full items-center justify-between max-w-screen-2xl",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}
        style={{
          paddingLeft: semanticSpacing.layout.sm,
          paddingRight: semanticSpacing.layout.sm,
        }}
        aria-label="التنقل الرئيسي"
      >
        {/* Logo */}
        <NavbarLogo href={logoHref} logo={logo} isRTL={isRTL} />

        {/* Desktop Navigation Links */}
        <DesktopNav links={links} isRTL={isRTL} />

        {/* Actions Container */}
        <div
          className={cn("flex items-center", isRTL && "flex-row-reverse")}
          style={{ gap: semanticSpacing.component.md }}
        >
          {/* Theme Toggle + Notifications */}
          <NavActions
            showNotifications={showNotifications}
            notificationCount={unreadCount}
            notificationsHref={notificationsHref}
            isRTL={isRTL}
          />

          {/* Mobile Menu */}
          <MobileNav
            links={links}
            mobileMenuLabel={mobileMenuLabel}
            direction={direction}
            isRTL={isRTL}
          />
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
