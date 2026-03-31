import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only client with the service role key. Bypasses RLS. Use only in trusted API routes.
 * Returns null if env is not configured.
 */
export function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
