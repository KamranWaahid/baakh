import { Skeleton } from "./skeleton";

export function NavigationSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left Side - Login Button Skeleton */}
          <div className="flex items-center">
            <Skeleton className="h-8 w-20" />
          </div>

          {/* Center Navigation Skeleton */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </nav>

          {/* Right Side - Theme Toggle Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </header>
  );
}
