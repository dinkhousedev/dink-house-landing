import { backendFetch } from "./backend";

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
    const res = await backendFetch("/api/subscribers", {
      method: "POST",
      body: JSON.stringify({
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        source: params.source,
      }),
      headers: params.referrerUrl
        ? { Referer: params.referrerUrl }
        : undefined,
    });

    const data = (await res.json()) as {
      success?: boolean;
      duplicate?: boolean;
      message?: string;
      error?: string;
    };

    if (!res.ok || !data.success) {
      return {
        ok: false,
        status: res.status || 500,
        message: data.error || data.message || "Failed to subscribe",
      };
    }

    if (data.duplicate) {
      return { ok: true, duplicate: true };
    }

    return {
      ok: true,
      duplicate: false,
      message: data.message,
    };
  } catch (error) {
    return {
      ok: false,
      status: 503,
      message:
        error instanceof Error ? error.message : "Backend unavailable",
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
    const res = await backendFetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        message: params.message,
        phone: params.phone,
        company: params.company,
        subject: params.subject,
      }),
      headers: {
        ...(params.referer ? { Referer: params.referer } : {}),
        ...(params.userAgent ? { "User-Agent": params.userAgent } : {}),
        ...(params.ip ? { "X-Forwarded-For": params.ip } : {}),
      },
    });

    const data = (await res.json()) as {
      success?: boolean;
      submissionId?: string;
      message?: string;
    };

    if (!res.ok || !data.success || !data.submissionId) {
      return {
        ok: false,
        status: res.status || 500,
        message: data.message || "Failed to store submission",
      };
    }

    return { ok: true, submissionId: data.submissionId };
  } catch (error) {
    return {
      ok: false,
      status: 503,
      message:
        error instanceof Error ? error.message : "Backend unavailable",
    };
  }
}
