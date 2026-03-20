import { NextResponse, type NextRequest } from "next/server";

import { logger } from "../../../lib/logger";
import { upsertLaunchSubscriber } from "../../../lib/supabase-forms";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { firstName, lastName, email, source } = body;

    if (!firstName || !String(firstName).trim()) {
      return NextResponse.json(
        { success: false, error: "First name is required" },
        { status: 400 },
      );
    }

    if (!lastName || !String(lastName).trim()) {
      return NextResponse.json(
        { success: false, error: "Last name is required" },
        { status: 400 },
      );
    }

    if (!email || !String(email).trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 },
      );
    }

    const result = await upsertLaunchSubscriber({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      source:
        typeof source === "string" && source.trim()
          ? source.trim()
          : "website",
      referrerUrl: req.headers.get("referer"),
    });

    if (result.ok && result.duplicate) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message:
          "You're already on our notification list. We'll notify you when we open.",
      });
    }

    if (!result.ok) {
      logger.error("Subscribers route:", result.message);

      return NextResponse.json(
        { success: false, error: result.message },
        { status: result.status },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        result.message ||
        "Successfully joined the waitlist! We'll notify you when we open.",
    });
  } catch (error) {
    logger.error("Subscribers route error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
