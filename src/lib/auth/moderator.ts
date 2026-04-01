import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export function parseModeratorEmails(): string[] {
  const raw = process.env.REVIEW_MODERATOR_EMAILS ?? '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
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
  const allowed = parseModeratorEmails();
  if (allowed.length === 0 || !allowed.includes(user.email.toLowerCase())) {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true, email: user.email };
}
