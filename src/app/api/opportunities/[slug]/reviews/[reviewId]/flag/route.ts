import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getOpportunityBySlug } from '@/lib/mock-data';

const flagSchema = z.object({
  note: z.string().max(500).optional(),
});

export async function POST(
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

  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    json = {};
  }
  const parsed = flagSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: review, error: revErr } = await supabase
    .from('opportunity_reviews')
    .select('id, user_id, opportunity_slug, status')
    .eq('id', reviewId)
    .maybeSingle();

  if (revErr || !review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }
  if (review.opportunity_slug !== trimmedSlug || review.status !== 'approved') {
    return NextResponse.json({ error: 'Cannot flag this review' }, { status: 400 });
  }
  if (review.user_id === user.id) {
    return NextResponse.json({ error: 'You cannot flag your own review' }, { status: 400 });
  }

  const { error } = await supabase.from('opportunity_review_flags').insert({
    review_id: reviewId,
    user_id: user.id,
    note: parsed.data.note?.trim() || null,
  });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You already reported this review' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Could not submit report' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
