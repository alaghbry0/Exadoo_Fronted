import React from 'react'

export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 animate-pulse">
      {/* Icon Skeleton */}
      <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex-shrink-0" />
      
      <div className="flex-1 space-y-2">
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        
        {/* Content Skeleton */}
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </div>
        
        {/* Time Skeleton */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
      
      {/* Badge Skeleton */}
      <div className="w-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
    </div>
  )
}

export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  )
}
