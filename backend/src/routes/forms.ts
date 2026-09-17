import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";

import { prisma } from "../db.js";

export async function upsertSubscriber(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, source } = req.body as Record<
      string,
      unknown
    >;

    if (!firstName || !String(firstName).trim()) {
      return res
        .status(400)
        .json({ success: false, error: "First name is required" });
    }
    if (!lastName || !String(lastName).trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Last name is required" });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, error: "Invalid email format" });
    }

    const referrer =
      typeof req.headers.referer === "string" ? req.headers.referer : null;
    const sourceVal =
      typeof source === "string" && source.trim() ? source.trim() : "website";

    const existing = await prisma.launch_subscribers.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, is_active: true },
    });

    if (existing) {
      if (existing.is_active) {
        return res.json({
          success: true,
          duplicate: true,
          message:
            "You're already on our notification list. We'll notify you when we open.",
        });
      }

      await prisma.launch_subscribers.update({
        where: { id: existing.id },
        data: {
          is_active: true,
          status: "active",
          subscription_date: new Date(),
          unsubscribed_at: null,
          first_name: String(firstName).trim(),
          last_name: String(lastName).trim(),
          source: sourceVal,
        },
      });

      return res.json({
        success: true,
        duplicate: false,
        message: "Subscription reactivated successfully",
      });
    }

    await prisma.launch_subscribers.create({
      data: {
        email: normalizedEmail,
        first_name: String(firstName).trim(),
        last_name: String(lastName).trim(),
        source: sourceVal,
        is_active: true,
        status: "active",
        metadata: referrer
          ? ({ referrer_url: referrer } as Prisma.InputJsonValue)
          : undefined,
      },
    });

    return res.json({
      success: true,
      duplicate: false,
      message:
        "Successfully joined the waitlist! We'll notify you when we open.",
    });
  } catch (error) {
    console.error("upsertSubscriber:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function insertContact(req: Request, res: Response) {
  try {
    const {
      firstName,
      lastName,
      email,
      message,
      phone,
      company,
      subject,
    } = req.body as Record<string, unknown>;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const name = `${String(firstName).trim()} ${String(lastName).trim()}`.trim();
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null;

    const row = await prisma.contact_inquiries.create({
      data: {
        name,
        email: String(email).trim().toLowerCase(),
        message: String(message),
        phone: phone ? String(phone) : null,
        subject: subject ? String(subject) : null,
        inquiry_type: "website",
        ip_address: ip,
        user_agent: req.headers["user-agent"] || null,
        referrer: (req.headers.referer as string) || null,
        metadata: {
          company: company ? String(company) : null,
          first_name: String(firstName).trim(),
          last_name: String(lastName).trim(),
          source: "website",
          form_type: "contact",
          timestamp: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    return res.json({ success: true, submissionId: row.id });
  } catch (error) {
    console.error("insertContact:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to store submission",
    });
  }
}
