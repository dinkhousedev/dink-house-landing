import type { NextApiRequest, NextApiResponse } from "next";

import { getBackendUrl } from "../../lib/backend";
import { logger } from "../../lib/logger";

type ApiResponse = {
  success: boolean;
  message: string;
  already_subscribed?: boolean;
  not_found?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
      error: "Only POST requests are accepted",
    });
  }

  try {
    const { email } = req.body;

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: "Email is required",
      });
    }

    const response = await fetch(
      `${getBackendUrl()}/api/newsletter/resubscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(email).trim().toLowerCase() }),
      },
    );

    const result = (await response.json()) as ApiResponse;

    return res.status(response.status).json(result);
  } catch (error) {
    logger.error("Error processing resubscribe request:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        error instanceof Error ? error.message : "Failed to process resubscribe",
    });
  }
}
