/**
 * Writes static previews of every weekly email to email/weekly/week-NN.html
 * at the repo root, so you can open them in a browser and check copy/images
 * before a send.
 *
 * Run from backend/: npx tsx scripts/preview-weekly-emails.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  generateWeeklyEmailHTML,
  weeklyCalendar,
} from "../src/lib/weekly-emails.js";

const outDir = fileURLToPath(new URL("../../email/weekly/", import.meta.url));

mkdirSync(outDir, { recursive: true });

function localizeImages(html: string): string {
  return html
    .replaceAll("https://thedinkhousepb.com/dinklogo.jpg", "images/dinklogo.jpg")
    .replaceAll(
      "https://thedinkhousepb.com/images/facility-aerial.png",
      "images/facility-aerial.png",
    )
    .replaceAll("https://thedinkhousepb.com/email/weekly/", "images/");
}

for (const entry of weeklyCalendar) {
  const html = localizeImages(
    generateWeeklyEmailHTML(entry.week, {
      first_name: "there",
      site_url: "https://thedinkhousepb.com",
      unsubscribe_url: "https://thedinkhousepb.com/unsubscribe?token=PREVIEW",
    }),
  );
  const file = join(
    outDir,
    `week-${String(entry.week).padStart(2, "0")}.html`,
  );

  writeFileSync(file, html);
  console.log(
    `wrote week-${String(entry.week).padStart(2, "0")}.html  [${entry.theme}]  ${entry.subject}`,
  );
}

console.log(`\n${weeklyCalendar.length} previews written to ${outDir}`);
