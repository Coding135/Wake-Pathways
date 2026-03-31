import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpportunityBySlug } from '@/lib/mock-data';
import { reviewTextFailsContentCheck } from '@/lib/reviews/content-check';
import { reviewBodySchema } from '@/lib/reviews/validation';

export async function GET(_request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const trimmed = slug.trim();
  if (!trimmed) {
    return NextResponse.json({ error: 'Invalid opportunity' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('opportunity_reviews')
    .select('*')
    .eq('opportunity_slug', trimmed)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Could not load reviews' }, { status: 500 });
  }

  const rows = data ?? [];
  const approved = rows.filter((r: { status: string }) => r.status === 'approved');
  const myReview = user ? rows.find((r: { user_id: string }) => r.user_id === user.id) ?? null : null;

  return NextResponse.json({ approved, myReview });
}

export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const trimmedSlug = slug.trim();
  if (!trimmedSlug || !getOpportunityBySlug(trimmedSlug)) {
    return NextResponse.json({ error: 'Unknown opportunity' }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = reviewBodySchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', fields: msg }, { status: 400 });
  }

  const v = parsed.data;
  if (!v.participated) {
    return NextResponse.json(
      { error: 'Please confirm that you participated or attended before submitting.' },
      { status: 400 }
    );
  }

  const combined = `${v.display_name} ${v.title ?? ''} ${v.body}`;
  if (reviewTextFailsContentCheck(combined)) {
    return NextResponse.json(
      { error: 'This review contains language we cannot accept. Please revise and try again.' },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('opportunity_reviews').insert({
    user_id: user.id,
    opportunity_slug: trimmedSlug,
    rating: v.rating,
    title: v.title ?? null,
    body: v.body,
    display_name: v.display_name,
    graduation_year: v.graduation_year,
    grade_level: v.grade_level,
    participated: true,
    would_recommend: v.would_recommend,
    status: 'pending',
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'You already submitted a review for this opportunity. You can edit it instead.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Could not save review' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
