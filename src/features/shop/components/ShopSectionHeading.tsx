import type { LucideIcon } from "lucide-react";

import { colors, spacing, typography } from "@/styles/tokens";

interface ShopSectionHeadingProps {
  icon: LucideIcon;
  title: string;
  id: string;
}

export function ShopSectionHeading({
  icon: Icon,
  title,
  id,
}: ShopSectionHeadingProps) {
  return (
    <div
      aria-labelledby={id}
      style={{
        display: "flex",
        alignItems: "center",
        gap: spacing[3],
        marginBottom: spacing[4],
      }}
    >
      <Icon aria-hidden="true" size={24} style={{ color: colors.brand.primary }} />
      <h2 id={id} className={typography.heading.lg} style={{ color: colors.text.primary }}>
        {title}
      </h2>
    </div>
  );
}
