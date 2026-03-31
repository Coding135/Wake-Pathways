import { createClient } from '@/lib/supabase/server';
import type { OpportunityReview } from '@/types/database';

export async function getOpportunityReviewsForDetail(slug: string): Promise<{
  approved: OpportunityReview[];
  myReview: OpportunityReview | null;
  userId: string | null;
  profileName: string;
  loadError: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('opportunity_reviews')
    .select('*')
    .eq('opportunity_slug', slug)
    .order('created_at', { ascending: false });

  if (error) {
    return {
      approved: [],
      myReview: null,
      userId: user?.id ?? null,
      profileName: '',
      loadError: true,
    };
  }

  const rows = (data ?? []) as OpportunityReview[];
  const approved = rows.filter((r) => r.status === 'approved');
  const myReview = user ? (rows.find((r) => r.user_id === user.id) ?? null) : null;

  let profileName = '';
  if (user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();
    profileName = typeof prof?.full_name === 'string' ? prof.full_name.trim() : '';
  }

  return {
    approved,
    myReview,
    userId: user?.id ?? null,
    profileName,
    loadError: false,
  };
}
