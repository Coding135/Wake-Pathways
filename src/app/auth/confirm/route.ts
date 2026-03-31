import { type NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/auth-js';
import { createClient } from '@/lib/supabase/server';
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
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const login = new URL('/login', origin);
  login.searchParams.set('error', 'confirm');
  return NextResponse.redirect(login);
}
