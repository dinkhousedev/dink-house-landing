/**
 * Sends one week of the 26-week engagement series to active subscribers.
 *
 * Usage (from backend/):
 *   WEEK=1 ONLY=you@email.com npx tsx scripts/send-weekly-email.ts   # test send
 *   WEEK=1 npx tsx scripts/send-weekly-email.ts                      # full send
 *   npx tsx scripts/send-weekly-email.ts                             # current issue from WEEKLY_SERIES_START
 *
 * WEEK optional (1-26). ONLY restricts the send to a single address.
 * FORCE=1 re-sends even if that week is already logged.
 */

import "dotenv/config";

import { sendWeeklyIssue } from "../src/lib/send-weekly-email.js";

async function main() {
  const weekRaw = process.env.WEEK;
  const week = weekRaw ? Number(weekRaw) : undefined;
  if (weekRaw && !Number.isInteger(week)) {
    throw new Error(
      "WEEK must be an integer, e.g. WEEK=1 npx tsx scripts/send-weekly-email.ts",
    );
  }

  const result = await sendWeeklyIssue({
    week,
    only: process.env.ONLY,
    force: process.env.FORCE === "1" || process.env.FORCE === "true",
  });

  if (result.skipped) {
    console.log(result.skipReason);
    return;
  }

  console.log(
    `Week ${result.week} "${result.subject}"\n` +
      `sent=${result.sent} failed=${result.failed}`,
  );
  for (const row of result.errors) {
    console.error(`FAIL  ${row.email}: ${row.error}`);
  }
  if (result.failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
