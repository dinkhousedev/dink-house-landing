import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

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
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const campaignId = req.query.campaign_id as string | undefined;

    let sql = `
      SELECT
        id,
        campaign_type_id,
        name,
        amount,
        description,
        benefits,
        stripe_price_id,
        max_backers,
        current_backers,
        display_order,
        metadata,
        created_at,
        updated_at
      FROM public.contribution_tiers
      WHERE is_active = true
    `;

    const params: any[] = [];

    if (campaignId) {
      sql += " AND campaign_type_id = $1";
      params.push(campaignId);
    }

    sql += " ORDER BY campaign_type_id, display_order ASC";

    const result = await pool.query(sql, params);

    res.status(200).json(result.rows);
  } catch (error: any) {
    console.error("Error fetching contribution tiers:", error);
    res.status(500).json({
      error: "Failed to fetch contribution tiers",
      details: error.message,
    });
  }
}
