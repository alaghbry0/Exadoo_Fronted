// src/shared/components/common/EmptyState.tsx
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="mb-4 p-4 rounded-full bg-gray-100 dark:bg-neutral-800">
          <Icon className="h-8 w-8 text-gray-400 dark:text-neutral-500" />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-600 dark:text-neutral-400 max-w-md mb-6">
          {description}
        </p>
      )}

      {action && <Button onClick={action.onClick}>{action.label}</Button>}

      {children}
    </div>
  );
}
