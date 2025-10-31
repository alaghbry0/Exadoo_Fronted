import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/utils";
import { colors, componentRadius, semanticSpacing, withAlpha } from "@/styles/tokens";
import type { NavbarLink } from "./types";

type FocusRingStyles = CSSProperties & {
  "--tw-ring-color": string;
  "--tw-ring-offset-color": string;
};

interface MobileNavProps {
  links: NavbarLink[];
  mobileMenuLabel: string;
  direction: "ltr" | "rtl";
  isRTL: boolean;
}

/**
 * Mobile Navigation Menu (Sheet/Drawer)
 * Visible only on mobile screens
 */
export function MobileNav({
  links,
  mobileMenuLabel,
  direction,
  isRTL,
}: MobileNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          intent="ghost"
          density="icon"
          aria-label={mobileMenuLabel}
          className="md:hidden"
          style={{ color: colors.text.primary }}
        >
          {mobileMenuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
        </Button>
      </SheetTrigger>
      <SheetContent
        side={isRTL ? "left" : "right"}
        dir={direction}
        className={cn(
          componentRadius.modal,
          isRTL ? "border-r" : "border-l",
          "w-[320px] sm:w-[360px]"
        )}
        style={{
          backgroundColor: colors.bg.primary,
          color: colors.text.primary,
          borderColor: withAlpha(colors.border.default, 0.6),
        }}
      >
        <nav
          className="flex flex-col"
          style={{
            gap: semanticSpacing.component.lg,
            marginTop: semanticSpacing.layout.sm,
          }}
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
                "flex items-center justify-between px-4 py-3 text-lg font-medium transition-all duration-200",
                componentRadius.dropdown,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              )}
              style={{
                backgroundColor: withAlpha(colors.bg.secondary, 0.3),
                color: colors.text.primary,
                "--tw-ring-color": colors.border.focus,
                "--tw-ring-offset-color": colors.bg.primary,
              } as FocusRingStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = withAlpha(
                  colors.bg.secondary,
                  0.6
                );
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = withAlpha(
                  colors.bg.secondary,
                  0.3
                );
              }}
            >
              <span className="flex items-center gap-3">
                {Icon && <Icon className="h-5 w-5" aria-hidden />}
                {label}
              </span>
              <span aria-hidden>›</span>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
