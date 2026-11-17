export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading content">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-[#E2E8F0] bg-white p-5"
          >
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-4 h-7 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
