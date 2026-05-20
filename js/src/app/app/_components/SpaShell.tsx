"use client";

import { useEffect, useMemo, useState } from "react";

// Hash-based router keeps this shell portable: the same compiled bundle
// runs on GitHub Pages (`/<repo>/app/`), inside Electron (`file:///`),
// and inside Capacitor (`capacitor://`) without depending on a server.

const ROUTES = ["home", "chat", "guides", "documents", "about"] as const;

type Route = (typeof ROUTES)[number];

function parseHash(hash: string): Route {
  const candidate = hash.replace(/^#\/?/, "").split("/")[0] as Route;
  return ROUTES.includes(candidate) ? candidate : "home";
}

export function SpaShell() {
  const [route, setRoute] = useState<Route>("home");

  useEffect(() => {
    function sync() {
      setRoute(parseHash(window.location.hash));
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const apiBase = useMemo(() => {
    if (typeof window === "undefined") return "";
    return (
      process.env.NEXT_PUBLIC_API_BASE ??
      window.location.origin
    );
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">
              SatyaVera SPA
            </p>
            <h1 className="text-xl font-semibold">Universal app shell</h1>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm">
            {ROUTES.map((r) => (
              <a
                key={r}
                href={`#/${r}`}
                className={
                  "rounded px-3 py-1 transition " +
                  (r === route
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700")
                }
              >
                {r}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {route === "home" && <HomeView apiBase={apiBase} />}
        {route === "chat" && <PlaceholderView title="GandhiAI Chat" />}
        {route === "guides" && <PlaceholderView title="Rights Guides" />}
        {route === "documents" && <PlaceholderView title="Document Drafter" />}
        {route === "about" && <AboutView apiBase={apiBase} />}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800">
        <p>
          This shell renders entirely on the client. It is statically exported
          for GitHub Pages and packaged unchanged for desktop and mobile.
        </p>
      </footer>
    </div>
  );
}

function HomeView({ apiBase }: { apiBase: string }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Welcome to the SatyaVera SPA</h2>
      <p className="text-slate-600 dark:text-slate-300">
        This route is the universal-app shell described in issue #3. It boots
        without server rendering so the same bundle can be served from GitHub
        Pages, packaged into Electron for desktop, and wrapped with Capacitor
        for mobile.
      </p>
      <p className="text-slate-600 dark:text-slate-300">
        API calls will be routed to{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
          {apiBase || "(configure NEXT_PUBLIC_API_BASE)"}
        </code>{" "}
        — pointed at the Rust backend in <code>./rust</code> once it is live.
      </p>
      <ul className="list-disc space-y-1 pl-6 text-slate-600 dark:text-slate-300">
        <li>Hash-based router so it works from any static host.</li>
        <li>No <code>getServerSideProps</code>, no server actions.</li>
        <li>
          Drop-in target for Electron Forge and Capacitor builds (see{" "}
          <code>docs/case-studies/issue-3/solutions.md</code>).
        </li>
      </ul>
    </section>
  );
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-slate-600 dark:text-slate-300">
        Placeholder view. The corresponding feature module will be migrated
        from <code>src/app/(dashboard)/*</code> into this shell as part of the
        follow-up work tracked in{" "}
        <code>docs/case-studies/issue-3/plan.md</code>.
      </p>
    </section>
  );
}

function AboutView({ apiBase }: { apiBase: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">About this build</h2>
      <dl className="grid gap-2 text-sm sm:grid-cols-[max-content_1fr]">
        <dt className="font-medium">Build mode</dt>
        <dd className="text-slate-600 dark:text-slate-300">
          {process.env.NEXT_PUBLIC_STATIC_EXPORT === "1"
            ? "Static export (GitHub Pages)"
            : "Standalone server (Firebase App Hosting / dev)"}
        </dd>
        <dt className="font-medium">Base path</dt>
        <dd className="text-slate-600 dark:text-slate-300">
          <code>{process.env.NEXT_PUBLIC_BASE_PATH || "(none)"}</code>
        </dd>
        <dt className="font-medium">API base</dt>
        <dd className="text-slate-600 dark:text-slate-300">
          <code>{apiBase || "(configure NEXT_PUBLIC_API_BASE)"}</code>
        </dd>
      </dl>
    </section>
  );
}
