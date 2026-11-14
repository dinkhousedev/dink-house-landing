/**
 * Send one issue of the 26-week series to active subscribers.
 * Used by the Monday cron, the HTTP trigger, and the CLI script.
 */

import { randomBytes } from "node:crypto";
import { Prisma } from "../generated/prisma/client.js";

import { prisma } from "../db.js";
import { sendBrevoEmail } from "./brevo.js";
import {
  generateWeeklyEmailHTML,
  generateWeeklyEmailText,
  getWeeklyEmail,
  weeklyCalendar,
} from "./weekly-emails.js";

const DELAY_MS = 400;
const DEFAULT_TZ = "America/Chicago";

export function weeklyCronTimezone(): string {
  return process.env.WEEKLY_CRON_TZ || DEFAULT_TZ;
}

export function weeklySeriesStartDate(): string | null {
  const raw = process.env.WEEKLY_SERIES_START?.trim();
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function ymdInZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function utcDays(ymd: string): number {
  const [year, month, day] = ymd.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Which issue belongs to `now` (1–26), or null if before start / after the series. */
export function currentWeeklyIssue(now = new Date()): number | null {
  const start = weeklySeriesStartDate();
  if (!start) return null;
  const tz = weeklyCronTimezone();
  const elapsed = utcDays(ymdInZone(now, tz)) - utcDays(start);
  const week = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000)) + 1;
  if (week < 1 || week > weeklyCalendar.length) return null;
  return week;
}

function isTestEmail(email: string, source: string | null): boolean {
  const lower = email.toLowerCase();
  if (lower.endsWith("@example.com") || lower.endsWith("@mailshan.com")) {
    return true;
  }
  return source === "qa" || source === "smoke";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SendWeeklyEmailOptions = {
  week?: number;
  only?: string;
  /** Skip the "already sent this week" lock (CLI / test). */
  force?: boolean;
};

export type SendWeeklyEmailResult = {
  week: number;
  subject: string;
  sent: number;
  failed: number;
  skipped: boolean;
  skipReason?: string;
  errors: { email: string; error: string }[];
};

export async function sendWeeklyIssue(
  options: SendWeeklyEmailOptions = {},
): Promise<SendWeeklyEmailResult> {
  const week = options.week ?? currentWeeklyIssue();
  if (!week) {
    return {
      week: 0,
      subject: "",
      sent: 0,
      failed: 0,
      skipped: true,
      skipReason:
        "No weekly issue for today. Set WEEKLY_SERIES_START=YYYY-MM-DD (the first Monday) or pass week explicitly.",
      errors: [],
    };
  }

  const entry = getWeeklyEmail(week);
  const siteUrl = (process.env.SITE_URL || "https://thedinkhousepb.com").replace(
    /\/$/,
    "",
  );

  if (!options.force) {
    try {
      await prisma.weekly_email_sends.create({
        data: {
          week,
          subject: entry.subject,
          status: "running",
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return {
          week,
          subject: entry.subject,
          sent: 0,
          failed: 0,
          skipped: true,
          skipReason: `Week ${week} was already sent`,
          errors: [],
        };
      }
      throw error;
    }
  }

  const rows = await prisma.launch_subscribers.findMany({
    where: { is_active: true },
    select: {
      id: true,
      email: true,
      first_name: true,
      source: true,
      unsubscribe_token: true,
    },
    orderBy: { subscription_date: "asc" },
  });

  const only = options.only?.trim().toLowerCase();
  const recipients = rows.filter((row) => {
    if (isTestEmail(row.email, row.source)) return false;
    if (only) return row.email.toLowerCase() === only;
    return true;
  });

  const errors: { email: string; error: string }[] = [];
  let sent = 0;

  for (const row of recipients) {
    let token = row.unsubscribe_token;
    if (!token) {
      token = randomBytes(32).toString("hex");
      await prisma.launch_subscribers.update({
        where: { id: row.id },
        data: { unsubscribe_token: token },
      });
    }

    const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodeURIComponent(token)}`;
    const firstName = row.first_name?.trim() || "there";
    const payload = {
      first_name: firstName,
      site_url: siteUrl,
      unsubscribe_url: unsubscribeUrl,
    };

    try {
      await sendBrevoEmail({
        to: row.email,
        subject: entry.subject,
        html: generateWeeklyEmailHTML(week, payload),
        text: generateWeeklyEmailText(week, payload),
        fromEmail: "contact@thedinkhousepb.com",
        fromName: "The Dink House",
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
        },
      });
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ email: row.email, error: message });
    }

    await sleep(DELAY_MS);
  }

  const failed = errors.length;
  const status = failed && !sent ? "failed" : failed ? "partial" : "sent";

  if (!options.force) {
    await prisma.weekly_email_sends.update({
      where: { week },
      data: {
        sent_count: sent,
        failed_count: failed,
        finished_at: new Date(),
        status,
      },
    });
  }

  return {
    week,
    subject: entry.subject,
    sent,
    failed,
    skipped: false,
    errors,
  };
}
