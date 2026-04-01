import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertModerator } from '@/lib/auth/moderator';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

type StatusFilter = 'open' | 'reviewed' | 'resolved' | 'all';

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
  const status = (searchParams.get('status') ?? 'open') as StatusFilter;
  if (status !== 'open' && status !== 'reviewed' && status !== 'resolved' && status !== 'all') {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  const { data, error } =
    status === 'all'
      ? await admin
          .from('opportunity_issue_reports')
          .select('*')
          .order('created_at', { ascending: false })
      : await admin
          .from('opportunity_issue_reports')
          .select('*')
          .eq('status', status)
          .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load reports' }, { status: 500 });
  }

  return NextResponse.json({ reports: data ?? [] });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['open', 'reviewed', 'resolved']),
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
    .from('opportunity_issue_reports')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id);

  if (error) {
    return NextResponse.json({ error: 'Could not update report' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
