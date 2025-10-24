// src/components/academy/SkeletonCard.tsx
import { colors } from "@/styles/tokens";

export function SkeletonCard() {
  return (
    <div
      className="h-full overflow-hidden rounded-3xl border p-3 sm:p-4 shadow-lg"
      style={{
        borderColor: colors.border.default,
        backgroundColor: colors.bg.primary,
      }}
    >
      <div
        className="aspect-[4/3] sm:aspect-[16/9] w-full rounded-2xl animate-pulse"
        style={{ backgroundColor: colors.bg.secondary }}
      />
      <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
        <div
          className="h-4 sm:h-5 w-3/4 rounded-lg animate-pulse"
          style={{ backgroundColor: colors.bg.secondary }}
        />
        <div
          className="h-3.5 sm:h-4 w-1/2 rounded-lg animate-pulse"
          style={{ backgroundColor: colors.bg.secondary }}
        />
        <div
          className="h-3 w-full rounded-lg animate-pulse"
          style={{ backgroundColor: colors.bg.secondary }}
        />
      </div>
    </div>
  );
}
