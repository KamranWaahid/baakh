import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Enhanced Couplet Card Skeleton Component
const CoupletCardSkeleton = () => (
  <div className="animate-pulse">
    <Card className="h-full border border-gray-200/50 bg-white rounded-[12px] shadow-none overflow-hidden">
      <CardContent className="p-8">
        {/* Couplet Content skeleton - matches actual couplet lines */}
        <div className="space-y-2 mb-6">
          <div className="text-center space-y-3">
            {/* First line of couplet */}
            <Skeleton className="h-6 w-4/5 mx-auto" />
            {/* Second line of couplet */}
            <Skeleton className="h-6 w-3/4 mx-auto" />
          </div>
        </div>

        {/* Poet Info skeleton - matches actual poet section */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Poet avatar skeleton */}
            <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <Skeleton className="w-4 h-4 rounded" />
            </div>
            {/* Poet name skeleton */}
            <Skeleton className="h-4 w-20" />
          </div>
          {/* Reading time skeleton */}
          <div className="flex items-center gap-2 text-xs">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>

        {/* Action Icons skeleton - matches actual action buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            {/* Like button skeleton */}
            <Skeleton className="h-8 w-8 rounded-full" />
            {/* Bookmark button skeleton */}
            <Skeleton className="h-8 w-8 rounded-full" />
            {/* Share button skeleton */}
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          {/* View count skeleton */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function CoupletsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Hero Section Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-80 mx-auto mb-6" />
          <Skeleton className="h-6 w-96 mx-auto mb-6" />
          
          {/* Stats Skeleton */}
          <div className="flex flex-wrap justify-center gap-8 mb-6">
            <div className="text-center">
              <Skeleton className="h-8 w-20 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          </div>
          
          {/* Academic Features Skeleton */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Skeleton className="h-10 w-80 rounded-full" />
          </div>
        </div>

        {/* Search and Filters Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-4 mb-8">
          {/* Search Bar Skeleton */}
          <div className="mb-4">
            <Skeleton className="h-10 w-96 mx-auto" />
          </div>

          {/* Filters Row Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Results Summary Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-sm p-6 mb-8 text-center">
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        {/* Couplets Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <CoupletCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
