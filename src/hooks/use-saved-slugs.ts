'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';

export function useSavedSlugs(initialSlugs?: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['saved-slugs'],
    queryFn: async () => {
      const r = await fetch('/api/saved', { credentials: 'same-origin' });
      if (r.status === 401) return [];
      if (!r.ok) throw new Error('Failed to load saved opportunities');
      const data = (await r.json()) as { slugs: string[] };
      return data.slugs;
    },
    enabled: !!user,
    initialData: initialSlugs,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ slug, isSaved }: { slug: string; isSaved: boolean }) => {
      if (isSaved) {
        const r = await fetch(`/api/saved?slug=${encodeURIComponent(slug)}`, {
          method: 'DELETE',
          credentials: 'same-origin',
        });
        if (!r.ok) {
          const j = (await r.json().catch(() => ({}))) as { error?: string };
          throw new Error(j.error || 'Could not remove');
        }
        return;
      }
      const r = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ slug }),
      });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || 'Could not save');
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved-slugs'] });
    },
  });

  const rawSlugs = query.data ?? [];
  const slugs = user ? rawSlugs : [];

  return {
    slugs,
    isLoading: !!user && query.isPending && initialSlugs === undefined,
    isSaved: (slug: string) => slugs.includes(slug),
    toggleSaved: (slug: string) => {
      const isSaved = slugs.includes(slug);
      return toggleMutation.mutateAsync({ slug, isSaved });
    },
    toggleError: toggleMutation.error as Error | null,
    togglePending: toggleMutation.isPending,
  };
}
