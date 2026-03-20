import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import { getSupabaseServiceClient } from "@/lib/supabase-server";

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
  customAmount?: number;
}

interface ApiResponse {
  success: boolean;
  url?: string;
  error?: string;
  debug?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY");
      return res.status(503).json({
        success: false,
        error: "Server configuration error",
      });
    }

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
    } = req.body as CreateCheckoutRequest;

    // Validate required fields
    if (!tierId || !firstName || !lastInitial || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Get tier details (using public view)
    const { data: tier, error: tierError } = await supabase
      .from("contribution_tiers")
      .select(`
        *,
        campaign_type:campaign_types(*)
      `)
      .eq("id", tierId)
      .single();

    if (tierError || !tier) {
      console.error("Tier fetch error:", JSON.stringify(tierError, null, 2));
      console.error("Attempted tier ID:", tierId);
      return res.status(404).json({
        success: false,
        error: "Contribution tier not found",
        debug: tierError?.message || "No tier data returned",
      });
    }

    // Check if tier is full
    if (tier.max_backers && tier.current_backers >= tier.max_backers) {
      return res.status(400).json({
        success: false,
        error: "This tier is fully backed",
      });
    }

    // Determine final amount (custom or tier amount)
    let finalAmount = tier.amount;
    const allowsCustomAmount = tier.metadata?.allows_custom_amount === true;
    const minAmount = tier.metadata?.min_amount || 5;

    if (customAmount !== undefined && customAmount !== null) {
      if (!allowsCustomAmount) {
        return res.status(400).json({
          success: false,
          error: "This tier does not support custom amounts",
        });
      }
      if (customAmount < minAmount) {
        return res.status(400).json({
          success: false,
          error: `Minimum donation amount is $${minAmount}`,
        });
      }
      finalAmount = customAmount;
    }

    // Create or get Stripe customer
    let stripeCustomerId: string | undefined;

    // Check if backer exists
    const { data: existingBackerData } = await supabase
      .rpc("get_backer_by_email", { p_email: email.toLowerCase() });

    if (existingBackerData?.stripe_customer_id) {
      stripeCustomerId = existingBackerData.stripe_customer_id;
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

    // Create backer and contribution using RPC function
    const { data: checkoutData, error: checkoutError } = await supabase
      .rpc("create_checkout_contribution", {
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

    if (checkoutError || !checkoutData) {
      console.error("Checkout creation error:", checkoutError);
      return res.status(500).json({
        success: false,
        error: "Failed to create contribution record",
      });
    }

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
              name: customAmount ? `${tier.name} - Custom Amount` : tier.name,
              description: tier.description || `Support ${tier.campaign_type.name}`,
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
    await supabase.rpc("update_contribution_session", {
      p_contribution_id: contribution.id,
      p_session_id: session.id,
    });

    return res.status(200).json({
      success: true,
      url: session.url || undefined,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
