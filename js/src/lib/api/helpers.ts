import { verifyAuthToken } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export { rateLimit } from "./rate-limiter";

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

// In-memory rate limiter (legacy — prefer rateLimit from ./rate-limiter)
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

/**
 * Validates that the request Content-Type is application/json.
 * Returns an error Response if invalid, or null if OK.
 */
export function validateContentType(req: Request): Response | null {
  const ct = req.headers.get("content-type");
  if (!ct || !ct.includes("application/json")) {
    return apiError("Content-Type must be application/json", 415);
  }
  return null;
}

type FieldSpec = {
  type: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
};

/**
 * Validates that a parsed JSON body contains required fields with correct types.
 * Returns an error message string if validation fails, or null if OK.
 */
export function validateBody(
  body: Record<string, unknown>,
  fields: Record<string, FieldSpec>
): string | null {
  for (const [name, spec] of Object.entries(fields)) {
    const val = body[name];

    if (val === undefined || val === null) {
      if (spec.required) {
        return `${name} is required`;
      }
      continue;
    }

    if (spec.type === "array") {
      if (!Array.isArray(val)) {
        return `${name} must be an array`;
      }
    } else if (spec.type === "object") {
      if (typeof val !== "object" || Array.isArray(val)) {
        return `${name} must be an object`;
      }
    } else if (typeof val !== spec.type) {
      return `${name} must be of type ${spec.type}`;
    }
  }
  return null;
}
