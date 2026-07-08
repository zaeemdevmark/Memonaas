export default function CollectionLoading() {
  return (
    <div className="bg-white">

      {/* Header skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-14">
        <div className="w-24 h-2.5 bg-[#EBEBEB] rounded mb-4 animate-pulse" />
        <div className="w-64 h-10 sm:h-12 bg-[#EBEBEB] rounded animate-pulse" />
        <div className="w-10 h-px bg-[#EBEBEB] mt-7" />
      </div>

      {/* Count skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6">
        <div className="w-16 h-2.5 bg-[#EBEBEB] rounded animate-pulse" />
      </div>

      {/* Grid skeleton — 4 cols desktop, 2 tablet, 1 mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              {/* Image placeholder — 3:4 */}
              <div
                className="w-full bg-[#F0EDE8] animate-pulse"
                style={{ aspectRatio: "3 / 4" }}
              />
              {/* Name + price row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 h-2.5 bg-[#EBEBEB] rounded animate-pulse" />
                <div className="w-20 h-2.5 bg-[#EBEBEB] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
