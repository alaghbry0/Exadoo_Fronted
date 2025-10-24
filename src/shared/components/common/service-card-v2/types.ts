import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type Accent = "primary" | "secondary" | "success";
export type Variant = "minimal" | "glass" | "dark" | "compact" | "split";
export type Layout = "half" | "wide";
export type IconSize = "md" | "lg";

export interface IconConfig {
  size: number;
  dimension: string;
  padding: string;
}

export interface AccentTheme {
  background: string;
  color: string;
}

export interface VariantTheme {
  container: CSSProperties;
  overlay?: ReactNode;
  descriptionColor: string;
  titleColor: string;
  ctaTone: "primary" | "light";
}

export interface StatChip {
  label: string;
  value: number | string;
  variant?: "default" | "success";
}

export interface ServiceCardV2Props {
  title: string;
  description?: string;
  icon?: LucideIcon;
  href: string;
  accent?: Accent;
  badge?: string;
  ctaLabel?: string;
  imageUrl?: string;
  stats?: StatChip[];
  rightSlot?: ReactNode;
  className?: string;
  layout?: Layout;
  variant?: Variant;
  size?: IconSize;
  prefetch?: boolean;
}
