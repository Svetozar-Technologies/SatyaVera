export default function Loading() {
  return (
    <div className="min-h-screen bg-bone flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="gandhi-avatar lg animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-saffron-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-saffron-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-saffron-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span className="text-ink-500 text-sm">Loading SatyaVera...</span>
      </div>
    </div>
  );
}
