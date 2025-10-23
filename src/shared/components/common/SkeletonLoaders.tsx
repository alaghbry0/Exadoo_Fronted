import { cn } from "@/lib/utils";
import { componentVariants, mergeVariants } from "@/components/ui/variants";
// components/shared/SkeletonLoaders.tsx

import { Card, CardContent } from "@/components/ui/card";

/**
 * Skeleton Loader لبطاقة نصف عرض (Half Card)
 */
export const HalfCardSkeleton = () => (
  <Card
    className={cn(componentVariants.card.base, "h-full rounded-card-lg dark:")}
  >
    <CardContent className="p-5">
      <div className="flex items-start gap-4 animate-pulse">
        {/* Icon Skeleton */}
        <div className="h-12 w-12 rounded-2xl bg-gray-200 dark:bg-neutral-800 shrink-0" />

        {/* Content Skeleton */}
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-neutral-800 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-5/6" />
          </div>
        </div>
      </div>

      {/* CTA Skeleton */}
      <div className="mt-4 pt-4">
        <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-24" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Skeleton Loader لبطاقة كامل العرض (Wide Card)
 */
export const WideCardSkeleton = () => (
  <Card className={cn(componentVariants.card.base, "rounded-card-lg dark:")}>
    <CardContent className="p-5 md:p-6">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gray-200 dark:bg-neutral-800 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-2/3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-4/5" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-32" />
            <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-24" />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded w-32" />
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Skeleton Loader لبطاقة الأكاديمية
 */
export const AcademyCardSkeleton = () => (
  <Card className={cn(componentVariants.card.base, "rounded-card-lg dark:")}>
    <CardContent className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-1/2" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded w-16 mx-auto" />
              <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
        <div className="h-10 bg-gray-200 dark:bg-neutral-800 rounded w-full" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Grid Skeleton - لعرض عدة بطاقات
 */
interface GridSkeletonProps {
  count?: number;
  variant?: "half" | "wide" | "mixed";
}

export const GridSkeleton = ({
  count = 4,
  variant = "mixed",
}: GridSkeletonProps) => {
  if (variant === "half") {
    return (
      <div className="grid grid-cols-12 gap-4 sm:gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="col-span-12 sm:col-span-6">
            <HalfCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "wide") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <WideCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Mixed: 1 wide + 2 half
  return (
    <div className="space-y-4">
      <WideCardSkeleton />
      <div className="grid grid-cols-12 gap-4 sm:gap-5">
        <div className="col-span-12 sm:col-span-6">
          <HalfCardSkeleton />
        </div>
        <div className="col-span-12 sm:col-span-6">
          <HalfCardSkeleton />
        </div>
      </div>
    </div>
  );
};

/**
 * Search Skeleton - أثناء البحث
 */
export const SearchSkeleton = () => (
  <div className="space-y-4">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-48 mb-6" />
      <GridSkeleton count={3} variant="mixed" />
    </div>
  </div>
);
