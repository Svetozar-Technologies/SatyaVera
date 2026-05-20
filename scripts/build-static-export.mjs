#!/usr/bin/env node
// Build the Next.js app as a static export suitable for GitHub Pages.
//
// The full Next.js tree contains routes that require a server (Route
// Handlers under `src/app/api`, dashboard/login screens that hit
// firebase-admin at request time). `output: 'export'` rejects those at
// build time. For the GitHub Pages variant we only need the `/app` SPA
// shell (issue #3 R2), so this script temporarily relocates the
// server-only routes out of `src/app/`, runs `next build`, and restores
// them — even if the build fails.

import { existsSync, renameSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const repoRoot = resolve(new URL(".", import.meta.url).pathname, "..");
const appDir = join(repoRoot, "src", "app");
const stashDir = join(repoRoot, ".static-export-stash");

// Anything under src/app/ that we do NOT want in the static export.
// Folder names match exactly what's on disk; route groups keep their
// parentheses and `api` is the App Router's Route Handlers directory.
const stashTargets = ["api", "(dashboard)", "(public)", "sitemap.ts"];

function stash() {
  if (existsSync(stashDir)) {
    rmSync(stashDir, { recursive: true, force: true });
  }
  mkdirSync(stashDir, { recursive: true });
  for (const name of stashTargets) {
    const src = join(appDir, name);
    if (!existsSync(src)) continue;
    renameSync(src, join(stashDir, name));
  }
}

function unstash() {
  if (!existsSync(stashDir)) return;
  for (const name of stashTargets) {
    const stashed = join(stashDir, name);
    if (!existsSync(stashed)) continue;
    renameSync(stashed, join(appDir, name));
  }
  rmSync(stashDir, { recursive: true, force: true });
}

process.on("SIGINT", () => {
  unstash();
  process.exit(130);
});
process.on("SIGTERM", () => {
  unstash();
  process.exit(143);
});

let exitCode = 0;
try {
  stash();
  const result = spawnSync("npx", ["next", "build"], {
    stdio: "inherit",
    env: { ...process.env, STATIC_EXPORT: "1" },
    cwd: repoRoot,
  });
  exitCode = result.status ?? 1;
} catch (err) {
  console.error(err);
  exitCode = 1;
} finally {
  unstash();
}

process.exit(exitCode);
