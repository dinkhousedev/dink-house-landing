import { Prisma } from "@prisma/client";

import { prisma } from "./prisma";

export type SubscriberUpsertResult =
  | { ok: true; duplicate: true }
  | { ok: true; duplicate: false; message?: string }
  | { ok: false; status: number; message: string };

export async function upsertLaunchSubscriber(params: {
  email: string;
  firstName: string;
  lastName: string;
  source: string;
  referrerUrl?: string | null;
}): Promise<SubscriberUpsertResult> {
  try {
    const normalizedEmail = params.email.trim().toLowerCase();
    const sourceVal =
      typeof params.source === "string" && params.source.trim()
        ? params.source.trim()
        : "website";

    const existing = await prisma.launch_subscribers.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, is_active: true },
    });

    if (existing) {
      if (existing.is_active) {
        return { ok: true, duplicate: true };
      }

      await prisma.launch_subscribers.update({
        where: { id: existing.id },
        data: {
          is_active: true,
          status: "active",
          subscription_date: new Date(),
          unsubscribed_at: null,
          first_name: params.firstName.trim(),
          last_name: params.lastName.trim(),
          source: sourceVal,
        },
      });

      return {
        ok: true,
        duplicate: false,
        message: "Subscription reactivated successfully",
      };
    }

    await prisma.launch_subscribers.create({
      data: {
        email: normalizedEmail,
        first_name: params.firstName.trim(),
        last_name: params.lastName.trim(),
        source: sourceVal,
        is_active: true,
        status: "active",
        metadata: params.referrerUrl
          ? ({ referrer_url: params.referrerUrl } as Prisma.InputJsonValue)
          : undefined,
      },
    });

    return {
      ok: true,
      duplicate: false,
      message:
        "Successfully joined the waitlist! We'll notify you when we open.",
    };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      message:
        error instanceof Error ? error.message : "Failed to subscribe",
    };
  }
}

export type ContactInsertResult =
  | { ok: true; submissionId: string }
  | { ok: false; status: number; message: string };

export async function insertContactInquiry(params: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  subject?: string;
  ip?: string | null;
  userAgent?: string | null;
  referer?: string | null;
}): Promise<ContactInsertResult> {
  try {
    const name =
      `${params.firstName.trim()} ${params.lastName.trim()}`.trim();

    const row = await prisma.contact_inquiries.create({
      data: {
        name,
        email: params.email.trim().toLowerCase(),
        message: params.message,
        phone: params.phone || null,
        subject: params.subject || null,
        inquiry_type: "website",
        ip_address: params.ip || null,
        user_agent: params.userAgent || null,
        referrer: params.referer || null,
        metadata: {
          company: params.company || null,
          first_name: params.firstName.trim(),
          last_name: params.lastName.trim(),
          source: "website",
          form_type: "contact",
          timestamp: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    return { ok: true, submissionId: row.id };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      message:
        error instanceof Error
          ? error.message
          : "Failed to store submission",
    };
  }
}

export async function listCampaignsData() {
  const campaigns = await prisma.campaign_types.findMany({
    where: { is_active: true },
    orderBy: { display_order: "asc" },
  });

  const tiers = await prisma.contribution_tiers.findMany({
    where: { is_active: true },
    orderBy: { display_order: "asc" },
  });

  return {
    success: true as const,
    campaigns: campaigns.map((c) => ({
      ...c,
      goal_amount: Number(c.goal_amount),
      current_amount: Number(c.current_amount ?? 0),
    })),
    tiers: tiers.map((t) => ({
      ...t,
      amount: Number(t.amount),
      benefits: t.benefits,
      metadata: t.metadata,
    })),
  };
}

export async function listFoundersWallData() {
  const founders = await prisma.founders_wall.findMany({
    orderBy: [{ is_featured: "desc" }, { total_contributed: "desc" }],
  });

  return {
    success: true as const,
    founders: founders.map((f) => ({
      ...f,
      total_contributed: Number(f.total_contributed),
    })),
  };
}
