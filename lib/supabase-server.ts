import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

/**
 * Service-role Supabase client for Next.js API routes only (bypasses RLS).
 * Set in Amplify / Vercel:
 * - NEXT_PUBLIC_SUPABASE_URL (same project as the anon key)
 * - SUPABASE_SERVICE_KEY (service_role secret — never NEXT_PUBLIC_*)
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url?.trim() || !key?.trim()) return null;
  if (!serviceClient) {
    serviceClient = createClient(url, key);
  }

  return serviceClient;
}
