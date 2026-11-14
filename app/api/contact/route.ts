import { NextResponse, type NextRequest } from "next/server";

import { getBackendUrl } from "../../../lib/backend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const response = await fetch(`${getBackendUrl()}/api/subscribers`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        referer: req.headers.get("referer") || "",
      },
      body: JSON.stringify({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        source: "website",
      }),
      cache: "no-store",
    });
    const result = (await response.json()) as {
      success?: boolean;
      duplicate?: boolean;
      message?: string;
      error?: string;
    };
    const contactData = {
      firstName: String(body.firstName ?? "").trim(),
      lastName: String(body.lastName ?? "").trim(),
      email: String(body.email ?? "").trim().toLowerCase(),
    };

    if (result.success && result.duplicate) {
      return NextResponse.json({
        success: true,
        message:
          "You're already on our waitlist! We'll notify you when we open.",
        data: contactData,
        already_subscribed: true,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error || result.message || "Failed to subscribe",
          error: result.error || result.message || "Failed to subscribe",
        },
        { status: response.status || 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        result.message ||
        "Successfully joined the waitlist! We'll notify you when we open.",
      data: contactData,
    });
  } catch (error) {
    console.error("Contact route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: "Failed to process newsletter subscription",
      },
      { status: 500 },
    );
  }
}
