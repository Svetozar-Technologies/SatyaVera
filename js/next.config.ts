import type { NextConfig } from "next";

// Toggle: set STATIC_EXPORT=1 to build a fully static bundle for GitHub Pages
// (issue #3, requirement R1). Without the flag we keep the existing
// `output: 'standalone'` build used by Firebase App Hosting.
const isStaticExport = process.env.STATIC_EXPORT === "1";

// When deploying to GitHub Pages the site is served from
// `https://<user>.github.io/<repo>/` so basePath + assetPrefix must be set.
// The deploy workflow injects BASE_PATH; locally you can override it.
const basePath =
  process.env.BASE_PATH && process.env.BASE_PATH !== "" ? process.env.BASE_PATH : undefined;

const configuredApiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "";

function apiConnectSources(): string {
  const sources = ["http://localhost:8787"];
  if (configuredApiBase) {
    try {
      sources.push(new URL(configuredApiBase).origin);
    } catch {
      // Relative API bases are covered by 'self'.
    }
  }
  return Array.from(new Set(sources)).join(" ");
}

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://firebasestorage.googleapis.com https://*.googleusercontent.com",
      `connect-src 'self' ${apiConnectSources()} https://*.firebaseio.com https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.razorpay.com wss://*.firebaseio.com`,
      "frame-src https://checkout.razorpay.com https://*.firebaseapp.com",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  turbopack: {
    resolveAlias: {
      "node:fs": { browser: "./src/lib/i18n/empty-node-module.ts" },
      "node:path": { browser: "./src/lib/i18n/empty-node-module.ts" },
    },
  },
  // `next export` does not run the Next.js image optimiser; keep images
  // unoptimised in that mode so they ship as plain files.
  images: isStaticExport
    ? { unoptimized: true }
    : {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "firebasestorage.googleapis.com",
          },
        ],
      },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  // Static exports cannot set response headers; only emit the policy when
  // running in standalone mode.
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: securityHeaders,
            },
          ];
        },
      }),
  // Make the build mode visible to the client (consumed by SpaShell).
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: isStaticExport ? "1" : "0",
    NEXT_PUBLIC_BASE_PATH: basePath ?? "",
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE ?? "",
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve ?? {};
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "node:fs": false,
        "node:path": false,
      };
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        fs: false,
        path: false,
      };
    }

    return config;
  },
};

export default nextConfig;
