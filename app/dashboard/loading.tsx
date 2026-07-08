import { SkeletonCard, SkeletonLine } from "@/components/dashboard/ui";

export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-10">
        <SkeletonLine w="w-20" h="h-3" />
        <div className="mt-2"><SkeletonLine w="w-64" h="h-10" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-[var(--border)] px-5 py-4">
            <SkeletonLine w="w-1/3" h="h-4" />
            <div className="mt-2"><SkeletonLine w="w-1/2" h="h-3" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
