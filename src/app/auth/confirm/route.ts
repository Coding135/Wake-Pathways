import { type NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/auth-js';
import { createServerClient } from '@supabase/ssr';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/env';
import { safeNextPath } from '@/lib/auth/redirect';

const EMAIL_OTP_TYPES = new Set<string>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const token_hash = searchParams.get('token_hash');
  const typeRaw = searchParams.get('type');
  const nextRaw = searchParams.get('next');
  const next =
    nextRaw !== null && nextRaw !== '' ? safeNextPath(nextRaw) : '/';

  if (
    token_hash &&
    typeRaw &&
    EMAIL_OTP_TYPES.has(typeRaw)
  ) {
    const type = typeRaw as EmailOtpType;
    const redirectTarget = new URL(next, origin);
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

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return response;
    }
  }

  const login = new URL('/login', origin);
  login.searchParams.set('error', 'confirm');
  return NextResponse.redirect(login);
}
