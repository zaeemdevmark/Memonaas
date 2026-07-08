function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#F0EDE8] rounded ${className}`} />;
}

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 pt-6 pb-8">
        <Sk className="h-3 w-8" />
        <Sk className="h-3 w-2" />
        <Sk className="h-3 w-14" />
        <Sk className="h-3 w-2" />
        <Sk className="h-3 w-28" />
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 pb-20">
        {/* Image gallery */}
        <div className="lg:w-[55%] flex gap-3">
          <div className="flex flex-col gap-2.5 w-16 shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <Sk key={i} className="w-16 h-20 rounded-[6px]" />
            ))}
          </div>
          <Sk className="flex-1 aspect-[3/4] rounded-[10px]" />
        </div>

        {/* Product info */}
        <div className="lg:w-[45%] space-y-5">
          <div className="space-y-2">
            <Sk className="h-10 w-3/4" />
            <Sk className="h-3 w-24" />
          </div>
          <Sk className="h-7 w-1/3" />
          <Sk className="h-3 w-16" />

          {/* Size buttons */}
          <div className="flex gap-2 pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Sk key={i} className="w-12 h-10" />
            ))}
          </div>

          {/* Quantity + CTA */}
          <Sk className="h-10 w-32" />
          <Sk className="h-14 w-full mt-2" />

          {/* Description */}
          <div className="pt-4 space-y-2">
            <Sk className="h-3 w-full" />
            <Sk className="h-3 w-5/6" />
            <Sk className="h-3 w-4/6" />
          </div>

          {/* Accordion rows */}
          <div className="pt-4 space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border-t border-[var(--border)] py-4">
                <Sk className="h-4 w-40" />
              </div>
            ))}
            <div className="border-t border-[var(--border)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
