import * as React from "react";
import { cn } from "@/shared/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  indicatorClassName,
  ...props
}) => {
  const percentage = Math.min(Math.max(value, 0), max);

  return (
    <div
      role="progressbar"
      aria-valuemax={max}
      aria-valuenow={percentage}
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-gray-100", // حاوية شريط التقدم مع خلفية فاتحة وحواف مستديرة
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-300", // تأثير انتقال سلس لتغير العرض
          indicatorClassName || "bg-gradient-to-r from-blue-400 to-blue-600", // استخدام تدرج لوني افتراضي أو استبداله بالكلاسات الممررة
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

Progress.displayName = "Progress";

export { Progress };
