import { Card, CardContent } from "@/components/ui/card";

export function PoetCardSkeleton() {
  return (
    <Card className="animate-pulse overflow-hidden h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header with Avatar and Basic Info */}
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Avatar skeleton */}
            <div className="w-16 h-16 bg-muted rounded-full flex-shrink-0"></div>
            
            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              {/* Name */}
              <div className="h-6 bg-muted rounded w-3/4"></div>
              {/* Sindhi name */}
              <div className="h-4 bg-muted rounded w-1/2"></div>
              {/* Laqab */}
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>

        {/* Content - Flexible */}
        <div className="px-6 pb-4 flex-1">
          {/* Tagline skeleton */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-4/5"></div>
          </div>
          
          {/* Meta info skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-6 bg-muted rounded w-24"></div>
          </div>
          
          {/* Tags skeleton */}
          <div className="flex gap-1.5 mb-4">
            <div className="h-6 bg-muted rounded w-16"></div>
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-6 bg-muted rounded w-14"></div>
          </div>
        </div>
        
        {/* Actions Bar skeleton - Clean and Minimal */}
        <div className="border-t border-border/40 bg-muted/10 px-6 py-4 mt-auto flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {/* Hidden status skeleton */}
              <div className="h-6 bg-muted rounded w-16"></div>
            </div>
            <div className="flex gap-2">
              {/* Feature button skeleton */}
              <div className="h-8 bg-muted rounded-md w-8"></div>
              {/* More actions dropdown skeleton */}
              <div className="w-8 h-8 bg-muted rounded-md"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PoetCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PoetCardSkeleton key={i} />
      ))}
    </div>
  );
}
