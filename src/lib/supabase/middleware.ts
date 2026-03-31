import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { readSupabasePublicEnv } from '@/lib/supabase/env';

/**
 * Refreshes Supabase Auth cookies on each matched request (Edge-safe).
 * Does not call createServerClient until URL + key are present (readSupabasePublicEnv).
 * On missing env or errors, passes the request through without throwing.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const env = readSupabasePublicEnv();
  if (!env) {
    return NextResponse.next({ request });
  }

  const { url: supabaseUrl, key: supabaseKey } = env;
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, responseHeaders) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          if (responseHeaders && typeof responseHeaders === 'object') {
            Object.entries(responseHeaders).forEach(([key, value]) => {
              if (typeof value === 'string') {
                supabaseResponse.headers.set(key, value);
              }
            });
          }
        },
      },
    });

    await supabase.auth.getUser();
  } catch {
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
