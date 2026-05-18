import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bone flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="gandhi-avatar lg mx-auto mb-6" />
        <h1 className="font-serif text-6xl font-bold text-navy-900 mb-2">404</h1>
        <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-4">Page not found</h2>
        <p className="text-ink-500 mb-8">
          The page you are looking for does not exist or has been moved.
          GandhiAI can still help you with your legal questions.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-700 text-white rounded-md font-semibold text-sm">
            Go Home
          </Link>
          <Link href="/dashboard/ask" className="inline-flex items-center gap-2 px-5 py-2.5 bg-saffron-600 text-white rounded-md font-semibold text-sm">
            Ask GandhiAI
          </Link>
        </div>
      </div>
    </div>
  );
}
