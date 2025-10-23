import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export function CourseSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
      
      <CardContent className="p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
        </div>
        
        {/* Instructor Skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
        
        {/* Stats Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
        
        {/* Price Skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CourseSkeleton key={i} />
      ))}
    </div>
  )
}
