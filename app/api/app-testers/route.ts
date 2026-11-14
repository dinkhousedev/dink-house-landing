import { NextResponse, type NextRequest } from "next/server";

import { getBackendUrl } from "../../../lib/backend";
import { logger } from "../../../lib/logger";

export const dynamic = "force-dynamic";

const RATE_LIMIT_PER_MINUTE = parseInt(
  process.env.RATE_LIMIT_PER_MINUTE || "5",
  10,
);
const RATE_LIMIT_PER_HOUR = parseInt(
  process.env.RATE_LIMIT_PER_HOUR || "50",
  10,
);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTE_MAX = 1000;

const rateLimitMap = new Map<string, { count: number; firstRequest: number }>();

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const minuteAgo = now - 60 * 1000;
  const hourAgo = now - 60 * 60 * 1000;

  for (const [key, value] of rateLimitMap.entries()) {
    if (value.firstRequest < hourAgo) {
      rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });

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

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return req.headers.get("x-real-ip") || "unknown";
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(req: NextRequest) {
  const rateLimitCheck = checkRateLimit(getClientIp(req));

  if (!rateLimitCheck.allowed) {
    return fail(rateLimitCheck.message || "Too many requests.", 429);
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;

    if (body._honeypot) return fail("Invalid submission");

    const firstName = text(body.firstName);
    const lastName = text(body.lastName);
    const iphone = body.iphone === true;
    const android = body.android === true;
    const appleEmail = iphone ? text(body.appleEmail).toLowerCase() : "";
    const googleEmail = android ? text(body.googleEmail).toLowerCase() : "";
    const note = text(body.note);

    if (!firstName || !lastName)
      return fail("First and last name are required");
    if (!iphone && !android) return fail("Pick iPhone, Android, or both");
    if (iphone && !EMAIL.test(appleEmail)) {
      return fail("Enter the email on your Apple ID");
    }
    if (android && !EMAIL.test(googleEmail)) {
      return fail("Enter the email on your Google account");
    }
    if (note.length > NOTE_MAX) {
      return fail(`Keep the note under ${NOTE_MAX} characters`);
    }

    const response = await fetch(`${getBackendUrl()}/api/app-testers`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        appleEmail: appleEmail || undefined,
        googleEmail: googleEmail || undefined,
        note: note || undefined,
      }),
      cache: "no-store",
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error("App testers route error:", error);

    return fail("Something went wrong. Please try again.", 500);
  }
}
