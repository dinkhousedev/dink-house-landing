import type { NextApiRequest, NextApiResponse } from "next";

import {
  allowMethods,
  forward,
  segment,
  withinRateLimit,
} from "../../../../lib/moneyball-proxy";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;

  const path = `/api/moneyball/pay/${segment(req.query.token)}`;

  if (req.method === "GET") return forward(res, path);
  if (!withinRateLimit(req, res, "moneyball-pay")) return;

  return forward(res, path, { method: "POST" });
}
