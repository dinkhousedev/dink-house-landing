import type { NextApiRequest, NextApiResponse } from "next";

import { Pool } from "pg";

import { logger } from "@/lib/logger";

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "dink_house",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
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

    res.status(200).json(result.rows);
  } catch (error: any) {
    logger.error("Error fetching campaigns:", error);
    res.status(500).json({
      error: "Failed to fetch campaigns",
      details: error.message,
    });
  }
}
