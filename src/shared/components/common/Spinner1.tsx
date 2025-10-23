
import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-full w-full animate-spin">
          <svg
            viewBox="0 0 50 50"
            className="h-full w-full"
          >
            <circle
              className="opacity-20"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <circle
              className="opacity-75"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
              strokeDashoffset="0"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
