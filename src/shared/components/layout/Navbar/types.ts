import type { ComponentType, ReactNode } from "react";

/**
 * Navbar Link Configuration
 */
export type NavbarLink = {
  href: string;
  label: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  isExternal?: boolean;
  onClick?: () => void;
};

/**
 * Navbar Component Props
 */
export interface NavbarProps {
  /** Array of navigation links */
  links?: NavbarLink[];
  /** Logo link destination */
  logoHref?: string;
  /** Custom logo component */
  logo?: ReactNode;
  /** Number of unread notifications */
  notificationCount?: number;
  /** Notifications page URL */
  notificationsHref?: string;
  /** Show/hide notifications bell */
  showNotifications?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Mobile menu button label */
  mobileMenuLabel?: string;
  /** Text direction */
  direction?: "ltr" | "rtl";
}
