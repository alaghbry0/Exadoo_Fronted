"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Menu, X } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import ThemeToggle from "@/shared/components/common/ThemeToggle";
import { cn } from "@/shared/utils";
import {
  colors,
  componentRadius,
  gradients,
  semanticSpacing,
  shadowClasses,
  withAlpha,
} from "@/styles/tokens";

export type NavbarLink = {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  isExternal?: boolean;
  onClick?: () => void;
};

export interface NavbarProps {
  links?: NavbarLink[];
  logoHref?: string;
  logo?: ReactNode;
  notificationCount?: number;
  notificationsHref?: string;
  showNotifications?: boolean;
  className?: string;
  mobileMenuLabel?: string;
}

const DEFAULT_LINKS: NavbarLink[] = [
  { href: "/shop", label: "المتجر" },
  { href: "/academy", label: "الأكاديمية" },
  { href: "/settings/customization", label: "التخصيص" },
  { href: "/profile", label: "حسابي" },
];

export function Navbar({
  links = DEFAULT_LINKS,
  logoHref = "/",
  logo,
  notificationCount = 0,
  notificationsHref = "/notifications",
  showNotifications = true,
  className,
  mobileMenuLabel = "القائمة",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = Math.max(0, notificationCount || 0);

  const logoContent = logo ?? (
    <div className="flex items-center gap-2">
      <Image
        src="/logo.png"
        alt="Exaado"
        width={40}
        height={40}
        className="object-contain"
        priority
      />
      <span
        className="text-xl font-bold text-transparent bg-clip-text"
        style={{ backgroundImage: gradients.text.brand }}
      >
        Exaado
      </span>
    </div>
  );

  const navLinkClass = cn(
    "text-sm font-medium transition-colors duration-200",
    `text-[${colors.text.secondary}]`,
    `hover:text-[${colors.brand.primaryHover}]`,
    "focus-visible:outline-none focus-visible:ring-2",
    `focus-visible:ring-[${colors.border.focus}]`,
    `focus-visible:ring-offset-[${colors.bg.primary}]`,
    "focus-visible:ring-offset-2",
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-md supports-[backdrop-filter]:bg-transparent",
        shadowClasses.card,
        className,
      )}
      style={{
        backgroundColor: withAlpha(colors.bg.elevated, 0.92),
        borderColor: withAlpha(colors.border.default, 0.85),
      }}
    >
      <nav
        className={cn(
          "mx-auto flex h-16 w-full items-center justify-between",
          "max-w-screen-2xl",
          `px-[${semanticSpacing.layout.sm}]`,
          `md:px-[${semanticSpacing.layout.md}]`,
          `lg:px-[${semanticSpacing.layout.lg}]`,
        )}
        aria-label="التنقل الرئيسي"
      >
        <Link
          href={logoHref}
          className={cn(
            "flex items-center gap-3",
            `text-[${colors.text.primary}]`,
            "focus-visible:outline-none focus-visible:ring-2",
            `focus-visible:ring-[${colors.border.focus}]`,
            `focus-visible:ring-offset-[${colors.bg.primary}]`,
            "focus-visible:ring-offset-2",
          )}
          aria-label="العودة إلى الصفحة الرئيسية"
        >
          {logoContent}
        </Link>

        <div
          className={cn(
            "hidden md:flex items-center",
            `gap-[${semanticSpacing.component.lg}]`,
          )}
        >
          {links.map(({ href, label, isExternal, icon: Icon, onClick }) => (
            <Link
              key={href}
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              onClick={onClick}
              className={navLinkClass}
            >
              <span className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {label}
              </span>
            </Link>
          ))}
        </div>

        <div
          className={cn(
            "flex items-center",
            `gap-[${semanticSpacing.component.md}]`,
          )}
        >
          <div className="hidden md:flex">
            <ThemeToggle
              showLabels={false}
              showStatusText={false}
              className="shadow-none"
            />
          </div>

          {showNotifications && (
            <Button intent="ghost" density="icon" className="relative" asChild>
              <Link
                href={notificationsHref}
                aria-label="الإشعارات"
                className="flex h-full w-full items-center justify-center"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unreadCount > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center p-0 text-xs border-0",
                      componentRadius.badge,
                      `bg-[${colors.status.error}] text-[${colors.text.inverse}]`,
                    )}
                    aria-label={`عدد الإشعارات غير المقروءة: ${unreadCount}`}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                intent="ghost"
                density="icon"
                aria-label={mobileMenuLabel}
                className={cn(
                  `text-[${colors.text.primary}]`,
                  "md:hidden",
                )}
              >
                {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className={cn(
                componentRadius.modal,
                `bg-[${colors.bg.primary}]`,
                `text-[${colors.text.primary}]`,
                `border-l border-[${withAlpha(colors.border.default, 0.6)}]`,
                "w-[320px] sm:w-[360px]",
              )}
            >
              <nav
                className={cn(
                  "flex flex-col",
                  `gap-[${semanticSpacing.component.lg}]`,
                  `mt-[${semanticSpacing.layout.sm}]`,
                )}
                aria-label="روابط القائمة الجانبية"
              >
                {links.map(({ href, label, isExternal, icon: Icon, onClick }) => (
                  <Link
                    key={`mobile-${href}`}
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onClick?.();
                    }}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 text-lg font-medium transition-colors",
                      componentRadius.dropdown,
                      `bg-[${withAlpha(colors.bg.secondary, 0.3)}]`,
                      `text-[${colors.text.primary}]`,
                      `hover:bg-[${withAlpha(colors.bg.secondary, 0.6)}]`,
                      "focus-visible:outline-none focus-visible:ring-2",
                      `focus-visible:ring-[${colors.border.focus}]`,
                      `focus-visible:ring-offset-[${colors.bg.primary}]`,
                      "focus-visible:ring-offset-2",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {Icon && <Icon className="h-5 w-5" aria-hidden="true" />}
                      {label}
                    </span>
                    <span aria-hidden="true">›</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
