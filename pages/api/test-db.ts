import type { NextApiRequest, NextApiResponse } from "next";

import { Pool } from "pg";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const env_check = {
    DB_HOST: process.env.DB_HOST ? "SET" : "MISSING",
    DB_PORT: process.env.DB_PORT || "default",
    DB_NAME: process.env.DB_NAME || "default",
    DB_USER: process.env.DB_USER ? "SET" : "MISSING",
    DB_PASSWORD: process.env.DB_PASSWORD
      ? "SET (length: " + process.env.DB_PASSWORD.length + ")"
      : "MISSING",
    DB_SSL: process.env.DB_SSL || "false",
  };

  // Try to connect
  let connection_test = "not attempted";

  try {
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "dink_house",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
      ssl:
        process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    const result = await pool.query("SELECT current_database(), current_user");

    connection_test = `SUCCESS: ${result.rows[0].current_database} as ${result.rows[0].current_user}`;
    await pool.end();
  } catch (error: any) {
    connection_test = `FAILED: ${error.message} (code: ${error.code})`;
  }

  res.status(200).json({
    env_check,
    connection_test,
  });
}
