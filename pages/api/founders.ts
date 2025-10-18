import type { NextApiRequest, NextApiResponse } from "next";

import { Pool } from "pg";

import { logger } from "@/lib/logger";

const pool = new Pool({
  connectionString: `postgresql://${encodeURIComponent(process.env.DB_USER || "postgres")}:${encodeURIComponent(process.env.DB_PASSWORD || "")}@${process.env.DB_HOST}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dink_house"}?sslmode=${process.env.DB_SSL === "true" ? "require" : "disable"}`,
  max: 5,
  idleTimeoutMillis: 30000,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    logger.info("Fetching founders from database...");

    const result = await pool.query(
      `SELECT
        id,
        display_name,
        location,
        contribution_tier,
        total_contributed,
        is_featured,
        metadata,
        created_at,
        updated_at
      FROM public.founders_wall
      ORDER BY is_featured DESC, total_contributed DESC, created_at DESC`,
    );

    logger.info(`Successfully fetched ${result.rows.length} founders`);
    res.status(200).json(result.rows);
  } catch (error: any) {
    logger.error("Error fetching founders:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });
    res.status(500).json({
      error: "Failed to fetch founders",
      details: error.message,
      code: error.code,
    });
  }
}
