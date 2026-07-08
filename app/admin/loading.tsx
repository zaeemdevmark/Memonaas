function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
}

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar outline */}
      <div className="hidden lg:flex w-60 bg-[#0f172a] shrink-0 flex-col p-4 gap-1">
        <div className="h-14 border-b border-white/10 mb-2" />
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-9 rounded-lg bg-white/5" />
        ))}
      </div>

      {/* Main area */}
      <div className="lg:ml-0 flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-[53px] bg-white border-b border-slate-200 px-5 flex items-center gap-3">
          <Sk className="h-3 w-10" />
          <Sk className="h-3 w-2" />
          <Sk className="h-3 w-20" />
        </div>

        {/* Dashboard skeleton */}
        <div className="flex-1 p-5 sm:p-7 space-y-6">
          <div>
            <Sk className="h-7 w-48 mb-2" />
            <Sk className="h-4 w-80" />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex justify-between">
                  <Sk className="w-10 h-10 rounded-lg" />
                  <Sk className="h-5 w-16" />
                </div>
                <Sk className="h-8 w-28" />
                <Sk className="h-3 w-20" />
              </div>
            ))}
          </div>

          {/* Table + activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <Sk className="h-5 w-36 mb-4" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Sk key={i} className="h-10 w-full" />
              ))}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <Sk className="h-5 w-32 mb-2" />
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <Sk className="w-2 h-2 rounded-full mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Sk className="h-3 w-full" />
                    <Sk className="h-2.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customers + stock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <Sk className="h-5 w-36 mb-2" />
                {Array.from({ length: 4 }).map((_, j) => (
                  <Sk key={j} className="h-12 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
