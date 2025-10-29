// src/shared/components/layout/PageLayout.tsx
import {
  ComponentType,
  ReactNode,
  cloneElement,
  isValidElement,
} from "react";

import { Navbar, type NavbarProps } from "@/components/ui/navbar";
import { cn } from "@/shared/utils";

import FooterNavEnhanced from "./FooterNavEnhanced";
import { PageLayoutSlot, usePageLayoutComponents } from "./PageLayoutContext";

type PageLayoutProps = {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  navbar?: PageLayoutSlot;
  footer?: PageLayoutSlot;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
  navbarProps?: NavbarProps;
};

const DEFAULT_NAVBAR: PageLayoutSlot = Navbar;
const DEFAULT_FOOTER: PageLayoutSlot = FooterNavEnhanced;

export default function PageLayout({
  children,
  showNavbar = true,
  showFooter = true,
  navbar,
  footer,
  maxWidth = "2xl",
  className,
  navbarProps,
}: PageLayoutProps) {
  const { navbar: navbarFromContext, footer: footerFromContext } =
    usePageLayoutComponents();

  const resolvedNavbar = navbar ?? navbarFromContext ?? DEFAULT_NAVBAR;
  const resolvedFooter = footer ?? footerFromContext ?? DEFAULT_FOOTER;

  const shouldRenderNavbar = showNavbar && Boolean(resolvedNavbar);
  const shouldRenderFooter = showFooter && Boolean(resolvedFooter);

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
      {shouldRenderNavbar && renderSlot(resolvedNavbar, navbarProps)}

      <main
        className={cn(
          "flex-1 w-full mx-auto px-4",
          maxWidthClass,
          shouldRenderFooter && "pb-20",
          className,
        )}
      >
        {children}
      </main>

      {shouldRenderFooter && renderSlot(resolvedFooter)}
    </div>
  );
}

function renderSlot<P extends object>(slot?: PageLayoutSlot, props?: P) {
  if (!slot) return null;

  if (isValidElement(slot)) {
    return props ? cloneElement(slot, props) : slot;
  }

  const SlotComponent = slot as ComponentType<P>;
  return <SlotComponent {...props} />;
}
