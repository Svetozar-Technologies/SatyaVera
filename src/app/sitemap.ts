import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://satyavera.in";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/forgot-password`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const dashboardPages: MetadataRoute.Sitemap = [
    "/dashboard",
    "/dashboard/ask",
    "/dashboard/guides",
    "/dashboard/drafter",
    "/dashboard/templates",
    "/dashboard/lawyers",
    "/dashboard/legal-aid",
    "/dashboard/dictionary",
    "/dashboard/scanner",
    "/dashboard/sos",
    "/dashboard/quiz",
    "/dashboard/settings",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  return [...staticPages, ...dashboardPages];
}
