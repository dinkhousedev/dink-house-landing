import type { NextApiRequest, NextApiResponse } from "next";

import Stripe from "stripe";

import { logger } from "@/lib/logger";
import { callFunction, query } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

interface CreateCheckoutRequest {
  tierId: string;
  firstName: string;
  lastInitial: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  isPublic?: boolean;
  showAmount?: boolean;
}

interface ApiResponse {
  success: boolean;
  url?: string;
  error?: string;
  debug?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

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
    } = req.body as CreateCheckoutRequest;

    // Validate required fields
    if (!tierId || !firstName || !lastInitial || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Log the tier ID being requested
    logger.debug("=== CREATE CHECKOUT DEBUG ===");
    logger.debug("Tier ID received:", tierId);
    logger.debug("Tier ID type:", typeof tierId);

    // Get tier details with campaign type
    const tierResult = await query(
      `
      SELECT
        t.*,
        ct.id as campaign_type_id,
        ct.name as campaign_type_name,
        ct.slug as campaign_type_slug,
        ct.description as campaign_type_description
      FROM crowdfunding.contribution_tiers t
      JOIN crowdfunding.campaign_types ct ON t.campaign_type_id = ct.id
      WHERE t.id = $1
      `,
      [tierId],
    );

    logger.debug("Tier fetch result:", tierResult.rows[0]);

    if (tierResult.rows.length === 0) {
      logger.error("Tier fetch error: not found");
      logger.error("Attempted tier ID:", tierId);
      logger.error("Full request body:", JSON.stringify(req.body, null, 2));

      return res.status(404).json({
        success: false,
        error: "Contribution tier not found",
        debug: "No tier data returned",
      });
    }

    const tier = tierResult.rows[0];

    // Check if tier is full
    if (tier.max_backers && tier.current_backers >= tier.max_backers) {
      return res.status(400).json({
        success: false,
        error: "This tier is fully backed",
      });
    }

    const finalAmount = tier.amount;

    // Create or get Stripe customer
    let stripeCustomerId: string | undefined;

    // Check if backer exists
    const existingBackerResult = await callFunction<{
      id: string;
      stripe_customer_id: string | null;
    }>("crowdfunding.get_backer_by_email", {
      p_email: email.toLowerCase(),
    });

    if (
      Array.isArray(existingBackerResult) &&
      existingBackerResult.length > 0 &&
      existingBackerResult[0].stripe_customer_id
    ) {
      stripeCustomerId = existingBackerResult[0].stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: email.toLowerCase(),
        name: `${firstName} ${lastInitial}.`,
        phone: phone || undefined,
        metadata: {
          first_name: firstName,
          last_initial: lastInitial,
          city: city || "",
          state: state || "",
        },
      });

      stripeCustomerId = customer.id;
    }

    // Create backer and contribution using PostgreSQL function
    const checkoutResult = await callFunction<{
      backer_id: string;
      contribution_id: string;
    }>("crowdfunding.create_checkout_contribution", {
      p_email: email.toLowerCase(),
      p_first_name: firstName,
      p_last_initial: lastInitial,
      p_campaign_type_id: tier.campaign_type_id,
      p_tier_id: tierId,
      p_amount: finalAmount,
      p_phone: phone || null,
      p_city: city || null,
      p_state: state || null,
      p_stripe_customer_id: stripeCustomerId,
      p_is_public: isPublic,
      p_show_amount: showAmount,
    });

    if (!checkoutResult) {
      logger.error("Checkout creation error: no data returned");

      return res.status(500).json({
        success: false,
        error: "Failed to create contribution record",
      });
    }

    // Handle both single object and array return types
    const checkoutData = Array.isArray(checkoutResult)
      ? checkoutResult[0]
      : checkoutResult;

    const backer = { id: checkoutData.backer_id };
    const contribution = { id: checkoutData.contribution_id };

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      locale: "en",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: tier.name,
              description:
                tier.description || `Support ${tier.campaign_type_name}`,
            },
            unit_amount: Math.round(finalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/campaign?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/campaign?canceled=true`,
      metadata: {
        contribution_id: contribution.id,
        backer_id: backer.id,
        campaign_type_id: tier.campaign_type_id,
        tier_id: tierId,
      },
      payment_intent_data: {
        metadata: {
          contribution_id: contribution.id,
          backer_id: backer.id,
        },
      },
    });

    // Update contribution with session ID
    await callFunction("crowdfunding.update_contribution_session", {
      p_contribution_id: contribution.id,
      p_session_id: session.id,
    });

    return res.status(200).json({
      success: true,
      url: session.url || undefined,
    });
  } catch (error) {
    logger.error("Error creating checkout session:", error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
