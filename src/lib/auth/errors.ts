import type { AuthError } from '@supabase/supabase-js';

/** User-facing copy for Supabase Auth API errors */
export function formatAuthError(error: AuthError | Error | null | undefined): string {
  if (!error?.message) return 'Something went wrong. Please try again.';
  const msg = error.message;
  const lower = msg.toLowerCase();

  if (lower.includes('already registered') || lower.includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid email or password') ||
    (error && 'code' in error && error.code === 'invalid_credentials')
  ) {
    return 'Incorrect email or password.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email before signing in.';
  }
  if (lower.includes('password') && lower.includes('least')) {
    return msg;
  }
  if (lower.includes('invalid email')) {
    return 'Enter a valid email address.';
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Too many attempts. Wait a moment and try again.';
  }
  if (lower.includes('email rate limit')) {
    return 'Please wait before requesting another email.';
  }

  return msg.length > 120 ? 'Something went wrong. Please try again.' : msg;
}
