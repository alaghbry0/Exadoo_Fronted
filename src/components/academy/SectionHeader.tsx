// src/components/academy/SectionHeader.tsx
import { memo } from "react";
import { cn } from "@/lib/utils";
import { componentVariants } from "@/components/ui/variants";
import { colors } from "@/styles/tokens";

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  id: string;
}

export const SectionHeader = memo(
  ({ icon: Icon, title, id }: SectionHeaderProps) => (
    <div className="mb-6 flex items-center gap-4">
      <div
        className={cn(
          componentVariants.card.elevated,
          "grid place-items-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600",
        )}
      >
        <Icon className="w-7 h-7" style={{ color: "#FFFFFF" }} />
      </div>
      <h2
        id={id}
        className="text-3xl font-bold tracking-tight"
        style={{ color: colors.text.primary }}
      >
        {title}
      </h2>
    </div>
  ),
);

SectionHeader.displayName = "SectionHeader";
