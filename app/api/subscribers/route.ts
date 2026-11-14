import { NextResponse, type NextRequest } from "next/server";

import { getBackendUrl } from "../../../lib/backend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const response = await fetch(`${getBackendUrl()}/api/subscribers`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        referer: req.headers.get("referer") || "",
      },
      body: await req.text(),
      cache: "no-store",
    });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Subscribers route error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
