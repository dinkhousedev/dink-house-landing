import "dotenv/config";
import { randomBytes } from "node:crypto";

import { prisma } from "../src/db.js";
import { sendBrevoEmail } from "../src/lib/brevo.js";
import {
  generateWaitlistUpdateEmailHTML,
  generateWaitlistUpdateEmailText,
} from "../src/lib/email-templates.js";

const SITE_URL = "https://thedinkhousepb.com";
const SUBJECT = "Thank you — we're moving full steam ahead";
const DELAY_MS = 400;

function isTestEmail(email: string, source: string | null): boolean {
  const lower = email.toLowerCase();
  if (lower.endsWith("@example.com") || lower.endsWith("@mailshan.com")) {
    return true;
  }
  return source === "qa" || source === "smoke";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
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

  const only = process.env.ONLY?.trim().toLowerCase();
  const recipients = rows.filter((row) => {
    if (isTestEmail(row.email, row.source)) return false;
    if (only) return row.email.toLowerCase() === only;
    return true;
  });

  console.log(
    `Sending waitlist update to ${recipients.length} people (${rows.length - recipients.length} test rows skipped)`,
  );

  const results: { email: string; ok: boolean; error?: string }[] = [];

  for (const row of recipients) {
    let token = row.unsubscribe_token;
    if (!token) {
      token = randomBytes(32).toString("hex");
      await prisma.launch_subscribers.update({
        where: { id: row.id },
        data: { unsubscribe_token: token },
      });
    }

    const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${encodeURIComponent(token)}`;
    const firstName = row.first_name?.trim() || "there";
    const payload = {
      first_name: firstName,
      site_url: SITE_URL,
      unsubscribe_url: unsubscribeUrl,
    };

    try {
      const smtp = await sendBrevoEmail({
        to: row.email,
        subject: SUBJECT,
        html: generateWaitlistUpdateEmailHTML(payload),
        text: generateWaitlistUpdateEmailText(payload),
        fromEmail: "contact@thedinkhousepb.com",
        fromName: "The Dink House",
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
        },
      });
      results.push({ email: row.email, ok: true });
      console.log(`sent  ${row.email}  ${smtp.response || smtp.messageId || ""}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ email: row.email, ok: false, error: message });
      console.error(`FAIL  ${row.email}: ${message}`);
    }

    await sleep(DELAY_MS);
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  console.log(`\nDone. sent=${sent} failed=${failed.length}`);
  if (failed.length) {
    for (const row of failed) {
      console.log(`  ${row.email}: ${row.error}`);
    }
    process.exitCode = 1;
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
