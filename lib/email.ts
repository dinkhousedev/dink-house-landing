import { logger } from "./logger";

import { getLogoUrl } from "@/config/media-urls";

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  tags?: string[];
}

export async function sendEmail({
  to,
  toName,
  subject,
  html,
  text,
  tags = ["contribution"],
}: SendEmailParams) {
  try {
    logger.info("Sending email via backend API", { to, subject });

    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_AWS_API_URL;

    if (!backendUrl) {
      logger.error("Backend API URL not configured");
      throw new Error("Email service not configured");
    }

    const response = await fetch(`${backendUrl}/contact/send-brevo-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        toName,
        subject,
        html,
        text,
        tags,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      logger.error("Email API request failed", {
        status: response.status,
        error: errorData,
      });
      throw new Error(`Email API returned ${response.status}`);
    }

    const result = await response.json();

    logger.info("Email sent successfully", {
      to,
      messageId: result.messageId,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error: any) {
    logger.error("Error sending email", {
      to,
      error: error.message,
    });
    throw error;
  }
}

export function generateContributionEmailHTML(data: {
  first_name: string;
  amount: string;
  tier_name: string;
  contribution_date: string;
  contribution_id: string;
  payment_method: string;
  stripe_charge_id: string;
  site_url?: string;
}): string {
  const {
    first_name,
    amount,
    tier_name,
    contribution_date,
    contribution_id,
    payment_method,
    stripe_charge_id,
    site_url = "https://thedinkhouse.com",
  } = data;

  // Use centralized media URL configuration
  const logoUrl = getLogoUrl("dinklogo.jpg");

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #B3FF00 0%, #9BCF00 100%); padding: 40px 30px; text-align: center; }
    .header img { max-width: 180px; height: auto; margin-bottom: 20px; }
    .header h1 { color: #000000; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .receipt-box { background: #f8f8f8; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .receipt-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
    .receipt-item:last-child { border-bottom: none; }
    .receipt-label { font-weight: 600; color: #666; }
    .receipt-value { color: #333; }
    .amount { font-size: 24px; color: #B3FF00; font-weight: 700; }
    .footer { background: #f8f8f8; padding: 20px 30px; text-align: center; font-size: 14px; color: #666; }
    .button { display: inline-block; background: #B3FF00; color: #000000; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="The Dink House" />
      <h1>Thank You for Your Contribution!</h1>
    </div>
    <div class="content">
      <p>Hi ${first_name},</p>
      <p>Thank you for your generous contribution to The Dink House! You're helping build a community where pickleball players of all levels can thrive, learn, and connect.</p>

      <div class="receipt-box">
        <h2 style="margin-top: 0;">Receipt</h2>
        <div class="receipt-item">
          <span class="receipt-label">Amount:</span>
          <span class="receipt-value amount">$${amount}</span>
        </div>
        <div class="receipt-item">
          <span class="receipt-label">Tier:</span>
          <span class="receipt-value">${tier_name}</span>
        </div>
        <div class="receipt-item">
          <span class="receipt-label">Date:</span>
          <span class="receipt-value">${contribution_date}</span>
        </div>
        <div class="receipt-item">
          <span class="receipt-label">Transaction ID:</span>
          <span class="receipt-value">${contribution_id}</span>
        </div>
        <div class="receipt-item">
          <span class="receipt-label">Payment Method:</span>
          <span class="receipt-value">${payment_method}</span>
        </div>
        <div class="receipt-item">
          <span class="receipt-label">Stripe Charge ID:</span>
          <span class="receipt-value">${stripe_charge_id}</span>
        </div>
      </div>

      <p>Your support means the world to us. Together, we're creating something special for the pickleball community!</p>

      <center>
        <a href="${site_url}" class="button">Visit The Dink House</a>
      </center>

      <p style="margin-top: 30px;">
        <strong>Keep this email for your records.</strong><br>
        Questions? Contact us at support@thedinkhouse.com
      </p>
    </div>
    <div class="footer">
      <p><strong>The Dink House</strong> - Where Pickleball Lives</p>
      <p style="margin-top: 10px; font-size: 12px;">This is a receipt for your contribution.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateContributionEmailText(data: {
  first_name: string;
  amount: string;
  tier_name: string;
  contribution_date: string;
  contribution_id: string;
  payment_method: string;
  stripe_charge_id: string;
  site_url?: string;
}): string {
  const {
    first_name,
    amount,
    tier_name,
    contribution_date,
    contribution_id,
    payment_method,
    stripe_charge_id,
    site_url = "https://thedinkhouse.com",
  } = data;

  return `Hi ${first_name},

THANK YOU FOR YOUR CONTRIBUTION!

Thank you for your generous contribution to The Dink House! You're helping build a community where pickleball players of all levels can thrive, learn, and connect.

RECEIPT
-------
Amount: $${amount}
Tier: ${tier_name}
Date: ${contribution_date}
Transaction ID: ${contribution_id}
Payment Method: ${payment_method}
Stripe Charge ID: ${stripe_charge_id}

Your support means the world to us. Together, we're creating something special for the pickleball community!

Visit us at: ${site_url}

Keep this email for your records.
Questions? Contact us at support@thedinkhouse.com

--
The Dink House - Where Pickleball Lives
`;
}
