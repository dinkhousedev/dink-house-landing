import type { NextApiRequest, NextApiResponse } from "next";

import { logger } from "../../../lib/logger";

interface SetupResponse {
  success: boolean;
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SetupResponse>,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({
        success: false,
        message:
          "Supabase configuration is missing. Need SUPABASE_SERVICE_KEY in .env.local",
      });
    }

    // Create the bucket
    const createBucketResponse = await fetch(
      `${supabaseUrl}/storage/v1/bucket`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "dink-files",
          name: "dink-files",
          public: true,
          file_size_limit: 52428800, // 50MB
          allowed_mime_types: ["image/jpeg", "image/png", "image/jpg"],
        }),
      },
    );

    if (!createBucketResponse.ok) {
      const errorText = await createBucketResponse.text();

      return res.status(createBucketResponse.status).json({
        success: false,
        message: "Failed to create bucket",
        error: errorText,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Bucket 'dink-files' created successfully. Now upload your images to images_landing folder via Supabase Dashboard.",
    });
  } catch (error) {
    logger.error("Error setting up bucket:", error);

    return res.status(500).json({
      success: false,
      message: "Error setting up bucket",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
