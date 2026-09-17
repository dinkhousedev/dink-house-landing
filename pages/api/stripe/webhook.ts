import type { NextApiRequest, NextApiResponse } from "next";

import { buffer } from "micro";

import { getBackendUrl } from "../../../lib/backend";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawBody = await buffer(req);
    const signature = req.headers["stripe-signature"];

    const response = await fetch(`${getBackendUrl()}/api/stripe/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(signature
          ? { "stripe-signature": Array.isArray(signature) ? signature[0] : signature }
          : {}),
      },
      body: rawBody,
    });

    const text = await response.text();
    let data: unknown = text;

    try {
      data = JSON.parse(text);
    } catch {
      // keep text
    }

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error proxying stripe webhook:", error);

    return res.status(502).json({
      error: error instanceof Error ? error.message : "Backend unavailable",
    });
  }
}
