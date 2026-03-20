import { getSupabaseServiceClient } from "@/lib/supabase-server";

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
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return {
      ok: false,
      status: 503,
      message: "Database is not configured.",
    };
  }

  const { data: existing, error: fetchErr } = await supabase
    .schema("launch")
    .from("launch_subscribers")
    .select("id, is_active")
    .eq("email", params.email)
    .maybeSingle();

  if (fetchErr) {
    return { ok: false, status: 500, message: fetchErr.message };
  }

  if (existing) {
    if (existing.is_active) {
      return { ok: true, duplicate: true };
    }

    const { error: updateErr } = await supabase
      .schema("launch")
      .from("launch_subscribers")
      .update({
        is_active: true,
        subscription_date: new Date().toISOString(),
        unsubscribed_at: null,
      })
      .eq("id", existing.id);

    if (updateErr) {
      return { ok: false, status: 500, message: updateErr.message };
    }

    return {
      ok: true,
      duplicate: false,
      message: "Subscription reactivated successfully",
    };
  }

  const { error: insertErr } = await supabase
    .schema("launch")
    .from("launch_subscribers")
    .insert({
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      source: params.source,
      referrer_url: params.referrerUrl ?? null,
      is_active: true,
    });

  if (insertErr) {
    return { ok: false, status: 500, message: insertErr.message };
  }

  return { ok: true, duplicate: false, message: "Subscribed successfully" };
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
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return {
      ok: false,
      status: 503,
      message: "Database is not configured.",
    };
  }

  const { data, error } = await supabase
    .schema("contact")
    .from("contact_inquiries")
    .insert({
      first_name: params.firstName,
      last_name: params.lastName,
      email: params.email,
      message: params.message,
      phone: params.phone ?? null,
      company: params.company ?? null,
      subject: params.subject ?? null,
      source: "website",
      ip_address: params.ip ?? null,
      user_agent: params.userAgent ?? null,
      source_details: {
        referrer: params.referer ?? null,
        timestamp: new Date().toISOString(),
        form_type: "contact",
      },
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      status: 500,
      message: error?.message ?? "Failed to store submission",
    };
  }

  return { ok: true, submissionId: data.id as string };
}
