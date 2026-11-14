import type { NextApiRequest, NextApiResponse } from "next";

import {
  allowMethods,
  asRecord,
  fail,
  forward,
  pickGuest,
  segment,
  withinRateLimit,
} from "../../../../lib/moneyball-proxy";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!allowMethods(req, res, ["POST"])) return;
  if (!withinRateLimit(req, res, "moneyball-team")) return;

  const body = asRecord(req.body);

  if (body._honeypot) return fail(res, "Invalid submission");

  return forward(res, `/api/moneyball/${segment(req.query.id)}/team`, {
    method: "POST",
    body: {
      waiver: body.waiver,
      captain: pickGuest(body.captain),
      partner: pickGuest(body.partner),
    },
  });
}
