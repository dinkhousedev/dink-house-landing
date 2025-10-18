import type { NextApiRequest, NextApiResponse } from "next";

import { buffer } from "micro";
import Stripe from "stripe";

import { logger } from "@/lib/logger";
import { callFunction, query } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Disable body parser for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

interface EmailData {
  first_name: string;
  amount: string;
  tier_name: string;
  contribution_date: string;
  contribution_id: string;
  payment_method: string;
  stripe_charge_id: string;
  benefits_html: string;
  benefits_text: string;
  on_founders_wall: boolean;
  display_name: string;
  founders_wall_message: string;
  site_url: string;
}

// Email template generation functions
function generateContributionEmailHTML(data: EmailData): string {
  const {
    first_name,
    amount,
    tier_name,
    contribution_date,
    contribution_id,
    payment_method,
    stripe_charge_id,
    benefits_html,
    on_founders_wall,
    display_name,
    founders_wall_message,
    site_url = "https://thedinkhouse.com",
  } = data;

  const foundersWallSection = on_founders_wall
    ? `
    <div class="recognition-box">
      <h3>🌟 You're on the Founders Wall!</h3>
      <p>Your name will be displayed as: <strong>${display_name}</strong></p>
      <p style="margin-top: 8px;">${founders_wall_message}</p>
    </div>
  `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #ffffff; margin: 0; padding: 0; background-color: #0a0a0a; }
    .container { max-width: 650px; margin: 0 auto; background-color: #1a1a1a; }
    .header { background: linear-gradient(135deg, #B3FF00 0%, #9BCF00 100%); padding: 40px 30px; text-align: center; }
    .logo { max-width: 200px; height: auto; margin-bottom: 15px; }
    .header h1 { color: #000000; margin: 0; font-size: 28px; font-weight: 700; }
    .content { padding: 40px 35px; background-color: #1a1a1a; }
    .greeting { font-size: 18px; margin-bottom: 20px; color: #ffffff; }
    .section { margin: 30px 0; padding: 25px; background: #2a2a2a; border-radius: 8px; border-left: 4px solid #B3FF00; }
    .section-title { font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 15px 0; display: flex; align-items: center; }
    .section-title .icon { margin-right: 10px; font-size: 24px; }
    .receipt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
    .receipt-label { font-size: 12px; text-transform: uppercase; color: #888888; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 5px; }
    .receipt-value { font-size: 16px; color: #ffffff; font-weight: 600; }
    .receipt-value.amount { font-size: 24px; color: #B3FF00; font-weight: 700; text-shadow: 0 0 10px rgba(179, 255, 0, 0.3); }
    .benefits-list { margin-top: 15px; }
    .benefit-item { background: #333333; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #404040; display: flex; align-items: start; }
    .benefit-item .checkmark { color: #B3FF00; font-size: 20px; margin-right: 12px; font-weight: bold; }
    .benefit-content { flex: 1; }
    .benefit-name { font-weight: 600; color: #ffffff; font-size: 15px; margin-bottom: 3px; }
    .benefit-details { font-size: 13px; color: #aaaaaa; }
    .benefit-quantity { display: inline-block; background: #B3FF00; color: #000000; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 8px; }
    .recognition-box { background: linear-gradient(135deg, #B3FF00 0%, #9BCF00 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .recognition-box h3 { margin: 0 0 10px 0; color: #000000; font-size: 18px; }
    .recognition-box p { margin: 0; color: #000000; font-size: 14px; }
    .cta-box { text-align: center; margin: 30px 0; }
    .button { display: inline-block; background: #B3FF00; color: #000000; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
    .help-text { background: #2a2a2a; padding: 20px; border-radius: 6px; margin: 25px 0; font-size: 14px; color: #cccccc; border: 1px solid #404040; }
    .footer { background: #0a0a0a; color: #888888; padding: 30px 35px; text-align: center; font-size: 14px; border-top: 1px solid #2a2a2a; }
    .footer a { color: #B3FF00; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://wchxzbuuwssrnaxshseu.supabase.co/storage/v1/object/public/dink-files/dinklogo.jpg" alt="The Dink House" class="logo" />
      <h1>Thank You for Your Contribution!</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi ${first_name},</p>
      <p style="font-size: 16px; line-height: 1.8; color: #ffffff;">
        🎉 <strong>Wow!</strong> We are absolutely thrilled and grateful for your generous contribution to The Dink House.
        You're not just supporting a pickleball facility—you're helping build a community where players of all levels can thrive, learn, and connect.
      </p>
      <div class="section">
        <h2 class="section-title"><span class="icon">📄</span> Your Receipt</h2>
        <div class="receipt-grid">
          <div><div class="receipt-label">Contribution Amount</div><div class="receipt-value amount">$${amount}</div></div>
          <div><div class="receipt-label">Contribution Tier</div><div class="receipt-value">${tier_name}</div></div>
          <div><div class="receipt-label">Date</div><div class="receipt-value">${contribution_date}</div></div>
          <div><div class="receipt-label">Transaction ID</div><div class="receipt-value" style="font-size: 13px;">${contribution_id}</div></div>
          <div><div class="receipt-label">Payment Method</div><div class="receipt-value">${payment_method}</div></div>
          <div><div class="receipt-label">Stripe Charge ID</div><div class="receipt-value" style="font-size: 12px;">${stripe_charge_id}</div></div>
        </div>
      </div>
      <div class="section">
        <h2 class="section-title"><span class="icon">🎁</span> Your Rewards & Benefits</h2>
        <p style="margin-top: 0; color: #cccccc;">As a valued contributor, you're receiving the following benefits:</p>
        <div class="benefits-list">${benefits_html}</div>
      </div>
      ${foundersWallSection}
      <div class="help-text">
        <strong>📋 Next Steps:</strong><br>
        • Keep this email for your records - it serves as your official receipt<br>
        • Benefits will be available once The Dink House opens<br>
        • Watch your email for facility updates and opening announcements<br>
        • Questions? Reply to this email or call us at (254) 123-4567
      </div>
      <div class="cta-box">
        <a href="${site_url}" class="button">Visit The Dink House</a>
      </div>
      <p style="font-size: 16px; margin-top: 40px; color: #ffffff;">
        Your support means the world to us. Together, we're creating something special for the pickleball community in Bell County!
      </p>
      <p style="font-size: 16px; font-weight: 600; color: #ffffff;">
        With gratitude,<br>The Dink House Team
      </p>
    </div>
    <div class="footer">
      <p><strong>The Dink House</strong> - Where Pickleball Lives</p>
      <p style="margin-top: 15px; font-size: 13px; color: #999;">
        Questions? Contact us at support@thedinkhouse.com or (254) 123-4567<br>
        <span style="font-size: 11px; margin-top: 10px; display: block;">
          This is a receipt for your contribution. Please keep for your records.
        </span>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateContributionEmailText(data: EmailData): string {
  const {
    first_name,
    amount,
    tier_name,
    contribution_date,
    contribution_id,
    payment_method,
    stripe_charge_id,
    benefits_text,
    on_founders_wall,
    display_name,
    founders_wall_message,
    site_url = "https://thedinkhouse.com",
  } = data;

  const foundersWallSection = on_founders_wall
    ? `
=====================================
🌟 FOUNDERS WALL RECOGNITION
=====================================

Your name will be displayed as: ${display_name}
${founders_wall_message}
`
    : "";

  return `Hi ${first_name},

🎉 THANK YOU FOR YOUR CONTRIBUTION! 🎉

We are absolutely thrilled and grateful for your generous contribution to The Dink House. You're not just supporting a pickleball facility—you're helping build a community where players of all levels can thrive, learn, and connect.

=====================================
YOUR RECEIPT
=====================================

Contribution Amount: $${amount}
Contribution Tier: ${tier_name}
Date: ${contribution_date}
Transaction ID: ${contribution_id}
Payment Method: ${payment_method}
Stripe Charge ID: ${stripe_charge_id}

=====================================
YOUR REWARDS & BENEFITS
=====================================

As a valued contributor, you're receiving:

${benefits_text}
${foundersWallSection}
=====================================
NEXT STEPS
=====================================

• Keep this email for your records - it serves as your official receipt
• Benefits will be available once The Dink House opens
• Watch your email for facility updates and opening announcements
• Questions? Reply to this email or call us at (254) 123-4567

Visit us at: ${site_url}

Your support means the world to us. Together, we're creating something special for the pickleball community in Bell County!

With gratitude,
The Dink House Team

--
The Dink House - Where Pickleball Lives
Questions? Contact us at support@thedinkhouse.com or (254) 123-4567

This is a receipt for your contribution. Please keep for your records.
`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    logger.error("Missing stripe-signature header");

    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);

    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    logger.error("Webhook signature verification failed:", err);

    return res.status(400).json({
      error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  }

  logger.info(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await handlePaymentFailed(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;

        await handleChargeRefunded(charge);
        break;
      }

      default:
        logger.warn(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error("Error processing webhook:", error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  logger.info("Processing checkout.session.completed", session.id);

  const contributionId = session.metadata?.contribution_id;
  const backerId = session.metadata?.backer_id;

  if (!contributionId) {
    logger.error("Missing contribution_id in session metadata");

    return;
  }

  try {
    // Update contribution status using PostgreSQL function
    await callFunction("public.complete_contribution", {
      p_contribution_id: contributionId,
      p_payment_intent_id: session.payment_intent as string,
      p_checkout_session_id: session.id,
      p_payment_method: session.payment_method_types?.[0] || "card",
    });

    logger.info("Contribution updated successfully:", contributionId);

    // Note: The complete_contribution function automatically:
    // 1. Allocates benefits from tier via database trigger
    // 2. Updates campaign and tier totals
    // 3. Updates founders wall

    // Send the thank you email immediately
    try {
      // Get contribution data for email
      const contributionData = await query(
        `
        SELECT
          c.id as contribution_id,
          c.amount,
          c.completed_at,
          c.stripe_payment_intent_id,
          c.payment_method,
          b.id as backer_id,
          b.email,
          b.first_name,
          b.last_initial,
          b.city,
          b.state,
          t.id as tier_id,
          t.name as tier_name,
          t.benefits,
          ct.name as campaign_name,
          fw.display_name as founders_wall_name,
          fw.location as founders_wall_location,
          (c.is_public AND fw.id IS NOT NULL) as on_founders_wall
        FROM public.contributions c
        JOIN public.backers b ON c.backer_id = b.id
        JOIN public.contribution_tiers t ON c.tier_id = t.id
        JOIN public.campaign_types ct ON c.campaign_type_id = ct.id
        LEFT JOIN public.founders_wall fw ON b.id = fw.backer_id
        WHERE c.id = $1
        `,
        [contributionId],
      );

      if (contributionData.rows.length === 0) {
        throw new Error(`Contribution ${contributionId} not found`);
      }

      const contrib = contributionData.rows[0];

      // Get benefit allocations
      const benefitsData = await query(
        `
        SELECT
          benefit_type,
          benefit_name,
          quantity_allocated,
          valid_until,
          metadata
        FROM public.benefit_allocations
        WHERE contribution_id = $1 AND is_active = true
        ORDER BY created_at
        `,
        [contributionId],
      );

      // Generate benefits HTML and text
      let benefitsHtml = "";
      let benefitsText = "";

      for (const benefit of benefitsData.rows) {
        const quantity = benefit.quantity_allocated
          ? ` <span class="benefit-quantity">${benefit.quantity_allocated}</span>`
          : "";
        const validUntil = benefit.valid_until
          ? ` (Valid until ${new Date(benefit.valid_until).toLocaleDateString()})`
          : "";

        benefitsHtml += `
          <div class="benefit-item">
            <div class="checkmark">✓</div>
            <div class="benefit-content">
              <div class="benefit-name">${benefit.benefit_name}${quantity}</div>
              <div class="benefit-details">${validUntil}</div>
            </div>
          </div>
        `;

        benefitsText += `✓ ${benefit.benefit_name}${benefit.quantity_allocated ? ` (${benefit.quantity_allocated})` : ""}${validUntil}\n`;
      }

      // Prepare email data
      const emailData: EmailData = {
        first_name: contrib.first_name,
        amount: contrib.amount,
        tier_name: contrib.tier_name,
        contribution_date: new Date(contrib.completed_at).toLocaleDateString(),
        contribution_id: contrib.contribution_id,
        payment_method: contrib.payment_method || "card",
        stripe_charge_id: contrib.stripe_payment_intent_id || "",
        benefits_html: benefitsHtml,
        benefits_text: benefitsText,
        on_founders_wall: contrib.on_founders_wall || false,
        display_name: contrib.founders_wall_name || `${contrib.first_name} ${contrib.last_initial}.`,
        founders_wall_message: contrib.on_founders_wall
          ? "Thank you for your generous support!"
          : "",
        site_url: process.env.NEXT_PUBLIC_SITE_URL || "https://thedinkhouse.com",
      };

      // Send email via AWS Lambda function
      const emailResponse = await fetch(
        `${process.env.AWS_API_URL}/contact/send-brevo-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: [{ email: contrib.email, name: `${contrib.first_name} ${contrib.last_initial}.` }],
            subject: "Thank You for Your Contribution to The Dink House! 🎉",
            htmlContent: generateContributionEmailHTML(emailData),
            textContent: generateContributionEmailText(emailData),
          }),
        },
      );

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();

        logger.error("Error sending email via Brevo:", errorText);

        // Log failed email attempt
        await query(
          `INSERT INTO system.email_queue
           (to_email, subject, html_body, text_body, status, error_message)
           VALUES ($1, $2, $3, $4, 'failed', $5)`,
          [
            [contrib.email],
            "Thank You for Your Contribution to The Dink House! 🎉",
            generateContributionEmailHTML(emailData),
            generateContributionEmailText(emailData),
            errorText,
          ],
        );
      } else {
        const emailResult = await emailResponse.json();

        logger.info("Email sent successfully via Brevo:", emailResult);

        // Log successful email
        await query(
          `INSERT INTO system.email_queue
           (to_email, subject, html_body, text_body, status, sent_at, provider_message_id)
           VALUES ($1, $2, $3, $4, 'sent', CURRENT_TIMESTAMP, $5)`,
          [
            [contrib.email],
            "Thank You for Your Contribution to The Dink House! 🎉",
            generateContributionEmailHTML(emailData),
            generateContributionEmailText(emailData),
            emailResult.messageId || null,
          ],
        );
      }
    } catch (emailErr) {
      logger.error("Exception sending thank you email:", emailErr);
    }

    logger.info("Checkout completed processing finished");
  } catch (error) {
    logger.error("Error in handleCheckoutCompleted:", error);
    throw error;
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info("Processing payment_intent.succeeded", paymentIntent.id);

  try {
    await query(
      `UPDATE public.contributions
       SET status = 'completed',
           stripe_charge_id = $1
       WHERE stripe_payment_intent_id = $2`,
      [paymentIntent.latest_charge as string, paymentIntent.id],
    );
  } catch (error) {
    logger.error("Error updating contribution on payment success:", error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.info("Processing payment_intent.payment_failed", paymentIntent.id);

  try {
    await query(
      `UPDATE public.contributions
       SET status = 'failed'
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id],
    );
  } catch (error) {
    logger.error("Error updating contribution on payment failure:", error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  logger.info("Processing charge.refunded", charge.id);

  try {
    // Find contribution
    const contributionResult = await query(
      `SELECT id FROM public.contributions WHERE stripe_charge_id = $1`,
      [charge.id],
    );

    if (contributionResult.rows.length === 0) {
      logger.error("Error finding contribution for refund: not found");

      return;
    }

    const contributionId = contributionResult.rows[0].id;

    // Update contribution status
    await query(
      `UPDATE public.contributions
       SET status = 'refunded',
           refunded_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [contributionId],
    );

    // Deactivate benefits
    await query(
      `UPDATE public.benefit_allocations
       SET is_active = false
       WHERE contribution_id = $1`,
      [contributionId],
    );

    logger.info("Refund processing completed");
  } catch (error) {
    logger.error("Error processing refund:", error);
  }
}
