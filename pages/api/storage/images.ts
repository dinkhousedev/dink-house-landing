import type { NextApiRequest, NextApiResponse } from "next";

import { logger } from "../../../lib/logger";

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

interface ImageResponse {
  success: boolean;
  images?: Array<{ src: string; alt: string }>;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImageResponse>,
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return res.status(500).json({
        success: false,
        error: "Supabase configuration is missing",
      });
    }

    const bucketName = req.query.bucket || "dink-files";
    const storagePath = req.query.path || "images_landing";

    // List files in the bucket
    const listUrl = `${supabaseUrl}/storage/v1/object/list/${bucketName}${storagePath ? `/${storagePath}` : ""}`;

    logger.info("Fetching images from:", listUrl);

    const response = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      logger.error("Supabase storage error:", errorText);

      return res.status(response.status).json({
        success: false,
        error: `Failed to fetch from Supabase: ${errorText}`,
      });
    }

    const files: StorageFile[] = await response.json();

    // Filter for JPG and PNG files only
    const imageFiles = files.filter((file) => {
      return file.name.match(/\.(jpg|jpeg|png)$/i);
    });

    // Convert to carousel format
    const images = imageFiles.map((file) => {
      const path = storagePath ? `${storagePath}/${file.name}` : file.name;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;

      return {
        src: publicUrl,
        alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      };
    });

    logger.info(`Found ${images.length} images`);

    return res.status(200).json({
      success: true,
      images,
    });
  } catch (error) {
    logger.error("Error fetching images:", error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
