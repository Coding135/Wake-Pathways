import type { NextRequest, NextResponse } from 'next/server';
import { safeNextPath } from '@/lib/auth/redirect';

/** Short-lived cookie so OAuth redirectTo can stay `/auth/callback` (matches Supabase allowlist exactly). */
export const OAUTH_RETURN_COOKIE = 'wp_oauth_next';
const MAX_AGE_SEC = 600;

/** Call in the browser immediately before `signInWithOAuth`. */
export function setOauthReturnPathCookie(nextPath: string) {
  if (typeof document === 'undefined') return;
  const safe = safeNextPath(nextPath);
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${OAUTH_RETURN_COOKIE}=${encodeURIComponent(safe)}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function clearOauthReturnPathCookie(response: NextResponse) {
  response.cookies.set(OAUTH_RETURN_COOKIE, '', { path: '/', maxAge: 0 });
}

export function getOauthReturnPathFromRequest(request: NextRequest): string | null {
  const raw = request.cookies.get(OAUTH_RETURN_COOKIE)?.value;
  if (!raw) return null;
  try {
    return safeNextPath(decodeURIComponent(raw));
  } catch {
    return null;
  }
}
