import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export function parseModeratorEmails(): string[] {
  const raw = process.env.REVIEW_MODERATOR_EMAILS ?? '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Same allowlist as admin APIs; if the env list is empty, no one is a moderator. */
export function isModeratorEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const allowed = parseModeratorEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(email.trim().toLowerCase());
}

/**
 * Server-only: signed-in user whose email is in REVIEW_MODERATOR_EMAILS.
 * Use in admin layouts/pages — do not call from client components.
 */
export async function getModeratorUser(): Promise<{ email: string; id: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !isModeratorEmail(user.email)) return null;
  return { email: user.email, id: user.id };
}

export async function assertModerator(): Promise<
  { ok: true; email: string } | { ok: false; response: NextResponse }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!isModeratorEmail(user.email)) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true, email: user.email };
}
