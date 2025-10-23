// src/shared/components/layout/PageLayout.tsx
import { ReactNode } from "react";
import NavbarEnhanced from "./NavbarEnhanced";
import FooterNavEnhanced from "./FooterNavEnhanced";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

export default function PageLayout({
  children,
  showNavbar = true,
  showFooter = true,
  maxWidth = "2xl",
  className,
}: PageLayoutProps) {
  const maxWidthClass = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  }[maxWidth];

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <NavbarEnhanced />}

      <main
        className={cn(
          "flex-1 w-full mx-auto px-4",
          maxWidthClass,
          showFooter && "pb-20", // مسافة للـ footer
          className,
        )}
      >
        {children}
      </main>

      {showFooter && <FooterNavEnhanced />}
    </div>
  );
}
