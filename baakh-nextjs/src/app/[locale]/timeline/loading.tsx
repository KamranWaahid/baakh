import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TimelineLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content Skeleton */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section Skeleton */}
          <section className="text-center py-10">
            <div className="space-y-4">
              <Skeleton className="h-12 w-96 mx-auto" />
              <Skeleton className="h-6 w-2xl mx-auto" />
            </div>
          </section>

          {/* Filters Skeleton */}
          <section className="mb-8">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </section>

          {/* Timeline Grid Skeleton */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="rounded-xl ring-1 ring-border/60 bg-card/60 h-full">
                  <CardHeader className="pt-6 pb-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 pb-6 space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-18 rounded-full" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    
                    <div className="pt-4 border-t border-border/60">
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Summary Stats Skeleton */}
          <section className="mt-16">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-8">
              <Skeleton className="h-8 w-48 mx-auto mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index}>
                    <Skeleton className="h-10 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
