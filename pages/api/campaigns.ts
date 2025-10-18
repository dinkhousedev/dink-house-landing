import type { NextApiRequest, NextApiResponse } from "next";

import { Pool } from "pg";

import { logger } from "@/lib/logger";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: `postgresql://${encodeURIComponent(process.env.DB_USER || "postgres")}:${encodeURIComponent(process.env.DB_PASSWORD || "")}@${process.env.DB_HOST}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dink_house"}?sslmode=${process.env.DB_SSL === "true" ? "require" : "disable"}`,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
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
    logger.info("Fetching campaigns from database...", {
      host: process.env.DB_HOST ? "***configured***" : "MISSING",
      database: process.env.DB_NAME || "dink_house",
    });

    const result = await pool.query(
      `SELECT
        id,
        name,
        slug,
        description,
        goal_amount,
        current_amount,
        backer_count,
        display_order,
        metadata,
        created_at,
        updated_at
      FROM public.campaign_types
      WHERE is_active = true
      ORDER BY display_order ASC`,
    );

    logger.info(`Successfully fetched ${result.rows.length} campaigns`);
    res.status(200).json(result.rows);
  } catch (error: any) {
    logger.error("Error fetching campaigns:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });
    res.status(500).json({
      error: "Failed to fetch campaigns",
      details: error.message,
      code: error.code,
    });
  }
}
