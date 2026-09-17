/**
 * Brevo email via SMTP (xsmtpsib-… keys).
 * BREVO_SMTP_USER = email you use to log into Brevo
 * BREVO_FROM_EMAIL = verified sender (e.g. contact@…)
 */

import nodemailer from "nodemailer";

export type SendBrevoEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromEmail?: string;
  fromName?: string;
  headers?: Record<string, string>;
};

export async function sendBrevoEmail(
  params: SendBrevoEmailParams,
): Promise<{ messageId: string | null; response: string | null }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not set");
  }

  const smtpUser = process.env.BREVO_SMTP_USER;
  if (!smtpUser) {
    throw new Error(
      "BREVO_SMTP_USER is required — set it to the email you use to log into Brevo",
    );
  }

  const fromEmail =
    params.fromEmail ||
    process.env.BREVO_FROM_EMAIL ||
    "contact@thedinkhousepb.com";
  const fromName = params.fromName || "The Dink House";

  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT || 587),
    secure: false,
    auth: {
      user: smtpUser,
      pass: apiKey,
    },
  });

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    headers: params.headers,
  });

  const accepted = Array.isArray(info.accepted) ? info.accepted : [];
  const rejected = Array.isArray(info.rejected) ? info.rejected : [];
  if (rejected.length || !accepted.length) {
    throw new Error(
      `SMTP did not accept ${params.to} (accepted=${accepted.join(",") || "none"} rejected=${rejected.join(",") || "none"} response=${info.response || "none"})`,
    );
  }

  return { messageId: info.messageId || null, response: info.response || null };
}
