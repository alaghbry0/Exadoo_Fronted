// src/shared/components/layout/index.ts
export { Navbar, type NavbarProps } from "@/components/ui/navbar";
export { default as FooterNavEnhanced } from "./FooterNavEnhanced";
export { default as PageLayout } from "./PageLayout";
export {
  PageLayoutComponentsProvider,
  usePageLayoutComponents,
} from "./PageLayoutContext";
