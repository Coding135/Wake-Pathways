import { NextResponse } from 'next/server';
import { z } from 'zod';
import { assertModerator } from '@/lib/auth/moderator';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['approved', 'rejected', 'needs_edits']),
  admin_notes: z.string().max(2000).optional().nullable(),
});

export async function GET(request: Request) {
  const mod = await assertModerator();
  if (!mod.ok) return mod.response;

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          'Server is not configured for admin submissions (set SUPABASE_SERVICE_ROLE_KEY on the server)',
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = admin.from('submissions').select('*').order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[GET /api/admin/submissions]', error);
    return NextResponse.json({ error: 'Could not load submissions' }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], total: data?.length ?? 0 });
}

export async function PATCH(request: Request) {
  const mod = await assertModerator();
  if (!mod.ok) return mod.response;

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          'Server is not configured for admin submissions (set SUPABASE_SERVICE_ROLE_KEY on the server)',
      },
      { status: 503 }
    );
  }

  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid body', details: parsed.error.flatten() }, { status: 400 });
  }

  const { id, status, admin_notes } = parsed.data;

  const { error } = await admin
    .from('submissions')
    .update({
      status,
      admin_notes: admin_notes ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id ?? null,
    })
    .eq('id', id);

  if (error) {
    console.error('[PATCH /api/admin/submissions]', error);
    return NextResponse.json({ error: 'Could not update submission' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
