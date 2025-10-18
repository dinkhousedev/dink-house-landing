import type { NextApiRequest, NextApiResponse } from "next";

// Configuration
const AWS_API_URL =
  process.env.NEXT_PUBLIC_AWS_API_URL || process.env.AWS_API_URL || "";

// Rate limiting configuration
const RATE_LIMIT_PER_MINUTE = parseInt(
  process.env.RATE_LIMIT_PER_MINUTE || "5",
);
const RATE_LIMIT_PER_HOUR = parseInt(process.env.RATE_LIMIT_PER_HOUR || "50");

// Simple in-memory rate limiting (consider using Redis in production)
const rateLimitMap = new Map<string, { count: number; firstRequest: number }>();

// Rate limiting helper
function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const minuteAgo = now - 60 * 1000;
  const hourAgo = now - 60 * 60 * 1000;

  // Clean old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.firstRequest < hourAgo) {
      rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });

    return { allowed: true };
  }

  // Check minute limit
  if (
    record.firstRequest > minuteAgo &&
    record.count >= RATE_LIMIT_PER_MINUTE
  ) {
    return {
      allowed: false,
      message: "Too many requests. Please wait a minute.",
    };
  }

  // Check hour limit
  if (record.count >= RATE_LIMIT_PER_HOUR) {
    return {
      allowed: false,
      message: "Too many requests. Please try again later.",
    };
  }

  record.count++;

  return { allowed: true };
}

// Get client IP address
function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }

  return req.socket.remoteAddress || "unknown";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  // Check rate limiting
  const clientIp = getClientIp(req);
  const rateLimitCheck = checkRateLimit(clientIp);

  if (!rateLimitCheck.allowed) {
    return res.status(429).json({
      success: false,
      message: rateLimitCheck.message,
    });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      message,
      phone,
      company,
      subject,
      _honeypot,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Prepare the payload for AWS Lambda
    const payload = {
      firstName,
      lastName,
      email,
      message,
      phone: phone || undefined,
      company: company || undefined,
      subject: subject || undefined,
      _honeypot: _honeypot || undefined,
    };

    // Check if AWS API URL is configured
    if (!AWS_API_URL) {
      console.error("AWS_API_URL is not configured");

      return res.status(500).json({
        success: false,
        message:
          "Email service is not configured. Please contact the administrator.",
      });
    }

    // Call the Lambda function endpoint
    const lambdaUrl = `${AWS_API_URL}/contact/submit`;

    console.log("Calling Lambda endpoint:", lambdaUrl);

    const response = await fetch(lambdaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Lambda API error:", {
        status: response.status,
        result,
      });

      return res.status(response.status).json({
        success: false,
        message: result.message || "Failed to submit contact form",
      });
    }

    // Log successful submission
    console.log("Contact form submitted successfully:", {
      timestamp: new Date().toISOString(),
      email,
      inquiryId: result.inquiry_id,
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message:
        result.message ||
        "Thank you for your message! We will get back to you within 24 hours.",
      inquiry_id: result.inquiry_id,
      emailSent: result.emailSent,
      confirmationSent: true,
    });
  } catch (error) {
    console.error("Contact form submission error:", error);

    return res.status(500).json({
      success: false,
      message:
        "An error occurred while submitting your message. Please try again.",
    });
  }
}
