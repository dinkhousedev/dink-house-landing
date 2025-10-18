import type { NextApiRequest, NextApiResponse } from "next";

type ContactData = {
  firstName: string;
  lastName: string;
  email: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: ContactData;
  error?: string;
  already_subscribed?: boolean;
};

// Configuration
const AWS_API_URL =
  process.env.NEXT_PUBLIC_AWS_API_URL || process.env.AWS_API_URL || "";

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
    const { firstName, lastName, email } = req.body;

    if (!firstName || !firstName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: "First name is required",
      });
    }

    if (!lastName || !lastName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: "Last name is required",
      });
    }

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

    const contactData: ContactData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
    };

    // Check if AWS API URL is configured
    if (!AWS_API_URL) {
      console.error("AWS_API_URL is not configured");

      return res.status(500).json({
        success: false,
        message:
          "Newsletter service is not configured. Please contact the administrator.",
        error: "AWS_API_URL not set",
      });
    }

    // Call the Lambda function endpoint
    const lambdaUrl = `${AWS_API_URL}/newsletter/subscribe`;

    console.log("Calling Lambda endpoint:", lambdaUrl);

    const response = await fetch(lambdaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    const result = await response.json();

    // Log the actual response for debugging
    console.log("Lambda API Response:", JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error(
        "Lambda API returned non-OK status:",
        response.status,
        result,
      );

      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to subscribe",
        error: result.message,
      });
    }

    // Handle already subscribed case
    if (result.already_subscribed) {
      return res.status(200).json({
        success: true,
        message:
          result.message ||
          "You're already on our waitlist! We'll notify you when we open.",
        data: contactData,
        already_subscribed: true,
      });
    }

    console.log("Newsletter subscription saved:", result.subscriber_id);

    return res.status(200).json({
      success: true,
      message:
        result.message ||
        "Successfully joined the waitlist! We'll notify you when we open.",
      data: contactData,
    });
  } catch (error) {
    console.error("Error processing newsletter subscription:", error);

    // Provide more helpful error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: `Failed to process newsletter subscription: ${errorMessage}`,
    });
  }
}
