/**
 * Single source of truth for Supabase public env (browser + server + Edge middleware reads).
 *
 * Primary: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (Supabase “publishable” / new keys).
 * Legacy:  NEXT_PUBLIC_SUPABASE_ANON_KEY (still accepted so existing Vercel projects keep working).
 */

const URL_VAR = 'NEXT_PUBLIC_SUPABASE_URL';
const KEY_VAR = 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY';
const LEGACY_KEY_VAR = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';

export function getSupabaseUrl(): string {
  const url = process.env[URL_VAR]?.trim();
  if (!url) {
    throw new Error(
      `Wake Pathways Supabase: missing ${URL_VAR}. Set it in Vercel Environment Variables or .env.local.`
    );
  }
  return url;
}

/**
 * Publishable key (preferred) or legacy anon key for the same JWT role.
 */
export function getSupabasePublishableKey(): string {
  const key =
    process.env[KEY_VAR]?.trim() || process.env[LEGACY_KEY_VAR]?.trim();
  if (!key) {
    throw new Error(
      `Wake Pathways Supabase: missing ${KEY_VAR} (or legacy ${LEGACY_KEY_VAR}). ` +
        `Use the Publishable key from Supabase Project Settings → API, or your legacy anon key. ` +
        `Set it in Vercel or .env.local.`
    );
  }
  return key;
}

/** For Edge middleware: same resolution as getSupabasePublishableKey but non-throwing. */
export function readSupabasePublicEnv(): { url: string; key: string } | null {
  const url = process.env[URL_VAR]?.trim();
  const key =
    process.env[KEY_VAR]?.trim() || process.env[LEGACY_KEY_VAR]?.trim();
  if (!url || !key) return null;
  return { url, key };
}
