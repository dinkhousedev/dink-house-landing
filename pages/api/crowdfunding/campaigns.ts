import type { NextApiRequest, NextApiResponse } from "next";

import { listCampaignsData } from "../../../lib/backend-forms";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const data = await listCampaignsData();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load campaigns",
    });
  }
}
