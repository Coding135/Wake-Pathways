import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';
import { safeNextPath } from '@/lib/auth/redirect';
import {
  clearOauthReturnPathCookie,
  getOauthReturnPathFromRequest,
} from '@/lib/auth/oauth-return-path';

export const dynamic = 'force-dynamic';

/**
 * Sanitize for query string (no secrets; keep message for Supabase error text only).
 */
function hintParam(msg: string): string {
  const trimmed = msg.replace(/\s+/g, ' ').slice(0, 180);
  return trimmed.replace(/[^\w\s.,:/\-()'"]/g, '');
}

/**
 * OAuth (e.g. Google) returns here with ?code=...
 * Session cookies must be set on the redirect response (not only next/headers cookies).
 *
 * `@supabase/ssr` calls setAll(..., headers) — apply cache headers on the response so CDNs/proxies
 * don’t mishandle auth cookies (see Supabase SSR middleware docs).
 *
 * Post-login path: `next` query (legacy) or short-lived `wp_oauth_next` cookie set before
 * OAuth — redirectTo stays exactly `/auth/callback` so Supabase "Redirect URLs" can match.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const oauthError = url.searchParams.get('error');
  const oauthDesc = url.searchParams.get('error_description');

  if (oauthError) {
    console.error('[auth/callback] OAuth provider returned error:', oauthError, oauthDesc ?? '');
    const login = new URL('/login', url.origin);
    login.searchParams.set('error', 'auth');
    if (oauthDesc) login.searchParams.set('hint', hintParam(oauthDesc));
    else login.searchParams.set('hint', hintParam(oauthError));
    const fail = NextResponse.redirect(login);
    clearOauthReturnPathCookie(fail);
    return fail;
  }

  const code = url.searchParams.get('code');
  const next =
    url.searchParams.has('next') && url.searchParams.get('next') !== ''
      ? safeNextPath(url.searchParams.get('next'))
      : getOauthReturnPathFromRequest(request) || '/opportunities';

  if (code) {
    const redirectTarget = new URL(next, url.origin);
    const response = NextResponse.redirect(redirectTarget);

    const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, responseHeaders) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          if (responseHeaders && typeof responseHeaders === 'object') {
            Object.entries(responseHeaders).forEach(([key, value]) => {
              if (typeof value === 'string') {
                response.headers.set(key, value);
              }
            });
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      clearOauthReturnPathCookie(response);
      return response;
    }

    console.error('[auth/callback] exchangeCodeForSession failed:', error.message, error);
    const login = new URL('/login', url.origin);
    login.searchParams.set('error', 'auth');
    login.searchParams.set('hint', hintParam(error.message));
    const fail = NextResponse.redirect(login);
    clearOauthReturnPathCookie(fail);
    return fail;
  }

  const login = new URL('/login', url.origin);
  login.searchParams.set('error', 'auth');
  login.searchParams.set('hint', 'No authorization code in callback URL — try signing in again from the site.');
  const fail = NextResponse.redirect(login);
  clearOauthReturnPathCookie(fail);
  return fail;
}
