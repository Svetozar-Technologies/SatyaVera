"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bone flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b3261e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-3">Something went wrong</h2>
        <p className="text-ink-500 mb-6 text-sm">
          An unexpected error occurred. This has been logged and our team will look into it.
          {error.digest && (
            <span className="block mt-2 text-xs text-ink-400 font-mono">Error ID: {error.digest}</span>
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-navy-700 text-white rounded-md font-semibold text-sm cursor-pointer"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-ink-200 text-navy-700 rounded-md font-semibold text-sm"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
