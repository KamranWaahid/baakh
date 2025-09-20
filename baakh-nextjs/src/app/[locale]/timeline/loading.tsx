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
            <div className="space-y-6">
              <Skeleton className="h-12 w-96 mx-auto rounded-lg" />
              <Skeleton className="h-6 w-2xl mx-auto rounded-lg" />
              <div className="flex justify-center">
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
            </div>
          </section>

          {/* Filters Skeleton */}
          <section className="mb-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </section>

          {/* Timeline Grid Skeleton */}
          <section>
            <div className="space-y-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-gray-200/40 via-gray-200/60 to-gray-200/40" />
                  
                  {/* Timeline dot */}
                  <div className="absolute left-4 sm:left-8 mt-3 -translate-x-1/2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
                  </div>

                  <div className="pl-12 sm:pl-16">
                    <Card className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 border-0">
                      <CardHeader className="pt-6 pb-4">
                        <div className="flex items-start gap-4">
                          <Skeleton className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200" />
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-6 w-48 rounded-lg" />
                              <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <div className="flex gap-4">
                              <Skeleton className="h-4 w-24 rounded-md" />
                              <Skeleton className="h-4 w-20 rounded-md" />
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 pb-6 space-y-4">
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                        <Skeleton className="h-4 w-1/2 rounded-md" />
                        
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-20 rounded-md" />
                          <div className="flex gap-2">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-18 rounded-full" />
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-100/60">
                          <Skeleton className="h-4 w-48 rounded-md" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
