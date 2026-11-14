import type { Request, Response } from "express";

import {
  currentWeeklyIssue,
  sendWeeklyIssue,
  weeklyCronTimezone,
  weeklySeriesStartDate,
} from "../lib/send-weekly-email.js";

function authorized(req: Request): boolean {
  const secret = process.env.WEEKLY_CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return token === secret;
}

/** GET /internal/weekly-email */
export function weeklyEmailStatus(req: Request, res: Response) {
  if (!authorized(req)) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }
  res.json({
    ok: true,
    timezone: weeklyCronTimezone(),
    seriesStart: weeklySeriesStartDate(),
    currentIssue: currentWeeklyIssue(),
    cronEnabled: !["0", "false", "off"].includes(
      (process.env.WEEKLY_CRON_ENABLED ?? "true").toLowerCase(),
    ),
  });
}

/** POST /internal/weekly-email  { week?, only?, force? } */
export async function triggerWeeklyEmail(req: Request, res: Response) {
  if (!authorized(req)) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const weekRaw = req.body?.week ?? req.query.week;
  const week = weekRaw != null && weekRaw !== "" ? Number(weekRaw) : undefined;
  if (week != null && (!Number.isInteger(week) || week < 1)) {
    res.status(400).json({ ok: false, error: "week must be an integer >= 1" });
    return;
  }

  const only =
    typeof req.body?.only === "string"
      ? req.body.only
      : typeof req.query.only === "string"
        ? req.query.only
        : undefined;
  const force = Boolean(req.body?.force ?? req.query.force);

  try {
    const result = await sendWeeklyIssue({ week, only, force });
    res.json({
      ok: !result.skipped && result.failed === 0,
      currentIssue: currentWeeklyIssue(),
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({ ok: false, error: message });
  }
}
