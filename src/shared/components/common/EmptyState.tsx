// src/shared/components/common/EmptyState.tsx
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";
import { colors, componentRadius, withAlpha } from "@/styles/tokens";

type EmptyStateAction =
  | { label: string; onClick: () => void }
  | (() => ReactNode)
  | ReactNode;

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  const renderAction = () => {
    if (!action) return null;

    if (typeof action === "function") {
      return action();
    }

    if (
      typeof action === "object" &&
      action !== null &&
      "label" in action &&
      "onClick" in action
    ) {
      const { label, onClick } = action as { label: string; onClick: () => void };
      return <Button onClick={onClick}>{label}</Button>;
    }

    return action;
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      style={{ color: colors.text.secondary }}
    >
      {Icon && (
        <div
          className={cn("mb-4 p-4", componentRadius.badge)}
          style={{ backgroundColor: withAlpha(colors.bg.secondary, 0.9) }}
        >
          <Icon
            className="h-8 w-8"
            style={{ color: colors.text.tertiary }}
          />
        </div>
      )}

      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: colors.text.primary }}
      >
        {title}
      </h3>

      {description && (
        <p
          className="text-sm max-w-md mb-6"
          style={{ color: colors.text.secondary }}
        >
          {description}
        </p>
      )}

      {renderAction()}

      {children}
    </div>
  );
}
