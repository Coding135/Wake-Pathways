/**
 * Whitelisted query keys for /opportunities. Used to serialize explore state
 * onto detail URLs (`return=`) and to sanitize that param (open-redirect safe).
 */
export const EXPLORE_URL_PARAM_KEYS = [
  'search',
  'category',
  'city',
  'grade',
  'remote_type',
  'paid_type',
  'application_status',
  'verified_only',
  'is_free',
  'interests',
  'sort',
  'page',
] as const;

export type ExploreUrlParamKey = (typeof EXPLORE_URL_PARAM_KEYS)[number];

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Build a query string for /opportunities from server or client search params. */
export function serializeExploreParams(
  sp: Record<string, string | string[] | undefined>
): string {
  const params = new URLSearchParams();
  for (const key of EXPLORE_URL_PARAM_KEYS) {
    const raw = first(sp[key]);
    if (!raw) continue;
    if (key === 'page' && raw === '1') continue;
    params.set(key, raw);
  }
  return params.toString();
}

/**
 * Parse the `return` query value from a detail URL: decode and keep only
 * whitelisted keys so we only ever link back to /opportunities?...
 */
export function parseExploreReturnParam(returnRaw: string | undefined): string | null {
  if (!returnRaw?.trim()) return null;
  try {
    const decoded = decodeURIComponent(returnRaw.trim());
    const incoming = new URLSearchParams(
      decoded.startsWith('?') ? decoded.slice(1) : decoded
    );
    const out = new URLSearchParams();
    for (const key of EXPLORE_URL_PARAM_KEYS) {
      const val = incoming.get(key);
      if (!val) continue;
      if (key === 'page' && val === '1') continue;
      out.set(key, val);
    }
    const s = out.toString();
    return s.length > 0 ? s : null;
  } catch {
    return null;
  }
}
