export default function DashboardLoading() {
  return (
    <div className="animate-in fade-in space-y-6 duration-150">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-7 w-48 rounded-xl bg-slate-200" />
          <div className="skeleton h-4 w-72 rounded-lg bg-slate-100" />
        </div>
        <div className="skeleton h-9 w-32 rounded-xl bg-slate-200" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs"
          >
            <div className="skeleton h-4 w-24 rounded-md bg-slate-100" />
            <div className="skeleton h-8 w-20 rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Main Table / View Skeleton */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="skeleton h-9 w-64 rounded-xl bg-slate-100" />
          <div className="skeleton h-9 w-28 rounded-xl bg-slate-100" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-slate-50 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-xl bg-slate-200" />
              <div className="space-y-1.5">
                <div className="skeleton h-4 w-40 rounded-md bg-slate-200" />
                <div className="skeleton h-3 w-20 rounded-md bg-slate-100" />
              </div>
            </div>
            <div className="skeleton h-4 w-20 rounded-md bg-slate-100" />
            <div className="skeleton h-6 w-16 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
