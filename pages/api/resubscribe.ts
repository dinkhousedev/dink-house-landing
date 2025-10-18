import type { NextApiRequest, NextApiResponse } from "next";

type ResubscribeData = {
  email: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  already_subscribed?: boolean;
  not_found?: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
      error: "Only POST requests are accepted",
    });
  }

  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: "Invalid email format",
      });
    }

    const resubscribeData: ResubscribeData = {
      email: email.trim().toLowerCase(),
    };

    // Call the Supabase API endpoint
    const SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://api.dinkhousepb.com";
    const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/resubscribe_newsletter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          p_email: resubscribeData.email,
        }),
      },
    );

    const result = await response.json();

    // Log the actual response for debugging
    console.log("Resubscribe API Response:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error("API returned non-OK status:", response.status, result);
      throw new Error(result.message || "Failed to resubscribe");
    }

    // Check if result is the direct response or wrapped
    const actualResult = result.success !== undefined ? result : result;

    if (actualResult.success) {
      if (actualResult.already_subscribed) {
        return res.status(200).json({
          success: true,
          already_subscribed: true,
          message: actualResult.message || "You are already subscribed!",
        });
      }

      console.log(
        "Newsletter resubscribe successful:",
        actualResult.subscriber_id,
      );

      return res.status(200).json({
        success: true,
        message:
          actualResult.message ||
          "Thank you for resubscribing! You will now receive our newsletter updates.",
      });
    } else {
      // Handle "not found" case
      if (actualResult.message?.includes("not found")) {
        return res.status(200).json({
          success: false,
          not_found: true,
          message: actualResult.message,
        });
      }

      console.error("API returned success: false", actualResult);
      throw new Error(actualResult.message || "Resubscription failed");
    }
  } catch (error) {
    console.error("Error processing resubscribe request:", error);

    // Provide more helpful error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: `Failed to process resubscribe request: ${errorMessage}`,
    });
  }
}
