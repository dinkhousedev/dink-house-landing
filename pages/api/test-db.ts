import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.status(200).json({
    env_check: {
      DB_HOST: process.env.DB_HOST ? "SET" : "MISSING",
      DB_PORT: process.env.DB_PORT || "default",
      DB_NAME: process.env.DB_NAME || "default",
      DB_USER: process.env.DB_USER ? "SET" : "MISSING",
      DB_PASSWORD: process.env.DB_PASSWORD ? "SET (length: " + process.env.DB_PASSWORD.length + ")" : "MISSING",
      DB_SSL: process.env.DB_SSL || "false",
    },
    connection_string: `postgresql://USER:PASS@${process.env.DB_HOST}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "dink_house"}`,
  });
}
