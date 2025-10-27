// src/components/shared/ConsultationsCard.tsx
"use client";

import { ServiceCardV2 } from "./ServiceCardV2";
import { CalendarCheck2, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function ConsultationsCard({
  title,
  description,
  href,
  eyebrow,
  variant = "minimal",
}: {
  title: string;
  description: string;
  href: string;
  eyebrow?: string;
  variant?: "minimal" | "glass" | "dark" | "compact" | "split";
}) {
  const Right = (
    <Button
      variant="outline"
      className="rounded-xl border-gray-300 dark:border-neutral-700"
    >
      احجز الآن <ArrowLeft className="w-4 h-4 mr-2" />
    </Button>
  );

  return (
    <ServiceCardV2
      title={title}
      description={description}
      href={href}
      icon={CalendarCheck2}
      accent="success"
      layout="wide"
      variant={variant}
      rightSlot={Right}
      badge={eyebrow}
    />
  );
}
