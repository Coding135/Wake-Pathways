'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import type { SiteFeedback } from '@/types/database';
import { formatDate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminSiteFeedbackPage() {
  const [items, setItems] = useState<SiteFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/site-feedback', { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not load feedback');
        setItems([]);
        return;
      }
      setItems((data.feedback as SiteFeedback[]) ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <title>Site feedback - Wake Pathways Admin</title>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Site feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages from the footer &quot;Send a quick note&quot; form. Sign in with an email in
          REVIEW_MODERATOR_EMAILS. The server needs SUPABASE_SERVICE_ROLE_KEY and the{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">site_feedback</code> table.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
        {!loading && (
          <span className="text-sm text-muted-foreground tabular-nums">{items.length} total</span>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {loading && items.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No feedback submissions yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((row) => (
            <li key={row.id}>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm whitespace-pre-wrap text-foreground">{row.message}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {formatDate(row.created_at)}
                    {row.contact_email ? ` · ${row.contact_email}` : ' · No reply email'}
                    {row.reporter_user_id ? ' · Signed-in user' : ''}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
