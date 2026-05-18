export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bone">
      {/* Nav skeleton */}
      <div className="h-16 bg-paper border-b border-ink-100 flex items-center px-8 gap-4">
        <div className="w-8 h-8 bg-ink-100 rounded-full animate-pulse" />
        <div className="w-24 h-4 bg-ink-100 rounded animate-pulse" />
        <div className="ml-auto flex gap-3">
          <div className="w-60 h-8 bg-ink-50 rounded-md animate-pulse" />
          <div className="w-8 h-8 bg-ink-100 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar skeleton */}
        <div className="w-60 bg-paper border-r border-ink-100 p-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`flex items-center gap-2.5 px-2.5 py-2 mb-1 ${i === 0 || i === 4 || i === 8 ? "mt-4" : ""}`}>
              {(i === 0 || i === 4 || i === 8) ? (
                <div className="w-16 h-3 bg-ink-100 rounded animate-pulse" />
              ) : (
                <>
                  <div className="w-4 h-4 bg-ink-100 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-ink-100 rounded animate-pulse" />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-7 md:px-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="w-40 h-3 bg-ink-100 rounded animate-pulse mb-2" />
              <div className="w-64 h-8 bg-ink-100 rounded animate-pulse mb-2" />
              <div className="w-48 h-4 bg-ink-100 rounded animate-pulse" />
            </div>
            <div className="w-60 h-12 bg-ink-100 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-paper border border-ink-100 rounded-lg p-5 animate-pulse">
                <div className="w-10 h-10 bg-ink-100 rounded-lg mb-3" />
                <div className="w-32 h-4 bg-ink-100 rounded mb-2" />
                <div className="w-48 h-3 bg-ink-50 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
