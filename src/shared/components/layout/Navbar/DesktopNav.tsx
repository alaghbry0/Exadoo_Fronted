import Link from "next/link";
import { cn } from "@/shared/utils";
import { colors, semanticSpacing } from "@/styles/tokens";
import type { NavbarLink } from "./types";

interface DesktopNavProps {
  links: NavbarLink[];
  isRTL: boolean;
}

/**
 * Desktop Navigation Links
 * Hidden on mobile, visible on md+ screens
 */
export function DesktopNav({ links, isRTL }: DesktopNavProps) {
  return (
    <div
      className={cn(
        "hidden md:flex items-center",
        isRTL && "md:flex-row-reverse"
      )}
      style={{ gap: semanticSpacing.component.lg }}
    >
      {links.map(({ href, label, isExternal, icon: Icon, onClick }) => (
        <Link
          key={href}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={onClick}
          className="text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md px-2 py-1"
          style={{
            color: colors.text.secondary,
            // @ts-ignore - CSS variable
            "--tw-ring-color": colors.border.focus,
            // @ts-ignore - CSS variable
            "--tw-ring-offset-color": colors.bg.primary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.brand.primaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.text.secondary;
          }}
        >
          <span className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" aria-hidden />}
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
