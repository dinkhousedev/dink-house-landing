import type { NextApiRequest, NextApiResponse } from "next";

import { getBackendUrl } from "../../../lib/backend";

interface ApiResponse {
  success: boolean;
  url?: string;
  error?: string;
  debug?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const response = await fetch(
      `${getBackendUrl()}/api/stripe/create-checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      },
    );

    const data = (await response.json()) as ApiResponse;

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error proxying create-checkout:", error);

    return res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : "Backend unavailable",
    });
  }
}
