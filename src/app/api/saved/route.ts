import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpportunityBySlug } from '@/lib/mock-data';
import type { SavedOpportunity } from '@/types/database';

type SavedSlugRow = Pick<SavedOpportunity, 'opportunity_slug'>;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('opportunity_slug')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load saved items' }, { status: 500 });
  }

  const rows = (data ?? []) as SavedSlugRow[];
  return NextResponse.json({
    slugs: rows.map((r) => r.opportunity_slug),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const slug =
    typeof body === 'object' &&
    body !== null &&
    'slug' in body &&
    typeof (body as { slug: unknown }).slug === 'string'
      ? (body as { slug: string }).slug.trim()
      : '';

  if (!slug) {
    return NextResponse.json({ error: 'Missing opportunity' }, { status: 400 });
  }

  if (!getOpportunityBySlug(slug)) {
    return NextResponse.json({ error: 'Unknown opportunity' }, { status: 404 });
  }

  const { error } = await supabase.from('saved_opportunities').insert({
    user_id: user.id,
    opportunity_slug: slug,
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already saved' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Could not save' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug')?.trim();
  if (!slug) {
    return NextResponse.json({ error: 'Missing opportunity' }, { status: 400 });
  }

  const { error } = await supabase
    .from('saved_opportunities')
    .delete()
    .eq('user_id', user.id)
    .eq('opportunity_slug', slug);

  if (error) {
    return NextResponse.json({ error: 'Could not remove' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
