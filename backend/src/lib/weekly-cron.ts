import cron from "node-cron";

import {
  sendWeeklyIssue,
  weeklyCronTimezone,
  weeklySeriesStartDate,
} from "./send-weekly-email.js";

export function startWeeklyEmailCron(): void {
  const enabled = (process.env.WEEKLY_CRON_ENABLED ?? "true").toLowerCase();
  if (enabled === "0" || enabled === "false" || enabled === "off") {
    console.log("Weekly email cron disabled (WEEKLY_CRON_ENABLED)");
    return;
  }

  const tz = weeklyCronTimezone();
  const start = weeklySeriesStartDate();
  if (!start) {
    console.warn(
      "Weekly email cron not started: set WEEKLY_SERIES_START=YYYY-MM-DD (first Monday)",
    );
    return;
  }

  // Seconds minutes hours day-of-month month day-of-week — Monday 08:00:00
  const task = cron.schedule(
    "0 0 8 * * 1",
    async () => {
      try {
        const result = await sendWeeklyIssue();
        if (result.skipped) {
          console.log(`Weekly email cron: ${result.skipReason}`);
          return;
        }
        console.log(
          `Weekly email cron: week=${result.week} sent=${result.sent} failed=${result.failed} "${result.subject}"`,
        );
        for (const row of result.errors) {
          console.error(`  FAIL ${row.email}: ${row.error}`);
        }
      } catch (error) {
        console.error("Weekly email cron failed:", error);
      }
    },
    {
      timezone: tz,
      noOverlap: true,
      name: "weekly-email",
    },
  );

  const next = task.getNextRun();
  console.log(
    `Weekly email cron: Mondays 08:00 ${tz}, series start ${start}` +
      (next ? `, next run ${next.toISOString()}` : ""),
  );
}
