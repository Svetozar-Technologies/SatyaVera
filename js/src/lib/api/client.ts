const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE || "";

export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = API_BASE.replace(/\/$/, "");

  return `${normalizedBase}${normalizedPath}`;
}
