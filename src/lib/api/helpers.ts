import { verifyAuthToken } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function authRequired(req: Request): Promise<DecodedIdToken | Response> {
  const decoded = await verifyAuthToken(req);
  if (!decoded) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return decoded;
}

export function apiResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Clean up old entries every 5 minutes
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (entry.resetAt < now) rateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000);
}

export function checkRateLimit(key: string, maxPerMinute: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= maxPerMinute) return false;
  entry.count++;
  return true;
}

export function getSearchParams(req: Request) {
  return new URL(req.url).searchParams;
}
