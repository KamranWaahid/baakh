import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-10 space-y-10">
      {/* Hero */}
      <div className="space-y-3 text-center">
        <Skeleton className="h-8 w-40 mx-auto" />
        <Skeleton className="h-10 w-[min(720px,90%)] mx-auto" />
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-9 w-80 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
        <div className="flex items-center justify-center gap-4 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-28 rounded-full" />
          ))}
        </div>
      </div>

      {/* Featured cards */}
      <section className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <Skeleton className="h-6 w-44" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-full" />
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="space-y-4">
        <Skeleton className="h-6 w-44" />
        <div className="relative">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-56 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}


