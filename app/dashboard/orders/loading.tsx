import { SkeletonLine } from "@/components/dashboard/ui";

export default function OrdersLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-7"><SkeletonLine w="w-32" h="h-8" /></div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-[#E8E8E8] px-6 py-5">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <SkeletonLine w="w-40" h="h-4" />
                <SkeletonLine w="w-24" h="h-3" />
                <SkeletonLine w="w-20" h="h-3" />
              </div>
              <div className="flex items-center gap-4">
                <SkeletonLine w="w-20" h="h-6" />
                <SkeletonLine w="w-16" h="h-4" />
                <SkeletonLine w="w-24" h="h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
