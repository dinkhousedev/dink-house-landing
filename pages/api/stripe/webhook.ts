import type { NextApiRequest, NextApiResponse } from "next";

import { buffer } from "micro";
import { Pool } from "pg";
import Stripe from "stripe";

import {
  generateContributionEmailHTML,
  generateContributionEmailText,
  sendEmail,
} from "@/lib/email";
import { logger } from "@/lib/logger";
import { callFunction, query } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-09-30.clover",
});

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "dink_house",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// Disable body parser for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

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

  // Ensure sig is a string (not array)
  const signature = Array.isArray(sig) ? sig[0] : sig;

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);

    logger.debug("Webhook signature verification attempt:", {
      hasSecret: !!webhookSecret,
      secretLength: webhookSecret?.length || 0,
      bufferLength: buf.length,
      signature: signature.substring(0, 20) + "...",
    });

    event = stripe.webhooks.constructEvent(buf, signature, webhookSecret);
  } catch (err) {
    logger.error("Webhook signature verification failed:", {
      error: err instanceof Error ? err.message : "Unknown error",
      hasSecret: !!webhookSecret,
      secretPrefix: webhookSecret?.substring(0, 10) || "none",
    });

    return res.status(401).json({
      error: "Invalid webhook signature",
      statusCode: 401,
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

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Update contribution status
    const updateResult = await client.query(
      `UPDATE public.contributions
       SET status = 'completed',
           stripe_payment_intent_id = $1,
           stripe_checkout_session_id = $2,
           payment_method = $3,
           completed_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [
        session.payment_intent as string,
        session.id,
        session.payment_method_types?.[0] || "card",
        contributionId,
      ],
    );

    if (updateResult.rows.length === 0) {
      throw new Error(`Contribution not found: ${contributionId}`);
    }

    logger.info("Contribution updated successfully:", contributionId);

    // Send thank you email
    try {
      // Get backer details for email
      const backerResult = await client.query(
        `SELECT email, first_name FROM public.backers WHERE id = $1`,
        [backerId],
      );

      if (backerResult.rows.length > 0) {
        const backer = backerResult.rows[0];
        const contribution = updateResult.rows[0];

        // Get tier name
        let tierName = "Custom Contribution";

        if (contribution.tier_id) {
          const tierResult = await client.query(
            `SELECT name FROM public.contribution_tiers WHERE id = $1`,
            [contribution.tier_id],
          );

          if (tierResult.rows.length > 0) {
            tierName = tierResult.rows[0].name;
          }
        }

        const emailData = {
          first_name: backer.first_name,
          amount: parseFloat(contribution.amount).toFixed(2),
          tier_name: tierName,
          contribution_date: new Date(
            contribution.completed_at,
          ).toLocaleDateString(),
          contribution_id: contribution.id,
          payment_method: contribution.payment_method || "card",
          stripe_charge_id:
            contribution.stripe_charge_id || (session.payment_intent as string),
          site_url:
            process.env.NEXT_PUBLIC_SITE_URL || "https://thedinkhouse.com",
        };

        await sendEmail({
          to: backer.email,
          toName: backer.first_name,
          subject: "Thank You for Your Contribution to The Dink House!",
          html: generateContributionEmailHTML(emailData),
          text: generateContributionEmailText(emailData),
          tags: ["contribution", "thank-you"],
        });

        logger.info("Thank you email sent successfully", {
          email: backer.email,
        });
      } else {
        logger.warn("Backer not found for email sending", { backerId });
      }
    } catch (emailError) {
      // Don't fail the webhook if email fails
      logger.error("Error sending thank you email:", emailError);
    }

    // Check if this qualifies for court sponsorship ($1000+)
    const contribution = updateResult.rows[0];

    if (contribution && contribution.amount >= 1000 && backerId) {
      const backerResult = await client.query(
        `SELECT first_name, last_initial FROM public.backers WHERE id = $1`,
        [backerId],
      );

      if (backerResult.rows.length > 0) {
        const backer = backerResult.rows[0];

        await client.query(
          `INSERT INTO public.court_sponsors (backer_id, contribution_id, sponsor_name, sponsor_type, sponsorship_start)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [
            backerId,
            contributionId,
            `${backer.first_name} ${backer.last_initial}.`,
            "individual",
            new Date().toISOString().split("T")[0],
          ],
        );

        logger.info("Created court sponsor entry");
      }
    }

    await client.query("COMMIT");
    logger.info("Checkout completed processing finished");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Error in handleCheckoutCompleted:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info("Processing payment_intent.succeeded", paymentIntent.id);

  try {
    await pool.query(
      `UPDATE public.contributions
       SET status = 'completed',
           stripe_charge_id = $1
       WHERE stripe_payment_intent_id = $2`,
      [paymentIntent.latest_charge as string, paymentIntent.id],
    );

    logger.info("Payment succeeded and contribution updated");
  } catch (error) {
    logger.error("Error updating contribution on payment success:", error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.info("Processing payment_intent.payment_failed", paymentIntent.id);

  try {
    await pool.query(
      `UPDATE public.contributions
       SET status = 'failed'
       WHERE stripe_payment_intent_id = $1`,
      [paymentIntent.id],
    );

    logger.info("Payment failed and contribution updated");
  } catch (error) {
    logger.error("Error updating contribution on payment failure:", error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  logger.info("Processing charge.refunded", charge.id);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Find contribution
    const contributionResult = await client.query(
      `SELECT id FROM public.contributions WHERE stripe_charge_id = $1`,
      [charge.id],
    );

    if (contributionResult.rows.length === 0) {
      logger.error("Error finding contribution for refund - not found");

      return;
    }

    const contributionId = contributionResult.rows[0].id;

    // Update contribution status
    await client.query(
      `UPDATE public.contributions
       SET status = 'refunded',
           refunded_at = NOW()
       WHERE id = $1`,
      [contributionId],
    );

    // Deactivate benefits
    await client.query(
      `UPDATE public.benefit_allocations
       SET is_active = false
       WHERE contribution_id = $1`,
      [contributionId],
    );

    // Deactivate court sponsor (if table exists)
    await client.query(
      `UPDATE public.court_sponsors
       SET is_active = false
       WHERE contribution_id = $1`,
      [contributionId],
    );

    await client.query("COMMIT");
    logger.info("Refund processing completed");
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Error processing refund:", error);
  } finally {
    client.release();
  }
}
