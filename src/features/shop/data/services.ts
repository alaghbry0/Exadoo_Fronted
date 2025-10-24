import type { LucideIcon } from "lucide-react";
import { BarChart3, TrendingUp } from "lucide-react";

import type {
  ServiceCardAccent,
  ServiceCardLayout,
  ServiceCardVariant,
} from "@/shared/components/common/ServiceCardV2";

export type ShopServiceType = "standard" | "indicators" | "consultations";

export interface ShopServiceMeta {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: ServiceCardAccent;
  layout: ServiceCardLayout;
  variant?: ServiceCardVariant;
  badge?: string;
  type?: ShopServiceType;
  isLive?: boolean;
}

export const SHOP_SERVICES: ShopServiceMeta[] = [
  {
    key: "signals",
    title: "Exaado Signals",
    description: "إشارات لحظية مدروسة تعزز قراراتك وتقلل الضوضاء.",
    href: "/shop/signals",
    icon: TrendingUp,
    accent: "secondary",
    layout: "half",
    type: "standard",
    isLive: true,
  },
  {
    key: "indicators",
    title: "مؤشرات Exaado للبيع والشراء",
    description:
      "حزمة مؤشرات متقدمة (Gann-based) بأداء مُثبت وتجربة سلسة.",
    href: "/indicators",
    icon: BarChart3,
    accent: "primary",
    layout: "wide",
    variant: "split",
    type: "indicators",
  },
  {
    key: "forex",
    title: "Exaado Forex",
    description:
      "تحكم كامل في صفقاتك مع لوحات Exaado للتداول. نفّذ أوامرك بنقرة واحدة، أدر مخاطرك بفعالية، وركز على الأهم: تحقيق الأرباح.",
    href: "/forex",
    icon: TrendingUp,
    accent: "primary",
    layout: "half",
    type: "standard",
  },
];
