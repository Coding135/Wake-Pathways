import { NextResponse } from 'next/server';
import { assertModerator } from '@/lib/auth/moderator';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export async function GET() {
  const mod = await assertModerator();
  if (!mod.ok) return mod.response;

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json(
      { error: 'Server is not configured for moderation (missing SUPABASE_SERVICE_ROLE_KEY)' },
      { status: 503 }
    );
  }

  const { data, error } = await admin
    .from('site_feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/admin/site-feedback]', error);
    return NextResponse.json({ error: 'Could not load site feedback' }, { status: 500 });
  }

  return NextResponse.json({ feedback: data ?? [] });
}
