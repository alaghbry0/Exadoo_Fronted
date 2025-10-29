// src/shared/components/layout/index.ts
export { default as FooterNav, type FooterNavProps } from "./FooterNav";
export { Navbar, type NavbarProps } from "@/shared/components/layout/Navbar";
export { default as PageLayout } from "./PageLayout";
export { HorizontalScroll, buildCountBadge } from "./HorizontalScroll";
export {
  PageLayoutComponentsProvider,
  usePageLayoutComponents,
} from "./PageLayoutContext";
