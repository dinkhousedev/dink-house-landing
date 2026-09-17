import type { Request, Response } from "express";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";

import { prisma } from "../db.js";
import { sendBrevoEmail } from "../lib/brevo.js";
import {
  generateContributionEmailHTML,
  generateContributionEmailText,
  type ContributionEmailData,
} from "../lib/email-templates.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

const siteUrl = () =>
  process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://thedinkhousepb.com";

export async function createCheckout(req: Request, res: Response) {
  try {
    const {
      tierId,
      firstName,
      lastInitial,
      email,
      phone,
      city,
      state,
      isPublic = true,
      showAmount = true,
      customAmount,
    } = req.body as Record<string, unknown>;

    if (!tierId || !firstName || !lastInitial || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const tier = await prisma.contribution_tiers.findUnique({
      where: { id: String(tierId) },
      include: { campaign_types: true },
    });

    if (!tier) {
      return res.status(404).json({
        success: false,
        error: "Contribution tier not found",
      });
    }

    if (
      tier.max_backers != null &&
      (tier.current_backers ?? 0) >= tier.max_backers
    ) {
      return res.status(400).json({
        success: false,
        error: "This tier is fully backed",
      });
    }

    const metadata = (tier.metadata ?? {}) as Record<string, unknown>;
    let finalAmount = Number(tier.amount);
    const allowsCustomAmount = metadata.allows_custom_amount === true;
    const minAmount = Number(metadata.min_amount ?? 5);

    if (customAmount !== undefined && customAmount !== null) {
      if (!allowsCustomAmount) {
        return res.status(400).json({
          success: false,
          error: "This tier does not support custom amounts",
        });
      }
      if (Number(customAmount) < minAmount) {
        return res.status(400).json({
          success: false,
          error: `Minimum donation amount is $${minAmount}`,
        });
      }
      finalAmount = Number(customAmount);
    }

    const emailLower = String(email).toLowerCase();

    const existingBackers = await prisma.$queryRaw<
      Array<{ stripe_customer_id: string | null }>
    >`
      SELECT stripe_customer_id
      FROM crowdfunding.get_backer_by_email(${emailLower}::citext)
    `;

    let stripeCustomerId = existingBackers[0]?.stripe_customer_id || undefined;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: emailLower,
        name: `${String(firstName)} ${String(lastInitial)}.`,
        phone: phone ? String(phone) : undefined,
        metadata: {
          first_name: String(firstName),
          last_initial: String(lastInitial),
          city: city ? String(city) : "",
          state: state ? String(state) : "",
        },
      });
      stripeCustomerId = customer.id;
    }

    const checkoutRows = await prisma.$queryRaw<
      Array<{ backer_id: string; contribution_id: string }>
    >`
      SELECT backer_id, contribution_id
      FROM crowdfunding.create_checkout_contribution(
        ${emailLower}::citext,
        ${String(firstName)}::varchar,
        ${String(lastInitial)}::varchar,
        ${tier.campaign_type_id}::uuid,
        ${String(tierId)}::uuid,
        ${finalAmount}::numeric,
        ${phone ? String(phone) : null}::varchar,
        ${city ? String(city) : null}::varchar,
        ${state ? String(state) : null}::varchar,
        ${stripeCustomerId}::text,
        ${Boolean(isPublic)}::boolean,
        ${Boolean(showAmount)}::boolean
      )
    `;

    const checkoutData = checkoutRows[0];
    if (!checkoutData) {
      return res.status(500).json({
        success: false,
        error: "Failed to create contribution record",
      });
    }

    const campaignName = tier.campaign_types?.name || "The Dink House";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      locale: "en",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: customAmount
                ? `${tier.name} - Custom Amount`
                : tier.name,
              description: tier.description || `Support ${campaignName}`,
            },
            unit_amount: Math.round(finalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl()}/campaign?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/campaign?canceled=true`,
      metadata: {
        contribution_id: checkoutData.contribution_id,
        backer_id: checkoutData.backer_id,
        campaign_type_id: tier.campaign_type_id,
        tier_id: String(tierId),
      },
      payment_intent_data: {
        metadata: {
          contribution_id: checkoutData.contribution_id,
          backer_id: checkoutData.backer_id,
        },
      },
    });

    await prisma.$executeRaw`
      SELECT crowdfunding.update_contribution_session(
        ${checkoutData.contribution_id}::uuid,
        ${session.id}::text
      )
    `;

    return res.json({ success: true, url: session.url || undefined });
  } catch (error) {
    console.error("createCheckout:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function stripeWebhook(req: Request, res: Response) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const sig = req.headers["stripe-signature"];

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: "Missing webhook signature config" });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      webhookSecret,
    );
  } catch (err) {
    return res.status(400).json({
      error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  }

  console.log(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const contributionId = session.metadata?.contribution_id;
  const backerId = session.metadata?.backer_id;

  if (!contributionId) {
    console.error("Missing contribution_id in session metadata");
    return;
  }

  await prisma.$executeRaw`
    SELECT crowdfunding.complete_contribution(
      ${contributionId}::uuid,
      ${String(session.payment_intent || "")}::text,
      ${session.id}::text,
      ${(session.payment_method_types?.[0] || "card")}::varchar
    )
  `;

  // Queue + send thank-you email
  try {
    const emailRows = await prisma.$queryRaw<Array<{ result: Prisma.JsonValue }>>`
      SELECT crowdfunding.send_contribution_thank_you_email(${contributionId}::uuid) AS result
    `;
    const emailResult = emailRows[0]?.result as Record<string, unknown> | null;

    if (emailResult?.success) {
      const emailData = emailResult.email_data as ContributionEmailData;
      const recipient = String(emailResult.recipient);
      const emailLogId = String(emailResult.email_log_id);

      if (process.env.BREVO_API_KEY) {
        try {
          const sendResult = await sendBrevoEmail({
            to: recipient,
            subject: "Thank You for Your Contribution to The Dink House!",
            html: generateContributionEmailHTML({
              ...emailData,
              site_url: emailData.site_url || siteUrl(),
            }),
            text: generateContributionEmailText({
              ...emailData,
              site_url: emailData.site_url || siteUrl(),
            }),
          });

          await prisma.email_logs.update({
            where: { id: emailLogId },
            data: {
              status: "sent",
              provider: "brevo",
              sent_at: new Date(),
              provider_message_id: sendResult.messageId,
            },
          });
        } catch (sendErr) {
          console.error("Brevo error:", sendErr);
          await prisma.email_logs.update({
            where: { id: emailLogId },
            data: {
              status: "failed",
              provider: "brevo",
              error_message:
                sendErr instanceof Error ? sendErr.message : "Brevo error",
            },
          });
        }
      } else {
        console.warn("BREVO_API_KEY not set; email not sent");
      }
    }
  } catch (emailErr) {
    console.error("Thank-you email flow error:", emailErr);
  }

  // Court sponsorship for $1000+
  const contribution = await prisma.contributions.findUnique({
    where: { id: contributionId },
    select: { amount: true },
  });

  if (contribution && Number(contribution.amount) >= 1000 && backerId) {
    const backer = await prisma.backers.findUnique({
      where: { id: backerId },
      select: { first_name: true, last_initial: true },
    });
    if (backer) {
      await prisma.court_sponsors.create({
        data: {
          backer_id: backerId,
          contribution_id: contributionId,
          sponsor_name: `${backer.first_name} ${backer.last_initial}.`,
          sponsor_type: "individual",
          sponsorship_start: new Date(),
        },
      });
    }
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  await prisma.contributions.updateMany({
    where: { stripe_payment_intent_id: paymentIntent.id },
    data: {
      status: "completed",
      stripe_charge_id: String(paymentIntent.latest_charge || ""),
    },
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  await prisma.contributions.updateMany({
    where: { stripe_payment_intent_id: paymentIntent.id },
    data: { status: "failed" },
  });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const contribution = await prisma.contributions.findFirst({
    where: { stripe_charge_id: charge.id },
    select: { id: true },
  });
  if (!contribution) return;

  await prisma.contributions.update({
    where: { id: contribution.id },
    data: { status: "refunded", refunded_at: new Date() },
  });

  await prisma.backer_benefits.updateMany({
    where: { contribution_id: contribution.id },
    data: { is_active: false },
  });

  await prisma.court_sponsors.updateMany({
    where: { contribution_id: contribution.id },
    data: { is_active: false },
  });
}
