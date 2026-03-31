import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpportunityBySlug } from '@/lib/mock-data';
import { reviewTextFailsContentCheck } from '@/lib/reviews/content-check';
import { reviewBodySchema } from '@/lib/reviews/validation';

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ slug: string; reviewId: string }> }
) {
  const { slug, reviewId } = await ctx.params;
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

  const { data: existing, error: fetchErr } = await supabase
    .from('opportunity_reviews')
    .select('id, user_id, opportunity_slug')
    .eq('id', reviewId)
    .maybeSingle();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }
  if (existing.user_id !== user.id || existing.opportunity_slug !== trimmedSlug) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = reviewBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const v = parsed.data;
  if (!v.participated) {
    return NextResponse.json(
      { error: 'Please confirm that you participated or attended.' },
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

  const { error } = await supabase
    .from('opportunity_reviews')
    .update({
      rating: v.rating,
      title: v.title ?? null,
      body: v.body,
      display_name: v.display_name,
      graduation_year: v.graduation_year,
      grade_level: v.grade_level,
      participated: true,
      would_recommend: v.would_recommend,
      status: 'pending',
    })
    .eq('id', reviewId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Could not update review' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ slug: string; reviewId: string }> }
) {
  const { slug, reviewId } = await ctx.params;
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

  const { error } = await supabase
    .from('opportunity_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .eq('opportunity_slug', trimmedSlug);

  if (error) {
    return NextResponse.json({ error: 'Could not delete review' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
