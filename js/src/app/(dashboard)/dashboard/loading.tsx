export default function DashboardLoading() {
  return (
    <>
      {/* Content skeleton — AppNav and Sidebar are rendered by the layout */}
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
    </>
  );
}
