import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/shared/utils";
import { colors, gradients } from "@/styles/tokens";

interface NavbarLogoProps {
  href: string;
  logo?: ReactNode;
  isRTL: boolean;
}

/**
 * Navbar Logo Component
 * Displays the Exaado logo with gradient text
 */
export function NavbarLogo({ href, logo, isRTL }: NavbarLogoProps) {
  const logoContent =
    logo ?? (
      <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
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

  return (
    <Link
      href={href}
      className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-md transition-opacity hover:opacity-90"
      style={{
        color: colors.text.primary,
        // @ts-ignore - CSS variable
        "--tw-ring-color": colors.border.focus,
        // @ts-ignore - CSS variable
        "--tw-ring-offset-color": colors.bg.primary,
      }}
      aria-label="العودة إلى الصفحة الرئيسية"
    >
      {logoContent}
    </Link>
  );
}
