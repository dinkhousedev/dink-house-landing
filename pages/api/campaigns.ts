import type { NextApiRequest, NextApiResponse } from "next";

import { logger } from "@/lib/logger";

// Backend API URL from environment
const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://z5afj0ni48.execute-api.us-west-1.amazonaws.com/prod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    logger.info("Fetching campaigns from backend API...", {
      backendUrl: BACKEND_API_URL,
    });

    const response = await fetch(`${BACKEND_API_URL}/campaigns`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }

    const data = await response.json();

    logger.info(`Successfully fetched ${data.length || 0} campaigns`);
    res.status(200).json(data);
  } catch (error: any) {
    logger.error("Error fetching campaigns:", {
      message: error.message,
    });
    res.status(500).json({
      error: "Failed to fetch campaigns",
      details: error.message,
    });
  }
}
