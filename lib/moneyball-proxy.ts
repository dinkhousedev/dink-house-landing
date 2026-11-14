import type { NextApiRequest, NextApiResponse } from "next";

import { getBackendUrl } from "./backend";
import { logger } from "./logger";

const RATE_LIMIT_PER_MINUTE = parseInt(
  process.env.RATE_LIMIT_PER_MINUTE || "5",
  10,
);
const RATE_LIMIT_PER_HOUR = parseInt(
  process.env.RATE_LIMIT_PER_HOUR || "50",
  10,
);

const rateLimitMap = new Map<string, { count: number; firstRequest: number }>();

function checkRateLimit(key: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const minuteAgo = now - 60 * 1000;
  const hourAgo = now - 60 * 60 * 1000;

  for (const [entry, value] of rateLimitMap.entries()) {
    if (value.firstRequest < hourAgo) {
      rateLimitMap.delete(entry);
    }
  }

  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, firstRequest: now });

    return { allowed: true };
  }

  if (
    record.firstRequest > minuteAgo &&
    record.count >= RATE_LIMIT_PER_MINUTE
  ) {
    return {
      allowed: false,
      message: "Too many requests. Please wait a minute.",
    };
  }

  if (record.count >= RATE_LIMIT_PER_HOUR) {
    return {
      allowed: false,
      message: "Too many requests. Please try again later.",
    };
  }

  record.count++;

  return { allowed: true };
}

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;

  if (first) {
    return first.split(",")[0]?.trim() || "unknown";
  }

  const realIp = req.headers["x-real-ip"];

  return (
    (Array.isArray(realIp) ? realIp[0] : realIp) ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

/** Errors use the backend's shape so the pages read one format. */
export function fail(res: NextApiResponse, error: string, status = 400) {
  return res.status(status).json({ error });
}

/** False (and a 405 already sent) when the method is not one of `methods`. */
export function allowMethods(
  req: NextApiRequest,
  res: NextApiResponse,
  methods: string[],
): boolean {
  if (req.method && methods.includes(req.method)) return true;

  res.setHeader("Allow", methods.join(", "));
  fail(res, "Method not allowed", 405);

  return false;
}

/** False (and a 429 already sent) when this IP has posted to `scope` too often. */
export function withinRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  scope: string,
): boolean {
  const check = checkRateLimit(`${scope}:${getClientIp(req)}`);

  if (check.allowed) return true;

  fail(res, check.message || "Too many requests.", 429);

  return false;
}

/** One path segment from the query, safe to put in a backend URL. */
export function segment(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;

  return encodeURIComponent(raw ?? "");
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

/** A rating as a number. Anything else is left out so the backend asks for it. */
function rating(value: unknown): number | undefined {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string" || !value.trim()) return undefined;

  const parsed = Number(value.trim());

  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Only the fields the backend reads for one person; anything else is dropped. */
export function pickGuest(value: unknown): Record<string, unknown> {
  const body = asRecord(value);
  const duprId = typeof body.duprId === "string" ? body.duprId.trim() : "";

  return {
    firstName: text(body.firstName),
    lastName: text(body.lastName),
    email: text(body.email),
    phone: text(body.phone),
    gender: text(body.gender),
    dupr: rating(body.dupr),
    ...(duprId ? { duprId } : {}),
  };
}

/** Sends the request to the backend and relays its status and JSON unchanged. */
export async function forward(
  res: NextApiResponse,
  path: string,
  init?: { method: "POST"; body?: unknown },
) {
  try {
    const response = await fetch(`${getBackendUrl()}${path}`, {
      method: init?.method ?? "GET",
      headers: init ? { "content-type": "application/json" } : undefined,
      body: init ? JSON.stringify(init.body ?? {}) : undefined,
      cache: "no-store",
    });
    const data: unknown = await response.json();

    res.setHeader("Cache-Control", "no-store");

    return res.status(response.status).json(data);
  } catch (error) {
    logger.error("Moneyball proxy error:", path, error);

    return fail(res, "Something went wrong. Please try again.", 502);
  }
}
