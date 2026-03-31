import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { SavedOpportunity } from '@/types/database';
import { SavedAuthenticatedView } from './saved-authenticated-view';

export const metadata = {
  title: 'Saved Opportunities — Wake Pathways',
  description: 'Your saved Wake County teen opportunities.',
};

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=%2Fsaved');
  }

  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('opportunity_slug')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-muted-foreground">
        <p className="text-destructive">We couldn&apos;t load your saved list. Try refreshing the page.</p>
      </div>
    );
  }

  const rows = (data ?? []) as Pick<SavedOpportunity, 'opportunity_slug'>[];
  const slugs = rows.map((r) => r.opportunity_slug);

  return <SavedAuthenticatedView initialSlugs={slugs} />;
}
