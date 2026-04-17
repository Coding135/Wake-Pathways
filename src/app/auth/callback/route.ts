import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';
import { safeNextPath } from '@/lib/auth/redirect';

/**
 * OAuth (e.g. Google) returns here with ?code=...
 * Session cookies must be set on the redirect response. Using only `cookies()` from
 * next/headers often drops them in Route Handlers, which
 * makes exchangeCodeForSession "succeed" in memory but leaves the user logged out.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next'));

  if (code) {
    const redirectTarget = new URL(next, url.origin);
    const response = NextResponse.redirect(redirectTarget);

    const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[auth/callback] exchangeCodeForSession:', error.message);
    }
  }

  const login = new URL('/login', url.origin);
  login.searchParams.set('error', 'auth');
  return NextResponse.redirect(login);
}
