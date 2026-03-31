import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

function parseModeratorEmails(): string[] {
  const raw = process.env.REVIEW_MODERATOR_EMAILS ?? '';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

async function assertModerator(): Promise<{ ok: true; email: string } | { ok: false; response: NextResponse }> {
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

export async function GET(request: Request) {
  const mod = await assertModerator();
  if (!mod.ok) return mod.response;

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      { error: 'Server is not configured for moderation (missing SUPABASE_SERVICE_ROLE_KEY)' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'pending';
  if (status !== 'pending' && status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('opportunity_reviews')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Could not load reviews' }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [] });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['approved', 'rejected', 'pending']),
});

export async function PATCH(request: Request) {
  const mod = await assertModerator();
  if (!mod.ok) return mod.response;

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      { error: 'Server is not configured for moderation (missing SUPABASE_SERVICE_ROLE_KEY)' },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { error } = await admin
    .from('opportunity_reviews')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id);

  if (error) {
    return NextResponse.json({ error: 'Could not update review' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
