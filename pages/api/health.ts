import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

  res.status(hasDatabaseUrl ? 200 : 503).json({
    ok: hasDatabaseUrl,
    service: "dink-house-landing-web",
    hasDatabaseUrl,
    sourceCommit: process.env.SOURCE_COMMIT || process.env.COOLIFY_CONTAINER_NAME || null,
  });
}
