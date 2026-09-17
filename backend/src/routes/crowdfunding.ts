import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";

import { prisma } from "../db.js";

export async function listCampaigns(_req: Request, res: Response) {
  try {
    const campaigns = await prisma.campaign_types.findMany({
      where: { is_active: true },
      orderBy: { display_order: "asc" },
    });

    const tiers = await prisma.contribution_tiers.findMany({
      where: { is_active: true },
      orderBy: { display_order: "asc" },
    });

    return res.json({
      success: true,
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
    });
  } catch (error) {
    console.error("listCampaigns:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to load campaigns",
    });
  }
}

export async function listFoundersWall(_req: Request, res: Response) {
  try {
    const founders = await prisma.founders_wall.findMany({
      orderBy: [{ is_featured: "desc" }, { total_contributed: "desc" }],
    });

    return res.json({
      success: true,
      founders: founders.map((f) => ({
        ...f,
        total_contributed: Number(f.total_contributed),
      })),
    });
  } catch (error) {
    console.error("listFoundersWall:", error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load founders wall",
    });
  }
}

export async function confirmNewsletter(req: Request, res: Response) {
  try {
    const token = String(req.body?.token || req.body?.p_verification_token || "");
    if (!token) {
      return res.status(400).json({ success: false, message: "Token required" });
    }

    const rows = await prisma.$queryRaw<Array<{ result: Prisma.JsonValue }>>`
      SELECT public.confirm_newsletter_subscription(${token}::varchar) AS result
    `;
    return res.json(rows[0]?.result ?? { success: false, message: "No result" });
  } catch (error) {
    console.error("confirmNewsletter:", error);
    try {
      const token = String(req.body?.token || req.body?.p_verification_token || "");
      const sub = await prisma.launch_subscribers.findFirst({
        where: {
          OR: [
            { unsubscribe_token: token },
            { metadata: { path: ["verification_token"], equals: token } },
          ],
        },
      });
      if (!sub) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired confirmation link.",
        });
      }
      await prisma.launch_subscribers.update({
        where: { id: sub.id },
        data: {
          verified_at: new Date(),
          is_active: true,
          status: "active",
        },
      });
      return res.json({
        success: true,
        email: sub.email,
        message: "Your subscription has been confirmed!",
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Confirm failed",
      });
    }
  }
}

export async function unsubscribeNewsletter(req: Request, res: Response) {
  try {
    const token = req.body?.token ?? req.body?.p_unsubscribe_token ?? null;
    const email = req.body?.email ?? req.body?.p_email ?? null;
    const reason = req.body?.reason ?? req.body?.p_reason ?? null;

    const rows = await prisma.$queryRaw<Array<{ result: Prisma.JsonValue }>>`
      SELECT public.unsubscribe_newsletter(
        ${token ? String(token) : null}::varchar,
        ${email ? String(email) : null}::varchar,
        ${reason ? String(reason) : null}::text
      ) AS result
    `;
    return res.json(rows[0]?.result ?? { success: false, message: "No result" });
  } catch (error) {
    console.error("unsubscribeNewsletter:", error);
    try {
      const token = req.body?.token ?? req.body?.p_unsubscribe_token;
      const email = req.body?.email ?? req.body?.p_email;
      const sub = token
        ? await prisma.launch_subscribers.findUnique({
            where: { unsubscribe_token: String(token) },
          })
        : email
          ? await prisma.launch_subscribers.findUnique({
              where: { email: String(email).toLowerCase() },
            })
          : null;

      if (!sub) {
        return res.status(400).json({
          success: false,
          message: "Unable to process your unsubscribe request.",
        });
      }
      if (!sub.is_active) {
        return res.json({
          success: true,
          already_unsubscribed: true,
          email: sub.email,
          message: "You are already unsubscribed.",
        });
      }
      await prisma.launch_subscribers.update({
        where: { id: sub.id },
        data: {
          is_active: false,
          status: "inactive",
          unsubscribed_at: new Date(),
        },
      });
      return res.json({
        success: true,
        email: sub.email,
        message: "You have been successfully unsubscribed.",
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Unsubscribe failed",
      });
    }
  }
}

export async function resubscribeNewsletter(req: Request, res: Response) {
  try {
    const email = String(req.body?.email || req.body?.p_email || "")
      .trim()
      .toLowerCase();
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const rows = await prisma.$queryRaw<Array<{ result: Prisma.JsonValue }>>`
      SELECT public.resubscribe_newsletter(${email}::text) AS result
    `;
    return res.json(rows[0]?.result ?? { success: false, message: "No result" });
  } catch (error) {
    console.error("resubscribeNewsletter:", error);
    try {
      const email = String(req.body?.email || "")
        .trim()
        .toLowerCase();
      const sub = await prisma.launch_subscribers.findUnique({
        where: { email },
      });
      if (!sub) {
        return res.json({
          success: false,
          not_found: true,
          message: "Email not found. Please subscribe first.",
        });
      }
      if (sub.is_active) {
        return res.json({
          success: true,
          already_subscribed: true,
          message: "You are already subscribed!",
        });
      }
      await prisma.launch_subscribers.update({
        where: { id: sub.id },
        data: {
          is_active: true,
          status: "active",
          unsubscribed_at: null,
          subscription_date: new Date(),
        },
      });
      return res.json({
        success: true,
        message: "Thank you for resubscribing!",
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Resubscribe failed",
      });
    }
  }
}
