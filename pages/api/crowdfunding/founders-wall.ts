import type { NextApiRequest, NextApiResponse } from "next";

import { getBackendUrl } from "../../../lib/backend";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      `${getBackendUrl()}/api/crowdfunding/founders-wall`,
    );
    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : "Backend unavailable",
    });
  }
}
