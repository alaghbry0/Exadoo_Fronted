import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SubscriptionCardSkeleton() {
  return (
    <Card className="relative overflow-hidden animate-pulse">
      <CardHeader className="space-y-3 pb-4">
        {/* Icon Skeleton */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Features Skeleton */}
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
            </div>
          ))}
        </div>

        {/* Price Skeleton */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          </div>

          {/* Button Skeleton */}
          <div className="h-11 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-xl w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SubscriptionCardSkeleton key={i} />
      ))}
    </div>
  );
}
