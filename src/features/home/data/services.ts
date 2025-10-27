// src/features/home/data/services.ts
import type { LucideIcon } from "lucide-react";
import { TrendingUp, BarChart3, Activity } from "lucide-react";

// Import animations
import signalsAnimation from "@/animations/signals.json";
import forexAnimation from "@/animations/forex.json";
import buyIndicatorAnimation from "@/animations/buy_indicator.json";

export interface HomeServiceMeta {
  key: string;
  title: string;
  description: string;
  href: string;
  icon?: LucideIcon;
  animationData?: any;
}

export const HOME_SERVICES: HomeServiceMeta[] = [
  {
    key: "signals",
    title: "Exaado Signals",
    description: "Get real-time crypto signals to boost your trading performance.",
    href: "/shop/signals",
    animationData: signalsAnimation,
  },
  {
    key: "forex",
    title: "Exaado Forex",
    description: "Trade crypto with precision insights and expert-backed strategies.",
    href: "/forex",
    animationData: forexAnimation,
  },
  {
    key: "indicators",
    title: "Exaado Buy Indicators",
    description: "Power your crypto trading with advanced Gann-based indicator tools from Exaado's top experts.",
    href: "/indicators",
    animationData: buyIndicatorAnimation,
  },
];
