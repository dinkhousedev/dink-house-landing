import { NextResponse, type NextRequest } from "next/server";

import { logger } from "@/lib/logger";
import { upsertLaunchSubscriber } from "@/lib/supabase-forms";

type ContactData = {
  firstName: string;
  lastName: string;
  email: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { firstName, lastName, email } = body;

    if (!firstName || !String(firstName).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          error: "First name is required",
        },
        { status: 400 },
      );
    }

    if (!lastName || !String(lastName).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          error: "Last name is required",
        },
        { status: 400 },
      );
    }

    if (!email || !String(email).trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          error: "Email is required",
        },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(String(email))) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          error: "Invalid email format",
        },
        { status: 400 },
      );
    }

    const contactData: ContactData = {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: String(email).trim().toLowerCase(),
    };

    const result = await upsertLaunchSubscriber({
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      source: "website",
      referrerUrl: req.headers.get("referer"),
    });

    if (result.ok && result.duplicate) {
      return NextResponse.json({
        success: true,
        message:
          "You're already on our waitlist! We'll notify you when we open.",
        data: contactData,
        already_subscribed: true,
      });
    }

    if (!result.ok) {
      logger.error("Contact (newsletter) route:", result.message);

      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.message,
        },
        { status: result.status },
      );
    }

    logger.info("Newsletter subscription saved via Supabase");

    return NextResponse.json({
      success: true,
      message:
        result.message ||
        "Successfully joined the waitlist! We'll notify you when we open.",
      data: contactData,
    });
  } catch (error) {
    logger.error("Contact route error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: `Failed to process newsletter subscription: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
