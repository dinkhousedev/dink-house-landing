import { NextResponse, type NextRequest } from "next/server";

import { logger } from "../../../lib/logger";
import { insertContactInquiry } from "../../../lib/supabase-forms";

const RATE_LIMIT_PER_MINUTE = parseInt(
  process.env.RATE_LIMIT_PER_MINUTE || "5",
  10,
);
const RATE_LIMIT_PER_HOUR = parseInt(
  process.env.RATE_LIMIT_PER_HOUR || "50",
  10,
);

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

export async function POST(req: NextRequest) {
  const rateLimitCheck = checkRateLimit(getClientIp(req));

  if (!rateLimitCheck.allowed) {
    return NextResponse.json(
      { success: false, message: rateLimitCheck.message },
      { status: 429 },
    );
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const {
      firstName,
      lastName,
      email,
      message,
      phone,
      company,
      subject,
      _honeypot,
    } = body;

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(String(email))) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 },
      );
    }

    if (_honeypot) {
      return NextResponse.json(
        { success: false, message: "Invalid submission" },
        { status: 400 },
      );
    }

    const clientIp = getClientIp(req);
    const ipForDb =
      clientIp !== "unknown" && /^[\d.:a-fA-F]+$/.test(clientIp)
        ? clientIp
        : null;

    const result = await insertContactInquiry({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: String(email).trim().toLowerCase(),
      message: String(message).trim(),
      phone: phone ? String(phone).trim() : undefined,
      company: company ? String(company).trim() : undefined,
      subject: subject ? String(subject).trim() : undefined,
      ip: ipForDb,
      userAgent: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
    });

    if (!result.ok) {
      logger.error("Contact form insert:", result.message);

      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.status },
      );
    }

    logger.info("Contact form submitted:", {
      email,
      submissionId: result.submissionId,
    });

    return NextResponse.json({
      success: true,
      message:
        "Thank you for your message! We will get back to you within 24 hours.",
      inquiry_id: result.submissionId,
      submissionId: result.submissionId,
      confirmationSent: true,
    });
  } catch (error) {
    logger.error("Contact form route error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "An error occurred while submitting your message. Please try again.",
      },
      { status: 500 },
    );
  }
}
