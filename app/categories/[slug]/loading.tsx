function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#F0EDE8] rounded ${className}`} />;
}

export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 pt-5 pb-2">
        <Sk className="h-3 w-8" />
        <Sk className="h-3 w-2" />
        <Sk className="h-3 w-28" />
      </div>

      {/* Category header */}
      <div className="pt-8 pb-6 border-b border-[#E8E8E8] space-y-3">
        <Sk className="h-12 w-56" />
        <Sk className="h-4 w-96 max-w-full" />
        <Sk className="h-4 w-72 max-w-full" />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 mt-8 pb-16">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <Sk className="aspect-[3/4] w-full rounded-[10px]" />
            <div className="px-1 py-2.5 flex items-center justify-between gap-2">
              <Sk className="h-4 w-2/3" />
              <Sk className="h-4 w-1/4 shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
