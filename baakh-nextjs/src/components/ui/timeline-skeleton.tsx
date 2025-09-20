"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimelineSkeletonProps {
  count?: number;
  isSindhi?: boolean;
  isRTL?: boolean;
}

export function TimelineSkeleton({ count = 6, isSindhi = false, isRTL = false }: TimelineSkeletonProps) {
  return (
    <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Timeline line with gradient */}
      <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200/40 via-gray-200/60 to-gray-200/40" aria-hidden="true" />
      
      <div className="space-y-8">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative pl-12 sm:pl-16"
          >
            {/* Timeline dot skeleton */}
            <div className="absolute left-4 sm:left-8 mt-3 -translate-x-1/2">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
            </div>

            <Card className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 border-0">
              <CardHeader className="pt-6 pb-4">
                <div className="flex items-start gap-4">
                  {/* Icon skeleton */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
                    <div className="h-8 w-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      {/* Title skeleton */}
                      <Skeleton className="h-6 w-48 rounded-lg" />
                      {/* Badge skeleton */}
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    
                    {/* Meta info skeleton */}
                    <div className="flex gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded-md" />
                        <Skeleton className="h-4 w-24 rounded-md" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded-md" />
                        <Skeleton className="h-4 w-16 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-6">
                {/* Description skeleton */}
                <div className="mb-4 space-y-2">
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>

                {/* Characteristics skeleton */}
                <div className="mb-4">
                  <Skeleton className="h-4 w-24 mb-2 rounded-md" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-6 w-18 rounded-full" />
                  </div>
                </div>

                {/* Footer skeleton */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100/60">
                  <Skeleton className="h-4 w-48 rounded-md" />
                  <Skeleton className="h-4 w-4 rounded-md" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Shimmer effect component for enhanced loading animation
export function ShimmerSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="bg-gray-200 h-full w-full" />
    </div>
  );
}

// Simple loading skeleton for basic use cases
export function SimpleTimelineSkeleton({ count = 3, isSindhi = false, isRTL = false }: TimelineSkeletonProps) {
  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Card className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 border-0">
            <CardHeader className="pt-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shimmer">
                  <div className="h-8 w-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-6 w-48 bg-gray-200 rounded shimmer" />
                    <div className="h-6 w-20 bg-gray-200 rounded-full shimmer" />
                  </div>
                  <div className="flex gap-4 mb-3">
                    <div className="h-4 w-24 bg-gray-200 rounded shimmer" />
                    <div className="h-4 w-16 bg-gray-200 rounded shimmer" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-gray-200 rounded shimmer" />
                <div className="h-4 w-3/4 bg-gray-200 rounded shimmer" />
                <div className="h-4 w-1/2 bg-gray-200 rounded shimmer" />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full shimmer" />
                <div className="h-6 w-20 bg-gray-200 rounded-full shimmer" />
                <div className="h-6 w-14 bg-gray-200 rounded-full shimmer" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Enhanced timeline skeleton with shimmer effects
export function EnhancedTimelineSkeleton({ count = 6, isSindhi = false, isRTL = false }: TimelineSkeletonProps) {
  return (
    <div className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Timeline line with gradient */}
      <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200/40 via-gray-200/60 to-gray-200/40" aria-hidden="true" />
      
      <div className="space-y-8">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative pl-12 sm:pl-16"
          >
            {/* Timeline dot with shimmer */}
            <div className="absolute left-4 sm:left-8 mt-3 -translate-x-1/2">
              <div className="h-3 w-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            </div>

            <Card className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 border-0 group">
              <CardHeader className="pt-6 pb-4">
                <div className="flex items-start gap-4">
                  {/* Icon skeleton with shimmer */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    <div className="h-8 w-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      {/* Title skeleton with shimmer */}
                      <div className="h-6 w-48 bg-gray-200 rounded relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                      </div>
                      {/* Badge skeleton with shimmer */}
                      <div className="h-6 w-20 bg-gray-200 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                      </div>
                    </div>
                    
                    {/* Meta info skeleton with shimmer */}
                    <div className="flex gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-4 bg-gray-200 rounded relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </div>
                        <div className="h-4 w-24 bg-gray-200 rounded relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-4 w-4 bg-gray-200 rounded relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </div>
                        <div className="h-4 w-16 bg-gray-200 rounded relative overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-6">
                {/* Description skeleton with shimmer */}
                <div className="mb-4 space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                </div>

                {/* Characteristics skeleton with shimmer */}
                <div className="mb-4">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                    <div className="h-6 w-14 bg-gray-200 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                    <div className="h-6 w-18 bg-gray-200 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                    </div>
                  </div>
                </div>

                {/* Footer skeleton with shimmer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200/40">
                  <div className="h-4 w-48 bg-gray-200 rounded relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                  <div className="h-4 w-4 bg-gray-200 rounded relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
