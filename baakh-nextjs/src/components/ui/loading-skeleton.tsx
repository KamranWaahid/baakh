import { Skeleton } from "./skeleton";

// Main page loading skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section Skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-2/3 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <div className="flex justify-center gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Featured Content Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>

          {/* Categories Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Couplet Card Skeleton Component
const CoupletCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-full border border-gray-200/50 bg-white rounded-[12px] shadow-none overflow-hidden">
      <div className="p-8">
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
      </div>
    </div>
  </div>
);

// Couplets page loading skeleton
export function CoupletsSkeleton() {
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

        {/* Pagination Skeleton */}
        <div className="flex justify-center gap-3 mt-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-12 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Poets page loading skeleton
export function PoetsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-80" />
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Poets Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="text-center space-y-3">
                <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Categories page loading skeleton
export function CategoriesSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-6 w-88" />
          </div>

          {/* Categories Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// About page loading skeleton
export function AboutSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {/* Hero Section Skeleton */}
          <div className="text-center space-y-6">
            <Skeleton className="h-16 w-96 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>

          {/* Mission Section Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center space-y-4">
                  <Skeleton className="h-16 w-16 mx-auto rounded-full" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Team Section Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-10 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="text-center space-y-3">
                  <Skeleton className="h-32 w-32 mx-auto rounded-full" />
                  <Skeleton className="h-6 w-28 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Contact page loading skeleton
export function ContactSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>

            {/* Contact Info Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
