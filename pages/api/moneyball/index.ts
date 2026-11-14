import type { NextApiRequest, NextApiResponse } from "next";

import { allowMethods, forward } from "../../../lib/moneyball-proxy";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!allowMethods(req, res, ["GET"])) return;

  return forward(res, "/api/moneyball");
}
