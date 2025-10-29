import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { colors, spacing, typography } from "@/styles/tokens";

interface SectionHeadingProps {
  id: string;
  title: string;
  icon?: LucideIcon;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({
  id,
  title,
  icon: Icon,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div
      aria-labelledby={id}
      style={{
        display: "flex",
        alignItems: description ? "flex-start" : "center",
        justifyContent: action ? "space-between" : "flex-start",
        gap: spacing[4],
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: description ? "flex-start" : "center",
          gap: spacing[3],
        }}
      >
        {Icon ? (
          <Icon
            aria-hidden="true"
            size={24}
            style={{ color: colors.brand.primary, flexShrink: 0 }}
          />
        ) : null}
        <div style={{ display: "grid", gap: description ? spacing[2] : 0 }}>
          <h2 id={id} className={typography.heading.lg} style={{ color: colors.text.primary }}>
            {title}
          </h2>
          {description ? (
            <p className={typography.body.sm} style={{ margin: 0, color: colors.text.secondary }}>
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
    </div>
  );
}
