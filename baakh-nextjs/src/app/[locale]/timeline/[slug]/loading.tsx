import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Calendar, Star, MapPin, Tag, Award } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Hero Section Skeleton */}
          <div className="text-center mb-12">
            <div className="mb-8">
              <Skeleton className="h-8 w-24 mx-auto mb-6" />
            </div>
            
            <Skeleton className="h-16 w-3/4 mx-auto mb-6" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-8" />

            {/* Stats Skeleton */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <Skeleton className="h-8 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
              <div className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex flex-wrap justify-center gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Period Details Skeleton */}
          <div className="mb-12">
            <Card className="rounded-2xl border border-gray-200/50 shadow-sm">
              <CardHeader className="pt-6 pb-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <div className="flex gap-4 mb-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-6">
                <div className="mb-6">
                  <Skeleton className="h-6 w-32 mb-3" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200/40">
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Events Skeleton */}
          <div className="mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-8" />
            
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="rounded-xl border border-gray-200/50 shadow-sm">
                  <CardHeader className="pt-6 pb-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <Skeleton className="h-6 w-48" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-12" />
                            <Skeleton className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <Skeleton className="h-4 w-14" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-gray-400" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-6">
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-5 w-12" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-10" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200/40">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
