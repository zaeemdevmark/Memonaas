function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-[#F0EDE8] rounded ${className}`} />;
}

export default function ShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Page header */}
      <div className="pt-14 pb-6 border-b border-[var(--border)]">
        <Sk className="h-12 w-44" />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 mt-8 pb-16">
        {Array.from({ length: 12 }).map((_, i) => (
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
